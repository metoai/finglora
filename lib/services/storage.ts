import { getSupabaseBrowserClient } from '@/lib/supabase/client';

/**
 * Downscales any image (File, Blob, or URL) down to max 768px and returns a compact ~30-40KB base64 JPEG
 * for ultra-fast Gemini Vision processing without hanging.
 */
export async function downscaleImageForVision(
  input: File | Blob | string,
  maxDim = 768,
  quality = 0.72
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

/**
 * Uploads a user hand photo (File, Blob, or DataURL) to Supabase Storage bucket 'user-hands'.
 * If the input is already a Supabase or remote HTTP URL, returns it immediately.
 * Returns the permanent public CDN URL.
 */
export async function uploadUserHandPhoto(
  input: File | Blob | string,
  userId?: string
): Promise<string> {
  const supabase = getSupabaseBrowserClient();

  // If already a remote HTTP/HTTPS URL or local static asset, no need to upload as a blob
  if (typeof input === 'string') {
    if (input.startsWith('http://') || input.startsWith('https://')) {
      return input;
    }
    if (input.startsWith('/')) {
      return input;
    }
  }

  try {
    let blob: Blob;

    if (typeof input === 'string') {
      // Base64 Data URL (e.g. from camera capture or FileReader)
      const res = await fetch(input);
      blob = await res.blob();
    } else if (input instanceof File) {
      blob = await optimizeImage(input, 1400, 0.88);
    } else {
      blob = input;
    }

    // Determine user ID from auth session if not passed
    let effectiveUserId = userId;
    if (!effectiveUserId) {
      try {
        const { data } = await supabase.auth.getSession();
        effectiveUserId = data.session?.user?.id;
      } catch {
        // ignore
      }
    }

    const path = `${effectiveUserId || 'guest'}/${Date.now()}_hand.jpg`;

    const { data, error } = await supabase.storage
      .from('user-hands')
      .upload(path, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.warn('User hand upload to user-hands bucket failed, using fallback:', error.message);
      return typeof input === 'string' ? input : URL.createObjectURL(input);
    }

    const { data: publicUrlData } = supabase.storage
      .from('user-hands')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.warn('Error in uploadUserHandPhoto:', err);
    return typeof input === 'string' ? input : URL.createObjectURL(input);
  }
}

/**
 * Uploads a user profile avatar to Supabase Storage bucket 'avatars'
 */
export async function uploadUserAvatar(file: File, userId: string): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  const optimizedBlob = await optimizeImage(file, 512, 0.85);
  const path = `${userId}/${Date.now()}_avatar.jpg`;

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(path, optimizedBlob, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/**
 * Uploads an AI-synthesized applied manicure result to Supabase Storage ('try-on-captures')
 * and records it strictly under the verified authenticated user's try_on_history.
 */
export async function uploadAppliedTryOnResult({
  imageDataUrl,
  userId,
  setId,
  skinToneId = 'warm-ivory',
  mode = 'ai-synthesis',
}: {
  imageDataUrl: string;
  userId?: string;
  setId?: string;
  skinToneId?: string;
  mode?: string;
}): Promise<string> {
  const supabase = getSupabaseBrowserClient();

  try {
    let effectiveUserId = userId;
    if (!effectiveUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      effectiveUserId = user?.id;
    }

    if (!effectiveUserId) {
      return imageDataUrl;
    }

    const res = await fetch(imageDataUrl);
    const blob = await res.blob();
    const path = `${effectiveUserId}/${Date.now()}_applied_manicure.jpg`;

    const { data, error } = await supabase.storage
      .from('try-on-captures')
      .upload(path, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.warn('Failed to upload applied manicure to storage:', error.message);
      return imageDataUrl;
    }

    const { data: publicData } = supabase.storage
      .from('try-on-captures')
      .getPublicUrl(data.path);

    const publicUrl = publicData.publicUrl;

    // Insert under authenticated user's own RLS ("Users can insert own try-ons")
    const { error: insertError } = await supabase.from('try_on_history').insert({
      user_id: effectiveUserId,
      image_url: publicUrl,
      mode,
      set_id: setId || null,
      skin_tone_id: skinToneId,
    } as any);

    if (insertError) {
      // Fallback to RPC if direct insert had policy conflict
      await (supabase as any).rpc('save_try_on_result', {
        p_user_id: effectiveUserId,
        p_image_url: publicUrl,
        p_mode: mode,
        p_set_id: setId || null,
        p_skin_tone_id: skinToneId,
      });
    }

    return publicUrl;
  } catch (err) {
    console.warn('Error in uploadAppliedTryOnResult:', err);
    return imageDataUrl;
  }
}

