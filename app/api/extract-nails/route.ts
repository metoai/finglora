import { NextResponse } from 'next/server';
import { Finger, NailDesign } from '@/types/nail';

interface ExtractionRequestBody {
  imageUrl?: string;
  imageBase64?: string;
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

    if (geminiKey) {
      // Call Gemini 1.5 Flash Vision for deep multimodal classification
      const prompt = `Analyze this manicure photo and extract the design for each of the 5 fingers (thumb, index, middle, ring, pinky).
Return ONLY a valid JSON object matching this schema:
{
  "title": "Editorial Manicure Name",
  "category": "Chrome" | "French" | "Floral" | "Aura" | "Minimal" | "Bold" | "Glass",
  "nails": {
    "thumb": { "finger": "thumb", "title": "...", "baseColor": "#HEX", "accentColor": "#HEX", "pattern": "solid" | "classic-french" | "aura" | "floral" | "chrome-swirl" | "glitter-ombre" | "minimal-line", "shape": "almond" | "square" | "coffin" | "oval" | "stiletto", "length": "short" | "medium" | "long" | "extra-long", "finish": "glossy" | "matte" | "chrome" | "glitter", "clientNote": "..." },
    "index": { ... },
    "middle": { ... },
    "ring": { ... },
    "pinky": { ... }
  }
}`;

      let imagePart: any;
      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        imagePart = {
          inline_data: {
            mime_type: 'image/jpeg',
            data: cleanBase64,
          },
        };
      } else if (imageUrl) {
        // Fetch image as base64
        const res = await fetch(imageUrl);
        const arrayBuf = await res.arrayBuffer();
        const b64 = Buffer.from(arrayBuf).toString('base64');
        const mime = res.headers.get('content-type') || 'image/jpeg';
        imagePart = {
          inline_data: {
            mime_type: mime,
            data: b64,
          },
        };
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  imagePart,
                ],
              },
            ],
            generationConfig: {
              response_mime_type: 'application/json',
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          const parsed = JSON.parse(candidate);
          return NextResponse.json({
            success: true,
            source: 'gemini-vision',
            data: parsed,
          });
        }
      }
    }

    // Default response if Gemini key not set: instructs client to run MediaPipe client-side analysis
    return NextResponse.json({
      success: true,
      source: 'client-mediapipe',
      message: 'Client-side MediaPipe landmark color sampling active.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to extract nails from photo' },
      { status: 500 }
    );
  }
}
