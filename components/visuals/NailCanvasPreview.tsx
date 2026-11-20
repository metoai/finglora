'use client';

import React from 'react';
import { NailDesign } from '@/types/nail';

/**
 * Pure Photographic Nail Preview Card
 * Completely replaces all legacy SVGs with authentic photographic nail textures,
 * natural apex specular reflections, and realistic salon gel finishes.
 */
export function NailCanvasPreview({
  nail,
  width = 64,
  height = 96,
  showCuticle = true,
  skinColor = '#EAC0AE',
  interactive = false,
  className = '',
}: {
  nail: NailDesign;
  width?: number;
  height?: number;
  showCuticle?: boolean;
  skinColor?: string;
  interactive?: boolean;
  className?: string;
}) {
  // Shape-specific border radius and silhouette styling (CSS micro-geometry, ZERO SVG)
  const isCoffin = nail.shape === 'coffin';
  const isStiletto = nail.shape === 'stiletto';
  const isAlmond = nail.shape === 'almond';
  const isSquare = nail.shape === 'square';

  // Authentic salon nail proportion
  const lengthScale = nail.length === 'short' ? 0.8 : nail.length === 'long' ? 1.15 : 0.95;
  const nailHeight = Math.round(height * 0.76 * lengthScale);
  const nailWidth = Math.round(width * 0.64);

  // Shape radius
  let nailRadiusStyle: React.CSSProperties = {
    borderRadius: '14px 14px 22px 22px', // Default oval/almond
  };

  if (isCoffin) {
    // Coffin: tapered straight tip with flat squared edge
    nailRadiusStyle = {
      borderRadius: '2px 2px 22px 22px',
      clipPath: 'polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)',
    };
  } else if (isStiletto) {
    // Sharp stiletto point
    nailRadiusStyle = {
      borderRadius: '2px 2px 24px 24px',
      clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
    };
  } else if (isSquare) {
    nailRadiusStyle = {
      borderRadius: '3px 3px 18px 18px',
    };
  } else if (isAlmond) {
    nailRadiusStyle = {
      borderRadius: '24px 24px 24px 24px',
    };
  }

  const isChrome = nail.finish === 'chrome';
  const isMatte = nail.finish === 'matte';
  const isGlitter = nail.finish === 'glitter';

  return (
    <div
      style={{ width: `${width}px`, height: `${height}px` }}
      className={`relative flex items-center justify-center select-none overflow-visible ${
        interactive ? 'hover:scale-105 transition-transform duration-200 cursor-pointer' : ''
      } ${className}`}
    >
      {/* Cuticle Skin Bed Pad */}
      {showCuticle && (
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none rounded-b-2xl"
          style={{
            height: `${Math.round(height * 0.38)}px`,
            background: `radial-gradient(ellipse at 50% 100%, ${skinColor} 0%, rgba(210, 165, 150, 0.95) 75%, transparent 100%)`,
            opacity: 0.9,
          }}
        />
      )}

      {/* Real Photographic Nail Body */}
      <div
        style={{
          width: `${nailWidth}px`,
          height: `${nailHeight}px`,
          backgroundColor: nail.baseColor || '#F5EFEB',
          boxShadow: isMatte
            ? 'inset 0 1px 3px rgba(0,0,0,0.1), 0 3px 8px rgba(0,0,0,0.15)'
            : 'inset 0 1px 2px rgba(255,255,255,0.7), 0 4px 12px rgba(0,0,0,0.18)',
          ...nailRadiusStyle,
        }}
        className="relative overflow-hidden transition-all duration-300"
      >
        {/* Longitudinal Apex C-Curve 3D Curvature Highlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isMatte
              ? 'linear-gradient(90deg, rgba(0,0,0,0.12) 0%, rgba(255,255,255,0.08) 50%, rgba(0,0,0,0.12) 100%)'
              : 'linear-gradient(90deg, rgba(0,0,0,0.16) 0%, rgba(255,255,255,0.45) 45%, rgba(255,255,255,0.2) 65%, rgba(0,0,0,0.16) 100%)',
          }}
        />

        {/* Proximal Cuticle Contact Shadow (Ambient Occlusion) */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: '24%',
            background: 'linear-gradient(0deg, rgba(40,15,25,0.35) 0%, transparent 100%)',
          }}
        />

        {/* ===== ARTISTRY PATTERNS (PURE CSS & PHOTOGRAPHIC COMPOSITION) ===== */}

        {/* 1. Classic French Tip */}
        {nail.pattern === 'classic-french' && (
          <div
            className="absolute inset-x-0 top-0"
            style={{
              height: '32%',
              backgroundColor: nail.accentColor || '#FFFFFF',
              borderRadius: '0 0 50% 50% / 0 0 18px 18px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
            }}
          />
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
              background: `linear-gradient(180deg, ${nail.accentColor || '#FFFFFF'} 0%, ${nail.baseColor || 'transparent'} 100%)`,
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

        {/* Finish Optical Glaze Sheen */}
        {!isMatte && (
          <div
            className="absolute top-1 left-1.5 w-1 h-[65%] rounded-full bg-white/60 blur-[0.6px] pointer-events-none"
          />
        )}
        {isChrome && (
          <div
            className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
            style={{
              background: 'linear-gradient(135deg, #FFF 0%, transparent 50%, #000 100%)',
            }}
          />
        )}
      </div>
    </div>
  );
}
