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
  { id: 'stiletto', label: 'Stiletto' },
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

// All pre-seeded designs and sample inspo photos deleted
export const INITIAL_EXPLORE_DESIGNS: ExploreDesignSet[] = [];
