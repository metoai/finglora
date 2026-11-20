import { NextResponse } from 'next/server';

interface GenerateRequestBody {
  prompt: string;
  handImageBase64?: string;
  mode?: '5-nail-set' | 'hand-tryon';
  nailShape?: string;
}

export async function POST(request: Request) {
  try {
    const body: GenerateRequestBody = await request.json();
    const { prompt, handImageBase64, mode = 'hand-tryon', nailShape = 'almond' } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const primaryKey = process.env.GEMINI_API_KEY;
    const secondaryKey = process.env.VERTEX_API_KEY_2;
    const candidateKeys = Array.from(new Set([primaryKey, secondaryKey].filter(Boolean))) as string[];

    if (candidateKeys.length === 0) {
      return NextResponse.json({ error: 'Vertex API key is not configured' }, { status: 500 });
    }

    const rawHandBase64 = handImageBase64?.replace(/^data:image\/\w+;base64,/, '');
    const mimeType = handImageBase64?.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';

    let promptText = '';
    if (mode === '5-nail-set') {
      promptText = `Luxury studio top-down photograph of a complete 5-finger manicure set. Exactly 5 isolated acrylic fingernails lined up horizontally in a neat row from left to right: Thumb, Index, Middle, Ring, Pinky. Nail silhouette shape: ${nailShape}. Design theme: ${prompt}. Clean light linen stone atelier background. Sharp macro product photography, high-gloss gel clearcoat, perfect finish.`;
    } else {
      promptText = `You are an expert nail artist AI. Generate an ultra-photorealistic editorial salon photograph of a real human hand showcasing this exact manicure design: "${prompt}". Natural lighting, high-gloss gel clearcoat, perfect cuticle margin, realistic skin texture.`;
    }

    const parts: any[] = [{ text: promptText }];

    if (rawHandBase64 && mode === 'hand-tryon') {
      parts.push({
        inlineData: {
          mimeType,
          data: rawHandBase64,
        },
      });
    }

    const candidateImageModels = ['gemini-3.1-flash-image', 'gemini-3-pro-image'];
    let generatedImageData: string | null = null;
    let lastError = 'Image generation failed';

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
              signal: AbortSignal.timeout(18000),
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

    return NextResponse.json({ error: lastError }, { status: 502 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
