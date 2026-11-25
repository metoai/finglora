import { Finger, NailDesign } from '@/types/nail';

export interface SimpleTechSummary {
  title: string;
  shape: string;
  length: string;
  finish: string;
  colors: string[];
  description: string;
}

const SUPABASE_TRYON_PREFIX =
  'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/try-on-captures/';

/**
 * Builds a concise, minimal nail technician summary from the active 5-finger set.
 */
export function buildSimpleTechSummary(
  nails: Record<Finger, NailDesign>,
  designTitle?: string
): SimpleTechSummary {
  const refNail = nails.middle || nails.index || nails.thumb;
  const shape = refNail?.shape || 'almond';
  const length = refNail?.length || 'medium';
  const finish = refNail?.finish || 'glossy';

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

  const uniqueTitles = Array.from(
    new Set(
      (['thumb', 'index', 'middle', 'ring', 'pinky'] as Finger[])
        .map((f) => nails[f]?.title)
        .filter(Boolean)
    )
  );

  const note =
    refNail?.clientNote?.trim() ||
    `${shape} silhouette, ${length} length with a ${finish} top coat${
      uniqueTitles.length > 0 ? ` (${uniqueTitles.slice(0, 2).join(', ')})` : ''
    }.`;

  return {
    title: designTitle || refNail?.title || 'Custom Manicure',
    shape,
    length,
    finish,
    colors: colorList.slice(0, 4),
    description: note,
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
  if (summary.description) {
    params.set('n', summary.description.slice(0, 220));
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
