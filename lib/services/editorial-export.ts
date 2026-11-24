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
    filename = 'finglora-studio-look.jpg',
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

  // Luxury Editorial Finglora Watermark (Larger brand presence + website name)
  const badgeHeight = Math.max(58, Math.round(w * 0.062));
  const flowerSize = Math.round(badgeHeight * 0.54);
  const titleSize = Math.round(badgeHeight * 0.44);
  const domainSize = Math.round(badgeHeight * 0.32);

  // Pre-measure dimensions for pixel-perfect pill container
  ctx.font = `600 ${titleSize}px "Playfair Display", Georgia, serif`;
  const titleWidth = ctx.measureText('Finglora').width;

  ctx.font = `500 ${domainSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  const domainWidth = ctx.measureText('finglora.com').width;
  const dotWidth = ctx.measureText('·').width;

  const gap = Math.round(badgeHeight * 0.18);
  const padX = Math.round(badgeHeight * 0.45);
  const totalContentWidth = flowerSize + gap + titleWidth + gap + dotWidth + gap + domainWidth;
  const badgeWidth = Math.round(totalContentWidth + padX * 2);

  // Position: centered at bottom with comfortable margin (above story safe zone when in 9:16)
  const badgeX = Math.round((w - badgeWidth) / 2);
  const badgeY = storyAspect
    ? h - badgeHeight - 140 // Instagram Stories safe zone
    : h - badgeHeight - Math.round(w * 0.045); // Standard portrait margin

  ctx.save();

  // Clean luxury frosted pill background
  ctx.fillStyle = 'rgba(20, 16, 18, 0.78)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 4;

  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, badgeHeight / 2);
  ctx.fill();
  ctx.stroke();

  // Reset shadow for razor-sharp typography rendering
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  const centerY = badgeY + badgeHeight / 2;
  let curX = badgeX + padX;

  // 1. Draw Brand Flower Mark (✿)
  ctx.fillStyle = '#E0246A';
  ctx.font = `600 ${flowerSize}px serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('✿', curX, centerY);
  curX += flowerSize + gap;

  // 2. Draw 'Finglora' Wordmark
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `600 ${titleSize}px "Playfair Display", Georgia, serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Finglora', curX, centerY);
  curX += titleWidth + gap;

  // 3. Draw Divider Dot '·'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = `500 ${domainSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText('·', curX, centerY);
  curX += dotWidth + gap;

  // 4. Draw Website Domain 'finglora.com'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
  ctx.font = `500 ${domainSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText('finglora.com', curX, centerY);

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
  link.download = options.filename || 'finglora-studio-look.jpg';
  link.href = URL.createObjectURL(result.blob);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

export interface ShareToSocialResult {
  success: boolean;
  mode: 'shared' | 'dialog' | 'cancelled';
  file?: File;
  dataUrl?: string;
  shareUrl: string;
  shareText: string;
}

/**
 * Shares to native social media stories/posts (Instagram, Telegram, X, WhatsApp, etc.)
 * via the Web Share API.
 * Never silently downloads file upon share click; if Web Share is unavailable,
 * returns mode 'dialog' so UI can render the direct social share options modal.
 */
export async function shareToStoryOrSocial(
  imageUrl: string,
  options: EditorialExportOptions & { shareText?: string } = {}
): Promise<ShareToSocialResult> {
  // Use storyAspect true for optimal 9:16 format if intended for stories
  const result = await generateBrandedEditorialImage(imageUrl, {
    storyAspect: options.storyAspect ?? true,
    ...options,
  });

  const shareUrl =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://finglora.com';
  const shareTitle = options.designTitle ? `${options.designTitle} · Finglora` : 'Finglora Manicure Look';
  const shareText = options.shareText || `Bespoke manicure created with Finglora (finglora.com)`;

  // Check if native Web Share is supported
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    // 1. Attempt sharing with image file (supported on mobile iOS Safari, Android Chrome)
    if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [result.file] })) {
      try {
        await navigator.share({
          files: [result.file],
          title: shareTitle,
          text: shareText,
        });
        return {
          success: true,
          mode: 'shared',
          file: result.file,
          dataUrl: result.dataUrl,
          shareUrl,
          shareText,
        };
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') {
          return {
            success: false,
            mode: 'cancelled',
            file: result.file,
            dataUrl: result.dataUrl,
            shareUrl,
            shareText,
          };
        }
        // If file sharing was blocked or unsupported, fallback to sharing text + URL
      }
    }

    // 2. Attempt sharing URL & text directly to OS share dialog
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl,
      });
      return {
        success: true,
        mode: 'shared',
        file: result.file,
        dataUrl: result.dataUrl,
        shareUrl,
        shareText,
      };
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        return {
          success: false,
          mode: 'cancelled',
          file: result.file,
          dataUrl: result.dataUrl,
          shareUrl,
          shareText,
        };
      }
    }
  }

  // 3. Fallback: Return dialog mode (so UI presents the native social share modal)
  // NEVER silently trigger a file download when user requested to share!
  return {
    success: true,
    mode: 'dialog',
    file: result.file,
    dataUrl: result.dataUrl,
    shareUrl,
    shareText,
  };
}
