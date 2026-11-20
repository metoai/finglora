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
        text: `Image 1 is the reference manicure design photograph. Image 2 is the photograph of the user's human hand. You are an expert salon AI. Flawlessly apply the manicure design, colors, patterns, and nail shape from Image 1 onto the fingernails of the hand in Image 2. Preserve the exact skin tone, finger positions, hand pose, lighting, and natural background from Image 2 while rendering high-gloss salon gel clearcoat on the nails.`
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
        text: `You are an expert nail artist AI. Generate an ultra-photorealistic editorial salon photograph of this exact human hand showcasing this manicure design: "${prompt}". Preserve the hand pose, skin tone, and fingers while applying high-gloss gel clearcoat to the nails.`
      });
      parts.push({
        inlineData: {
          mimeType: handMimeType,
          data: finalHandBase64,
        },
      });
    } else if (finalReferenceBase64) {
      parts.push({
        text: `You are an expert nail artist AI. Generate an ultra-photorealistic salon photograph of a real human hand wearing the exact manicure design from this reference image: "${prompt}". Natural lighting, high-gloss gel clearcoat, perfect cuticle margin, realistic skin texture.`
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
        promptText = `Luxury studio top-down photograph of a complete 5-finger manicure set. Exactly 5 isolated acrylic fingernails lined up horizontally in a neat row from left to right: Thumb, Index, Middle, Ring, Pinky. Nail silhouette shape: ${nailShape}. Design theme: ${prompt}. Clean light linen stone atelier background. Sharp macro product photography, high-gloss gel clearcoat, perfect finish.`;
      } else {
        promptText = `You are an expert nail artist AI. Generate an ultra-photorealistic editorial salon photograph of a real human hand showcasing this exact manicure design: "${prompt}". Natural lighting, high-gloss gel clearcoat, perfect cuticle margin, realistic skin texture.`;
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
