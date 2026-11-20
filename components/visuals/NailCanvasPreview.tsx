'use client';

import React from 'react';
import { NailDesign } from '@/types/nail';

export interface NailCanvasGradient {
  base: string;
  mid?: string;
  tip: string;
}

/**
 * Pure Photographic Nail Preview Card with Realistic Anatomical Finger Geometry
 * Completely replaces all legacy SVGs with authentic photographic textures,
 * natural apex specular reflections, realistic salon gel finishes, and 3D finger anatomy.
 * Zero-SVG Micro-Geometry Architecture.
 */
export function NailCanvasPreview({
  nail,
  width = 64,
  height = 96,
  showCuticle = true,
  showFinger = false,
  skinColor = '#F5DDD2',
  interactive = false,
  className = '',
  gradient,
  glowColor,
}: {
  nail: NailDesign;
  width?: number;
  height?: number;
  showCuticle?: boolean;
  showFinger?: boolean;
  skinColor?: string;
  interactive?: boolean;
  className?: string;
  gradient?: NailCanvasGradient;
  glowColor?: string;
}) {
  // Shape-specific border radius and silhouette styling (CSS micro-geometry, ZERO SVG)
  const isCoffin = nail.shape === 'coffin';
  const isStiletto = nail.shape === 'stiletto';
  const isAlmond = nail.shape === 'almond';
  const isSquare = nail.shape === 'square';
  const isOval = nail.shape === 'oval';

  // Proportions: scale appropriately for standalone nail vs full finger
  const isFinger = showFinger;
  const lengthScale = nail.length === 'short' ? 0.82 : nail.length === 'long' ? 1.15 : 0.98;
  const nailWidth = Math.round(width * (isFinger ? 0.58 : 0.64));
  const nailHeight = Math.round(height * (isFinger ? 0.68 : 0.76) * lengthScale);
  const fingerWidth = Math.round(nailWidth * 1.34);
  const fingerHeight = Math.round(height * 0.94);
  const cuticleOffset = Math.round(fingerHeight * 0.22);

  // Anatomically accurate shape silhouettes with smooth cuticle bases
  let nailRadiusStyle: React.CSSProperties = {
    borderRadius: '45% 45% 22px 22px / 52% 52% 20px 20px', // Default oval
  };

  if (isCoffin) {
    // Coffin (Ballerina): Tapered sidewalls with flat squared free edge
    nailRadiusStyle = {
      borderRadius: '0 0 20px 20px',
      clipPath: 'polygon(16% 0%, 84% 0%, 100% 74%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 74%)',
    };
  } else if (isStiletto) {
    // Graceful organic taper fallback
    nailRadiusStyle = {
      borderRadius: '48% 48% 22px 22px / 64% 64% 20px 20px',
    };
  } else if (isSquare) {
    // Square: Parallel sidewalls with softened 90° corners
    nailRadiusStyle = {
      borderRadius: '3px 3px 20px 20px',
    };
  } else if (isAlmond) {
    // Almond: Softly tapered lateral walls with slender parabolic apex dome
    nailRadiusStyle = {
      borderRadius: '48% 48% 22px 22px / 64% 64% 20px 20px',
    };
  } else if (isOval) {
    nailRadiusStyle = {
      borderRadius: '45% 45% 22px 22px / 52% 52% 20px 20px',
    };
  }

  const isChrome = nail.finish === 'chrome';
  const isMatte = nail.finish === 'matte';
  const isGlitter = nail.finish === 'glitter';

  // Derived realistic skin tones for cylindrical finger lighting
  const skinHighlight = '#FAF0EB';
  const skinMid = skinColor || '#F5DDD2';
  const skinShadow = '#CE9E8E';
  const skinDeepShadow = '#B07E6E';

  // Volumetric color glow based on polish tint
  const ambientGlow = glowColor || (gradient ? gradient.tip : (nail.accentColor || nail.baseColor || '#E0246A'));

  // Background styling: multi-stop linear gradient or base color
  const backgroundStyle = gradient
    ? `linear-gradient(180deg, ${gradient.base} 0%, ${gradient.mid || gradient.base} 45%, ${gradient.tip} 100%)`
    : nail.baseColor || '#F5EFEB';

  return (
    <div
      style={{ width: `${width}px`, height: `${height}px` }}
      className={`relative flex items-center justify-center select-none overflow-visible ${
        interactive ? 'hover:scale-105 transition-transform duration-200 cursor-pointer' : ''
      } ${className}`}
    >
      {/* 3D Anatomical Finger Body (Full hand presence that anchors into viewfinder) */}
      {isFinger && (
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-300"
          style={{
            width: `${fingerWidth}px`,
            height: `${fingerHeight}px`,
            borderRadius: '50% 50% 28px 28px / 40% 40% 28px 28px',
            background: `linear-gradient(90deg, ${skinDeepShadow} 0%, ${skinShadow} 12%, ${skinMid} 36%, ${skinHighlight} 52%, ${skinMid} 78%, ${skinShadow} 92%, ${skinDeepShadow} 100%)`,
            boxShadow:
              '0 18px 40px -8px rgba(70, 25, 35, 0.22), inset 0 2px 4px rgba(255, 255, 255, 0.6), inset 0 -6px 14px rgba(90, 35, 45, 0.25)',
          }}
        >
          {/* Distal Interphalangeal Joint Creases (Knuckle Lines on lower finger digit) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-55 pointer-events-none">
            <div
              className="h-[1.5px] rounded-full"
              style={{
                width: `${Math.round(fingerWidth * 0.46)}px`,
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(130, 65, 55, 0.6) 25%, rgba(130, 65, 55, 0.7) 75%, transparent 100%)',
                boxShadow: '0 1px 0 rgba(255, 255, 255, 0.65)',
              }}
            />
            <div
              className="h-[1px] rounded-full"
              style={{
                width: `${Math.round(fingerWidth * 0.32)}px`,
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(130, 65, 55, 0.4) 25%, rgba(130, 65, 55, 0.5) 75%, transparent 100%)',
                boxShadow: '0 1px 0 rgba(255, 255, 255, 0.5)',
              }}
            />
          </div>

          {/* Proximal Cuticle Fold Lip (Delicate skin fold wrapping nail base) */}
          <div
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-20"
            style={{
              bottom: `${cuticleOffset - 2}px`,
              width: `${nailWidth + 10}px`,
              height: '16px',
              borderRadius: '0 0 22px 22px',
              background:
                'linear-gradient(180deg, rgba(235, 195, 185, 0) 0%, rgba(210, 155, 140, 0.55) 50%, rgba(250, 228, 222, 0.95) 100%)',
              boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.85), 0 -1px 3px rgba(90, 30, 40, 0.25)',
            }}
          />
        </div>
      )}

      {/* Classic Cuticle Skin Bed Pad (When showFinger is false but showCuticle is true) */}
      {!isFinger && showCuticle && (
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none rounded-b-2xl"
          style={{
            height: `${Math.round(height * 0.38)}px`,
            background: `radial-gradient(ellipse at 50% 100%, ${skinMid} 0%, rgba(210, 165, 150, 0.95) 75%, transparent 100%)`,
            opacity: 0.9,
          }}
        />
      )}

      {/* Real Sculptural Acrylic / Gel Nail Body */}
      <div
        style={{
          width: `${nailWidth}px`,
          height: `${nailHeight}px`,
          marginBottom: isFinger ? `${cuticleOffset}px` : '0px',
          background: backgroundStyle,
          boxShadow: isMatte
            ? 'inset 0 1px 3px rgba(0,0,0,0.12)'
            : 'inset 0 2px 4px rgba(255,255,255,0.7), inset 0 -3px 6px rgba(0,0,0,0.12)',
          filter: isMatte
            ? 'drop-shadow(0 6px 14px rgba(0,0,0,0.1))'
            : `drop-shadow(0 12px 20px ${ambientGlow}32) drop-shadow(0 2px 6px rgba(0,0,0,0.06))`,
          ...nailRadiusStyle,
        }}
        className="relative overflow-hidden transition-all duration-300 z-10"
      >
        {/* Longitudinal Apex C-Curve 3D Curvature Highlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isMatte
              ? 'linear-gradient(90deg, rgba(0,0,0,0.12) 0%, rgba(255,255,255,0.06) 45%, rgba(0,0,0,0.12) 100%)'
              : 'linear-gradient(90deg, rgba(0,0,0,0.15) 0%, rgba(255,255,255,0.38) 36%, rgba(255,255,255,0.1) 52%, rgba(0,0,0,0.14) 100%)',
          }}
        />

        {/* Proximal Cuticle Contact Shadow (Ambient Occlusion) */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: '22%',
            background: 'linear-gradient(0deg, rgba(25,10,18,0.3) 0%, transparent 100%)',
          }}
        />

        {/* Natural Translucent Lunula (Half-Moon at Cuticle) */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-full bg-white/14 blur-[1px] pointer-events-none"
          style={{
            width: `${Math.round(nailWidth * 0.52)}px`,
            height: `${Math.round(nailHeight * 0.18)}px`,
          }}
        />

        {/* Authentic AI Generated Nail Art Image Layer */}
        {(nail.artImageUrl || nail.extractedTextureUrl) ? (
          <img
            src={nail.artImageUrl || nail.extractedTextureUrl || '/assets/editorial_nail_hero.jpg'}
            alt={nail.title || 'Nail Art Design'}
            className="absolute inset-0 w-full h-full object-cover scale-105 pointer-events-none"
          />
        ) : (
          <>
            {/* ===== ARTISTRY PATTERNS (PURE CSS & PHOTOGRAPHIC COMPOSITION) ===== */}

            {/* 1. Classic French Tip with Realistic Smile-Line Arc */}
            {nail.pattern === 'classic-french' && (
              <div
                className="absolute inset-x-0 top-0 pointer-events-none transition-all duration-300"
                style={{
                  height: '28%',
                  backgroundColor: nail.accentColor || '#FFFFFF',
                  borderRadius: '0 0 50% 50% / 0 0 16px 16px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                }}
              >
                {/* French Tip Sheen Highlight */}
                <div
                  className="absolute top-1 left-2.5 bottom-1.5 rounded-full bg-white/80 pointer-events-none"
                  style={{ width: width > 100 ? '4px' : '1.5px' }}
                />
              </div>
            )}

            {/* 2. Heart French & Swoopy Lines */}
            {nail.pattern === 'heart-french' && (
              <>
                <div
                  className="absolute inset-x-0 top-0"
                  style={{
                    height: '34%',
                    backgroundColor: nail.accentColor || '#FFFFFF',
                    borderRadius: '0 0 60% 40% / 0 0 20px 14px',
                  }}
                />
                {/* Center Heart Emblem */}
                <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                  <span
                    style={{ color: nail.accentColor || '#FFFFFF', fontSize: `${Math.round(nailWidth * 0.45)}px` }}
                    className="drop-shadow-xs leading-none select-none"
                  >
                    ♡
                  </span>
                </div>
                {/* Cuticle Rhinestones */}
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs border border-stone-200" />
                  <div className="w-2 h-2 rounded-full bg-white shadow-xs border border-stone-200" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs border border-stone-200" />
                </div>
              </>
            )}

            {/* 3. Metallic Striping Tape (Minimal Line) */}
            {nail.pattern === 'minimal-line' && (
              <>
                {/* Diagonal metallic tape band */}
                <div
                  className="absolute inset-x-[-20%] top-[40%] h-1 transform -rotate-25 shadow-xs"
                  style={{
                    backgroundColor: nail.accentColor || '#C8A182',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                  }}
                >
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-white/70" />
                </div>
                {/* Horizontal curved band */}
                <div
                  className="absolute inset-x-0 top-[62%] h-1 shadow-xs"
                  style={{
                    backgroundColor: nail.accentColor || '#C8A182',
                    borderRadius: '50%',
                  }}
                >
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-white/80" />
                </div>
              </>
            )}

            {/* 4. Ombré French */}
            {nail.pattern === 'ombre-french' && (
              <div
                className="absolute inset-x-0 top-0 h-[50%]"
                style={{
                  background: `linear-gradient(180deg, ${nail.accentColor || '#FFFFFF'} 0%, transparent 100%)`,
                }}
              />
            )}

            {/* 5. Aura Diffuse Center */}
            {nail.pattern === 'aura' && (
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[60%] rounded-full blur-xs"
                style={{
                  backgroundColor: nail.accentColor || '#E0246A',
                  opacity: 0.85,
                }}
              />
            )}

            {/* 6. Chrome Swirl */}
            {nail.pattern === 'chrome-swirl' && (
              <div
                className="absolute inset-x-[-10%] top-[35%] h-2.5 rounded-full transform rotate-18 shadow-sm"
                style={{
                  background: `linear-gradient(90deg, ${nail.accentColor || '#E0246A'}, #FFFFFF, ${nail.accentColor || '#E0246A'})`,
                }}
              />
            )}

            {/* 7. Glitter Ombre */}
            {nail.pattern === 'glitter-ombre' && (
              <div
                className="absolute inset-x-0 bottom-0 h-[65%]"
                style={{
                  background: `radial-gradient(circle at 50% 100%, ${nail.accentColor || '#C59B27'} 0%, transparent 80%)`,
                }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:6px_6px] opacity-70" />
              </div>
            )}
          </>
        )}

        {/* Studio Lighting Specular Gel Reflections */}
        {!isMatte && (
          <>
            {/* Primary Salon Light Tube Lateral Specular Ridge */}
            <div
              className="absolute top-2 sm:top-3 left-2 sm:left-3 bottom-5 rounded-full pointer-events-none"
              style={{
                width: width > 100 ? '9px' : '3px',
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.35) 35%, rgba(255,255,255,0.12) 75%, transparent 100%)',
              }}
            />
            {/* Ultra-Fine Crisp Hairline Core */}
            <div
              className="absolute top-3 sm:top-4 left-[11px] sm:left-[17px] h-[55%] rounded-full bg-white/95 pointer-events-none blur-[0.2px]"
              style={{ width: width > 100 ? '1.5px' : '0.8px' }}
            />
            {/* Secondary Right Ambient Rim Highlight */}
            <div
              className="absolute top-3 sm:top-4 right-2 sm:right-3 bottom-7 rounded-full bg-white/20 pointer-events-none"
              style={{ width: width > 100 ? '1.5px' : '0.8px' }}
            />
            {/* 3D Convex Apex Arch Dome Reflection */}
            <div
              className="absolute top-[32%] left-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
              style={{
                width: `${Math.round(nailWidth * 0.55)}px`,
                height: `${Math.round(nailHeight * 0.38)}px`,
                background:
                  'radial-gradient(ellipse at center, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.1) 45%, transparent 72%)',
              }}
            />
            {/* Top Free Edge Sculpted Rim Thickness */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-white/60 pointer-events-none" />
          </>
        )}

        {/* Pearlescent Glazed Chrome Optical Sheen */}
        {isChrome && (
          <>
            <div
              className="absolute inset-0 pointer-events-none opacity-45 mix-blend-overlay"
              style={{
                background: 'radial-gradient(ellipse at 35% 25%, #FFFFFF 0%, rgba(255,255,255,0.4) 40%, transparent 80%)',
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen"
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(224,36,106,0.3) 40%, rgba(197,155,39,0.3) 70%, transparent 100%)',
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
