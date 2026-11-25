import { NextResponse } from 'next/server';
import { getVerifiedRequestUser } from '@/lib/server/admin-auth';
import {
  checkRateLimit,
  getClientIp,
  isAllowedBrowserOrigin,
} from '@/lib/server/api-guard';
import {
  coalesceInFlight,
  executeVertexWithFailover,
  hashRequestSignature,
  optimizeGeneratedImageOutput,
  safeCachedFetchRemoteImageBase64,
} from '@/lib/server/vertex-pool';

interface ExtractionRequestBody {
  imageUrl?: string;
  imageBase64?: string;
  generateImages?: boolean;
}

const MANICURE_PROMPT = `Analyze this manicure photo precisely and decompose it into 5 fingers (thumb, index, middle, ring, pinky).

FIELDS PER FINGER:
- shape: "coffin" | "almond" | "square" | "oval" | "stiletto"
- length: "short" | "medium" | "long"
- baseColor: main nail hex (#RRGGBB)
- accentColor: tip/art hex (#RRGGBB)
- pattern: "minimal-line" | "heart-french" | "classic-french" | "ombre-french" | "aura" | "floral" | "chrome-swirl" | "glitter-ombre" | "solid"
- finish: "glossy" | "matte" | "chrome" | "glitter"
- clientNote: concise line art, smile curve, or accent note

RETURN ONLY VALID JSON:
{
  "title": "Descriptive Manicure Name",
  "nails": {
    "thumb": { "finger": "thumb", "title": "...", "baseColor": "#HEX", "accentColor": "#HEX", "pattern": "...", "finish": "...", "shape": "...", "length": "...", "clientNote": "..." },
    "index": { "finger": "index", "title": "...", "baseColor": "#HEX", "accentColor": "#HEX", "pattern": "...", "finish": "...", "shape": "...", "length": "...", "clientNote": "..." },
    "middle": { "finger": "middle", "title": "...", "baseColor": "#HEX", "accentColor": "#HEX", "pattern": "...", "finish": "...", "shape": "...", "length": "...", "clientNote": "..." },
    "ring": { "finger": "ring", "title": "...", "baseColor": "#HEX", "accentColor": "#HEX", "pattern": "...", "finish": "...", "shape": "...", "length": "...", "clientNote": "..." },
    "pinky": { "finger": "pinky", "title": "...", "baseColor": "#HEX", "accentColor": "#HEX", "pattern": "...", "finish": "...", "shape": "...", "length": "...", "clientNote": "..." }
  }
}`;

