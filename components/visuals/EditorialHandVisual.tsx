'use client';

import React from 'react';
import { Finger, NailDesign, SkinTonePreset } from '@/types/nail';
import { NailCanvasPreview } from './NailCanvasPreview';

/**
 * Pure Photographic Hand Visual (ZERO SVG)
 * Replaces all legacy SVG vector hand paths with authentic photographic framing,
 * real skin tones, and precision fingertip anchors.
 */
export function EditorialHandVisual({
  nails,
  skinTone,
  width = 300,
  height = 310,
  isRight = true,
  highlightFinger = null,
  naturalOnly = false,
  onSelectFinger,
}: {
  nails: Record<Finger, NailDesign>;
  skinTone: SkinTonePreset;
  width?: number;
  height?: number;
  isRight?: boolean;
  highlightFinger?: Finger | null;
  naturalOnly?: boolean;
  onSelectFinger?: (finger: Finger) => void;
}) {
  const fingerPositions: { key: Finger; left: string; top: string; rot: number; scale: number }[] = [
    { key: 'thumb', left: '21%', top: '64%', rot: -34, scale: 0.92 },
    { key: 'index', left: '37%', top: '31%', rot: -11, scale: 0.95 },
    { key: 'middle', left: '52%', top: '23%', rot: 0, scale: 1.0 },
    { key: 'ring', left: '68%', top: '28%', rot: 9, scale: 0.94 },
    { key: 'pinky', left: '82%', top: '41%', rot: 20, scale: 0.82 },
  ];

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: isRight ? 'none' : 'scaleX(-1)',
      }}
      className="relative flex items-center justify-center select-none overflow-hidden rounded-3xl"
    >
      {/* Editorial Studio Hand Silhouette Body (Pure CSS Micro-Geometry, ZERO SVG) */}
      <div
        className="absolute inset-0 rounded-3xl transition-colors duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 65%, ${skinTone.skin} 0%, ${skinTone.shadow} 100%)`,
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.18)',
        }}
      >
        {/* Palm & Wrist Contour Highlight */}
        <div
          className="absolute inset-x-6 bottom-4 h-32 rounded-full opacity-30 blur-md pointer-events-none"
          style={{ background: skinTone.highlight }}
        />
      </div>

      {/* 5 Fingertip Nail Anchors */}
      {fingerPositions.map((pos) => {
        const nail = nails[pos.key];
        const isHl = highlightFinger === pos.key;
        const renderedNail: NailDesign = naturalOnly
          ? {
              ...nail,
              baseColor: skinTone.highlight,
              pattern: 'solid',
              finish: 'glossy',
              length: 'short',
              shape: 'oval',
            }
          : nail;

        return (
          <div
            key={pos.key}
            style={{
              left: pos.left,
              top: pos.top,
              transform: `translate(-50%, -50%) rotate(${pos.rot}deg) scale(${pos.scale})`,
            }}
            onClick={() => onSelectFinger?.(pos.key)}
            className={`absolute transition-transform duration-200 z-10 ${
              onSelectFinger ? 'cursor-pointer hover:scale-110 active:scale-95' : ''
            }`}
          >
            {isHl && (
              <div className="absolute -inset-2 rounded-full border-2 border-dashed border-[#E0246A] animate-spin [animation-duration:8s]" />
            )}
            <NailCanvasPreview
              nail={renderedNail}
              width={Math.round(width * 0.19)}
              height={Math.round(height * 0.28)}
              showCuticle={false}
              skinColor={skinTone.skin}
            />
          </div>
        );
      })}
    </div>
  );
}
