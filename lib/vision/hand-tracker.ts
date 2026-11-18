/**
 * Finglora MediaPipe Hand Landmark & Vision Extraction Engine
 * Provides 60fps real-time fingertip tracking for Live AR Try-On
 * and automated 5-finger nail analysis from hand photos.
 */

import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { Finger, NailDesign, NailFinish, NailPattern, NailShape } from '@/types/nail';

export interface FingertipAnchor {
  finger: Finger;
  tipX: number;     // 0..1 normalized coordinate
  tipY: number;
  dipX: number;
  dipY: number;
  angleDeg: number; // Rotation in degrees
  scale: number;    // Normalized scale based on finger segment length
  confidence: number;
}

export type LiveHandTrackingCallback = (anchors: Record<Finger, FingertipAnchor> | null) => void;

let videoLandmarker: HandLandmarker | null = null;
let imageLandmarker: HandLandmarker | null = null;
let isInitializing = false;

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export async function getVideoHandLandmarker(): Promise<HandLandmarker | null> {
  if (videoLandmarker) return videoLandmarker;
  if (typeof window === 'undefined') return null;

  try {
    isInitializing = true;
    const vision = await FilesetResolver.forVisionTasks(WASM_URL);
    videoLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numHands: 1,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    return videoLandmarker;
  } catch (err) {
    console.warn('[Finglora AR] GPU vision initialization fallback to CPU:', err);
    try {
      const vision = await FilesetResolver.forVisionTasks(WASM_URL);
      videoLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
      });
      return videoLandmarker;
    } catch (fallbackErr) {
      console.error('[Finglora AR] Failed to initialize MediaPipe Hand Landmarker:', fallbackErr);
      return null;
    }
  } finally {
    isInitializing = false;
  }
}

export async function getImageHandLandmarker(): Promise<HandLandmarker | null> {
  if (imageLandmarker) return imageLandmarker;
  if (typeof window === 'undefined') return null;

  try {
    const vision = await FilesetResolver.forVisionTasks(WASM_URL);
    imageLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: 'GPU',
      },
      runningMode: 'IMAGE',
      numHands: 1,
    });
    return imageLandmarker;
  } catch (err) {
    console.warn('[Finglora Vision] Fallback to CPU image landmarker:', err);
    try {
      const vision = await FilesetResolver.forVisionTasks(WASM_URL);
      imageLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: 'CPU',
        },
        runningMode: 'IMAGE',
        numHands: 1,
      });
      return imageLandmarker;
    } catch {
      return null;
    }
  }
}

/**
 * Calculates fingertip anchors from 21 MediaPipe hand landmarks.
 * Landmarks indices:
 * Thumb: IP = 3, TIP = 4
 * Index: DIP = 7, TIP = 8
 * Middle: DIP = 11, TIP = 12
 * Ring: DIP = 15, TIP = 16
 * Pinky: DIP = 19, TIP = 20
 */
export function extractFingertipAnchors(
  result: HandLandmarkerResult
): Record<Finger, FingertipAnchor> | null {
  if (!result.landmarks || result.landmarks.length === 0) return null;

  const lm = result.landmarks[0];
  if (!lm || lm.length < 21) return null;

  const fingerMapping: { finger: Finger; dip: number; tip: number }[] = [
    { finger: 'thumb', dip: 3, tip: 4 },
    { finger: 'index', dip: 7, tip: 8 },
    { finger: 'middle', dip: 11, tip: 12 },
    { finger: 'ring', dip: 15, tip: 16 },
    { finger: 'pinky', dip: 19, tip: 20 },
  ];

  const anchors = {} as Record<Finger, FingertipAnchor>;

  for (const item of fingerMapping) {
    const dip = lm[item.dip];
    const tip = lm[item.tip];

    const dx = tip.x - dip.x;
    const dy = tip.y - dip.y;

    // Angle of finger pointing direction
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = (angleRad * 180) / Math.PI + 90;

    // Distance between DIP and TIP gives scale
    const dist = Math.hypot(dx, dy);

    anchors[item.finger] = {
      finger: item.finger,
      tipX: tip.x,
      tipY: tip.y,
      dipX: dip.x,
      dipY: dip.y,
      angleDeg,
      scale: Math.max(0.6, Math.min(2.0, dist * 12)),
      confidence: 0.95,
    };
  }

  return anchors;
}

/**
 * Detects hand and extracts 5 fingertip anchors from a static image.
 */
export async function detectHandInImage(
  imageElement: HTMLImageElement | HTMLCanvasElement
): Promise<Record<Finger, FingertipAnchor> | null> {
  const landmarker = await getImageHandLandmarker();
  if (!landmarker) return null;
  try {
    const result = landmarker.detect(imageElement);
    return extractFingertipAnchors(result);
  } catch (err) {
    console.warn('[Finglora Vision] detectHandInImage error:', err);
    return null;
  }
}

/**
 * Analyzes an image of a hand and automatically extracts color, pattern,
 * and shape for each individual finger using dual-point vision sampling.
 */
