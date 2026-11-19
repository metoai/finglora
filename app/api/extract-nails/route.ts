import { NextResponse } from 'next/server';

interface ExtractionRequestBody {
  imageUrl?: string;
  imageBase64?: string;
}

const MANICURE_PROMPT = `You are analyzing a manicure/nail art photograph. Study every finger CAREFULLY.

CRITICAL RULES:
- Extract the EXACT hex color codes you see. Do NOT default to generic colors.
- If nails have French tips with hearts drawn on them, the pattern is "heart-french".
- If nails have gradient/ombre French tips, the pattern is "ombre-french".
- If nails have standard white/colored French tips, the pattern is "classic-french".
- baseColor = the main body/bed color of the nail (the larger area).
- accentColor = the tip color, heart color, or decorative element color.
- Detect the actual nail shape: coffin (tapered square), almond, oval, square, stiletto.
- Detect actual length: short, medium, long.
- In clientNote, describe gems, rhinestones, 3D elements, heart outlines, swoopy lines, glitter placement.

Return ONLY valid JSON (no markdown fences, no explanation):
{
  "title": "Creative Manicure Name",
  "nails": {
    "thumb": {
      "finger": "thumb",
      "title": "Descriptive Name",
      "baseColor": "#HEX (exact color you see)",
      "accentColor": "#HEX (tip/accent color)",
      "pattern": "solid" | "classic-french" | "heart-french" | "ombre-french" | "aura" | "floral" | "chrome-swirl" | "glitter-ombre" | "minimal-line",
      "finish": "glossy" | "matte" | "chrome" | "glitter",
      "shape": "coffin" | "almond" | "oval" | "square" | "stiletto",
      "length": "short" | "medium" | "long",
      "clientNote": "Detailed description: gems, hearts, swoopy lines, rhinestones, 3D art"
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
      try { return JSON.parse(match[0]); } catch { return null; }
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

    const freeaiKey = process.env.FREEAI_API_KEY;
    if (!freeaiKey) {
      return NextResponse.json(
        { error: 'FREEAI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const imageUri = imageBase64
      ? (imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`)
      : imageUrl!;

    // Free.ai API — Single Dedicated AI Vision Extractor
    const freeRes = await fetch('https://api.free.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${freeaiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen7b',
        messages: [
          {
            role: 'system',
            content: 'You are Finglora AI Nail Vision Extractor. You examine manicure reference photos and extract the exact 5-finger nail art designs, color codes, finishes, and salon formulas. Return ONLY raw valid JSON.',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: MANICURE_PROMPT },
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
        { error: 'Failed to parse structured nail design from Free.ai response', raw: content },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      source: 'free.ai',
      data: parsed,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Free.ai vision extraction error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
