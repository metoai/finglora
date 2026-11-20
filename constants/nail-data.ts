import {
  Finger,
  NailShape,
  NailLength,
  NailFinish,
  NailPattern,
  SkinTonePreset,
  ExploreDesignSet,
  NailDesign,
} from '@/types/nail';

export const FINGER_KEYS: Finger[] = ['thumb', 'index', 'middle', 'ring', 'pinky'];

export const FINGER_LABELS: Record<Finger, string> = {
  thumb: 'Thumb',
  index: 'Index',
  middle: 'Middle',
  ring: 'Ring',
  pinky: 'Pinky',
};

export const NAIL_SHAPES: { id: NailShape; label: string }[] = [
  { id: 'almond', label: 'Almond' },
  { id: 'coffin', label: 'Coffin' },
  { id: 'oval', label: 'Oval' },
  { id: 'square', label: 'Square' },
];

export const NAIL_LENGTHS: { id: NailLength; label: string }[] = [
  { id: 'short', label: 'Short' },
  { id: 'medium', label: 'Medium' },
  { id: 'long', label: 'Long' },
];

export const NAIL_FINISHES: { id: NailFinish; label: string }[] = [
  { id: 'glossy', label: 'Glossy Glass' },
  { id: 'matte', label: 'Velvet Matte' },
  { id: 'chrome', label: 'Burnished Chrome' },
  { id: 'glitter', label: 'Fine Shimmer' },
];

export const NAIL_PATTERNS: { id: NailPattern; label: string }[] = [
  { id: 'solid', label: 'Solid Lacquer' },
  { id: 'classic-french', label: 'Micro-French' },
  { id: 'heart-french', label: 'Heart French' },
  { id: 'ombre-french', label: 'Ombré French' },
  { id: 'aura', label: 'Twilight Aura' },
  { id: 'floral', label: 'Botanical Bloom' },
  { id: 'chrome-swirl', label: 'Chrome Swirl' },
  { id: 'glitter-ombre', label: 'Glitter Ombré' },
  { id: 'minimal-line', label: 'Architectural Line' },
];

export const COLOR_PALETTE = [
  { name: 'Atelier Blanc', hex: '#FFFFFF' },
  { name: 'Haute Pink Lacquer', hex: '#E0246A' },
  { name: 'Rose Water', hex: '#F9D8E0' },
  { name: 'Glazed Pearl', hex: '#FAF0EA' },
  { name: 'Soft Blush', hex: '#FFB6C1' },
  { name: 'Smoked Espresso', hex: '#2A1B1F' },
  { name: 'Champagne Dust', hex: '#E5C697' },
  { name: 'Sage Linen', hex: '#8FA893' },
  { name: 'Deep Raspberry', hex: '#BE185D' },
  { name: 'Lavender Mist', hex: '#C9A0DC' },
];

export const HAND_SKIN_TONES: SkinTonePreset[] = [
  { id: 'porcelain', name: 'Porcelain Rose', skin: '#F5D6C6', shadow: '#E0B5A1', highlight: '#FDE8DD' },
  { id: 'warm-ivory', name: 'Warm Honey', skin: '#DFAC8B', shadow: '#C28B68', highlight: '#EFC2A4' },
  { id: 'golden-caramel', name: 'Golden Caramel', skin: '#B57B56', shadow: '#935D3B', highlight: '#C9906B' },
  { id: 'deep-espresso', name: 'Rich Espresso', skin: '#6C422E', shadow: '#4F2D1D', highlight: '#84553E' },
];

export const DEFAULT_EMPTY_NAILS: Record<Finger, NailDesign> = {
  thumb: {
    finger: 'thumb',
    title: 'Natural Nail',
    baseColor: '#FAF0EA',
    accentColor: '#FFFFFF',
    pattern: 'solid',
    shape: 'almond',
    length: 'medium',
    finish: 'glossy',
    clientNote: 'Ready for AI inspiration extraction.',
    status: 'detected',
  },
  index: {
    finger: 'index',
    title: 'Natural Nail',
    baseColor: '#FAF0EA',
    accentColor: '#FFFFFF',
    pattern: 'solid',
    shape: 'almond',
    length: 'medium',
    finish: 'glossy',
    clientNote: 'Ready for AI inspiration extraction.',
    status: 'detected',
  },
  middle: {
    finger: 'middle',
    title: 'Natural Nail',
    baseColor: '#FAF0EA',
    accentColor: '#FFFFFF',
    pattern: 'solid',
    shape: 'almond',
    length: 'medium',
    finish: 'glossy',
    clientNote: 'Ready for AI inspiration extraction.',
    status: 'detected',
  },
  ring: {
    finger: 'ring',
    title: 'Natural Nail',
    baseColor: '#FAF0EA',
    accentColor: '#FFFFFF',
    pattern: 'solid',
    shape: 'almond',
    length: 'medium',
    finish: 'glossy',
    clientNote: 'Ready for AI inspiration extraction.',
    status: 'detected',
  },
  pinky: {
    finger: 'pinky',
    title: 'Natural Nail',
    baseColor: '#FAF0EA',
    accentColor: '#FFFFFF',
    pattern: 'solid',
    shape: 'almond',
    length: 'medium',
    finish: 'glossy',
    clientNote: 'Ready for AI inspiration extraction.',
    status: 'detected',
  },
};

