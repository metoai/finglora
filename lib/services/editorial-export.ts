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
 * Loads any local/data/remote image safely for HTMLCanvasElement rendering without CORS cache taint.
 */
async function loadImageForCanvas(imageUrl: string): Promise<HTMLImageElement> {
  let objectUrlToRevoke: string | null = null;
  let resolvedSrc = imageUrl;

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    try {
      const res = await fetch(imageUrl, { mode: 'cors', credentials: 'omit' });
      if (res.ok) {
        const blob = await res.blob();
        objectUrlToRevoke = URL.createObjectURL(blob);
        resolvedSrc = objectUrlToRevoke;
      }
    } catch {
      // Fall back to direct image load with crossOrigin below
    }
  }

  const img = new Image();
  if (!resolvedSrc.startsWith('blob:') && !resolvedSrc.startsWith('data:')) {
    img.crossOrigin = 'anonymous';
  }

  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image for export'));
      img.src = resolvedSrc;
    });
    return img;
  } finally {
    if (objectUrlToRevoke) {
      // Delay revocation slightly so browser decoder retains bitmap cleanly
      setTimeout(() => {
        try {
          URL.revokeObjectURL(objectUrlToRevoke!);
        } catch {
          // ignore
        }
      }, 1000);
    }
  }
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, radius);
    return;
  }
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Renders a high-resolution canvas with the manicured hand image
 * and the subtle luxury Finglora editorial watermark.
 */
export async function generateBrandedEditorialImage(
  imageUrl: string,
  options: EditorialExportOptions = {}
): Promise<BrandedImageResult> {
  const {
    filename = 'finglora-studio-look.jpg',
    storyAspect = false,
  } = options;

  const img = await loadImageForCanvas(imageUrl);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas 2D context');

  // Determine export dimensions
  const baseWidth = Math.max(1080, img.naturalWidth || 1080);

  if (storyAspect) {
    // 9:16 Instagram/TikTok story format (1080 x 1920)
    canvas.width = 1080;
    canvas.height = 1920;

    ctx.fillStyle = '#181416';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

  // Subtle Luxury Editorial Finglora Watermark
  const badgeHeight = Math.max(54, Math.round(w * 0.056));
  const flowerSize = Math.round(badgeHeight * 0.52);
  const titleSize = Math.round(badgeHeight * 0.42);
  const domainSize = Math.round(badgeHeight * 0.31);

  ctx.font = `600 ${titleSize}px "Playfair Display", Georgia, serif`;
  const titleWidth = ctx.measureText('Finglora').width;

  ctx.font = `500 ${domainSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  const domainWidth = ctx.measureText('finglora.com').width;
  const dotWidth = ctx.measureText('·').width;

  const gap = Math.round(badgeHeight * 0.18);
  const padX = Math.round(badgeHeight * 0.42);
  const totalContentWidth = flowerSize + gap + titleWidth + gap + dotWidth + gap + domainWidth;
  const badgeWidth = Math.round(totalContentWidth + padX * 2);

  // Position: centered at bottom with comfortable margin (above story safe zone when in 9:16)
  const badgeX = Math.round((w - badgeWidth) / 2);
  const badgeY = storyAspect
    ? h - badgeHeight - 140
    : h - badgeHeight - Math.round(w * 0.042);

  ctx.save();

  ctx.fillStyle = 'rgba(20, 16, 18, 0.72)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.38)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 3;

  drawRoundedRectPath(ctx, badgeX, badgeY, badgeWidth, badgeHeight, badgeHeight / 2);
  ctx.fill();
  ctx.stroke();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  const centerY = badgeY + badgeHeight / 2;
  let curX = badgeX + padX;

  ctx.fillStyle = '#E0246A';
  ctx.font = `600 ${flowerSize}px serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('✿', curX, centerY);
  curX += flowerSize + gap;

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `600 ${titleSize}px "Playfair Display", Georgia, serif`;
  ctx.fillText('Finglora', curX, centerY);
  curX += titleWidth + gap;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = `500 ${domainSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText('·', curX, centerY);
  curX += dotWidth + gap;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
  ctx.font = `500 ${domainSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText('finglora.com', curX, centerY);

  ctx.restore();

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
 */
export async function shareToStoryOrSocial(
  imageUrl: string,
  options: EditorialExportOptions & { shareText?: string } = {}
): Promise<ShareToSocialResult> {
  const result = await generateBrandedEditorialImage(imageUrl, {
    storyAspect: options.storyAspect ?? true,
    ...options,
  });

  const shareUrl =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://finglora.com';
  const shareText = options.shareText || 'Created with Finglora (finglora.com)';

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [result.file] })) {
      try {
        await navigator.share({
          files: [result.file],
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
  }

  return {
    success: true,
    mode: 'dialog',
    file: result.file,
    dataUrl: result.dataUrl,
    shareUrl,
    shareText,
  };
}
