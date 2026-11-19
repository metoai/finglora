import { NextResponse } from 'next/server';

interface TryOnSegmindBody {
  handImageBase64: string; // Base64 of the user's hand
  prompt: string;          // Inpainting/editing prompt
  maskImageBase64?: string; // Optional mask
}

export async function POST(request: Request) {
  try {
    const body: TryOnSegmindBody = await request.json();
    const { handImageBase64, prompt, maskImageBase64 } = body;

    const segmindKey = process.env.SEGMIND_API_KEY || 'SG_33e0f9b8d6605613';
    if (!segmindKey) {
      return NextResponse.json(
        { error: 'SEGMIND_API_KEY is not configured.' },
        { status: 500 }
      );
    }

    if (!handImageBase64) {
      return NextResponse.json(
        { error: 'handImageBase64 is required.' },
        { status: 400 }
      );
    }

    // Clean base64 strings
    const cleanImage = handImageBase64.replace(/^data:image\/\w+;base64,/, '');

    // Call Segmind Flux Fill Dev or SDXL Inpaint
    const endpoint = 'https://api.segmind.com/v1/flux-fill-dev';
    const payload: Record<string, unknown> = {
      image: cleanImage,
      prompt:
        prompt ||
        'Realistic natural hand with bespoke long coffin nails, pink French tips, delicate white heart outlines, and sparkling crystal cuticles.',
      steps: 25,
      seed: -1,
    };

    if (maskImageBase64) {
      payload.mask = maskImageBase64.replace(/^data:image\/\w+;base64,/, '');
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'x-api-key': segmindKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      let parsedErr: { error?: string } = {};
      try {
        parsedErr = JSON.parse(errText);
      } catch {
        // raw text
      }
      return NextResponse.json(
        {
          error: parsedErr.error || errText || 'Segmind generation failed.',
          status: res.status,
        },
        { status: res.status }
      );
    }

    // Segmind returns raw image binary or JSON with base64
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('image/')) {
      const arrayBuffer = await res.arrayBuffer();
      const base64Out = Buffer.from(arrayBuffer).toString('base64');
      const dataUri = `data:${contentType};base64,${base64Out}`;
      return NextResponse.json({
        success: true,
        resultUrl: dataUri,
      });
    }

    const data = await res.json();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error during Segmind virtual try-on.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