function createCuratedSet(
  id: string,
  passportCode: string,
  title: string,
  category: string,
  photoUrl: string,
  baseColor: string,
  accentColor: string,
  pattern: any,
  finish: any = 'glossy',
  shape: NailShape = 'almond'
): ExploreDesignSet {
  const fingerNail = (finger: Finger): NailDesign => ({
    finger,
    title,
    baseColor,
    accentColor,
    pattern,
    shape,
    length: 'medium',
    finish,
    clientNote: `${title} bespoke atelier look`,
    status: 'detected',
  });

  return {
    id,
    passportCode,
    title,
    category,
    subtitle: `${category} · ${shape.charAt(0).toUpperCase() + shape.slice(1)} · Atelier Finish`,
    photoUrl,
    likes: 128,
    isSaved: false,
    skinTone: HAND_SKIN_TONES[0],
    backdrop: '#FAF7F2',
    chairMinutes: 65,
    nails: {
      thumb: fingerNail('thumb'),
      index: fingerNail('index'),
      middle: fingerNail('middle'),
      ring: fingerNail('ring'),
      pinky: fingerNail('pinky'),
    },
  };
}

export const CURATED_EDITORIAL_DESIGNS: ExploreDesignSet[] = [
  createCuratedSet(
    'set-milky-gold',
    'FGL-1001',
    'Milky Glazed Gold',
    'Glazed',
    '/assets/milky_gold_tryon_result.jpg',
    '#F5ECE3',
    '#D4AF37',
    'aura',
    'chrome',
    'almond'
  ),
  createCuratedSet(
    'set-blush-heart',
    'FGL-1002',
    'Blush Heart French',
    'French',
    '/assets/pink_heart_tryon_result.jpg',
    '#FCE7F3',
    '#E0246A',
    'heart-french',
    'glossy',
    'almond'
  ),
  createCuratedSet(
    'set-burgundy-aura',
    'FGL-1003',
    'Burgundy Velvet Aura',
    'Aura',
    '/assets/burgundy_gold_virtual_tryon.jpg',
    '#FAF0EA',
    '#801A35',
    'aura',
    'glossy',
    'almond'
  ),
  createCuratedSet(
    'set-editorial-nude',
    'FGL-1004',
    'Atelier Nude Minimal',
    'Minimal',
    '/assets/editorial_nail_hero.jpg',
    '#FAF0EA',
    '#FFFFFF',
    'solid',
    'glossy',
    'square'
  ),
  createCuratedSet(
    'set-rose-glazed',
    'FGL-1005',
    'Rose Quartz Glaze',
    'Glazed',
    '/assets/pink_heart_tryon_result.jpg',
    '#FCE7F3',
    '#F5ECE3',
    'aura',
    'chrome',
    'oval'
  ),
  createCuratedSet(
    'set-french-chrome',
    'FGL-1006',
    'French Chrome Rose',
    'French',
    '/assets/milky_gold_tryon_result.jpg',
    '#F5ECE3',
    '#E0246A',
    'classic-french',
    'chrome',
    'coffin'
  ),
  createCuratedSet(
    'set-velvet-wine',
    'FGL-1007',
    'Mulberry Velvet Aura',
    'Aura',
    '/assets/burgundy_gold_virtual_tryon.jpg',
    '#3B111D',
    '#E0246A',
    'aura',
    'matte',
    'coffin'
  ),
  createCuratedSet(
    'set-quiet-linen',
    'FGL-1008',
    'Quiet Luxury Linen',
    'Minimal',
    '/assets/editorial_nail_hero.jpg',
    '#FAF0EA',
    '#8FA893',
    'minimal-line',
    'glossy',
    'almond'
  ),
];

export const INITIAL_EXPLORE_DESIGNS: ExploreDesignSet[] = CURATED_EDITORIAL_DESIGNS;

export const EDITORIAL_ASSET_PHOTOS = [
  '/assets/milky_gold_tryon_result.jpg',
  '/assets/pink_heart_tryon_result.jpg',
  '/assets/burgundy_gold_virtual_tryon.jpg',
  '/assets/editorial_nail_hero.jpg',
] as const;

export function sanitizeEditorialPhotoUrl(url?: string | null, index = 0): string {
  if (!url) return EDITORIAL_ASSET_PHOTOS[index % EDITORIAL_ASSET_PHOTOS.length];
  const lower = url.toLowerCase();
  const isBanned =
    lower.includes('drill') ||
    lower.includes('table') ||
    lower.includes('equipment') ||
    lower.includes('gravel') ||
    lower.includes('unsplash.com') ||
    lower.includes('imagefes') ||
    lower.includes('images22') ||
    lower.includes('1795176925816') ||
    lower.includes('1795127479510') ||
    lower.includes('ar-nail-hero.jpg');
  if (isBanned) {
    return EDITORIAL_ASSET_PHOTOS[index % EDITORIAL_ASSET_PHOTOS.length];
  }
  return url;
}
