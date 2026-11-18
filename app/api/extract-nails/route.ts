import { NextResponse } from 'next/server';

interface ExtractionRequestBody {
  imageUrl?: string;
  imageBase64?: string;
}

const MANICURE_PROMPT = `Analyze this manicure photograph in extreme visual detail.
Extract the EXACT nail art design, colors, finish, and technique for all 5 fingers (thumb, index, middle, ring, pinky).
Do not simplify to plain generic colors — capture the real artistry (e.g., chrome swirls, micro French tips, 3D accents, aura gradients, velvet cat-eye, floral line work, glitter ombre).

Return ONLY a valid JSON object matching this exact schema — no markdown fences, no explanation, raw JSON only:
{
  "title": "Editorial Manicure Name",
  "nails": {
    "thumb": {
      "finger": "thumb",
      "title": "Specific Nail Art Name",
      "baseColor": "#HEX",
      "accentColor": "#HEX",
      "pattern": "solid" | "classic-french" | "aura" | "floral" | "chrome-swirl" | "glitter-ombre" | "minimal-line",
      "finish": "glossy" | "matte" | "chrome" | "glitter",
      "clientNote": "Detailed technician artistry recipe and layers"
    },
    "index": {
      "finger": "index",
      "title": "Specific Nail Art Name",
      "baseColor": "#HEX",
      "accentColor": "#HEX",
      "pattern": "solid" | "classic-french" | "aura" | "floral" | "chrome-swirl" | "glitter-ombre" | "minimal-line",
      "finish": "glossy" | "matte" | "chrome" | "glitter",
      "clientNote": "Detailed technician artistry recipe and layers"
    },
    "middle": {
      "finger": "middle",
      "title": "Specific Nail Art Name",
      "baseColor": "#HEX",
      "accentColor": "#HEX",
      "pattern": "solid" | "classic-french" | "aura" | "floral" | "chrome-swirl" | "glitter-ombre" | "minimal-line",
      "finish": "glossy" | "matte" | "chrome" | "glitter",
      "clientNote": "Detailed technician artistry recipe and layers"
    },
    "ring": {
      "finger": "ring",
      "title": "Specific Nail Art Name",
      "baseColor": "#HEX",
      "accentColor": "#HEX",
      "pattern": "solid" | "classic-french" | "aura" | "floral" | "chrome-swirl" | "glitter-ombre" | "minimal-line",
      "finish": "glossy" | "matte" | "chrome" | "glitter",
      "clientNote": "Detailed technician artistry recipe and layers"
    },
    "pinky": {
      "finger": "pinky",
      "title": "Specific Nail Art Name",
      "baseColor": "#HEX",
      "accentColor": "#HEX",
      "pattern": "solid" | "classic-french" | "aura" | "floral" | "chrome-swirl" | "glitter-ombre" | "minimal-line",
      "finish": "glossy" | "matte" | "chrome" | "glitter",
      "clientNote": "Detailed technician artistry recipe and layers"
    }
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
