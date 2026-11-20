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
 * Crops an individual nail texture from an inspiration photo using relative anchor coordinates.
 */
export async function cropNailFromPhoto(
  photoUrl: string,
  tipX: number,
  tipY: number,
  cropRatio = 0.22
): Promise<string> {
  if (typeof window === 'undefined') return photoUrl;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const cropSize = Math.round(Math.min(img.naturalWidth, img.naturalHeight) * cropRatio);
      canvas.width = cropSize;
      canvas.height = Math.round(cropSize * 1.4); // 3:4 portrait aspect ratio
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(photoUrl);
        return;
      }

      const centerX = tipX * img.naturalWidth;
      const centerY = tipY * img.naturalHeight;
      const srcX = Math.max(0, Math.min(img.naturalWidth - cropSize, centerX - cropSize / 2));
      const srcY = Math.max(0, Math.min(img.naturalHeight - canvas.height, centerY - canvas.height * 0.3));

      ctx.drawImage(
        img,
        srcX,
        srcY,
        cropSize,
        canvas.height,
        0,
        0,
        canvas.width,
        canvas.height
      );

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => resolve(photoUrl);
    img.src = photoUrl;
  });
}
