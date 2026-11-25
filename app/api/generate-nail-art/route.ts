import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getVerifiedRequestUser } from '@/lib/server/admin-auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  checkRateLimit,
  getClientIp,
  isAllowedBrowserOrigin,
  safeFetchRemoteImageBase64,
} from '@/lib/server/api-guard';

interface GenerateRequestBody {
  prompt?: string;
  referenceImageBase64?: string;
  referenceImageUrl?: string;
  handImageBase64?: string;
  handImageUrl?: string;
  mode?: '5-nail-set' | 'hand-tryon';
  nailShape?: string;
}

function resolvePublicImageBase64(relUrl: string): { base64: string; mimeType: string } | null {
  try {
    const publicRoot = path.resolve(process.cwd(), 'public');
    const resolved = path.resolve(publicRoot, relUrl.replace(/^\/+/, ''));
    if (!resolved.startsWith(publicRoot + path.sep)) return null;
    if (!fs.existsSync(resolved)) return null;
    const buf = fs.readFileSync(resolved);
    return {
      base64: buf.toString('base64'),
      mimeType: resolved.endsWith('.png') ? 'image/png' : 'image/jpeg',
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    if (!isAllowedBrowserOrigin(request)) {
      return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
    }

    const user = await getVerifiedRequestUser();
    const clientIp = getClientIp(request);

    // Rate limit per user or per IP for guests
    const rate = user
      ? checkRateLimit(`gen:user:${user.id}`, 25, 10 * 60 * 1000)
      : checkRateLimit(`gen:ip:${clientIp}`, 4, 30 * 60 * 1000);

    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: user
            ? 'Rate limit reached. Please wait a moment before generating again.'
            : 'Guest preview limit reached. Create a free account for 10 try-on credits.',
          paywall: !user,
          isRateLimit: true,
        },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
      );
    }

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

    const key1 = process.env.GEMINI_API_KEY;
    const key2 = process.env.VERTEX_API_KEY_2;
    const candidateKeys = Array.from(new Set([key1, key2].filter(Boolean))) as string[];

    if (candidateKeys.length === 0) {
      return NextResponse.json({ error: 'Vertex API key is not configured' }, { status: 500 });
    }

    // Server-side credit enforcement for authenticated users in virtual try-on mode
    let serverCreditStatus: { credits: number; isPro: boolean } | null = null;
    if (user && mode === 'hand-tryon') {
      try {
        const supabase = await getSupabaseServerClient();
        const { data: creditData, error: creditErr } = await (supabase as any).rpc('consume_tryon_credit');
        if (!creditErr && creditData && typeof creditData.allowed === 'boolean') {
          if (!creditData.allowed) {
            return NextResponse.json(
              {
                error: 'No try-on credits remaining. Upgrade to Finglora Pro for unlimited try-ons.',
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
        // Proceed gracefully if RPC unavailable
      }
    }

    // Resolve Hand Base64 & Mime
    let finalHandBase64 = handImageBase64?.replace(/^data:image\/\w+;base64,/, '');
    let handMimeType = handImageBase64?.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';

    if (!finalHandBase64 && handImageUrl) {
      if (handImageUrl.startsWith('/')) {
        const local = resolvePublicImageBase64(handImageUrl);
        if (local) {
          finalHandBase64 = local.base64;
          handMimeType = local.mimeType;
        }
      } else if (handImageUrl.startsWith('https://')) {
        const remote = await safeFetchRemoteImageBase64(handImageUrl);
        if (remote) {
          finalHandBase64 = remote.base64;
          handMimeType = remote.mimeType;
        }
      }
    }

    // Resolve Reference Base64 & Mime
    let finalReferenceBase64 = referenceImageBase64?.replace(/^data:image\/\w+;base64,/, '');
    let referenceMimeType = referenceImageBase64?.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';

    if (!finalReferenceBase64 && referenceImageUrl) {
      if (referenceImageUrl.startsWith('/')) {
        const local = resolvePublicImageBase64(referenceImageUrl);
        if (local) {
          finalReferenceBase64 = local.base64;
          referenceMimeType = local.mimeType;
        }
      } else if (referenceImageUrl.startsWith('https://')) {
        const remote = await safeFetchRemoteImageBase64(referenceImageUrl);
        if (remote) {
          finalReferenceBase64 = remote.base64;
          referenceMimeType = remote.mimeType;
        }
      }
    }

    const parts: any[] = [];

    if (finalReferenceBase64 && finalHandBase64) {
      // Image-to-Image with User's Real Hand (IMAGE 1 = locked base canvas) + Reference Nail Design (IMAGE 2 = design only)
      const detailNote =
        prompt && prompt !== 'Apply reference manicure to user hand'
          ? `\nAdditional manicure details: ${prompt}`
          : '';

      parts.push({
        text: `You are performing a STRICT PIXEL-LOCKED IN-PLACE PHOTO EDIT (localized virtual nail try-on).

IMAGE 1 is the EXACT target photograph of the user's hand. Treat IMAGE 1 as an immutable base layer where ONLY the 5 fingernail regions are editable.
IMAGE 2 is ONLY the manicure design reference.

TASK:
Apply ONLY the nail polish colors, nail art patterns, finish, and ${nailShape} tip style from IMAGE 2 onto the fingernails of the hand in IMAGE 1, scaled strictly to fit IMAGE 1's slim finger width.${detailNote}

ABSOLUTE HAND & SLIMNESS PRESERVATION RULES (HIGHEST PRIORITY):
1. ZERO FINGER WIDENING OR PLUMPING: Every finger shaft, thumb, fingertip, knuckle, palm, and wrist MUST keep the exact same slim pixel width as IMAGE 1. NEVER widen, thicken, plump, swell, puff, or bloat any finger or hand edge.
2. LOCK INTER-FINGER GAPS & SILHOUETTE: The empty background spaces/gaps between thumb, index, middle, ring, and pinky fingers MUST stay the exact same width and contour as IMAGE 1. Keep every hand and finger outline strictly pixel-aligned with IMAGE 1.
3. FIT NAILS TO USER'S SLIM NAIL BEDS (DO NOT ENLARGE FINGERS TO FIT NAILS): Shrink and narrow the width of each nail design from IMAGE 2 so the left and right nail sidewalls sit strictly within the user's exact natural nail bed width in IMAGE 1. Never flare the nail sides wider than the fingertip skin, and never expand fingertip flesh to accommodate wider salon nails from IMAGE 2.
4. ZERO CHANGES TO SKIN TEXTURE OR TONE: Retain the user's exact skin tone, undertones, shadows, highlights, pores, wrinkles, knuckle creases, veins, freckles, fine hairs, and cuticle skin from IMAGE 1. Do NOT airbrush, smooth, soften, brighten, lighten, darken, sharpen, or color-grade the skin.
5. ZERO CHANGES TO BACKGROUND, LIGHTING, OR FRAMING: Keep the exact original background, camera perspective, zoom, crop, aspect ratio, ambient lighting, and color temperature of IMAGE 1 untouched. Do NOT re-light or re-photograph the hand.
6. NO FOREIGN ELEMENTS FROM IMAGE 2: Extract strictly the nail design from IMAGE 2. Do NOT transfer IMAGE 2's hand anatomy, finger thickness, skin tone, lighting, background, sleeves, flowers, bottles, props, rings, bracelets, or jewelry. Keep whatever original background or accessories already exist in IMAGE 1.
7. CLEAN, DRY SKIN AROUND NAILS: The skin under the fingernails (hyponychium), around the cuticles, and on the finger pads must remain clean, natural, dry skin matching IMAGE 1. Strictly NO vaseline, NO petroleum jelly, NO greasy shine, NO cuticle oil pooling, and NO gel residue outside the nail plates.`,
      });
      parts.push({
        text: 'IMAGE 1 — TARGET BASE PHOTO (User Hand — preserve 100% of slim finger widths, inter-finger gaps, anatomy, skin texture, pose, lighting, and background pixel-identically):',
      });
      parts.push({
        inlineData: {
          mimeType: handMimeType,
          data: finalHandBase64,
        },
      });
      parts.push({
        text: 'IMAGE 2 — MANICURE DESIGN REFERENCE ONLY (Copy ONLY the polish art/colors/finish; shrink nail width to fit IMAGE 1 fingers):',
      });
      parts.push({
        inlineData: {
          mimeType: referenceMimeType,
          data: finalReferenceBase64,
        },
      });
    } else if (finalHandBase64) {
      parts.push({
        text: `You are performing a STRICT PIXEL-LOCKED IN-PLACE PHOTO EDIT (localized virtual nail try-on) on IMAGE 1 (the user's hand photograph).

Treat IMAGE 1 as an immutable base layer where ONLY the 5 fingernail regions are editable. Do NOT generate a new editorial photograph or re-render the scene.

TASK:
Apply ONLY this manicure design onto the fingernails of the hand in IMAGE 1, sized strictly to fit IMAGE 1's existing nail beds: "${prompt}".

ABSOLUTE HAND & SLIMNESS PRESERVATION RULES (HIGHEST PRIORITY):
1. ZERO FINGER WIDENING OR PLUMPING: Every finger shaft, thumb, fingertip, knuckle, palm, and wrist MUST keep the exact same slim pixel width as IMAGE 1. NEVER widen, thicken, plump, swell, puff, or bloat any finger or hand edge.
2. LOCK INTER-FINGER GAPS & SILHOUETTE: Preserve the exact empty background gap widths between every pair of fingers and keep the output strictly pixel-aligned with IMAGE 1.
3. ZERO CHANGES TO SKIN TEXTURE OR TONE: Retain the user's exact skin tone, undertones, shadows, highlights, pores, wrinkles, knuckle creases, veins, freckles, fine hairs, and cuticle skin from IMAGE 1. Do NOT airbrush, smooth, soften, brighten, sharpen, or color-grade the skin.
4. ZERO CHANGES TO BACKGROUND, LIGHTING, OR FRAMING: Keep the exact original background, camera perspective, zoom, crop, aspect ratio, ambient lighting, and color temperature of IMAGE 1 untouched.
5. NAIL PLATE BOUNDARY LOCK & NO FOREIGN OBJECTS: Modify ONLY the fingernail plates (narrowly fitted within IMAGE 1's existing nail bed sidewalls). Do NOT add any rings, jewelry, bracelets, or foreign props.
6. CLEAN, DRY SKIN AROUND NAILS: The skin under the fingernails (hyponychium) and around the cuticles must remain clean, natural, dry skin matching IMAGE 1. Strictly NO vaseline, NO petroleum jelly, NO greasy shine, NO cuticle oil pooling, and NO gel spillage on skin.`,
      });
      parts.push({
        text: 'IMAGE 1 — TARGET BASE PHOTO (User Hand — preserve 100% of hand anatomy, skin texture, pose, lighting, and background pixel-identically):',
      });
      parts.push({
        inlineData: {
          mimeType: handMimeType,
          data: finalHandBase64,
        },
      });
    } else if (finalReferenceBase64) {
      parts.push({
        text: `You are an expert salon studio AI. Generate an ultra-photorealistic salon photograph of a real human hand wearing the exact manicure design from this reference image: "${prompt}".

CRITICAL CONSTRAINTS:
1. NAIL DESIGN ONLY - NO FOREIGN OBJECTS: Copy ONLY the nail design (colors, patterns, finish, shape). If the reference image has rings, jewelry, accessories, bracelets, sleeves, props, or background objects, DO NOT include them. Only render the human hand and the manicured fingernails.
2. CLEAN, DRY SKIN - NO VASELINE OR GREASE: The skin under the nails and around the cuticles must be completely clean, natural, and dry. Strictly NO vaseline, NO petroleum jelly, NO greasy residue, and NO oil pooling under the nail edges.
3. Realistic skin texture, crisp cuticle margins, and natural lighting.`
      });
      parts.push({
        inlineData: {
          mimeType: referenceMimeType,
          data: finalReferenceBase64,
        },
      });
    } else {
      let promptText = '';
      if (mode === '5-nail-set') {
        promptText = `Luxury studio top-down photograph of a complete 5-finger manicure set. Exactly 5 isolated acrylic fingernails lined up horizontally in a neat row from left to right: Thumb, Index, Middle, Ring, Pinky. Nail silhouette shape: ${nailShape}. Design theme: ${prompt}. Clean light linen stone studio background. Sharp macro product photography, high-gloss gel clearcoat, perfect finish. No vaseline, no petroleum jelly, no foreign objects.`;
      } else {
        promptText = `You are an expert salon studio AI. Generate an ultra-photorealistic editorial salon photograph of a real human hand showcasing this exact manicure design: "${prompt}". Clean, natural, dry skin under and around the fingernails with no vaseline, petroleum jelly, or greasy residue. Nail design only, no jewelry, rings, or foreign objects. Natural lighting, crisp cuticle margin, realistic skin texture.`;
      }
      parts.push({ text: promptText });
    }

    const candidateImageModels = ['gemini-3.1-flash-image', 'gemini-3-pro-image'];
    let generatedImageData: string | null = null;
    let lastError = 'Image generation failed';
    let isRateLimited = false;

    keyLoop: for (const apiKey of candidateKeys) {
      for (const model of candidateImageModels) {
        try {
          const res = await fetch(
            `https://aiplatform.googleapis.com/v1/publishers/google/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts }],
                generationConfig: {
                  responseModalities: ['IMAGE'],
                },
              }),
              signal: AbortSignal.timeout(24000),
            }
          );

          if (res.ok) {
            const json = await res.json();
            const imgPart = json?.candidates?.[0]?.content?.parts?.find(
              (p: any) => p.inlineData?.data
            );
            if (imgPart?.inlineData?.data) {
              generatedImageData = `data:${imgPart.inlineData.mimeType || 'image/png'};base64,${imgPart.inlineData.data}`;
              break keyLoop;
            }
          } else {
            const errJson = await res.json().catch(() => ({}));
            lastError = errJson?.error?.message || `HTTP ${res.status}`;
            if (res.status === 429 || lastError.includes('RESOURCE_EXHAUSTED') || lastError.includes('Resource exhausted')) {
              isRateLimited = true;
            }
            console.warn(`[Finglora Vertex AI Image] ${model} unavailable (${res.status}: ${lastError}), trying next key...`);
          }
        } catch (err: unknown) {
          lastError = err instanceof Error ? err.message : 'Network timeout';
        }
      }
    }

    if (generatedImageData) {
      return NextResponse.json({
        success: true,
        imageUrl: generatedImageData,
        creditStatus: serverCreditStatus,
      });
    }

    const returnStatus = isRateLimited ? 429 : 502;
    return NextResponse.json({ error: lastError, isRateLimit: isRateLimited }, { status: returnStatus });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
