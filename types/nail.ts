export type Finger = 'thumb' | 'index' | 'middle' | 'ring' | 'pinky';
export type NailShape = 'almond' | 'coffin' | 'oval' | 'square' | 'stiletto';
export type NailLength = 'short' | 'medium' | 'long';
export type NailFinish = 'glossy' | 'matte' | 'chrome' | 'glitter';
export type NailPattern =
  | 'solid'
  | 'classic-french'
  | 'heart-french'
  | 'ombre-french'
  | 'aura'
  | 'floral'
  | 'chrome-swirl'
  | 'glitter-ombre'
  | 'minimal-line';

export interface SkinTonePreset {
  id: string;
  name: string;
  skin: string;
  shadow: string;
  highlight: string;
}

export interface NailDesign {
  finger: Finger;
  title: string;
  baseColor: string;
  accentColor: string;
  pattern: NailPattern;
  shape: NailShape;
  length: NailLength;
  finish: NailFinish;
  clientNote: string;
  status: 'detected' | 'edited';
  details?: string[];
  artImageUrl?: string;
  extractedTextureUrl?: string;
}

export interface ExploreDesignSet {
  id: string;
  passportCode: string;
  title: string;
  category: string;
  subtitle: string;
  photoUrl: string;
  likes: number;
  isSaved: boolean;
  skinTone: SkinTonePreset;
  backdrop: string;
  chairMinutes: number;
  nails: Record<Finger, NailDesign>;
}

export interface TechStep {
  num: number;
  phase: string;
  text: string;
  tool: string;
  cure: string;
  tip?: string;
  category?: 'prep' | 'base' | 'art' | 'finish';
}


export interface ToastItem {
  id: number;
  text: string;
}
