import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface GenerateRequestBody {
  prompt?: string;
  referenceImageBase64?: string;
  referenceImageUrl?: string;
  handImageBase64?: string;
  handImageUrl?: string;
  mode?: '5-nail-set' | 'hand-tryon';
  nailShape?: string;
}

export async function POST(request: Request) {
  try {
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

    // Resolve Hand Base64 & Mime
    let finalHandBase64 = handImageBase64?.replace(/^data:image\/\w+;base64,/, '');
    let handMimeType = handImageBase64?.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';

    if (!finalHandBase64 && handImageUrl) {
      if (handImageUrl.startsWith('/')) {
        try {
          const localPath = path.join(process.cwd(), 'public', handImageUrl);
          if (fs.existsSync(localPath)) {
            const buf = fs.readFileSync(localPath);
            finalHandBase64 = buf.toString('base64');
            handMimeType = handImageUrl.endsWith('.png') ? 'image/png' : 'image/jpeg';
          }
        } catch {}
      } else if (handImageUrl.startsWith('http://') || handImageUrl.startsWith('https://')) {
        try {
          const hRes = await fetch(handImageUrl, { signal: AbortSignal.timeout(6000) });
          if (hRes.ok) {
            const buf = await hRes.arrayBuffer();
            finalHandBase64 = Buffer.from(buf).toString('base64');
            handMimeType = hRes.headers.get('content-type') || 'image/jpeg';
          }
        } catch {}
      }
    }

    // Resolve Reference Base64 & Mime
    let finalReferenceBase64 = referenceImageBase64?.replace(/^data:image\/\w+;base64,/, '');
    let referenceMimeType = referenceImageBase64?.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';

    if (!finalReferenceBase64 && referenceImageUrl) {
      if (referenceImageUrl.startsWith('/')) {
        try {
          const localPath = path.join(process.cwd(), 'public', referenceImageUrl);
          if (fs.existsSync(localPath)) {
            const buf = fs.readFileSync(localPath);
            finalReferenceBase64 = buf.toString('base64');
            referenceMimeType = referenceImageUrl.endsWith('.png') ? 'image/png' : 'image/jpeg';
          }
        } catch {}
      } else if (referenceImageUrl.startsWith('http://') || referenceImageUrl.startsWith('https://')) {
        try {
          const rRes = await fetch(referenceImageUrl, { signal: AbortSignal.timeout(6000) });
          if (rRes.ok) {
            const buf = await rRes.arrayBuffer();
            finalReferenceBase64 = Buffer.from(buf).toString('base64');
            referenceMimeType = rRes.headers.get('content-type') || 'image/jpeg';
          }
        } catch {}
      }
    }

    const parts: any[] = [];

    if (finalReferenceBase64 && finalHandBase64) {
      // Image-to-Image with Reference Nail Design + User's Real Hand
      parts.push({
        text: `Image 1 is the reference inspiration manicure photograph. Image 2 is the photograph of the user's human hand.
You are an expert salon atelier AI.

TASK:
Flawlessly transfer and apply ONLY the nail design (colors, nail art, finish, and ${nailShape} shape) from Image 1 onto the fingernails of the hand in Image 2.

CRITICAL CONSTRAINTS:
1. NAIL DESIGN ONLY - NO FOREIGN OBJECTS: Extract strictly the nail design from Image 1. If Image 1 contains ANY other objects, accessories, rings, jewelry, bracelets, watches, sleeves, fabrics, bottles, flowers, props, or background items, DO NOT copy, transfer, or include them. Absolutely NO jewelry, rings, or foreign objects. Only the fingernails should be modified.
2. CLEAN, DRY SKIN - NO VASELINE OR GREASY RESIDUE: The skin under the fingernails (hyponychium), around the cuticles, and on the finger pads must remain clean, natural, and dry skin. Strictly NO vaseline, NO petroleum jelly, NO greasy shine, NO cuticle oil pooling, and NO glossy gel spills under or around the nails. The lacquer/gel must be cleanly bounded to the top surface of the nail plate with crisp, clean cuticle margins.
3. PRESERVE THE USER'S REAL HAND: Retain the user's exact hand pose, finger anatomy, skin tone, skin texture, knuckles, lighting, and natural background from Image 2.`
      });
      parts.push({
        inlineData: {
          mimeType: referenceMimeType,
          data: finalReferenceBase64,
        },
      });
      parts.push({
        inlineData: {
          mimeType: handMimeType,
          data: finalHandBase64,
        },
      });
    } else if (finalHandBase64) {
      parts.push({
        text: `You are an expert salon atelier AI. Generate an ultra-photorealistic editorial salon photograph of this exact human hand showcasing this manicure design: "${prompt}".

CRITICAL CONSTRAINTS:
1. NAIL DESIGN ONLY - NO FOREIGN OBJECTS: Modify ONLY the fingernails. Do not add any rings, jewelry, bracelets, accessories, or foreign props.
2. CLEAN, DRY SKIN - NO VASELINE OR GREASE: The skin under the fingernails (hyponychium) and around the cuticles must remain completely clean, natural, dry skin. Absolutely NO vaseline, NO petroleum jelly, NO shiny grease, NO cuticle oil pooling, and NO gel spillage under or around the nails. The lacquer must be neatly confined to the nail plate with crisp, sharp cuticle lines.
3. PRESERVE USER'S REAL HAND: Preserve the exact hand pose, finger proportions, skin tone, knuckles, and background from the photo.`
      });
      parts.push({
        inlineData: {
          mimeType: handMimeType,
          data: finalHandBase64,
        },
      });
    } else if (finalReferenceBase64) {
      parts.push({
        text: `You are an expert salon atelier AI. Generate an ultra-photorealistic salon photograph of a real human hand wearing the exact manicure design from this reference image: "${prompt}".

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
        promptText = `Luxury studio top-down photograph of a complete 5-finger manicure set. Exactly 5 isolated acrylic fingernails lined up horizontally in a neat row from left to right: Thumb, Index, Middle, Ring, Pinky. Nail silhouette shape: ${nailShape}. Design theme: ${prompt}. Clean light linen stone atelier background. Sharp macro product photography, high-gloss gel clearcoat, perfect finish. No vaseline, no petroleum jelly, no foreign objects.`;
      } else {
        promptText = `You are an expert salon atelier AI. Generate an ultra-photorealistic editorial salon photograph of a real human hand showcasing this exact manicure design: "${prompt}". Clean, natural, dry skin under and around the fingernails with no vaseline, petroleum jelly, or greasy residue. Nail design only, no jewelry, rings, or foreign objects. Natural lighting, crisp cuticle margin, realistic skin texture.`;
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
      });
    }

    const returnStatus = isRateLimited ? 429 : 502;
    return NextResponse.json({ error: lastError, isRateLimit: isRateLimited }, { status: returnStatus });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
