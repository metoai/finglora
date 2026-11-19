import { NailDesign } from '@/types/nail';

/**
 * Generates dynamic high-resolution procedural textures for the 3D PBR Nail Shader.
 * Generates both diffuse/albedo texture and bump/specular map.
 */
export function generateNailTextureCanvas(
  nail: NailDesign,
  size = 1024
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const w = size;
  const h = size;

  // 1. Base Lacquer Fill with Radial Micro-Depth
  const baseGrad = ctx.createLinearGradient(0, 0, w, 0);
  baseGrad.addColorStop(0, adjustBrightness(nail.baseColor, -12));
  baseGrad.addColorStop(0.3, adjustBrightness(nail.baseColor, 4));
  baseGrad.addColorStop(0.5, nail.baseColor);
  baseGrad.addColorStop(0.7, adjustBrightness(nail.baseColor, 4));
  baseGrad.addColorStop(1, adjustBrightness(nail.baseColor, -12));
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Cuticle Contact Ambient Occlusion (AO)
  // Deepens the base where nail emerges from under the eponychium fold
  const cuticleAo = ctx.createLinearGradient(0, h, 0, h - h * 0.22);
  cuticleAo.addColorStop(0, 'rgba(35, 15, 20, 0.40)');
  cuticleAo.addColorStop(0.4, 'rgba(35, 15, 20, 0.15)');
  cuticleAo.addColorStop(1, 'rgba(35, 15, 20, 0.0)');
  ctx.fillStyle = cuticleAo;
  ctx.fillRect(0, 0, w, h);

  // 3. Patterns & Artistry Rendering
  const tipDepth = h * 0.32;

  if (nail.pattern === 'classic-french') {
    renderFrenchTip(ctx, w, h, tipDepth, nail.accentColor);
  } else if (nail.pattern === 'heart-french') {
    renderHeartFrench(ctx, w, h, tipDepth, nail.accentColor);
  } else if (nail.pattern === 'ombre-french') {
    renderOmbreFrench(ctx, w, h, tipDepth * 1.5, nail.accentColor, nail.baseColor);
  } else if (nail.pattern === 'aura') {
    renderAura(ctx, w, h, nail.accentColor);
  } else if (nail.pattern === 'chrome-swirl') {
    renderChromeSwirl(ctx, w, h, nail.accentColor);
  } else if (nail.pattern === 'floral') {
    renderFloral(ctx, w, h, nail.accentColor);
  } else if (nail.pattern === 'glitter-ombre') {
    renderGlitterOmbre(ctx, w, h, nail.accentColor);
  } else if (nail.pattern === 'minimal-line') {
    renderMinimalLine(ctx, w, h, nail.accentColor);
  }

  // 4. Gem / Rhinestone Highlights & Reflections
  if (nail.pattern === 'heart-french' || nail.clientNote?.toLowerCase().includes('rhinestone') || nail.clientNote?.toLowerCase().includes('gem')) {
    renderCuticleRhinestones(ctx, w, h);
  }

  return canvas;
}

/**
 * Renders precision French Tip with natural smile curve
 */
function renderFrenchTip(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  depth: number,
  color: string
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, depth);
  // Elegant parabolic smile curve
  ctx.bezierCurveTo(w * 0.25, depth + h * 0.09, w * 0.75, depth + h * 0.09, w, depth);
  ctx.lineTo(w, 0);
  ctx.lineTo(0, 0);
  ctx.closePath();

  // French tip gradient for volume
  const tipGrad = ctx.createLinearGradient(0, 0, w, 0);
  tipGrad.addColorStop(0, adjustBrightness(color, -6));
  tipGrad.addColorStop(0.5, color);
  tipGrad.addColorStop(1, adjustBrightness(color, -6));
  ctx.fillStyle = tipGrad;
  ctx.fill();
  ctx.restore();
}

/**
 * Renders Heart French: swoopy French tip + delicate heart outline + micro gems
 */
function renderHeartFrench(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  depth: number,
  color: string
) {
  // 1. Swoopy French Smile
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, depth - h * 0.02);
  ctx.bezierCurveTo(w * 0.35, depth + h * 0.12, w * 0.65, depth + h * 0.04, w, depth + h * 0.03);
  ctx.lineTo(w, 0);
  ctx.lineTo(0, 0);
  ctx.closePath();

  const tipGrad = ctx.createLinearGradient(0, 0, w, 0);
  tipGrad.addColorStop(0, adjustBrightness(color, -5));
  tipGrad.addColorStop(0.5, color);
  tipGrad.addColorStop(1, adjustBrightness(color, -5));
  ctx.fillStyle = tipGrad;
  ctx.fill();
  ctx.restore();

  // 2. Translucent Airbrushed White Center Halo
  const halo = ctx.createRadialGradient(w * 0.5, h * 0.55, 10, w * 0.5, h * 0.55, w * 0.4);
  halo.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
  halo.addColorStop(0.6, 'rgba(255, 255, 255, 0.15)');
  halo.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, w, h);

  // 3. Crisp Vector Heart Outline
  drawHeartOutline(ctx, w * 0.5, h * 0.56, w * 0.28, color, 14);
}

/**
 * Mathematical bezier heart path
 */
function drawHeartOutline(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  strokeColor: string,
  lineWidth: number
) {
  ctx.save();
  ctx.beginPath();
  const topCurveHeight = size * 0.3;

  ctx.moveTo(cx, cy + size * 0.5);
  // Left curve
  ctx.bezierCurveTo(
    cx - size * 0.7,
    cy + size * 0.1,
    cx - size * 0.7,
    cy - topCurveHeight,
    cx,
    cy - size * 0.15
  );
  // Right curve
  ctx.bezierCurveTo(
    cx + size * 0.7,
    cy - topCurveHeight,
    cx + size * 0.7,
    cy + size * 0.1,
    cx,
    cy + size * 0.5
  );

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
  ctx.shadowBlur = 8;
  ctx.stroke();

  // Delicate inner overlay stroke with accent color
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth * 0.6;
  ctx.shadowBlur = 0;
  ctx.stroke();

  ctx.restore();
}

