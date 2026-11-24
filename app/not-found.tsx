'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Home, Compass, ArrowLeft } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';

export default function NotFound() {
  // Tap nail to switch lacquer shade
  const [shadeIndex, setShadeIndex] = useState(0);

  const SHADES = [
    { name: 'Signature Pink', from: '#E0246A', to: '#BE185D', hasTip: true },
    { name: 'Bordeaux Glaze', from: '#801A35', to: '#5C1225', hasTip: false },
    { name: 'Studio Nude', from: '#E8D5C8', to: '#D8C3B4', hasTip: true },
    { name: 'Pearl Chrome', from: '#FAF4EF', to: '#EAD7CD', hasTip: false },
  ];

  const currentShade = SHADES[shadeIndex];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1F1A1C] font-sans flex flex-col justify-between selection:bg-[#E0246A]/20">
      {/* Top Header */}
      <header className="w-full max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="inline-block">
          <BrandLogo size="sm" />
        </Link>
        <Link
          href="/"
          className="text-xs text-[#8C8085] hover:text-[#E0246A] transition inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </header>

      {/* Main Minimal Section */}
      <main className="w-full max-w-md mx-auto px-4 py-8 my-auto text-center space-y-6">
        {/* 1 Sculptural Nail */}
        <div className="flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={() => setShadeIndex((prev) => (prev + 1) % SHADES.length)}
            className="group relative cursor-pointer focus:outline-none transition-transform hover:scale-105 active:scale-95"
            title="Tap to switch polish shade"
          >
            {/* Acrylic Nail Tip */}
            <div
              className="relative w-18 h-32 sm:w-20 sm:h-36 rounded-t-[38px] sm:rounded-t-[42px] rounded-b-md shadow-xl transition-all duration-300 overflow-hidden border border-black/10"
              style={{
                background: `linear-gradient(180deg, ${currentShade.from} 0%, ${currentShade.to} 100%)`,
                boxShadow: `0 12px 28px -4px ${currentShade.from}35`,
              }}
            >
              {/* French Smile-Line Tip */}
              {currentShade.hasTip && (
                <div className="absolute top-0 inset-x-0 h-6 sm:h-7 rounded-t-[38px] sm:rounded-t-[42px] bg-white/95 shadow-2xs pointer-events-none" />
              )}

              {/* Specular Ridge Gloss Highlight */}
              <div className="absolute top-2 left-2.5 bottom-3 w-2 rounded-full bg-gradient-to-b from-white/55 via-white/20 to-transparent pointer-events-none" />

              {/* Cuticle Base Shadow */}
              <div className="absolute bottom-0 inset-x-0 h-3 bg-black/10 rounded-b-md pointer-events-none" />
            </div>
          </button>

          <span className="text-[10px] text-[#8C8085] mt-2 font-mono tracking-wider uppercase">
            {currentShade.name} • tap to switch
          </span>
        </div>

        {/* Big 404 Numerals */}
        <div className="font-serif text-7xl sm:text-8xl md:text-9xl font-normal text-[#1F1A1C] tracking-tight leading-none select-none">
          404
        </div>

        {/* Can't find the page */}
        <div className="space-y-2 max-w-xs sm:max-w-sm mx-auto">
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#1F1A1C] tracking-tight">
            Can&apos;t find the page
          </h1>
          <p className="text-xs sm:text-sm text-[#8C8085] leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2 max-w-xs sm:max-w-sm mx-auto w-full">
          <Link
            href="/"
            className="w-full sm:w-auto flex-1 h-11 px-5 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-sm shadow-[#E0246A]/20 active:scale-95"
          >
            <Home className="w-4 h-4 text-white" />
            <span>Back to Studio</span>
          </Link>

          <Link
            href="/explore"
            className="w-full sm:w-auto flex-1 h-11 px-5 rounded-xl border border-[#F0DFE4] hover:bg-white text-[#1F1A1C] text-xs font-medium transition flex items-center justify-center gap-2 active:scale-95"
          >
            <Compass className="w-4 h-4 text-[#E0246A]" />
            <span>Explore Designs</span>
          </Link>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full max-w-4xl mx-auto px-6 py-6 text-center text-[11px] text-[#8C8085]">
        <span>Finglora</span>
      </footer>
    </div>
  );
}
