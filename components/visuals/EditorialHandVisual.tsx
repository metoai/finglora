'use client';

import React from 'react';
import { Finger, NailDesign, SkinTonePreset } from '@/types/nail';
import { NailCanvasPreview } from './NailCanvasPreview';

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
  const fingerPositions: { key: Finger; x: number; y: number; rot: number; scale: number }[] = [
    { key: 'thumb', x: 74, y: 232, rot: -34, scale: 0.92 },
    { key: 'index', x: 132, y: 112, rot: -11, scale: 0.95 },
    { key: 'middle', x: 188, y: 84, rot: 0, scale: 1.0 },
    { key: 'ring', x: 244, y: 102, rot: 9, scale: 0.94 },
    { key: 'pinky', x: 294, y: 148, rot: 20, scale: 0.82 },
  ];

  return (
    <svg width={width} height={height} viewBox="0 0 360 365" className="max-w-full h-auto drop-shadow-md select-none">
      <g transform={isRight ? '' : 'translate(360, 0) scale(-1, 1)'}>
        <path
          d="M 122 365 L 126 285 Q 92 268 66 236 Q 55 222 68 212 Q 80 205 96 222 L 116 244 L 116 114 Q 116 98 132 98 Q 148 98 148 114 L 148 205 L 172 86 Q 172 70 188 70 Q 204 70 204 86 L 204 202 L 228 104 Q 228 88 244 88 Q 260 88 260 104 L 256 212 L 280 150 Q 282 135 296 137 Q 310 140 306 156 L 278 268 Q 268 302 252 325 L 252 365 Z"
          fill={skinTone.skin}
          stroke={skinTone.shadow}
          strokeWidth="2"
        />
        <path
          d="M 145 258 Q 190 245 235 262"
          fill="none"
          stroke={skinTone.shadow}
          strokeWidth="2"
          opacity="0.32"
          strokeLinecap="round"
        />
        <ellipse cx="188" cy="292" rx="44" ry="30" fill={skinTone.highlight} opacity="0.28" />

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
            <g
              key={pos.key}
              transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rot}) scale(${pos.scale})`}
              onClick={() => onSelectFinger?.(pos.key)}
              className={onSelectFinger ? 'cursor-pointer group' : ''}
              role={onSelectFinger ? 'button' : undefined}
              tabIndex={onSelectFinger ? 0 : undefined}
              aria-label={onSelectFinger ? `Select ${pos.key} finger` : undefined}
            >
              {isHl && (
                <circle
                  cx="0"
                  cy="-6"
                  r="28"
                  fill="none"
                  stroke="#D6336C"
                  strokeWidth="2.5"
                  strokeDasharray="4 3"
                />
              )}
              <g transform="translate(-32, -52)">
                <NailCanvasPreview nail={renderedNail} width={64} height={92} showCuticle={false} />
              </g>
              {onSelectFinger && (
                <circle
                  cx="0"
                  cy="-6"
                  r="30"
                  fill="transparent"
                  className="hover:stroke-[#D6336C]/40 hover:stroke-[1.5px] transition-colors"
                />
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
