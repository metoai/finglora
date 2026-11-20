import { NextResponse } from 'next/server';

interface ExtractionRequestBody {
  imageUrl?: string;
  imageBase64?: string;
}

const MANICURE_PROMPT = `You are Finglora's Master Manicure Analyzer powered by Google Gemini.
Examine this nail art photograph with extreme precision and decompose the design into 5 discrete finger specifications (thumb, index, middle, ring, pinky).

ANALYZE EACH FINGER:
1. Shape Architecture:
   - Identify silhouette: "coffin" (tapered flat tip), "almond" (organic tapered curve), "square" (straight 90-degree edge), "oval", or "stiletto" (sharp pointed).
   - Identify length: "short", "medium", "long".
2. Precise Color Matrix:
   - baseColor: Hex shade of main nail body (e.g. #ECE0E1 for milky white, #D4A5A5 for nude blush).
   - accentColor: Hex shade of tip, line art, or design elements (e.g. #C8A182 for metallic rose gold, #FFFFFF for white French).
3. Artistry Pattern:
   - pattern: "minimal-line" (geometric striping tape / metallic lines), "heart-french" (French tips with hearts), "classic-french", "ombre-french", "aura", "floral", "chrome-swirl", "glitter-ombre", "solid".
4. Specific Design Notes:
   - In clientNote, describe exact line angles, smile curve depth, gem clusters, or negative space art.
5. Finish:
   - finish: "glossy" | "matte" | "chrome" | "glitter".

RETURN ONLY RAW VALID JSON MATCHING THIS EXACT SCHEMA:
{
  "title": "Creative Manicure Name",
  "nails": {
    "thumb": {
      "finger": "thumb",
      "title": "Descriptive Name",
      "baseColor": "#HEX",
      "accentColor": "#HEX",
      "pattern": "minimal-line" | "classic-french" | "heart-french" | "ombre-french" | "aura" | "floral" | "chrome-swirl" | "glitter-ombre" | "solid",
      "finish": "glossy" | "matte" | "chrome" | "glitter",
      "shape": "coffin" | "almond" | "oval" | "square" | "stiletto",
      "length": "short" | "medium" | "long",
      "clientNote": "Detailed description of line art, curvature, and finish"
    },
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
    const body: ExtractionRequestBody = await request.json();
    const { imageUrl, imageBase64 } = body;

    if (!imageUrl && !imageBase64) {
      return NextResponse.json(
        { error: 'Provide either imageUrl or imageBase64' },
        { status: 400 }
      );
    }

    const primaryKey = process.env.GEMINI_API_KEY;
    const fallbackKey = process.env.GEMINI_FALLBACK_KEY;
    const candidateKeys = Array.from(new Set([primaryKey, fallbackKey].filter(Boolean))) as string[];

    if (candidateKeys.length === 0) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured.' },
        { status: 500 }
      );
    }

    let finalBase64 = imageBase64?.replace(/^data:image\/\w+;base64,/, '');
    let finalMimeType = imageBase64?.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';

    if (!finalBase64 && imageUrl) {
      try {
        const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(6000) });
        if (imgRes.ok) {
          const buffer = await imgRes.arrayBuffer();
          finalBase64 = Buffer.from(buffer).toString('base64');
          finalMimeType = imgRes.headers.get('content-type') || 'image/jpeg';
        }
      } catch {
        // Continue if fetch failed
      }
    }

    // Google Gemini Vision API (Primary: gemini-3.5-flash-lite for instant <1s analysis, fallback to 3.8-flash)
    const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.5-flash'];
    let geminiData: Record<string, any> | null = null;
    let activeModel = 'gemini-3.5-flash-lite';
    let lastErrorMsg = 'Google Gemini analysis request failed';

    keyLoop: for (const key of candidateKeys) {
      for (const model of candidateModels) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
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
                  responseMimeType: 'application/json',
                },
              }),
              signal: AbortSignal.timeout(8000),
            }
          );

          if (geminiRes.ok) {
            geminiData = await geminiRes.json();
            activeModel = model;
            break keyLoop;
          } else {
            const errorData = await geminiRes.json().catch(() => ({}));
            lastErrorMsg = errorData?.error?.message || `HTTP ${geminiRes.status}`;
            console.warn(`[Finglora Gemini Vision] ${model} unavailable (${geminiRes.status}: ${lastErrorMsg}), attempting fallback...`);
          }
        } catch (err: unknown) {
          lastErrorMsg = err instanceof Error ? err.message : 'Network error';
        }
      }
    }

    if (!geminiData) {
      return NextResponse.json({ error: lastErrorMsg }, { status: 503 });
    }

    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = rawText ? extractJSON(rawText) : null;

    if (!parsed || !parsed.nails) {
      return NextResponse.json(
        { error: 'Failed to parse structured nail design from Gemini response', raw: rawText },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      source: `google-${activeModel}`,
      data: parsed,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gemini vision extraction error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
