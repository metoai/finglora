/**
 * Editorial Export Service for Finglora
 * Generates high-resolution branded images with luxury Finglora branding
 * and enables direct downloading & native sharing to social media stories (Instagram, TikTok, WhatsApp).
 */

export interface EditorialExportOptions {
  designTitle?: string;
  category?: string;
  filename?: string;
  storyAspect?: boolean; // 9:16 story layout or natural aspect
}

export interface BrandedImageResult {
  blob: Blob;
  dataUrl: string;
  file: File;
}

/**
 * Renders a high-resolution canvas with the manicured hand image
 * and the luxury Finglora editorial watermark & brand typography.
 */
export async function generateBrandedEditorialImage(
  imageUrl: string,
  options: EditorialExportOptions = {}
): Promise<BrandedImageResult> {
  const {
    filename = 'finglora-atelier-look.jpg',
    storyAspect = false,
  } = options;

  // Load image
  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load image for export'));
    img.src = imageUrl;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas 2D context');

  // Determine export dimensions
  const baseWidth = Math.max(1080, img.naturalWidth || 1080);

  if (storyAspect) {
    // 9:16 Instagram/TikTok story format (1080 x 1920)
    canvas.width = 1080;
    canvas.height = 1920;

    // Draw luxury neutral background
    ctx.fillStyle = '#181416';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Compute center-fit crop
    const imgAspect = (img.naturalWidth || 1) / (img.naturalHeight || 1);
    const targetAspect = 1080 / 1920;

    let sWidth = img.naturalWidth;
    let sHeight = img.naturalHeight;
    let sx = 0;
    let sy = 0;

    if (imgAspect > targetAspect) {
      sWidth = img.naturalHeight * targetAspect;
      sx = (img.naturalWidth - sWidth) / 2;
    } else {
      sHeight = img.naturalWidth / targetAspect;
      sy = (img.naturalHeight - sHeight) / 2;
    }

    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
  } else {
    // Natural aspect ratio (scaled up to high-res min 1080px width)
    const scale = baseWidth / (img.naturalWidth || 1080);
    canvas.width = baseWidth;
    canvas.height = Math.round((img.naturalHeight || 1440) * scale);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  const w = canvas.width;
  const h = canvas.height;

  // Pure Finglora Logo Watermark (ONLY the logo badge, zero extra text, no dark scrim)
  const badgeHeight = Math.max(44, Math.round(w * 0.048));
  const badgeWidth = Math.max(160, Math.round(badgeHeight * 3.4));

  // Position: centered at bottom with comfortable margin (above story safe zone when in 9:16)
  const badgeX = Math.round((w - badgeWidth) / 2);
  const badgeY = storyAspect
    ? h - badgeHeight - 140 // Instagram Stories safe zone
    : h - badgeHeight - Math.round(w * 0.045); // Standard portrait margin

  ctx.save();

  // Clean luxury frosted pill background
  ctx.fillStyle = 'rgba(20, 16, 18, 0.72)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;

  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, badgeHeight / 2);
  ctx.fill();
  ctx.stroke();

  // Reset shadow for razor-sharp logo rendering
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 1. Draw Brand Flower Mark (✿)
  const flowerSize = Math.round(badgeHeight * 0.52);
  ctx.fillStyle = '#E0246A';
  ctx.font = `600 ${flowerSize}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const flowerX = badgeX + Math.round(badgeHeight * 0.6);
  const centerY = badgeY + badgeHeight / 2;
  ctx.fillText('✿', flowerX, centerY);

  // 2. Draw 'Finglora' Wordmark
  const textSize = Math.round(badgeHeight * 0.42);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `600 ${textSize}px "Playfair Display", Georgia, serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const textX = flowerX + Math.round(flowerSize * 0.7);
  ctx.fillText('Finglora', textX, centerY);

  ctx.restore();

  // Convert to high-quality JPEG
  const blob = await new Promise<Blob>((res, rej) => {
    canvas.toBlob(
      (b) => {
        if (b) res(b);
        else rej(new Error('Failed to encode image to blob'));
      },
      'image/jpeg',
      0.95
    );
  });

  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
  const file = new File([blob], filename, { type: 'image/jpeg' });

  return { blob, dataUrl, file };
}

/**
 * Downloads the branded editorial image directly to the user's device
 */
export async function downloadEditorialImage(
  imageUrl: string,
  options: EditorialExportOptions = {}
): Promise<void> {
  const result = await generateBrandedEditorialImage(imageUrl, options);
  const link = document.createElement('a');
  link.download = options.filename || 'finglora-atelier-look.jpg';
  link.href = URL.createObjectURL(result.blob);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

/**
 * Shares to native social media stories (Instagram, TikTok, WhatsApp, etc.)
 * via the Web Share API. Falls back to direct download if sharing files is not supported.
 * Returns true if shared, or false if downloaded as fallback.
 */
export async function shareToStoryOrSocial(
  imageUrl: string,
  options: EditorialExportOptions & { shareText?: string } = {}
): Promise<{ success: boolean; mode: 'shared' | 'downloaded' }> {
  // Use storyAspect true for optimal 9:16 format if intended for stories
  const result = await generateBrandedEditorialImage(imageUrl, {
    storyAspect: options.storyAspect ?? true,
    ...options,
  });

  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [result.file] })
  ) {
    try {
      await navigator.share({
        files: [result.file],
        title: options.designTitle || 'My Finglora Look',
        text: options.shareText || 'Tailored manicure created with Finglora Atelier (finglora.com)',
      });
      return { success: true, mode: 'shared' };
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        // User cancelled the share dialog
        return { success: false, mode: 'shared' };
      }
    }
  }

  // Fallback: Trigger direct download so user still gets the branded file to post manually
  const link = document.createElement('a');
  link.download = options.filename || 'finglora-story-look.jpg';
  link.href = URL.createObjectURL(result.blob);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);

  return { success: true, mode: 'downloaded' };
}
