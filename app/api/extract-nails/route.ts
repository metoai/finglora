import { NextResponse } from 'next/server';
import { Finger, NailDesign } from '@/types/nail';

interface ExtractionRequestBody {
  imageUrl?: string;
  imageBase64?: string;
}

const MANICURE_PROMPT = `Analyze this manicure photograph and extract the individual design for all 5 fingers (thumb, index, middle, ring, pinky).
Return ONLY a valid JSON object matching this exact schema:
{
  "title": "Editorial Manicure Name",
  "category": "Chrome" | "French" | "Floral" | "Aura" | "Minimal" | "Bold" | "Glass",
  "nails": {
    "thumb": { "finger": "thumb", "title": "Thumb Design", "baseColor": "#HEX", "accentColor": "#HEX", "pattern": "solid" | "classic-french" | "aura" | "floral" | "chrome-swirl" | "glitter-ombre" | "minimal-line", "shape": "almond" | "square" | "coffin" | "oval" | "stiletto", "length": "short" | "medium" | "long" | "extra-long", "finish": "glossy" | "matte" | "chrome" | "glitter", "clientNote": "Technician formula description" },
    "index": { "finger": "index", "title": "Index Design", "baseColor": "#HEX", "accentColor": "#HEX", "pattern": "solid" | "classic-french" | "aura" | "floral" | "chrome-swirl" | "glitter-ombre" | "minimal-line", "shape": "almond" | "square" | "coffin" | "oval" | "stiletto", "length": "short" | "medium" | "long" | "extra-long", "finish": "glossy" | "matte" | "chrome" | "glitter", "clientNote": "Technician formula description" },
    "middle": { "finger": "middle", "title": "Middle Design", "baseColor": "#HEX", "accentColor": "#HEX", "pattern": "solid" | "classic-french" | "aura" | "floral" | "chrome-swirl" | "glitter-ombre" | "minimal-line", "shape": "almond" | "square" | "coffin" | "oval" | "stiletto", "length": "short" | "medium" | "long" | "extra-long", "finish": "glossy" | "matte" | "chrome" | "glitter", "clientNote": "Technician formula description" },
    "ring": { "finger": "ring", "title": "Ring Accent Design", "baseColor": "#HEX", "accentColor": "#HEX", "pattern": "solid" | "classic-french" | "aura" | "floral" | "chrome-swirl" | "glitter-ombre" | "minimal-line", "shape": "almond" | "square" | "coffin" | "oval" | "stiletto", "length": "short" | "medium" | "long" | "extra-long", "finish": "glossy" | "matte" | "chrome" | "glitter", "clientNote": "Technician formula description" },
    "pinky": { "finger": "pinky", "title": "Pinky Design", "baseColor": "#HEX", "accentColor": "#HEX", "pattern": "solid" | "classic-french" | "aura" | "floral" | "chrome-swirl" | "glitter-ombre" | "minimal-line", "shape": "almond" | "square" | "coffin" | "oval" | "stiletto", "length": "short" | "medium" | "long" | "extra-long", "finish": "glossy" | "matte" | "chrome" | "glitter", "clientNote": "Technician formula description" }
  }
}`;

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

    const yepKey = process.env.YEPAPI_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    // 1. Try YepAPI (yepapi.com) Vision API if key configured
    if (yepKey) {
      try {
        const imageUri = imageBase64
          ? (imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`)
          : imageUrl;

        const yepRes = await fetch('https://api.yepapi.com/v1/ai/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${yepKey}`,
            'x-api-key': yepKey,
          },
          body: JSON.stringify({
            model: 'openai/gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are Finglora AI Vision Extractor. Always return strict JSON containing 5-finger manicure details.',
              },
              {
                role: 'user',
                content: [
                  { type: 'text', text: MANICURE_PROMPT },
                  { type: 'image_url', image_url: { url: imageUri } },
                ],
              },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2,
          }),
        });

        const yepData = await yepRes.json();

        if (yepRes.ok && yepData.choices?.[0]?.message?.content) {
          const content = yepData.choices[0].message.content;
          const parsed = JSON.parse(content);
          return NextResponse.json({
            success: true,
            source: 'yepapi-gpt4o',
            data: parsed,
          });
        } else {
          console.warn('[Finglora Vision] YepAPI response:', yepData?.error?.message || yepData);
        }
      } catch (yepErr) {
        console.warn('[Finglora Vision] YepAPI call failed, falling back:', yepErr);
      }
    }

    // 2. Try Gemini Vision if GEMINI_API_KEY configured
    if (geminiKey) {
      try {
        let imagePart: any;
        if (imageBase64) {
          const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
          imagePart = {
            inline_data: { mime_type: 'image/jpeg', data: cleanBase64 },
          };
        } else if (imageUrl) {
          const res = await fetch(imageUrl);
          const arrayBuf = await res.arrayBuffer();
          const b64 = Buffer.from(arrayBuf).toString('base64');
          const mime = res.headers.get('content-type') || 'image/jpeg';
          imagePart = {
            inline_data: { mime_type: mime, data: b64 },
          };
        }

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: MANICURE_PROMPT }, imagePart] }],
              generationConfig: { response_mime_type: 'application/json' },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidate) {
            return NextResponse.json({
              success: true,
              source: 'gemini-vision',
              data: JSON.parse(candidate),
            });
          }
        }
      } catch (geminiErr) {
        console.warn('[Finglora Vision] Gemini fallback error:', geminiErr);
      }
    }

    // 3. Graceful fallback: Client-side MediaPipe landmark color sampling
    return NextResponse.json({
      success: true,
      source: 'client-mediapipe',
      message: 'MediaPipe landmark color sampling active.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to extract nails from photo' },
      { status: 500 }
    );
  }
}
