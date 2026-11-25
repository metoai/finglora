import { NextResponse } from 'next/server';
import { getVerifiedRequestUser } from '@/lib/server/admin-auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  checkRateLimit,
  getClientIp,
  isAllowedBrowserOrigin,
} from '@/lib/server/api-guard';
import {
  attachGuestTryOnCookie,
  MAX_GUEST_FREE_TRYONS,
  readGuestTryOnCount,
} from '@/lib/server/guest-quota';
import {
  coalesceInFlight,
  executeVertexWithFailover,
  hashRequestSignature,
  optimizeGeneratedImageOutput,
  resolveCachedPublicImageBase64,
  safeCachedFetchRemoteImageBase64,
} from '@/lib/server/vertex-pool';

interface GenerateRequestBody {
  prompt?: string;
  referenceImageBase64?: string;
  referenceImageUrl?: string;
  handImageBase64?: string;
  handImageUrl?: string;
  mode?: '5-nail-set' | 'hand-tryon';
  nailShape?: string;
}

async function resolveInputImage(
  base64Input?: string,
  urlInput?: string
): Promise<{ base64?: string; mimeType: string }> {
  if (base64Input) {
    const mimeType =
      base64Input.match(/^data:(image\/[\w.+-]+);base64,/)?.[1] || 'image/jpeg';
    const base64 = base64Input.replace(/^data:image\/[\w.+-]+;base64,/, '');
    if (base64) return { base64, mimeType };
  }

  if (urlInput) {
    if (urlInput.startsWith('/')) {
      const local = resolveCachedPublicImageBase64(urlInput);
      if (local) return local;
    } else if (urlInput.startsWith('https://')) {
      const remote = await safeCachedFetchRemoteImageBase64(urlInput);
      if (remote) return remote;
    }
  }

  return { base64: undefined, mimeType: 'image/jpeg' };
}

