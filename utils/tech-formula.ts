import { NailDesign, NailPattern, NailFinish, TechStep } from '@/types/nail';

export function generateTechStepsForNail(nail: NailDesign): TechStep[] {
  const patternMap: Record<NailPattern, { step3: string; tool: string; cure: string }> = {
    solid: {
      step3: `Apply 2 micro-thin, even coats of ${nail.baseColor} lacquer gel, capping the free edge cleanly after each pass.`,
      tool: `Oval Gel Brush #4 • Pigment Shade ${nail.baseColor}`,
      cure: '60s LED',
    },
    'classic-french': {
      step3: `Over cured rubber base (${nail.baseColor}), hand-paint a precision razor-thin French smile line at the free edge using ${nail.accentColor} liner gel.`,
      tool: `7mm Fine Striper Brush • Art Gel ${nail.accentColor}`,
      cure: '30s LED Flash + 60s LED Full',
    },
    aura: {
      step3: `Over cured base (${nail.baseColor}), softly sponge or low-pressure airbrush ${nail.accentColor} into the central apex zone, diffusing outward into a seamless radial glow.`,
      tool: `Diffusing Sponge / Micro Airbrush • Pigment ${nail.accentColor}`,
      cure: '60s LED',
    },
    floral: {
      step3: `Over cured base (${nail.baseColor}), dot 5 delicate botanical petals using ${nail.accentColor} art gel with a micro dotting tool, anchoring with a micro Champagne Dust core.`,
      tool: `Micro Dotting Tool + 5mm Detail Liner • Art Gel ${nail.accentColor}`,
      cure: '60s LED',
    },
    'chrome-swirl': {
      step3: `Over cured base (${nail.baseColor}), sculpt organic 3D ribbon relief waves using high-viscosity builder art gel, flash-cure 20s, and burnish molten ${nail.accentColor} chrome powder.`,
      tool: `High-Viscosity 3D Builder Gel • Silicone Burnisher • Chrome Pigment ${nail.accentColor}`,
      cure: '20s Flash + 60s LED Full',
    },
    'glitter-ombre': {
      step3: `Over cured base (${nail.baseColor}), feather fine ${nail.accentColor} micro-glitter downward from cuticle toward mid-plate with a soft fan brush, fading before the tip.`,
      tool: `Feather Fan Brush • Micro-Reflective Gel ${nail.accentColor}`,
      cure: '60s LED',
    },
    'minimal-line': {
      step3: `Over cured base (${nail.baseColor}), pull an architectural 0.4mm vertical hairline along the nail axis using ${nail.accentColor} striper gel, flash-cured immediately to freeze placement.`,
      tool: `11mm Long Architectural Liner Brush • Shade ${nail.accentColor}`,
      cure: '30s LED Flash + 60s LED Full',
    },
  };

  const finishMap: Record<NailFinish, { text: string; tool: string; cure: string }> = {
    glossy: {
      text: 'Cap free edge with no-wipe high-refractive glass topcoat. Cure 60s LED and hydrate with botanical cuticle oil.',
      tool: 'No-Wipe Optical Glass Topcoat • Cuticle Nectar',
      cure: '60s LED',
    },
    matte: {
      text: 'Apply velvet soft-touch matte topcoat evenly across the entire plate. Cure 60s LED and cleanse dispersion layer.',
      tool: 'Velvet Matte Topcoat • Isopropanol Wipe',
      cure: '60s LED',
    },
    chrome: {
      text: 'Apply no-wipe topcoat, flash-cure 20s, burnish mirror pearl/gold chrome powder firmly with silicone applicator, dust excess, and seal with optical glass topcoat.',
      tool: 'Silicone Chrome Applicator • Dust Brush • 2x Optical Glass Topcoat',
      cure: '20s Flash + 60s LED Full',
    },
    glitter: {
      text: 'Float a self-leveling slip layer of clear apex builder over glitter texture, flash cure 30s, then seal with scratch-resistant high-gloss glass topcoat.',
      tool: 'Clear Leveling Builder • High-Shine Glass Topcoat',
      cure: '30s Flash + 60s LED Full',
    },
  };

  const pInfo = patternMap[nail.pattern] || patternMap.solid;
  const fInfo = finishMap[nail.finish] || finishMap.glossy;

  return [
    {
      num: 1,
      phase: 'Prep & Extension',
      text: `Dry e-file Russian cuticle prep with diamond flame bit, de-shine plate with 240-grit buffer, dehydrate with 99% isopropanol, apply acid-free bonding primer, and sculpt extension to a ${nail.length} ${nail.shape} silhouette.`,
      tool: 'Diamond Flame Bit • 180/240 Grit File • Acid-Free Primer',
      cure: '30s LED Flash',
    },
    {
      num: 2,
      phase: 'Rubber Base & Apex',
      text: `Float a self-leveling structural rubber base in ${nail.baseColor} tone to establish the central apex 1/3 down from the eponychium. Invert hand for 5s to center apex geometry before curing.`,
      tool: `Structural Rubber Base Shade ${nail.baseColor} • Oval #4 Brush`,
      cure: '60s LED',
    },
    {
      num: 3,
      phase: 'Art & Technique',
      text: pInfo.step3 + (nail.clientNote ? ` (Atelier note: "${nail.clientNote}")` : ''),
      tool: pInfo.tool,
      cure: pInfo.cure,
    },
    {
      num: 4,
      phase: 'Topcoat & Finish',
      text: fInfo.text,
      tool: fInfo.tool,
      cure: fInfo.cure,
    },
  ];
}
