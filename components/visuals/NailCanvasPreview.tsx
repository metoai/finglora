'use client';

import React, { useState, useEffect } from 'react';
import { NailDesign } from '@/types/nail';
import { PBRNailCanvas } from './PBRNailCanvas';

export function NailCanvasPreview({
  nail,
  width = 64,
  height = 96,
  showCuticle = true,
  skinColor = '#EAC0AE',
  interactive = false,
}: {
  nail: NailDesign;
  width?: number;
  height?: number;
  showCuticle?: boolean;
  skinColor?: string;
  interactive?: boolean;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // SSR static placeholder
    return (
      <div
        style={{ width: `${width}px`, height: `${height}px` }}
        className="rounded-xl bg-pink-50/60 animate-pulse"
      />
    );
  }

  return (
    <div
      style={{ width: `${width}px`, height: `${height}px` }}
      className="relative flex items-center justify-center overflow-visible select-none"
    >
      {/* Cuticle Skin Bed Pad (Underneath the 3D Nail) */}
      {showCuticle && (
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none rounded-b-2xl"
          style={{
            height: `${Math.round(height * 0.42)}px`,
            background: `radial-gradient(ellipse at 50% 100%, ${skinColor} 0%, rgba(220, 175, 160, 0.95) 70%, transparent 100%)`,
            opacity: 0.92,
          }}
        />
      )}

      {/* Photorealistic 3D PBR WebGL Nail Canvas */}
      <PBRNailCanvas
        nail={nail}
        width={width}
        height={height}
        interactive={interactive}
      />
    </div>
  );
}