export async function extractNailsFromPhoto(
  imageElement: HTMLImageElement | HTMLCanvasElement,
  fallbackNails: Record<Finger, NailDesign>
): Promise<{
  nails: Record<Finger, NailDesign>;
  handFound: boolean;
  anchors: Record<Finger, FingertipAnchor> | null;
}> {
  const landmarker = await getImageHandLandmarker();
  if (!landmarker) {
    return { nails: fallbackNails, handFound: false, anchors: null };
  }

  try {
    const result = landmarker.detect(imageElement);
    const anchors = extractFingertipAnchors(result);

    if (!anchors) {
      return { nails: fallbackNails, handFound: false, anchors: null };
    }

    // Sample colors from the image at each detected fingertip region
    const canvas = document.createElement('canvas');
    const width = 'naturalWidth' in imageElement ? imageElement.naturalWidth : imageElement.width;
    const height = 'naturalHeight' in imageElement ? imageElement.naturalHeight : imageElement.height;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return { nails: fallbackNails, handFound: true, anchors };

    ctx.drawImage(imageElement, 0, 0, width, height);

    const extractedNails = { ...fallbackNails };

    const samplePatch = (cx: number, cy: number, size: number) => {
      const startX = Math.max(0, Math.min(width - 1, Math.floor(cx - size / 2)));
      const startY = Math.max(0, Math.min(height - 1, Math.floor(cy - size / 2)));
      const safeW = Math.max(1, Math.min(size, width - startX));
      const safeH = Math.max(1, Math.min(size, height - startY));
      const imgData = ctx.getImageData(startX, startY, safeW, safeH).data;
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < imgData.length; i += 4) {
        r += imgData[i];
        g += imgData[i + 1];
        b += imgData[i + 2];
        count++;
      }
      if (count === 0) return { hex: '#FDF2F8', r: 253, g: 242, b: 248, brightness: 0.9, saturation: 0.1 };
      const avgR = Math.round(r / count);
      const avgG = Math.round(g / count);
      const avgB = Math.round(b / count);
      const hex = `#${((1 << 24) + (avgR << 16) + (avgG << 8) + avgB).toString(16).slice(1).toUpperCase()}`;
      const max = Math.max(avgR, avgG, avgB);
      const min = Math.min(avgR, avgG, avgB);
      const brightness = max / 255;
      const saturation = max === 0 ? 0 : (max - min) / max;
      return { hex, r: avgR, g: avgG, b: avgB, brightness, saturation };
    };

    for (const fingerKey of ['thumb', 'index', 'middle', 'ring', 'pinky'] as Finger[]) {
      const anchor = anchors[fingerKey];
      if (!anchor) continue;

      const patchSize = Math.max(8, Math.floor(width * 0.025));

      // Sample 1: The tip of the nail
      const tipPx = anchor.tipX * width;
      const tipPy = anchor.tipY * height;
      const tipSample = samplePatch(tipPx, tipPy, patchSize);

      // Sample 2: The nail bed / base (offset slightly towards the DIP joint)
      const dx = (anchor.tipX - anchor.dipX) * width;
      const dy = (anchor.tipY - anchor.dipY) * height;
      const bedPx = tipPx - dx * 0.35;
      const bedPy = tipPy - dy * 0.35;
      const bedSample = samplePatch(bedPx, bedPy, patchSize);

      let detectedPattern: NailPattern = 'solid';
      let detectedFinish: NailFinish = 'glossy';
      let detectedShape: NailShape = fallbackNails[fingerKey].shape;
      let baseColor = bedSample.hex;
      let accentColor = tipSample.hex;

      // Color difference between tip and bed
      const colorDist = Math.hypot(
        tipSample.r - bedSample.r,
        tipSample.g - bedSample.g,
        tipSample.b - bedSample.b
      );

      if (colorDist > 45) {
        // Distinct tip vs bed
        if (tipSample.brightness > 0.85 && bedSample.saturation > 0.15) {
          detectedPattern = 'classic-french';
          baseColor = bedSample.hex;
          accentColor = '#FFFFFF';
        } else if (tipSample.brightness > 0.85 && bedSample.brightness > 0.85) {
          detectedPattern = 'chrome-swirl';
          detectedFinish = 'chrome';
        } else {
          detectedPattern = 'aura';
          baseColor = bedSample.hex;
          accentColor = tipSample.hex;
        }
      } else {
        // Monochromatic / Solid
        baseColor = tipSample.hex;
        accentColor = tipSample.hex;
        if (tipSample.brightness > 0.88 && tipSample.saturation < 0.15) {
          detectedPattern = 'chrome-swirl';
          detectedFinish = 'chrome';
        } else if (tipSample.brightness < 0.3) {
          detectedFinish = 'matte';
        }
      }

      extractedNails[fingerKey] = {
        ...fallbackNails[fingerKey],
        title: `${fingerKey.charAt(0).toUpperCase() + fingerKey.slice(1)} ${detectedPattern === 'classic-french' ? 'French Tip' : detectedPattern === 'chrome-swirl' ? 'Glazed Chrome' : detectedPattern === 'aura' ? 'Aura Gradient' : 'Lacquer'}`,
        baseColor,
        accentColor,
        pattern: detectedPattern,
        finish: detectedFinish,
        shape: detectedShape,
        status: 'detected',
        clientNote: `AI vision extracted from fingertip (Tip: ${tipSample.hex}, Base: ${bedSample.hex}, Pattern: ${detectedPattern}).`,
      };
    }

    return { nails: extractedNails, handFound: true, anchors };
  } catch (err) {
    console.warn('[Finglora Vision] Nail extraction from photo error:', err);
    return { nails: fallbackNails, handFound: false, anchors: null };
  }
}
