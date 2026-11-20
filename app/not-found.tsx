'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Home, Compass, Hand, Paintbrush, ArrowLeft } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';

export default function NotFound() {
  const [cured, setCured] = useState(false);
  const [activeNailIndex, setActiveNailIndex] = useState(2); // Default to middle 404 nail

  const NAILS = [
    {
      id: 0,
      finger: 'Thumb',
      shade: 'Blush Glaze',
      color: '#FDE8EF',
      finish: 'High Gloss',
      width: 'w-8 sm:w-9',
      height: 'h-14 sm:h-16',
      radius: 'rounded-t-2xl',
      tip: null,
    },
    {
      id: 1,
      finger: 'Index',
      shade: 'Bordeaux Lacquer',
      color: '#E0246A',
      finish: 'Gel Clearcoat',
      width: 'w-7 sm:w-8',
      height: 'h-16 sm:h-18',
      radius: 'rounded-t-xl',
      tip: null,
    },
    {
      id: 2,
      finger: 'Middle',
      shade: cured ? 'Cured Lacquer' : 'Shade 404',
      color: cured ? '#E0246A' : 'transparent',
      finish: cured ? 'Cured' : 'Uncured Void',
      width: 'w-7.5 sm:w-8.5',
      height: 'h-18 sm:h-20',
      radius: 'rounded-t-xl',
      is404: true,
      tip: null,
    },
    {
      id: 3,
      finger: 'Ring',
      shade: 'French Arc',
      color: '#FAF2EB',
      finish: 'Classic French',
      width: 'w-7 sm:w-8',
      height: 'h-16 sm:h-18',
      radius: 'rounded-t-xl',
      tip: '#FFFFFF',
    },
    {
      id: 4,
      finger: 'Pinky',
      shade: 'Atelier Linen',
      color: '#F4EFEB',
      finish: 'Satin Shimmer',
      width: 'w-6 sm:w-7',
      height: 'h-13 sm:h-15',
      radius: 'rounded-t-lg',
      tip: null,
    },
  ];

  const currentSelection = NAILS[activeNailIndex];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1F1A1C] font-sans flex flex-col justify-between selection:bg-[#E0246A]/20">
      {/* Top Header */}
      <header className="w-full max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="inline-block">
          <BrandLogo size="sm" />
        </Link>
        <span className="text-[11px] font-mono text-[#8C8085] tracking-wider uppercase">
          Archive Specimen / 404
        </span>
      </header>

      {/* Main Specimen Card */}
      <main className="w-full max-w-md sm:max-w-lg mx-auto px-4 py-8 my-auto">
        <div className="bg-white rounded-3xl border border-[#F0DFE4] shadow-[0_4px_24px_rgba(31,26,28,0.04)] p-6 sm:p-8 space-y-6">
          {/* Card Label Bar */}
          <div className="flex items-center justify-between border-b border-[#F0DFE4] pb-3 text-[10px] font-mono tracking-wider text-[#8C8085] uppercase">
            <span>FORMULA SPECIMEN</span>
            <span className="text-[#E0246A] font-semibold">STATUS / UNCATALOGED</span>
          </div>

          {/* 5-Finger Acrylic Swatch Tray (The Craft Moment) */}
          <div className="space-y-3">
            <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#F0DFE4]/80 flex items-end justify-center gap-2.5 sm:gap-3.5 min-h-[120px] sm:min-h-[136px]">
              {NAILS.map((nail, idx) => {
                const isSelected = activeNailIndex === idx;
                return (
                  <button
                    key={nail.id}
                    type="button"
                    onClick={() => {
                      setActiveNailIndex(idx);
                      if (nail.is404) {
                        setCured((prev) => !prev);
                      }
                    }}
                    className={`relative ${nail.width} ${nail.height} ${nail.radius} transition-all duration-200 cursor-pointer flex flex-col items-center justify-center group focus:outline-none ${
                      isSelected ? 'ring-2 ring-[#E0246A] ring-offset-2 scale-105' : 'hover:-translate-y-1'
                    }`}
                    style={{
                      backgroundColor: nail.color,
                      border: nail.is404 && !cured ? '1.5px dashed #E0246A' : '1px solid rgba(31,26,28,0.08)',
                    }}
                    title={`${nail.finger}: ${nail.shade}`}
                  >
                    {/* French Tip Arc if applicable */}
                    {nail.tip && (
                      <div
                        className={`absolute top-0 inset-x-0 h-3 ${nail.radius} bg-white shadow-2xs`}
                      />
                    )}

                    {/* Specular Shine Highlight */}
                    <div className="absolute inset-y-1 left-1 w-1 bg-white/30 rounded-full pointer-events-none" />

                    {/* 404 Center Inscription */}
                    {nail.is404 && !cured && (
                      <span className="text-[10px] sm:text-xs font-mono font-bold text-[#E0246A] tracking-tighter select-none">
                        404
                      </span>
                    )}

                    {/* Cured Checkmark */}
                    {nail.is404 && cured && (
                      <Paintbrush className="w-3.5 h-3.5 text-white animate-in zoom-in-50 duration-150" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Interactive Swatch Status Indicator */}
            <div className="flex items-center justify-between px-1 text-[11px]">
              <span className="text-[#8C8085]">
                {currentSelection.finger}: <strong className="text-[#1F1A1C] font-semibold">{currentSelection.shade}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveNailIndex(2);
                  setCured((prev) => !prev);
                }}
                className="text-[10px] text-[#E0246A] hover:text-[#BE185D] transition cursor-pointer font-medium"
              >
                {cured ? 'Reset 404 swatch' : 'Tap middle nail to cure'}
              </button>
            </div>
          </div>

          {/* Editorial Headline & Explanation */}
          <div className="space-y-2 text-center pt-1">
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#1F1A1C] tracking-tight leading-snug">
              This shade has not been mixed
            </h1>
            <p className="text-xs text-[#8C8085] leading-relaxed max-w-sm mx-auto">
              {cured
                ? 'The swatch is polished, but this page remains uncataloged in our atelier records.'
                : 'The page or design passport you requested cannot be found in the atelier.'}
            </p>
          </div>

          {/* Action Routes */}
          <div className="space-y-2.5 pt-2">
            {/* Primary Action: Return to Studio */}
            <Link
              href="/"
              className="w-full h-11 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-sm shadow-[#E0246A]/20 active:scale-[0.99]"
            >
              <Home className="w-4 h-4 text-white" />
              <span>Return to Studio</span>
            </Link>

            {/* Secondary Actions Row */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/explore"
                className="h-10 rounded-xl border border-[#F0DFE4] hover:bg-[#FAF7F2] text-[#1F1A1C] text-xs font-medium transition flex items-center justify-center gap-1.5 active:scale-[0.99]"
              >
                <Compass className="w-3.5 h-3.5 text-[#E0246A]" />
                <span>Explore Designs</span>
              </Link>

              <Link
                href="/tryon"
                className="h-10 rounded-xl border border-[#F0DFE4] hover:bg-[#FAF7F2] text-[#1F1A1C] text-xs font-medium transition flex items-center justify-center gap-1.5 active:scale-[0.99]"
              >
                <Hand className="w-3.5 h-3.5 text-[#E0246A]" />
                <span>Photo Try-On</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Quiet Minimal Footer */}
      <footer className="w-full max-w-4xl mx-auto px-6 py-6 text-center text-[11px] text-[#8C8085]">
        <span>Finglora Nail Atelier • Virtual Try-On</span>
      </footer>
    </div>
  );
}
