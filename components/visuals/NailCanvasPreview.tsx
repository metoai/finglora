'use client';

import React, { useId } from 'react';
import { NailDesign } from '@/types/nail';

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
  const reactId = useId();
  const uid = `${nail.finger}-${reactId.replace(/:/g, '')}`;

  const lengthScale = nail.length === 'short' ? 0.78 : nail.length === 'long' ? 1.14 : 0.96;
  const nailH = Math.round(height * 0.74 * lengthScale);
  const nailW = Math.round(width * 0.66);
  const cx = width / 2;
  const bottomY = height - 8;
  const topY = Math.max(6, bottomY - nailH);
  const leftX = cx - nailW / 2;
  const rightX = cx + nailW / 2;
  const midY = topY + (bottomY - topY) * 0.45;

  let pathD = '';
  if (nail.shape === 'square') {
    const r = 5;
    pathD = `M ${leftX} ${bottomY - 10} L ${leftX} ${topY + r} Q ${leftX} ${topY} ${leftX + r} ${topY} L ${rightX - r} ${topY} Q ${rightX} ${topY} ${rightX} ${topY + r} L ${rightX} ${bottomY - 10} Q ${cx} ${bottomY + 3} ${leftX} ${bottomY - 10} Z`;
  } else if (nail.shape === 'coffin') {
    const taper = nailW * 0.22;
    pathD = `M ${leftX} ${bottomY - 10} L ${leftX + taper} ${topY + 2} Q ${cx} ${topY} ${rightX - taper} ${topY + 2} L ${rightX} ${bottomY - 10} Q ${cx} ${bottomY + 3} ${leftX} ${bottomY - 10} Z`;
  } else if (nail.shape === 'stiletto') {
    pathD = `M ${leftX} ${bottomY - 10} Q ${leftX + 2} ${midY} ${cx} ${topY} Q ${rightX - 2} ${midY} ${rightX} ${bottomY - 10} Q ${cx} ${bottomY + 3} ${leftX} ${bottomY - 10} Z`;
  } else if (nail.shape === 'oval') {
    pathD = `M ${leftX} ${bottomY - 10} L ${leftX} ${topY + nailW * 0.48} A ${nailW / 2} ${nailW * 0.48} 0 0 1 ${rightX} ${topY + nailW * 0.48} L ${rightX} ${bottomY - 10} Q ${cx} ${bottomY + 3} ${leftX} ${bottomY - 10} Z`;
  } else {
    pathD = `M ${leftX} ${bottomY - 10} Q ${leftX - 1} ${midY} ${cx} ${topY} Q ${rightX + 1} ${midY} ${rightX} ${bottomY - 10} Q ${cx} ${bottomY + 3} ${leftX} ${bottomY - 10} Z`;
  }

  const tipDepth = topY + (bottomY - topY) * 0.28;
  const auraCy = topY + (bottomY - topY) * 0.52;
  const fy = topY + (bottomY - topY) * 0.54;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible select-none ${interactive ? 'transition-transform duration-200 hover:scale-105' : ''}`}
    >
      <defs>
        <clipPath id={`clip-${uid}`}>
          <path d={pathD} />
        </clipPath>
        <linearGradient id={`apex-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.10" />
          <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.12" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.20" />
          <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.12" />
        </linearGradient>
        <radialGradient id={`aura-${uid}`} cx="50%" cy="52%" r="45%">
          <stop offset="0%" stopColor={nail.accentColor} stopOpacity="0.95" />
          <stop offset="65%" stopColor={nail.accentColor} stopOpacity="0.45" />
          <stop offset="100%" stopColor={nail.baseColor} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`glit-${uid}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={nail.accentColor} stopOpacity="0.95" />
          <stop offset="55%" stopColor={nail.accentColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={nail.accentColor} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`chrome-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.05" />
          <stop offset="75%" stopColor="#FFFFFF" stopOpacity="0.48" />
          <stop offset="100%" stopColor="#18181B" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id={`ombre-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={nail.accentColor} stopOpacity="0.95" />
          <stop offset="40%" stopColor={nail.accentColor} stopOpacity="0.45" />
          <stop offset="70%" stopColor={nail.baseColor} stopOpacity="0.15" />
          <stop offset="100%" stopColor={nail.baseColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {showCuticle && (
        <path
          d={`M ${leftX - 4} ${height} L ${leftX - 4} ${topY + nailH * 0.36} Q ${cx} ${topY + nailH * 0.22} ${rightX + 4} ${topY + nailH * 0.36} L ${rightX + 4} ${height} Z`}
          fill={skinColor}
          opacity="0.9"
        />
      )}

      <g clipPath={`url(#clip-${uid})`}>
        {/* Base Lacquer */}
        <rect x={leftX - 4} y={topY - 4} width={nailW + 8} height={nailH + 14} fill={nail.baseColor} />

        {/* Apex 3D curvature */}
        <rect x={leftX - 4} y={topY - 4} width={nailW + 8} height={nailH + 14} fill={`url(#apex-${uid})`} pointerEvents="none" />

        {/* ===== PATTERN RENDERING ===== */}

        {/* Classic French Tip */}
        {nail.pattern === 'classic-french' && (
          <path
            d={`M ${leftX - 4} ${tipDepth} Q ${cx} ${tipDepth + 9} ${rightX + 4} ${tipDepth} L ${rightX + 4} ${topY - 4} L ${leftX - 4} ${topY - 4} Z`}
            fill={nail.accentColor}
          />
        )}

        {/* Heart French — French tip + heart outline + gem dots */}
        {nail.pattern === 'heart-french' && (
          <>
            {/* Swoopy French tip */}
            <path
              d={`M ${leftX - 4} ${tipDepth - 2} Q ${cx - nailW * 0.15} ${tipDepth + 12} ${cx} ${tipDepth + 5} Q ${cx + nailW * 0.15} ${tipDepth - 2} ${rightX + 4} ${tipDepth + 3} L ${rightX + 4} ${topY - 4} L ${leftX - 4} ${topY - 4} Z`}
              fill={nail.accentColor}
            />
            {/* Heart outline */}
            <path
              d={`M ${cx} ${fy + 6}
                  C ${cx - nailW * 0.3} ${fy - 2}, ${cx - nailW * 0.3} ${fy - 10}, ${cx} ${fy - 4}
                  C ${cx + nailW * 0.3} ${fy - 10}, ${cx + nailW * 0.3} ${fy - 2}, ${cx} ${fy + 6} Z`}
              fill="none"
              stroke={nail.accentColor}
              strokeWidth="1.8"
              opacity="0.9"
            />
            {/* Gem cluster near cuticle */}
            <circle cx={cx + nailW * 0.18} cy={bottomY - 14} r="1.6" fill="#FFFFFF" opacity="0.95" />
            <circle cx={cx + nailW * 0.26} cy={bottomY - 17} r="1.2" fill="#FFFFFF" opacity="0.85" />
            <circle cx={cx + nailW * 0.12} cy={bottomY - 18} r="1.0" fill="#FFFFFF" opacity="0.75" />
            {/* Glossy highlight on gems */}
            <circle cx={cx + nailW * 0.18} cy={bottomY - 14.5} r="0.6" fill="#FFFFFF" opacity="0.95" />
          </>
        )}

        {/* Ombré French — gradient tip */}
        {nail.pattern === 'ombre-french' && (
          <rect
            x={leftX - 4}
            y={topY - 4}
            width={nailW + 8}
            height={nailH * 0.55}
            fill={`url(#ombre-${uid})`}
          />
        )}

        {/* Aura Glow */}
        {nail.pattern === 'aura' && (
          <ellipse cx={cx} cy={auraCy} rx={nailW * 0.44} ry={nailH * 0.36} fill={`url(#aura-${uid})`} />
        )}

        {/* Floral */}
        {nail.pattern === 'floral' && (
          <>
            <g transform={`translate(${cx - 2}, ${fy})`}>
              <circle cx="0" cy="-5" r="3.4" fill={nail.accentColor} opacity="0.95" />
              <circle cx="4.8" cy="-1.5" r="3.4" fill={nail.accentColor} opacity="0.95" />
              <circle cx="3" cy="4.2" r="3.4" fill={nail.accentColor} opacity="0.95" />
              <circle cx="-3" cy="4.2" r="3.4" fill={nail.accentColor} opacity="0.95" />
              <circle cx="-4.8" cy="-1.5" r="3.4" fill={nail.accentColor} opacity="0.95" />
              <circle cx="0" cy="0" r="2.2" fill="#E5C697" />
            </g>
            <g transform={`translate(${cx + 7}, ${fy - 14}) scale(0.65)`}>
              <circle cx="0" cy="-5" r="3.4" fill={nail.accentColor} opacity="0.9" />
              <circle cx="4.8" cy="-1.5" r="3.4" fill={nail.accentColor} opacity="0.9" />
              <circle cx="3" cy="4.2" r="3.4" fill={nail.accentColor} opacity="0.9" />
              <circle cx="-3" cy="4.2" r="3.4" fill={nail.accentColor} opacity="0.9" />
              <circle cx="-4.8" cy="-1.5" r="3.4" fill={nail.accentColor} opacity="0.9" />
              <circle cx="0" cy="0" r="2.2" fill="#E5C697" />
            </g>
          </>
        )}

        {/* Chrome Swirl */}
        {nail.pattern === 'chrome-swirl' && (
          <>
            <path
              d={`M ${leftX - 2} ${topY + nailH * 0.65} C ${cx} ${topY + nailH * 0.25}, ${cx} ${topY + nailH * 0.78}, ${rightX + 2} ${topY + nailH * 0.32}`}
              fill="none"
              stroke={nail.accentColor}
              strokeWidth="4.2"
              strokeLinecap="round"
              opacity="0.92"
            />
            <path
              d={`M ${leftX - 2} ${topY + nailH * 0.78} C ${cx} ${topY + nailH * 0.42}, ${cx + 2} ${topY + nailH * 0.88}, ${rightX + 2} ${topY + nailH * 0.48}`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.7"
            />
          </>
        )}

        {/* Glitter Ombré */}
        {nail.pattern === 'glitter-ombre' && (
          <>
            <rect x={leftX} y={topY} width={nailW} height={nailH + 6} fill={`url(#glit-${uid})`} />
            <circle cx={cx - 5} cy={bottomY - 14} r="1.3" fill="#FFFFFF" opacity="0.9" />
            <circle cx={cx + 4} cy={bottomY - 18} r="1.5" fill="#FFFFFF" opacity="0.85" />
            <circle cx={cx - 1} cy={bottomY - 24} r="1.1" fill="#FFFFFF" opacity="0.8" />
            <circle cx={cx + 6} cy={bottomY - 10} r="1.0" fill="#FFFFFF" opacity="0.75" />
          </>
        )}

        {/* Minimal Line */}
        {nail.pattern === 'minimal-line' && (
          <>
            <line
              x1={cx + 3}
              y1={topY + 8}
              x2={cx + 3}
              y2={bottomY - 11}
              stroke={nail.accentColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx={cx + 3} cy={bottomY - 15} r="2.2" fill={nail.accentColor} />
          </>
        )}

        {/* ===== FINISH EFFECTS ===== */}

        {/* Glossy streak */}
        {nail.finish === 'glossy' && (
          <path
            d={`M ${leftX + nailW * 0.22} ${bottomY - 15} Q ${leftX + nailW * 0.2} ${midY} ${cx - nailW * 0.08} ${topY + 10}`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.6"
            strokeLinecap="round"
            opacity="0.60"
          />
        )}
        {nail.finish === 'matte' && (
          <rect x={leftX} y={topY} width={nailW} height={nailH + 8} fill="#FFFFFF" opacity="0.06" />
        )}
        {nail.finish === 'chrome' && (
          <rect x={leftX} y={topY} width={nailW} height={nailH + 8} fill={`url(#chrome-${uid})`} />
        )}
        {nail.finish === 'glitter' && (
          <g fill="#FFFFFF" opacity="0.85">
            <circle cx={cx - 6} cy={topY + nailH * 0.28} r="1.2" />
            <circle cx={cx + 5} cy={topY + nailH * 0.36} r="1.4" />
            <circle cx={cx - 2} cy={topY + nailH * 0.52} r="1.1" />
            <circle cx={cx + 6} cy={topY + nailH * 0.64} r="1.3" />
          </g>
        )}
      </g>

      <path d={pathD} fill="none" stroke="rgba(36, 19, 27, 0.14)" strokeWidth="1.2" />
    </svg>
  );
}
