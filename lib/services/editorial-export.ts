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
    designTitle,
    category,
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

  // 1. Subtle top-corner editorial badge: [ ✿ FINGLORA ATELIER ]
  const badgeWidth = Math.round(w * 0.28);
  const badgeHeight = Math.round(badgeWidth * 0.22);
  const badgeX = Math.round(w * 0.04);
  const badgeY = Math.round(w * 0.04);

  ctx.save();
  ctx.fillStyle = 'rgba(15, 12, 14, 0.45)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, badgeHeight / 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#E0246A';
  ctx.font = `600 ${Math.round(badgeHeight * 0.45)}px serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('✿', badgeX + badgeHeight * 0.35, badgeY + badgeHeight / 2);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `600 ${Math.round(badgeHeight * 0.36)}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.fillText('FINGLORA', badgeX + badgeHeight * 0.85, badgeY + badgeHeight / 2);
  ctx.restore();

  // 2. Luxury bottom gradient scrim for maximum text legibility
  const scrimHeight = Math.round(h * 0.24);
  const grad = ctx.createLinearGradient(0, h - scrimHeight, 0, h);
  grad.addColorStop(0, 'rgba(15, 12, 14, 0)');
  grad.addColorStop(0.35, 'rgba(15, 12, 14, 0.45)');
  grad.addColorStop(0.7, 'rgba(15, 12, 14, 0.82)');
  grad.addColorStop(1, 'rgba(15, 12, 14, 0.95)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, h - scrimHeight, w, scrimHeight);

  // 3. Brand Typography Footer
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Optional design title
  let currentY = h - Math.round(scrimHeight * 0.65);
  if (designTitle && designTitle.trim()) {
    ctx.font = `italic 500 ${Math.round(w * 0.028)}px "Playfair Display", Georgia, serif`;
    ctx.fillStyle = 'rgba(253, 232, 239, 0.95)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 6;
    ctx.fillText(`“${designTitle.trim()}”`, w / 2, currentY);
    currentY += Math.round(w * 0.038);
  }

  // Finglora Wordmark with Letterspacing
  ctx.font = `bold ${Math.round(w * 0.045)}px "Playfair Display", Georgia, serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 8;
  ctx.fillText('F I N G L O R A', w / 2, currentY);

  // Subtitle / Atelier Tagline
  currentY += Math.round(w * 0.034);
  ctx.font = `600 ${Math.round(w * 0.018)}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.shadowBlur = 4;
  const tagText = category
    ? `ATELIER DE MANUCURE • ${category.toUpperCase()} • finglora.com`
    : 'ATELIER DE MANUCURE • VIRTUAL TRY-ON • finglora.com';
  ctx.fillText(tagText, w / 2, currentY);

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