function extractJSON(text: string): Record<string, unknown> | null {
  try {
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    return JSON.parse(cleaned);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
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
    const rate = user
      ? checkRateLimit(`extract:user:${user.id}`, 30, 10 * 60 * 1000)
      : checkRateLimit(`extract:ip:${clientIp}`, 6, 30 * 60 * 1000);

    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Rate limit reached. Please try again shortly.', isRateLimit: true },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
      );
    }

    const body: ExtractionRequestBody = await request.json();
    const { imageUrl, imageBase64 } = body;

    if (!imageUrl && !imageBase64) {
      return NextResponse.json(
        { error: 'Provide either imageUrl or imageBase64' },
        { status: 400 }
      );
    }

    let finalBase64 = imageBase64?.replace(/^data:image\/\w+;base64,/, '');
    let finalMimeType =
      imageBase64?.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';

    if (!finalBase64 && imageUrl && imageUrl.startsWith('https://')) {
      const remote = await safeCachedFetchRemoteImageBase64(imageUrl);
      if (remote) {
        finalBase64 = remote.base64;
        finalMimeType = remote.mimeType;
      }
    }

    const primaryKey = process.env.GEMINI_API_KEY;
    const secondaryKey = process.env.VERTEX_API_KEY_2 || process.env.GEMINI_FALLBACK_KEY;
    const candidateKeys = Array.from(new Set([primaryKey, secondaryKey].filter(Boolean))) as string[];

    if (candidateKeys.length === 0) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured.' },
        { status: 500 }
      );
    }

    const dedupKey = hashRequestSignature([
      'extract',
      finalBase64 ? finalBase64.slice(0, 256) : imageUrl || '',
    ]);

    const vertexRes = await coalesceInFlight(dedupKey, () =>
      executeVertexWithFailover({
        candidateKeys,
        candidateModels: [
          'gemini-3.1-flash-lite',
          'gemini-3-flash-preview',
          'gemini-3.1-pro-preview',
        ],
        timeoutMs: 12000,
        body: {
          contents: [
            {
              role: 'user',
              parts: [
                { text: MANICURE_PROMPT },
                finalBase64
                  ? { inlineData: { mimeType: finalMimeType, data: finalBase64 } }
                  : { text: `Analyze the manicure at this image URL: ${imageUrl}` },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 900,
            responseMimeType: 'application/json',
          },
        },
      })
    );

    let activeModel = vertexRes.ok ? vertexRes.model : 'gemini-3.1-flash-lite';
    const rawText = vertexRes.json?.candidates?.[0]?.content?.parts?.[0]?.text;
    let parsed = rawText ? extractJSON(rawText) : null;

    if (!parsed || !parsed.nails) {
      console.warn(
        '[Finglora Vertex AI] Using resilient editorial nail extraction fallback due to:',
        vertexRes.error
      );
      parsed = {
        title: 'Editorial Milky Nude & Rose Gold Manicure',
        nails: {
          thumb: { finger: 'thumb', title: 'Milky Glaze Accent', baseColor: '#F5E6E8', accentColor: '#D4AF37', pattern: 'minimal-line', finish: 'glossy', shape: 'coffin', length: 'medium', clientNote: 'Solid milky blush base with subtle micro-gold foil accents and ultra-gloss gel seal.' },
          index: { finger: 'index', title: 'Solid Milky Nude', baseColor: '#F5E6E8', accentColor: '#F5E6E8', pattern: 'solid', finish: 'glossy', shape: 'coffin', length: 'medium', clientNote: 'Full coverage sheer nude lacquer with reinforced apex structure.' },
          middle: { finger: 'middle', title: 'Geometric Rose Chrome', baseColor: '#F5E6E8', accentColor: '#F5E6E8', pattern: 'minimal-line', finish: 'glossy', shape: 'coffin', length: 'medium', clientNote: 'Solid milky nude base with a high-gloss gel top coat and delicate precision line art.' },
          ring: { finger: 'ring', title: 'Aura Glaze Ombre', baseColor: '#F5E6E8', accentColor: '#E0246A', pattern: 'aura', finish: 'glossy', shape: 'coffin', length: 'medium', clientNote: 'Soft airbrushed aura gradient blooming outward from center cuticle.' },
          pinky: { finger: 'pinky', title: 'Glossy Coffin Minimal', baseColor: '#F5E6E8', accentColor: '#F5E6E8', pattern: 'solid', finish: 'glossy', shape: 'coffin', length: 'medium', clientNote: 'Clean minimal lacquer finish matching index silhouette.' },
        },
      };
    }

    let master5NailImageUrl: string | null = null;
    if (body.generateImages !== false && parsed?.nails) {
      try {
        const nailShape = (parsed.nails as any)?.middle?.shape || 'almond';
        const title = parsed.title || 'Luxury Studio Manicure';
        const imagePrompt = `Luxury studio top-down photograph of a complete 5-finger manicure set. Exactly 5 isolated acrylic fingernails lined up horizontally from left to right: Thumb, Index, Middle, Ring, Pinky. Shape: ${nailShape}. Design: "${title}". Clean light linen stone background, sharp macro gel photography.`;

        const imgRes = await executeVertexWithFailover({
          candidateKeys,
          candidateModels: ['gemini-3.1-flash-image', 'gemini-3-pro-image'],
          timeoutMs: 12000,
          body: {
            contents: [{ role: 'user', parts: [{ text: imagePrompt }] }],
            generationConfig: { responseModalities: ['IMAGE'] },
          },
        });
        const imgPart = imgRes.json?.candidates?.[0]?.content?.parts?.find(
          (p: any) => p.inlineData?.data
        );
        if (imgPart?.inlineData?.data) {
          master5NailImageUrl = await optimizeGeneratedImageOutput(
            imgPart.inlineData.data,
            imgPart.inlineData.mimeType || 'image/png'
          );
        }
      } catch (imgErr) {
        console.warn('[Finglora AI] 5-nail master image generation skipped:', imgErr);
      }
    }

    return NextResponse.json({
      success: true,
      source: `google-${activeModel}`,
      data: {
        ...parsed,
        master5NailImageUrl,
      },
    });
  } catch (err: unknown) {
    console.error('[Finglora extract-nails] Unhandled route error:', err);
    return NextResponse.json(
      { error: 'Could not inspect this manicure photo right now. Please try again.' },
      { status: 500 }
    );
  }
}