export async function POST(request: Request) {
  try {
    if (!isAllowedBrowserOrigin(request)) {
      return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
    }

    const user = await getVerifiedRequestUser();
    const clientIp = getClientIp(request);
    const guestUsed = user ? 0 : readGuestTryOnCount(request);

    const body: GenerateRequestBody = await request.json();
    const {
      prompt = 'Apply reference manicure to user hand',
      referenceImageBase64,
      referenceImageUrl,
      handImageBase64,
      handImageUrl,
      mode = 'hand-tryon',
      nailShape = 'almond',
    } = body;

    if (!user) {
      if (guestUsed >= MAX_GUEST_FREE_TRYONS) {
        return NextResponse.json(
          {
            error:
              'Free guest preview used. Create a free account for 10 complimentary try-on credits.',
            paywall: true,
            isGuestFirstTry: true,
            credits: 0,
            isPro: false,
          },
          { status: 402 }
        );
      }

      const guestIpRate = checkRateLimit(
        `gen:guest:ip:${clientIp}`,
        2,
        24 * 60 * 60 * 1000
      );
      if (!guestIpRate.allowed) {
        return NextResponse.json(
          {
            error:
              'Guest preview limit reached. Create a free account for 10 complimentary try-on credits.',
            paywall: true,
            isGuestFirstTry: true,
            credits: 0,
            isPro: false,
          },
          { status: 402, headers: { 'Retry-After': String(guestIpRate.retryAfterSec) } }
        );
      }
    } else {
      const rate = checkRateLimit(`gen:user:${user.id}`, 25, 10 * 60 * 1000);
      if (!rate.allowed) {
        return NextResponse.json(
          {
            error: 'Our AI nail studio is momentarily busy. Please wait a few seconds and try again.',
            paywall: false,
            isRateLimit: true,
          },
          { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
        );
      }
    }

    const key1 = process.env.GEMINI_API_KEY;
    const key2 = process.env.VERTEX_API_KEY_2;
    const candidateKeys = Array.from(new Set([key1, key2].filter(Boolean))) as string[];

    if (candidateKeys.length === 0) {
      console.error('[Finglora generate-nail-art] Missing Vertex API credentials');
      return NextResponse.json(
        { error: 'AI styling service is temporarily unavailable. Please try again later.' },
        { status: 500 }
      );
    }

    // Pre-flight credit check for authenticated users (actual deduction waits until image succeeds)
    const supabase = user ? await getSupabaseServerClient() : null;
    if (user && supabase && mode === 'hand-tryon') {
      try {
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('is_pro, credits')
          .eq('id', user.id)
          .maybeSingle();

        if (profileRow) {
          const isPro = Boolean((profileRow as any).is_pro);
          const credits = Number((profileRow as any).credits ?? 0);
          if (!isPro && credits <= 0) {
            return NextResponse.json(
              {
                error:
                  'No try-on credits remaining. Upgrade to Finglora Pro for unlimited try-ons.',
                paywall: true,
                credits: 0,
                isPro: false,
              },
              { status: 402 }
            );
          }
        }
      } catch {
        // Atomic RPC check below handles final enforcement
      }
    }

    // Resolve Hand & Reference inputs concurrently using server memory caches
    const [handResolved, refResolved] = await Promise.all([
      resolveInputImage(handImageBase64, handImageUrl),
      resolveInputImage(referenceImageBase64, referenceImageUrl),
    ]);

    const finalHandBase64 = handResolved.base64;
    const handMimeType = handResolved.mimeType;
    const finalReferenceBase64 = refResolved.base64;
    const referenceMimeType = refResolved.mimeType;

    const buildGenerationBody = (model: string): Record<string, unknown> => {
      const isV25 = model.includes('2.5');
      const modelParts: any[] = [];

      if (finalReferenceBase64 && finalHandBase64) {
        const detailNote =
          prompt && prompt !== 'Apply reference manicure to user hand'
            ? `\nDesign specification: ${prompt}`
            : '';

        if (isV25) {
          // Tailored for gemini-2.5-flash-image: treat reference strictly as polish/finish swatch,
          // put target hand LAST so output preserves the hand's natural aspect ratio, and mandate all 5 nails.
          modelParts.push({
            text: `IN-PLACE 5-FINGER VIRTUAL NAIL POLISH EDIT (KEEP EXACT TARGET HAND PROPORTIONS):
IMAGE 1 is ONLY a polish color, pattern & gloss finish swatch.${detailNote}
DO NOT copy long artificial acrylic extensions, flat cutout tips, finger thickness, or hand anatomy from IMAGE 1!
IMAGE 2 is the TARGET USER HAND PHOTO — keep 100% of IMAGE 2's aspect ratio, framing, crop, skin tone, palm/knuckle creases, finger widths, finger angles, and background unchanged.

MANDATORY 5-FINGER COVERAGE (NEVER SKIP ANY FINGER):
Locate EVERY SINGLE ONE of the 5 fingernails visible in IMAGE 2 and paint ALL FIVE nail plates cleanly from cuticle to tip with IMAGE 1's polish color, finish, and art:
1. Thumb fingernail
2. Index fingernail
3. Middle fingernail
4. Ring fingernail
5. Pinky fingernail
Even when index, middle, or ring fingers are curled inward or seen at a steep foreshortened angle, find each nail bed carefully and coat ALL 5 cleanly! Keep natural-to-neat rounded ${nailShape} salon gel overlays aligned strictly along each finger axis — NEVER attach oversized sideways triangular tips onto only outer nails.`,
          });
        } else {
          // Precision prompt for gemini-3.1-flash-image / gemini-3-pro-image (reference first, target hand last for aspect-ratio lock)
          modelParts.push({
            text: `You are performing a STRICT PIXEL-LOCKED IN-PLACE PHOTO EDIT (localized virtual nail try-on).

IMAGE 1 is ONLY the manicure design reference swatch.
IMAGE 2 is the EXACT target photograph of the user's hand. Treat IMAGE 2 as an immutable base layer where ONLY the 5 fingernail plates are editable.

TASK:
Apply ONLY the nail polish colors, nail art patterns, finish, and ${nailShape} look from IMAGE 1 onto ALL FIVE fingernails of IMAGE 2, scaled strictly to fit IMAGE 2's natural slim nail bed width.${detailNote}

MANDATORY 5-FINGER COVERAGE & ALIGNMENT (CRITICAL):
- Paint ALL 5 visible fingernails in IMAGE 2 individually from cuticle to tip: (1) Thumb, (2) Index, (3) Middle, (4) Ring, (5) Pinky — NEVER skip curled or foreshortened middle, index, or ring fingernails.
- Align every nail naturally straight along its own finger axis and perspective foreshortening; NEVER paste oversized or sideways flat tips onto only 1-2 outer fingers.

ABSOLUTE HAND & SLIMNESS PRESERVATION RULES:
1. ZERO FINGER WIDENING OR PLUMPING: Every finger shaft, thumb, fingertip, knuckle, palm, and wrist MUST keep the exact same slim pixel width as IMAGE 2. Never flare nail sides wider than the fingertip skin.
2. LOCK INTER-FINGER GAPS & SILHOUETTE: Preserve exact empty background spaces/gaps between fingers and keep every hand contour pixel-aligned with IMAGE 2.
3. ZERO CHANGES TO SKIN TEXTURE OR TONE: Retain IMAGE 2's exact skin tone, pores, creases, lighting, framing, and original accessories; do NOT smooth or re-color skin.
4. ZERO CHANGES TO BACKGROUND, ASPECT RATIO, OR LIGHTING: Keep original framing, crop, aspect ratio, background, and lighting of IMAGE 2 untouched; copy NO hands, rings, jewelry, bottles, or props from IMAGE 1.
5. CLEAN, DRY SKIN AROUND NAILS: Skin under tips and around cuticles stays natural dry matte skin matching IMAGE 2 (no oil, vaseline, grease, or spillage).`,
          });
        }

        // Put reference swatch FIRST and user's target hand LAST so output natively keeps user hand aspect ratio
        modelParts.push({
          text: 'IMAGE 1 — MANICURE COLOR & FINISH SWATCH ONLY (DO NOT copy hand, crop, or oversized tip cutouts):',
        });
        modelParts.push({ inlineData: { mimeType: referenceMimeType, data: finalReferenceBase64 } });
        modelParts.push({
          text: 'IMAGE 2 — TARGET USER HAND PHOTO (Paint ALL 5 visible fingernails cleanly; keep exact framing, skin, fingers & background):',
        });
        modelParts.push({ inlineData: { mimeType: handMimeType, data: finalHandBase64 } });
      } else if (finalHandBase64) {
        modelParts.push({
          text: `You are performing a STRICT PIXEL-LOCKED IN-PLACE PHOTO EDIT on IMAGE 1 (user hand). Treat IMAGE 1 as an immutable base layer where ONLY the 5 fingernail plates are editable.

TASK:
Paint ALL FIVE visible fingernails in IMAGE 1 cleanly to match: "${prompt}".
- Coat all 5 fingernails consistently: (1) Thumb, (2) Index, (3) Middle, (4) Ring, (5) Pinky — never skip curled or foreshortened center nails.
- Keep polished gel overlays clearly visible with crisp glossy shine, hugging IMAGE 1's slim nail beds along each finger's natural pointing axis.

STRICT PRESERVATION RULES:
1. ZERO finger widening/plumping: keep slim finger shafts, fingertips, and inter-finger gaps pixel-identical to IMAGE 1.
2. ZERO skin/lighting/background/accessory edits: preserve exact skin tone, creases, pores, shadows, aspect ratio, lighting, and scene; add NO rings or jewelry.
3. CLEAN, DRY skin under nail tips and around cuticles (no oil, vaseline, grease, or polish spillage).`,
        });
        modelParts.push({
          text: 'IMAGE 1 — TARGET BASE PHOTO (User Hand — paint ALL 5 visible fingernails cleanly):',
        });
        modelParts.push({ inlineData: { mimeType: handMimeType, data: finalHandBase64 } });
      } else if (finalReferenceBase64) {
        modelParts.push({
          text: `Photorealistic salon macro photo of a natural human hand wearing the exact nail art from this reference ("${prompt}") across all 5 fingernails. Copy ONLY the nail design (no rings, jewelry, props, or clothing from reference). Clean dry cuticle and under-nail skin, natural lighting.`,
        });
        modelParts.push({ inlineData: { mimeType: referenceMimeType, data: finalReferenceBase64 } });
      } else {
        const promptText =
          mode === '5-nail-set'
            ? `Luxury top-down studio photo of 5 isolated acrylic nails lined horizontally (Thumb, Index, Middle, Ring, Pinky), ${nailShape} shape, design: ${prompt}, clean light linen stone background, sharp macro gel finish.`
            : `Photorealistic salon photo of a real human hand wearing this manicure across all 5 fingers: "${prompt}". Clean dry natural skin around cuticles and under nails, crisp cuticle margins, no jewelry or foreign props.`;
        modelParts.push({ text: promptText });
      }

      return {
        contents: [{ role: 'user', parts: modelParts }],
        generationConfig: {
          responseModalities: ['IMAGE'],
        },
      };
    };

    // Coalesce rapid duplicate double-taps from the same caller
    const dedupKey = hashRequestSignature([
      user?.id || clientIp,
      mode,
      nailShape,
      prompt,
      finalHandBase64 ? finalHandBase64.slice(0, 256) : handImageUrl || '',
      finalReferenceBase64 ? finalReferenceBase64.slice(0, 256) : referenceImageUrl || '',
    ]);

    const vertexResult = await coalesceInFlight(dedupKey, () =>
      executeVertexWithFailover({
        candidateKeys,
        candidateModels: ['gemini-3.1-flash-image', 'gemini-3-pro-image', 'gemini-2.5-flash-image'],
        timeoutMs: 24000,
        bodyForModel: buildGenerationBody,
      })
    );

    if (!vertexResult.ok) {
      console.error('[Finglora generate-nail-art] Vertex image generation failed:', {
        status: vertexResult.status,
        model: vertexResult.model,
        error: vertexResult.error,
      });
      const returnStatus = vertexResult.isRateLimited ? 429 : 502;
      return NextResponse.json(
        { error: vertexResult.publicError, isRateLimit: vertexResult.isRateLimited },
        { status: returnStatus }
      );
    }

    const imgPart = vertexResult.json?.candidates?.[0]?.content?.parts?.find(
      (p: any) => p.inlineData?.data
    );

    if (!imgPart?.inlineData?.data) {
      return NextResponse.json(
        { error: 'Unable to complete manicure generation right now. Please try again.' },
        { status: 502 }
      );
    }

    // Atomically deduct authenticated credit ONLY after generation actually succeeded
    let serverCreditStatus: { credits: number; isPro: boolean } | null = null;
    if (user && supabase && mode === 'hand-tryon') {
      try {
        const { data: creditData, error: creditErr } = await (supabase as any).rpc(
          'consume_tryon_credit'
        );
        if (!creditErr && creditData && typeof creditData.allowed === 'boolean') {
          if (!creditData.allowed) {
            return NextResponse.json(
              {
                error:
                  'No try-on credits remaining. Upgrade to Finglora Pro for unlimited try-ons.',
                paywall: true,
                credits: 0,
                isPro: false,
              },
              { status: 402 }
            );
          }
          serverCreditStatus = {
            credits: typeof creditData.credits === 'number' ? creditData.credits : 0,
            isPro: Boolean(creditData.is_pro),
          };
        }
      } catch {
        // Proceed if RPC unavailable
      }
    }

    // Compress bulky PNG -> crisp ~120KB mozjpeg (~10x faster download on mobile)
    const optimizedImageUrl = await optimizeGeneratedImageOutput(
      imgPart.inlineData.data,
      imgPart.inlineData.mimeType || 'image/png'
    );

    const response = NextResponse.json({
      success: true,
      imageUrl: optimizedImageUrl,
      modelUsed: vertexResult.model,
      creditStatus: user
        ? serverCreditStatus
        : {
            credits: Math.max(0, MAX_GUEST_FREE_TRYONS - (guestUsed + 1)),
            isPro: false,
            isGuest: true,
          },
    });

    if (!user) {
      attachGuestTryOnCookie(response, guestUsed + 1);
    }

    return response;
  } catch (err: unknown) {
    console.error('[Finglora generate-nail-art] Unhandled route error:', err);
    return NextResponse.json(
      { error: 'Something went wrong while styling your nails. Please try again.' },
      { status: 500 }
    );
  }
}
