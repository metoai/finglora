import { Finger, NailDesign } from '@/types/nail';

export interface SimpleTechSummary {
  title: string;
  shape: string;
  length: string;
  finish: string;
  technique: string;
  colors: string[];
  description: string;
}

const SUPABASE_TRYON_PREFIX =
  'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/try-on-captures/';

const PATTERN_LABELS: Record<string, string> = {
  solid: 'Full solid color',
  'classic-french': 'Classic micro-French tips',
  'heart-french': 'Blush heart French tips',
  'ombre-french': 'Soft baby-boomer ombré French',
  aura: 'Airbrushed aura blend',
  floral: 'Hand-painted micro botanical art',
  'chrome-swirl': '3D metallic chrome swirl linework',
  'glitter-ombre': 'Fine shimmer gradient fade',
  'minimal-line': 'Clean minimalist linework',
};

const FINISH_LABELS: Record<string, string> = {
  glossy: 'High-Gloss Gel',
  matte: 'Velvet Matte',
  chrome: 'Pearl Chrome Glaze',
  glitter: 'Fine Shimmer Gel',
};

function capFirst(val: string): string {
  if (!val) return '';
  return val.charAt(0).toUpperCase() + val.slice(1);
}

/**
 * Builds a concise, salon-ready 3-bullet technician summary from the active 5-finger set.
 */
export function buildSimpleTechSummary(
  nails: Record<Finger, NailDesign>,
  designTitle?: string
): SimpleTechSummary {
  const refNail = nails.middle || nails.index || nails.thumb;
  const rawShape = refNail?.shape || 'almond';
  const rawLength = refNail?.length || 'medium';
  const rawFinish = refNail?.finish || 'glossy';
  const rawPattern = refNail?.pattern || 'solid';

  const shape = capFirst(rawShape);
  const length = capFirst(rawLength);
  const finish = FINISH_LABELS[rawFinish] || capFirst(rawFinish);

  const colorList: string[] = [];
  (['thumb', 'index', 'middle', 'ring', 'pinky'] as Finger[]).forEach((f) => {
    const n = nails[f];
    if (n?.baseColor && !colorList.includes(n.baseColor.toUpperCase())) {
      colorList.push(n.baseColor.toUpperCase());
    }
    if (n?.accentColor && !colorList.includes(n.accentColor.toUpperCase())) {
      colorList.push(n.accentColor.toUpperCase());
    }
  });

  const uniquePatterns = Array.from(
    new Set(
      (['thumb', 'index', 'middle', 'ring', 'pinky'] as Finger[])
        .map((f) => nails[f]?.pattern)
        .filter(Boolean)
    )
  );

  const patternText =
    uniquePatterns.length > 1
      ? `${PATTERN_LABELS[rawPattern] || rawPattern} + mixed accent nail`
      : PATTERN_LABELS[rawPattern] || capFirst(rawPattern.replace(/-/g, ' '));

  const customNote = refNail?.clientNote?.trim();
  const isGenericNote =
    !customNote ||
    customNote.toLowerCase().includes('ready for ai') ||
    customNote.toLowerCase().includes('bespoke atelier look');

  const technique = !isGenericNote && customNote ? customNote : `${patternText} (${finish.toLowerCase()})`;

  const description = `${shape} (${length.toLowerCase()}) · ${finish} · ${patternText}`;

  return {
    title: designTitle || refNail?.title || 'Custom Manicure',
    shape,
    length,
    finish,
    technique,
    colors: colorList.slice(0, 4),
    description,
  };
}

/**
 * Generates a clean shareable /look URL pointing to the generated photo + minimal tech specs.
 */
export function buildSharedLookUrl(
  imageUrl: string | null | undefined,
  summary: SimpleTechSummary
): string {
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://finglora.app';

  const params = new URLSearchParams();
  params.set('t', summary.title);
  params.set('s', summary.shape);
  params.set('l', summary.length);
  params.set('f', summary.finish);
  if (summary.colors.length > 0) {
    params.set('c', summary.colors.join(','));
  }
  if (summary.technique) {
    params.set('n', summary.technique.slice(0, 220));
  }

  if (imageUrl && !imageUrl.startsWith('data:')) {
    if (imageUrl.startsWith(SUPABASE_TRYON_PREFIX)) {
      params.set('cap', imageUrl.slice(SUPABASE_TRYON_PREFIX.length));
    } else {
      params.set('img', imageUrl);
    }
  }

  return `${origin}/look?${params.toString()}`;
}
