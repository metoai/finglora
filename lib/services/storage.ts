import { getSupabaseBrowserClient } from '@/lib/supabase/client';

/**
 * Downscales any image (File, Blob, or URL) down to max 800px and returns a compact ~50KB base64 JPEG
 * for ultra-fast Gemini Vision processing without hanging.
 */
export async function downscaleImageForVision(
  input: File | Blob | string,
  maxDim = 800,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve) => {
    try {
      let objectUrl = '';
      let isCreatedUrl = false;

      if (typeof input === 'string') {
        objectUrl = input;
      } else {
        objectUrl = URL.createObjectURL(input);
        isCreatedUrl = true;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      const cleanup = () => {
        if (isCreatedUrl) {
          try {
            URL.revokeObjectURL(objectUrl);
          } catch {
            // ignore
          }
        }
      };

      // 4-second timeout on image load
      const timeout = setTimeout(() => {
        cleanup();
        resolve('');
      }, 4000);

      img.onload = () => {
        clearTimeout(timeout);
        try {
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            cleanup();
            return resolve('');
          }

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          cleanup();
          resolve(dataUrl);
        } catch {
          cleanup();
          resolve('');
        }
      };

      img.onerror = () => {
        clearTimeout(timeout);
        cleanup();
        resolve('');
      };

      img.src = objectUrl;
    } catch {
      resolve('');
    }
  });
}

/**
 * Optimizes an image File using browser canvas to target dimension & quality,
 * drastically reducing upload latency and bandwidth.
 */
async function optimizeImage(file: File, maxDim = 1400, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(file);

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else resolve(file);
        },
        'image/jpeg',
        quality
      );
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an inspiration hand photo to Supabase Storage bucket 'hand-inspo-photos'
 */
export async function uploadInspoPhoto(file: File, userId?: string): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  const optimizedBlob = await optimizeImage(file);

  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${userId || 'guest'}/${Date.now()}_${cleanName}`;

  const { data, error } = await supabase.storage
    .from('hand-inspo-photos')
    .upload(path, optimizedBlob, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) {
    console.warn('Storage upload failed, falling back to local object URL:', error.message);
    return URL.createObjectURL(file);
  }

  const { data: publicUrlData } = supabase.storage
    .from('hand-inspo-photos')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/**
 * Uploads a webcam capture frame dataUrl to Supabase Storage bucket 'try-on-captures'
 */
export async function uploadTryOnCapture(dataUrl: string, userId?: string): Promise<string> {
  const supabase = getSupabaseBrowserClient();

  // Convert base64 dataUrl to Blob
  const res = await fetch(dataUrl);
  const blob = await res.blob();

  const path = `${userId || 'guest'}/${Date.now()}_frame.jpg`;

  const { data, error } = await supabase.storage
    .from('try-on-captures')
    .upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) {
    console.warn('Capture upload failed, using local dataUrl:', error.message);
    return dataUrl;
  }

  const { data: publicUrlData } = supabase.storage
    .from('try-on-captures')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}
