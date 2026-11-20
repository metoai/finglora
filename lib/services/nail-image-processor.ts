import { Finger } from '@/types/nail';

/**
 * Slices a horizontal 5-nail studio composite image into 5 individual finger image data URLs.
 * Layout: Left to Right -> Thumb (0-20%), Index (20-40%), Middle (40-60%), Ring (60-80%), Pinky (80-100%).
 */
export async function slice5NailSetImage(
  masterImageUrl: string
): Promise<Record<Finger, string>> {
  if (typeof window === 'undefined') {
    return {
      thumb: masterImageUrl,
      index: masterImageUrl,
      middle: masterImageUrl,
      ring: masterImageUrl,
      pinky: masterImageUrl,
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const fingers: Finger[] = ['thumb', 'index', 'middle', 'ring', 'pinky'];
      const result: Partial<Record<Finger, string>> = {};
      const sliceWidth = img.naturalWidth / 5;
      const sliceHeight = img.naturalHeight;

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(sliceWidth));
      canvas.height = Math.max(1, sliceHeight);
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve({
          thumb: masterImageUrl,
          index: masterImageUrl,
          middle: masterImageUrl,
          ring: masterImageUrl,
          pinky: masterImageUrl,
        });
        return;
      }

      fingers.forEach((fk, idx) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          img,
          idx * sliceWidth,
          0,
          sliceWidth,
          sliceHeight,
          0,
          0,
          canvas.width,
          canvas.height
        );
        result[fk] = canvas.toDataURL('image/png');
      });

      resolve(result as Record<Finger, string>);
    };

    img.onerror = () => {
      resolve({
        thumb: masterImageUrl,
        index: masterImageUrl,
        middle: masterImageUrl,
        ring: masterImageUrl,
        pinky: masterImageUrl,
      });
    };

    img.src = masterImageUrl;
  });
}

/**
 * Calls Vertex AI gemini-3.1-flash-image to generate an authentic AI nail art image for an individual finger.
 */
export async function generateSingleFingerAiImage(
  finger: Finger,
  shape: string,
  designPrompt: string
): Promise<string | null> {
  try {
    const res = await fetch('/api/generate-nail-art', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'single-nail',
        finger,
        nailShape: shape,
        prompt: designPrompt,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.imageUrl || null;
    }
  } catch (err) {
    console.warn('[Finglora AI] Single finger AI generation error:', err);
  }
  return null;
}
