import { NextResponse } from 'next/server';

interface TryOnDeapiBody {
  handImageBase64: string; // Base64 or data URI of the user's hand
  prompt: string;          // Editing directive describing the nail art
}

export async function POST(request: Request) {
  try {
    const body: TryOnDeapiBody = await request.json();
    const { handImageBase64, prompt } = body;

    if (!handImageBase64) {
      return NextResponse.json(
        { error: 'Hand image is required for virtual try-on.' },
        { status: 400 }
      );
    }

    const deapiKey = process.env.DEAPI_API_KEY || 'sk-dp-30230-vKuzMx3laX1Acr2SIzjNaKIEGcVVxfz98eccQDvQb435838a';
    if (!deapiKey) {
      return NextResponse.json(
        { error: 'DEAPI_API_KEY is not configured.' },
        { status: 500 }
      );
    }

    // Convert base64 data URI to a Blob / Buffer for multipart upload
    const base64Data = handImageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = new Blob([buffer], { type: 'image/jpeg' });

    const formData = new FormData();
    formData.append('image', blob, 'hand.jpg');
    formData.append('model', 'QwenImageEdit_Plus_NF4');
    formData.append(
      'prompt',
      prompt ||
        'Apply custom long coffin-shaped nude nails with pastel baby pink French tips, delicate white heart outlines on the middle and ring fingers, and sparkling crystal rhinestones along the cuticles onto all five fingernails. Retain 100% of the hand, skin tone, fingers, and background unchanged.'
    );
    formData.append('steps', '40');
    formData.append('seed', '-1');
    formData.append('negative_prompt', 'deformed fingers, extra fingers, blurry, mutated hand, missing fingers');

    // 1. Submit Image Edit Job to DeAPI
    const submitRes = await fetch('https://api.deapi.ai/api/v2/images/edits', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${deapiKey}`,
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 Finglora/1.0',
      },
      body: formData,
    });

    const submitData = await submitRes.json();

    if (!submitRes.ok) {
      console.error('[DeAPI] Submit edit error:', submitData);
      return NextResponse.json(
        {
          error: submitData?.message || 'Failed to submit image edit to DeAPI.',
          details: submitData?.errors,
        },
        { status: submitRes.status }
      );
    }

    const requestId = submitData?.data?.request_id || submitData?.request_id;
    if (!requestId) {
      return NextResponse.json(
        { error: 'DeAPI did not return a valid request_id', raw: submitData },
        { status: 502 }
      );
    }

    // 2. Poll for Job Completion (up to 45 seconds)
    const maxAttempts = 15;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((r) => setTimeout(r, 3000));

      const pollRes = await fetch(`https://api.deapi.ai/api/v2/jobs/${requestId}`, {
        headers: {
          Authorization: `Bearer ${deapiKey}`,
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 Finglora/1.0',
        },
      });

      if (!pollRes.ok) continue;

      const pollData = await pollRes.json();
      const job = pollData?.data || pollData;

      if (job?.status === 'done' && job?.result_url) {
        return NextResponse.json({
          success: true,
          resultUrl: job.result_url,
          requestId,
        });
      }

      if (job?.status === 'error' || job?.status === 'failed') {
        return NextResponse.json(
          { error: job?.error || 'DeAPI image editing job failed.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Image generation timed out waiting for DeAPI GPU worker.', requestId },
      { status: 504 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error during DeAPI virtual try-on.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
