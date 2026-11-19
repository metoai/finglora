import { NextResponse } from 'next/server';

interface ExtractionRequestBody {
  imageUrl?: string;
  imageBase64?: string;
}

const MANICURE_PBR_PROMPT = `You are Finglora's Master Nail Artistry Computer Vision & Photometric Analyzer.
Your task is to analyze the provided manicure photograph with extreme optical precision and decompose the design into 5 discrete, standalone finger specifications (thumb, index, middle, ring, pinky) formatted for a 3D Physically Based Rendering (PBR) shader engine.

ANALYZE EACH FINGER INDIVIDUALLY:
1. Shape Architecture:
   - Identify the exact silhouette: "coffin" (tapered square tip), "almond" (soft tapered curve), "square" (straight 90-degree edge), "oval", or "stiletto" (sharp pointed).
   - Identify relative length: "short", "medium", "long".
2. Optical Color Matrix (Exact Hex Codes):
   - baseColor: The primary nail bed lacquer shade (e.g., #D4A5A5 for dusty rose nude).
   - accentColor: The primary tip or art shade (e.g., #F7D1D1 for pastel pink French).
3. Artistry Pattern & Vector Geometry:
   - pattern: "heart-french" | "classic-french" | "ombre-french" | "aura" | "floral" | "chrome-swirl" | "glitter-ombre" | "minimal-line" | "solid".
   - If French tip has a delicate heart outline on the middle/ring finger: pattern is "heart-french".
   - If gradient French: "ombre-french".
4. Embellishments:
   - In clientNote, explicitly describe crystal rhinestones, gems, heart outlines, smile lines, and gloss layers.
5. Finish:
   - finish: "glossy" | "matte" | "chrome" | "glitter".

RETURN ONLY RAW VALID JSON (no markdown fences, no explanation):
{
  "title": "Creative Manicure Name",
  "nails": {
    "thumb": {
      "finger": "thumb",
      "title": "Descriptive Name",
      "baseColor": "#HEX",
      "accentColor": "#HEX",
      "pattern": "solid" | "classic-french" | "heart-french" | "ombre-french" | "aura" | "floral" | "chrome-swirl" | "glitter-ombre" | "minimal-line",
      "finish": "glossy" | "matte" | "chrome" | "glitter",
      "shape": "coffin" | "almond" | "oval" | "square" | "stiletto",
      "length": "short" | "medium" | "long",
      "clientNote": "Detailed description: crystal rhinestones, heart outlines, high-gloss apex"
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

    const geminiKey = process.env.GEMINI_API_KEY;
    const freeaiKey = process.env.FREEAI_API_KEY;

    // 1. Preferred Tier: Google Gemini 2.0 Flash Vision
    if (geminiKey) {
      try {
        const rawBase64 = imageBase64?.replace(/^data:image\/\w+;base64,/, '');
        const mimeType = imageBase64?.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: MANICURE_PBR_PROMPT },
                    rawBase64
                      ? { inlineData: { mimeType, data: rawBase64 } }
                      : { text: `Analyze the manicure at this image URL: ${imageUrl}` },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.1,
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          const parsed = rawText ? extractJSON(rawText) : null;
          if (parsed && parsed.nails) {
            return NextResponse.json({
              success: true,
              source: 'google-gemini-2.0',
              data: parsed,
            });
          }
        }
      } catch (geminiErr) {
        console.warn('[Finglora Vision] Gemini 2.0 extraction error, falling back:', geminiErr);
      }
    }

    // 2. Free Tier: Free.ai Qwen Vision
    if (!freeaiKey) {
      return NextResponse.json(
        { error: 'No AI Vision key configured (GEMINI_API_KEY or FREEAI_API_KEY).' },
        { status: 500 }
      );
    }

    const imageUri = imageBase64
      ? imageBase64.startsWith('data:')
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`
      : imageUrl!;

    const freeRes = await fetch('https://api.free.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${freeaiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen7b',
        messages: [
          {
            role: 'system',
            content:
              'You are Finglora AI Nail Vision Extractor. You examine manicure reference photos and extract the exact 5-finger nail art designs, color codes, finishes, and salon formulas. Return ONLY raw valid JSON.',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: MANICURE_PBR_PROMPT },
              { type: 'image_url', image_url: { url: imageUri } },
            ],
          },
        ],
        temperature: 0.1,
      }),
    });

    const freeData = await freeRes.json();

    if (!freeRes.ok) {
      console.error('[Finglora Vision] Free.ai error:', freeData);
      return NextResponse.json(
        { error: freeData?.error?.message || 'Free.ai extraction request failed' },
        { status: freeRes.status }
      );
    }

    const content = freeData.choices?.[0]?.message?.content as string;
    const parsed = content ? extractJSON(content) : null;

    if (!parsed || !parsed.nails) {
      return NextResponse.json(
        { error: 'Failed to parse structured nail design from AI response', raw: content },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      source: 'free.ai',
      data: parsed,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI vision extraction error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