/**
 * Ombre French gradient blend
 */
function renderOmbreFrench(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  reach: number,
  accentColor: string,
  baseColor: string
) {
  const grad = ctx.createLinearGradient(0, 0, 0, reach);
  grad.addColorStop(0, accentColor);
  grad.addColorStop(0.65, accentColor);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, reach);
}

/**
 * Aura diffuse glow
 */
function renderAura(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string
) {
  const aura = ctx.createRadialGradient(w * 0.5, h * 0.5, 20, w * 0.5, h * 0.5, w * 0.45);
  aura.addColorStop(0, color);
  aura.addColorStop(0.7, hexToRgba(color, 0.4));
  aura.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Organic Chrome Swirl relief
 */
function renderChromeSwirl(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(w * 0.05, h * 0.75);
  ctx.bezierCurveTo(w * 0.5, h * 0.35, w * 0.45, h * 0.85, w * 0.95, h * 0.4);
  ctx.strokeStyle = color;
  ctx.lineWidth = 38;
  ctx.lineCap = 'round';
  ctx.stroke();

  // White chrome highlight
  ctx.beginPath();
  ctx.moveTo(w * 0.05, h * 0.77);
  ctx.bezierCurveTo(w * 0.5, h * 0.37, w * 0.45, h * 0.87, w * 0.95, h * 0.42);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();
}

/**
 * Hand-painted Botanical Blooms
 */
function renderFloral(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string
) {
  const cx = w * 0.5;
  const cy = h * 0.55;
  const r = 32;
  ctx.save();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI) / 5;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    ctx.beginPath();
    ctx.arc(px, py, 26, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
  // Core
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#E5C697';
  ctx.fill();
  ctx.restore();
}

/**
 * Micro reflective glitter ombre
 */
function renderGlitterOmbre(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string
) {
  const grad = ctx.createLinearGradient(0, h, 0, h * 0.3);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Micro glitter flakes
  for (let i = 0; i < 80; i++) {
    const gx = Math.random() * w;
    const gy = h - Math.random() * (h * 0.65);
    ctx.beginPath();
    ctx.arc(gx, gy, 2 + Math.random() * 4, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  }
}

/**
 * Minimal Architectural & Metallic Striping Tape Line Art
 */
function renderMinimalLine(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string
) {
  ctx.save();
  // 1. Diagonal intersecting striping line
  ctx.beginPath();
  ctx.moveTo(w * 0.15, h * 0.2);
  ctx.bezierCurveTo(w * 0.45, h * 0.45, w * 0.55, h * 0.55, w * 0.85, h * 0.85);
  ctx.strokeStyle = color;
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.stroke();

  // White chrome highlight
  ctx.beginPath();
  ctx.moveTo(w * 0.17, h * 0.2);
  ctx.bezierCurveTo(w * 0.46, h * 0.45, w * 0.56, h * 0.55, w * 0.86, h * 0.85);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.stroke();

  // 2. Transverse curved smile-band
  ctx.beginPath();
  ctx.moveTo(w * 0.1, h * 0.58);
  ctx.bezierCurveTo(w * 0.4, h * 0.68, w * 0.6, h * 0.68, w * 0.9, h * 0.58);
  ctx.strokeStyle = color;
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.stroke();

  // White chrome highlight for band
  ctx.beginPath();
  ctx.moveTo(w * 0.1, h * 0.57);
  ctx.bezierCurveTo(w * 0.4, h * 0.67, w * 0.6, h * 0.67, w * 0.9, h * 0.57);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.restore();
}

/**
 * Renders faceted crystal rhinestones near the proximal cuticle fold
 */
function renderCuticleRhinestones(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
) {
  const gems = [
    { x: w * 0.5, y: h * 0.86, r: 18 },
    { x: w * 0.42, y: h * 0.88, r: 14 },
    { x: w * 0.58, y: h * 0.88, r: 14 },
    { x: w * 0.35, y: h * 0.91, r: 11 },
    { x: w * 0.65, y: h * 0.91, r: 11 },
  ];

  ctx.save();
  for (const g of gems) {
    // Drop shadow on nail
    ctx.beginPath();
    ctx.arc(g.x, g.y + 3, g.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fill();

    // Crystal base (brilliant cut reflection)
    const gemGrad = ctx.createRadialGradient(g.x - g.r * 0.3, g.y - g.r * 0.3, 1, g.x, g.y, g.r);
    gemGrad.addColorStop(0, '#FFFFFF');
    gemGrad.addColorStop(0.4, '#E2E8F0');
    gemGrad.addColorStop(0.8, '#CBD5E1');
    gemGrad.addColorStop(1, '#94A3B8');

    ctx.beginPath();
    ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
    ctx.fillStyle = gemGrad;
    ctx.fill();

    // Specular star glint
    ctx.beginPath();
    ctx.arc(g.x - g.r * 0.25, g.y - g.r * 0.25, g.r * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Utility: Adjust hex color brightness
 */
function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  if (isNaN(num)) return hex;
  let r = (num >> 16) + Math.round((255 * percent) / 100);
  let g = ((num >> 8) & 0x00ff) + Math.round((255 * percent) / 100);
  let b = (num & 0x0000ff) + Math.round((255 * percent) / 100);
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function hexToRgba(hex: string, alpha: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  if (isNaN(num)) return `rgba(224, 36, 106, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
