import { NextResponse } from 'next/server';

interface ExtractionRequestBody {
  imageUrl?: string;
  imageBase64?: string;
}

const MANICURE_PROMPT = `Analyze this manicure photograph and extract the individual design for all 5 fingers (thumb, index, middle, ring, pinky).
Return ONLY a valid JSON object matching this exact schema — no markdown, no explanation, just the raw JSON object:
{
  "title": "Editorial Manicure Name",
  "nails": {
    "thumb":  { "finger": "thumb",  "title": "string", "baseColor": "#HEX", "accentColor": "#HEX", "pattern": "solid"|"classic-french"|"aura"|"floral"|"chrome-swirl"|"glitter-ombre"|"minimal-line", "shape": "almond"|"square"|"coffin"|"oval"|"stiletto", "length": "short"|"medium"|"long"|"extra-long", "finish": "glossy"|"matte"|"chrome"|"glitter", "clientNote": "Formula description" },
    "index":  { "finger": "index",  "title": "string", "baseColor": "#HEX", "accentColor": "#HEX", "pattern": "solid"|"classic-french"|"aura"|"floral"|"chrome-swirl"|"glitter-ombre"|"minimal-line", "shape": "almond"|"square"|"coffin"|"oval"|"stiletto", "length": "short"|"medium"|"long"|"extra-long", "finish": "glossy"|"matte"|"chrome"|"glitter", "clientNote": "Formula description" },
    "middle": { "finger": "middle", "title": "string", "baseColor": "#HEX", "accentColor": "#HEX", "pattern": "solid"|"classic-french"|"aura"|"floral"|"chrome-swirl"|"glitter-ombre"|"minimal-line", "shape": "almond"|"square"|"coffin"|"oval"|"stiletto", "length": "short"|"medium"|"long"|"extra-long", "finish": "glossy"|"matte"|"chrome"|"glitter", "clientNote": "Formula description" },
    "ring":   { "finger": "ring",   "title": "string", "baseColor": "#HEX", "accentColor": "#HEX", "pattern": "solid"|"classic-french"|"aura"|"floral"|"chrome-swirl"|"glitter-ombre"|"minimal-line", "shape": "almond"|"square"|"coffin"|"oval"|"stiletto", "length": "short"|"medium"|"long"|"extra-long", "finish": "glossy"|"matte"|"chrome"|"glitter", "clientNote": "Formula description" },
    "pinky":  { "finger": "pinky",  "title": "string", "baseColor": "#HEX", "accentColor": "#HEX", "pattern": "solid"|"classic-french"|"aura"|"floral"|"chrome-swirl"|"glitter-ombre"|"minimal-line", "shape": "almond"|"square"|"coffin"|"oval"|"stiletto", "length": "short"|"medium"|"long"|"extra-long", "finish": "glossy"|"matte"|"chrome"|"glitter", "clientNote": "Formula description" }
  }
}`;

/**
 * Extracts clean JSON from a model response that may contain markdown fences.
 */
function extractJSON(text: string): Record<string, unknown> | null {
  try {
    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    return JSON.parse(cleaned);
  } catch {
    // Try to find the first {...} block
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
    const yepKey    = process.env.YEPAPI_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    // Build a usable image URI (data: or remote URL)
    const imageUri = imageBase64
      ? (imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`)
      : imageUrl!;

    // ─────────────────────────────────────────────────────────────────
    // TIER 1 — Free.ai Qwen Vision (self-hosted, vision-capable, free)
    //          Endpoint: https://api.free.ai/v1/chat/completions
    //          Model:    qwen7b  (Qwen3-30B-A3B-Instruct — vision on)
    // ─────────────────────────────────────────────────────────────────
    if (freeaiKey) {
      try {
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
                content: 'You are Finglora AI Vision Extractor. Extract per-finger nail designs from manicure images. Always return only raw, valid JSON — no markdown, no explanation.',
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

        if (freeRes.ok && freeData.choices?.[0]?.message?.content) {
          const content = freeData.choices[0].message.content as string;
          const parsed = extractJSON(content);
          if (parsed && parsed.nails) {
            console.log('[Finglora Vision] Free.ai extracted manicure:', parsed.title);
            return NextResponse.json({
              success: true,
              source: 'freeai-qwen-vision',
              data: parsed,
            });
          }
        } else {
          console.warn('[Finglora Vision] Free.ai response error:', freeData?.error || freeData);
        }
      } catch (freeErr) {
        console.warn('[Finglora Vision] Free.ai call failed, trying next tier:', freeErr);
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // TIER 2 — YepAPI (GPT-4o-mini vision — requires paid balance)
    // ─────────────────────────────────────────────────────────────────
    if (yepKey) {
      try {
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
          const parsed = extractJSON(yepData.choices[0].message.content);
          if (parsed && parsed.nails) {
            return NextResponse.json({ success: true, source: 'yepapi-gpt4o', data: parsed });
          }
        } else {
          console.warn('[Finglora Vision] YepAPI response:', yepData?.error?.message || yepData);
        }
      } catch (yepErr) {
        console.warn('[Finglora Vision] YepAPI call failed:', yepErr);
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // TIER 3 — Gemini 1.5 Flash Vision
    // ─────────────────────────────────────────────────────────────────
    if (geminiKey) {
      try {
        let imagePart: Record<string, unknown>;
        if (imageBase64) {
          const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
          imagePart = { inline_data: { mime_type: 'image/jpeg', data: cleanBase64 } };
        } else {
          const res = await fetch(imageUrl!);
          const arrayBuf = await res.arrayBuffer();
          const b64 = Buffer.from(arrayBuf).toString('base64');
          const mime = res.headers.get('content-type') || 'image/jpeg';
          imagePart = { inline_data: { mime_type: mime, data: b64 } };
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
          const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (raw) {
            const parsed = extractJSON(raw);
            if (parsed && parsed.nails) {
              return NextResponse.json({ success: true, source: 'gemini-vision', data: parsed });
            }
          }
        }
      } catch (geminiErr) {
        console.warn('[Finglora Vision] Gemini fallback error:', geminiErr);
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // TIER 4 — Graceful fallback: client-side MediaPipe color sampling
    // ─────────────────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      source: 'client-mediapipe',
      message: 'MediaPipe landmark color sampling active on client.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to extract nails from photo';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
