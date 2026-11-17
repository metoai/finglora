'use client';

import React, { useState } from 'react';
import { Camera, X, Check, ArrowRight, Sparkles, SlidersHorizontal, Info, Scan, Palette, CheckCircle2, UploadCloud, ChevronRight, ChevronLeft, Layers } from 'lucide-react';
import { ExploreDesignSet, NailShape, Finger } from '@/types/nail';
import { BrandLogo } from '@/components/common/BrandLogo';

interface ShadeOption {
  id: string;
  name: string;
  hex: string;
  gradient: { base: string; mid: string; tip: string };
}

const SHADES: ShadeOption[] = [
  {
    id: 'milk-glaze',
    name: 'Milk Glaze',
    hex: '#FCEEF2',
    gradient: { base: '#FFF5F8', mid: '#FDE8EF', tip: '#F7CCD9' },
  },
  {
    id: 'petal',
    name: 'Petal',
    hex: '#E892A8',
    gradient: { base: '#FCEEF2', mid: '#EFA2B7', tip: '#E0246A' },
  },
  {
    id: 'french-rose',
    name: 'French Rose',
    hex: '#DF6A89',
    gradient: { base: '#F7CAD7', mid: '#E886A2', tip: '#D84274' },
  },
  {
    id: 'berry-rouge',
    name: 'Berry Rouge',
    hex: '#CF3168',
    gradient: { base: '#F2A7C3', mid: '#D8286A', tip: '#B5124E' },
  },
  {
    id: 'deep-wine',
    name: 'Deep Wine',
    hex: '#851838',
    gradient: { base: '#B84566', mid: '#851838', tip: '#520C21' },
  },
];

const SHAPES: { id: NailShape; name: string; desc: string; path: string }[] = [
  {
    id: 'almond',
    name: 'Almond',
    desc: 'Softly tapered lateral walls with an elegant curved apex',
    path: 'M 50,260 C 24,260 16,220 16,170 C 16,90 28,16 50,16 C 72,16 84,90 84,170 C 84,220 76,260 50,260 Z',
  },
  {
    id: 'coffin',
    name: 'Coffin',
    desc: 'Tapered edges squaring off into a crisp flat free edge',
    path: 'M 50,260 C 24,260 18,220 20,170 L 32,25 C 33,20 40,20 50,20 C 60,20 67,20 68,25 L 80,170 C 82,220 76,260 50,260 Z',
  },
  {
    id: 'oval',
    name: 'Oval',
    desc: 'Classic rounded contours mirroring the cuticle curvature',
    path: 'M 50,260 C 24,260 16,220 16,170 C 16,100 24,20 50,20 C 76,20 84,100 84,170 C 84,220 76,260 50,260 Z',
  },
  {
    id: 'square',
    name: 'Square',
    desc: 'Parallel straight side walls with a precise horizontal tip',
    path: 'M 50,260 C 24,260 18,220 18,170 L 18,30 C 18,22 24,22 50,22 C 76,22 82,22 82,30 L 82,170 C 82,220 76,260 50,260 Z',
  },
  {
    id: 'stiletto',
    name: 'Stiletto',
    desc: 'Dramatic architectural silhouette tapering to a razor point',
    path: 'M 50,260 C 24,260 16,220 18,170 L 50,10 L 82,170 C 84,220 76,260 50,260 Z',
  },
];

export function LandingSurface({
  exploreDesigns,
  mobilePreview,
  onExploreClick,
  onSignInClick,
  onSignUpClick,
  onStudioClick,
  onTryOnClick,
  onSelectNail,
  onSaveAndCustomize,
  onOnboardingClick,
}: {
  exploreDesigns?: ExploreDesignSet[];
  mobilePreview?: boolean;
  onExploreClick?: () => void;
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
  onStudioClick?: () => void;
  onTryOnClick?: () => void;
  onSelectNail?: (fingerKey: Finger) => void;
  onSaveAndCustomize?: (setId: string) => void;
  onOnboardingClick?: () => void;
}) {
  const [activeShadeIndex, setActiveShadeIndex] = useState(1); // default 'Petal'
  const [activeShapeIndex, setActiveShapeIndex] = useState(0); // default 'Almond'
  const [activeLength] = useState('Medium');
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [shapesModalOpen, setShapesModalOpen] = useState(false);
  const [shadesModalOpen, setShadesModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeShade = SHADES[activeShadeIndex];
  const activeShape = SHAPES[activeShapeIndex];

  const handleLaunchTryOn = () => {
    if (onSignUpClick) {
      onSignUpClick();
    } else if (onTryOnClick) {
      onTryOnClick();
    } else if (onStudioClick) {
      onStudioClick();
    } else if (onOnboardingClick) {
      onOnboardingClick();
    }
  };

  const handleToggleShape = () => {
    setActiveShapeIndex((prev) => (prev + 1) % SHAPES.length);
  };

  return (
    <main className="min-h-screen bg-white text-[#181216] flex flex-col justify-between overflow-x-hidden relative selection:bg-[#E0246A]/20 font-sans">
      {/* Soft Radial Ambient Pink Aura in Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[650px] lg:w-[750px] h-[550px] sm:h-[650px] lg:h-[750px] rounded-full bg-[radial-gradient(circle,rgba(224,36,106,0.11)_0%,rgba(224,36,106,0.03)_50%,transparent_70%)] pointer-events-none -z-0" />

      {/* =====================================================================
          TOP NAVIGATION BAR (DESKTOP & MOBILE)
          ===================================================================== */}
      {/* Desktop Top Bar */}
      <header className="hidden lg:flex w-full max-w-7xl mx-auto px-8 lg:px-12 pt-7 pb-4 items-center justify-between z-20">
        {/* User Brand Logo with Text */}
        <BrandLogo size="md" />

        {/* Right: Sign In Only */}
        <div>
          {onSignInClick && (
            <button
              type="button"
              onClick={onSignInClick}
              className="h-9 px-5 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-sm font-medium text-stone-800 hover:text-[#E0246A] hover:border-[#E0246A]/50 transition cursor-pointer shadow-2xs active:scale-95"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Mobile Top Bar */}
      <header className="lg:hidden w-full px-5 pt-4 pb-2 flex items-center justify-between z-20">
        {/* User Brand Logo with Text */}
        <BrandLogo size="sm" />

        {/* Right: Sign In Only */}
        {onSignInClick && (
          <button
            type="button"
            onClick={onSignInClick}
            className="h-8 px-4 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-800 hover:text-[#E0246A] transition cursor-pointer shadow-2xs active:scale-95"
          >
            Sign In
          </button>
        )}
      </header>

      {/* =====================================================================
          MAIN HERO ARTWORK: "Try" + AR VIEW FINDER WITH 3D NAIL + "on."
          ===================================================================== */}
      {/* Desktop Artwork (Page 1): Centered Row Layout with Giant "Try" and "on." */}
      <div className="hidden lg:flex relative items-center justify-center w-full max-w-7xl mx-auto my-auto py-4 px-6 z-10 select-none">
        {/* Left Headline: "Try" */}
        <div className="flex-1 flex justify-end items-center pr-4 xl:pr-8">
          <span className="font-serif text-[130px] xl:text-[160px] 2xl:text-[185px] font-normal text-[#181216] leading-none tracking-tight select-none pointer-events-none">
            Try
          </span>
        </div>

        {/* Center: Circular AR Viewfinder & 3D Glass Nail */}
        <div className="relative shrink-0">
          {/* Circular Reticle Ring */}
          <div className="w-[360px] h-[360px] xl:w-[420px] xl:h-[420px] rounded-full border border-pink-200/70 relative flex items-center justify-center">
            {/* 4 Crisp Pink Camera Reticle Corners */}
            <span className="absolute top-5 left-5 w-6 h-6 border-t-2 border-l-2 border-[#E0246A] rounded-tl-md pointer-events-none" />
            <span className="absolute top-5 right-5 w-6 h-6 border-t-2 border-r-2 border-[#E0246A] rounded-tr-md pointer-events-none" />
            <span className="absolute bottom-10 left-5 w-6 h-6 border-b-2 border-l-2 border-[#E0246A] rounded-bl-md pointer-events-none" />
            <span className="absolute bottom-10 right-5 w-6 h-6 border-b-2 border-r-2 border-[#E0246A] rounded-br-md pointer-events-none" />

            {/* Top Pill Button: Live preview with Camera icon */}
            <button
              type="button"
              onClick={onSignUpClick || handleLaunchTryOn}
              className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-white hover:bg-stone-50 border border-stone-200/90 hover:border-[#E0246A]/60 shadow-xs hover:shadow-sm text-xs font-medium text-stone-800 hover:text-[#E0246A] flex items-center gap-1.5 whitespace-nowrap z-20 transition-all cursor-pointer group active:scale-95"
              title="Start live nail try-on"
            >
              <Camera className="w-3.5 h-3.5 text-[#E0246A] group-hover:scale-110 transition-transform" />
              <span>Live preview</span>
            </button>

            {/* Modern Periodic AR Laser Beam (Sweeps Down & Up 1 time per 10s) */}
            <div className="absolute inset-4 rounded-full overflow-hidden pointer-events-none z-10">
              <div className="absolute left-4 right-4 animate-scan-periodic">
                <div className="h-8 -mt-4 bg-gradient-to-b from-transparent via-[#E0246A]/25 to-transparent blur-[2px]" />
                <div className="h-[2px] -mt-[17px] bg-gradient-to-r from-transparent via-[#E0246A] to-transparent shadow-[0_0_16px_#E0246A,0_0_6px_#FFFFFF]" />
              </div>
            </div>

            {/* Translucent 3D Glass Nail Silhouette */}
            <div
              onClick={handleToggleShape}
              className="relative w-[150px] h-[270px] xl:w-[170px] xl:h-[300px] flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-[1.03] active:scale-95"
              title="Click to cycle nail shape"
            >
              <svg
                viewBox="0 0 100 270"
                className="w-full h-full filter drop-shadow-[0_12px_24px_rgba(224,36,106,0.18)]"
              >
                <defs>
                  {/* Linear Nail Shade Gradient */}
                  <linearGradient id="landingNailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={activeShade.gradient.tip} />
                    <stop offset="55%" stopColor={activeShade.gradient.mid} />
                    <stop offset="100%" stopColor={activeShade.gradient.base} />
                  </linearGradient>

                  {/* Inner Apex Depth Highlight */}
                  <radialGradient id="apexGlow" cx="50%" cy="40%" r="50%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Base Nail Silhouette Body */}
                <path
                  d={activeShape.path}
                  fill="url(#landingNailGrad)"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="0.75"
                />

                {/* Inner Apex Radial Soft Glow */}
                <path
                  d={activeShape.path}
                  fill="url(#apexGlow)"
                  className="pointer-events-none"
                />

                {/* Elegant Curved Specular Reflection Streak (Left Wall) */}
                <path
                  d="M 34,26 C 24,70 23,120 28,190 C 25,190 20,120 30,26 Z"
                  fill="white"
                  fillOpacity="0.75"
                />

                {/* Secondary Soft Specular Reflection (Apex Ridge) */}
                <path
                  d="M 42,40 C 37,70 37,110 40,150 C 38,150 35,110 39,40 Z"
                  fill="white"
                  fillOpacity="0.35"
                />

                {/* Bottom Cuticle Crescent (Lunula Translucency) */}
                <path
                  d="M 30,235 C 40,220 60,220 70,235 C 60,242 40,242 30,235 Z"
                  fill="white"
                  fillOpacity="0.22"
                />
              </svg>
            </div>

            {/* Label Below Viewfinder: Shape · Length · Shade */}
            <button
              type="button"
              onClick={handleToggleShape}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 text-xs font-medium text-stone-700 tracking-wide whitespace-nowrap bg-white/90 hover:bg-white border border-stone-200/60 shadow-2xs rounded-full transition cursor-pointer"
              title="Click to change nail shape"
            >
              {activeShape.name} · {activeLength} · {activeShade.name}
            </button>
          </div>
        </div>

        {/* Right Headline: "on." in Pink Serif Italic */}
        <div className="flex-1 flex justify-start items-center pl-4 xl:pr-8">
          <span className="font-serif italic text-[130px] xl:text-[160px] 2xl:text-[185px] font-normal text-[#E0246A] leading-none tracking-tight select-none pointer-events-none">
            on.
          </span>
        </div>
      </div>

      {/* Mobile Artwork (Page 2): "Try on." at top in 1 row, then centered AR Viewfinder */}
      <div className="lg:hidden relative w-full flex flex-col items-center justify-center my-auto py-2 px-3 select-none">
        {/* "Try on." at the top in 1 row */}
        <div className="flex items-baseline justify-center gap-2 mb-7 sm:mb-8 pt-1 z-10 pointer-events-none select-none">
          <span className="font-serif text-[48px] sm:text-[58px] font-normal text-[#181216] leading-none tracking-tight">
            Try
          </span>
          <span className="font-serif italic text-[48px] sm:text-[58px] font-normal text-[#E0246A] leading-none tracking-tight">
            on.
          </span>
        </div>

        {/* Reticle Ring */}
        <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-full border border-pink-200/70 flex items-center justify-center">
          {/* 4 Pink Reticle Corners */}
          <span className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-[#E0246A] rounded-tl-sm pointer-events-none" />
          <span className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-[#E0246A] rounded-tr-sm pointer-events-none" />
          <span className="absolute bottom-8 left-4 w-5 h-5 border-b-2 border-l-2 border-[#E0246A] rounded-bl-sm pointer-events-none" />
          <span className="absolute bottom-8 right-4 w-5 h-5 border-b-2 border-r-2 border-[#E0246A] rounded-br-sm pointer-events-none" />

          {/* Top Pill Button: Live preview with Camera icon */}
          <button
            type="button"
            onClick={onSignUpClick || handleLaunchTryOn}
            className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-white hover:bg-stone-50 border border-stone-200/90 hover:border-[#E0246A]/60 shadow-xs hover:shadow-sm text-[11px] font-medium text-stone-800 hover:text-[#E0246A] flex items-center gap-1.5 whitespace-nowrap z-20 transition-all cursor-pointer group active:scale-95"
            title="Start live nail try-on"
          >
            <Camera className="w-3 h-3 text-[#E0246A] group-hover:scale-110 transition-transform" />
            <span>Live preview</span>
          </button>

          {/* Modern Periodic AR Laser Beam (Sweeps Down & Up 1 time per 10s) */}
          <div className="absolute inset-3 rounded-full overflow-hidden pointer-events-none z-10">
            <div className="absolute left-3 right-3 animate-scan-periodic">
              <div className="h-7 -mt-3.5 bg-gradient-to-b from-transparent via-[#E0246A]/25 to-transparent blur-[2px]" />
              <div className="h-[2px] -mt-[15px] bg-gradient-to-r from-transparent via-[#E0246A] to-transparent shadow-[0_0_14px_#E0246A,0_0_6px_#FFFFFF]" />
            </div>
          </div>

          {/* Translucent 3D Glass Nail */}
          <div
            onClick={handleToggleShape}
            className="relative w-[125px] h-[225px] sm:w-[145px] sm:h-[260px] flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
          >
            <svg
              viewBox="0 0 100 270"
              className="w-full h-full filter drop-shadow-[0_8px_20px_rgba(224,36,106,0.18)]"
            >
              <defs>
                <linearGradient id="mobileNailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={activeShade.gradient.tip} />
                  <stop offset="55%" stopColor={activeShade.gradient.mid} />
                  <stop offset="100%" stopColor={activeShade.gradient.base} />
                </linearGradient>
              </defs>
              <path
                d={activeShape.path}
                fill="url(#mobileNailGrad)"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="0.75"
              />
              {/* Left Sheen Streak */}
              <path
                d="M 34,26 C 24,70 23,120 28,190 C 25,190 20,120 30,26 Z"
                fill="white"
                fillOpacity="0.75"
              />
              {/* Lunula */}
              <path
                d="M 30,235 C 40,220 60,220 70,235 C 60,242 40,242 30,235 Z"
                fill="white"
                fillOpacity="0.22"
              />
            </svg>
          </div>

          {/* Bottom Label: Almond · Medium */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-xs font-medium text-stone-700 tracking-wide whitespace-nowrap bg-white/90 border border-stone-200/60 shadow-2xs rounded-full">
            {activeShape.name} · {activeLength}
          </div>
        </div>
      </div>

      {/* =====================================================================
          BOTTOM CONTENT & CONTROLS (DESKTOP & MOBILE)
          ===================================================================== */}
      {/* Desktop Bottom Section (Page 1) */}
      <footer className="hidden lg:block w-full max-w-7xl mx-auto px-8 lg:px-12 pb-8 pt-2 z-20">
        <div className="grid grid-cols-3 items-center gap-6">
          {/* Left: Explanatory Copy */}
          <div className="text-left">
            <p className="text-stone-600 text-sm leading-relaxed max-w-[320px]">
              Customize each finger, design with AI, and try on real polish colors and shapes on your own hand live.
            </p>
          </div>

          {/* Center: Interactive Shade Selector Pill */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-stone-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
              {SHADES.map((shade, idx) => {
                const active = idx === activeShadeIndex;
                return (
                  <button
                    key={shade.id}
                    type="button"
                    onClick={() => setActiveShadeIndex(idx)}
                    className={`w-7 h-7 rounded-full transition-all duration-200 cursor-pointer ${
                      active
                        ? 'ring-2 ring-offset-2 ring-[#E0246A] scale-110 shadow-xs'
                        : 'hover:scale-105 opacity-85 hover:opacity-100 border border-black/10'
                    }`}
                    style={{ backgroundColor: shade.hex }}
                    title={shade.name}
                  />
                );
              })}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-6">
            <button
              type="button"
              onClick={() => setHowItWorksOpen(true)}
              className="text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors cursor-pointer"
            >
              How it works
            </button>
            <button
              type="button"
              onClick={onSignUpClick || handleLaunchTryOn}
              className="h-11 px-6 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white text-sm font-semibold shadow-md shadow-[#E0246A]/20 flex items-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Try it on</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Section (Page 2) */}
      <footer className="lg:hidden w-full px-5 pb-8 pt-2 space-y-3.5 z-20">
        {/* Copy */}
        <p className="text-stone-700 text-xs sm:text-sm leading-relaxed text-center max-w-xs mx-auto">
          Customize each finger, design with AI, and try on real polish colors and shapes on your own hand live.
        </p>

        {/* Swatch Pill with Shade Name on Mobile */}
        <div className="w-full max-w-sm mx-auto flex items-center justify-between px-3.5 py-2 rounded-full bg-white border border-stone-200/80 shadow-xs">
          <div className="flex items-center gap-2.5">
            {SHADES.map((shade, idx) => {
              const active = idx === activeShadeIndex;
              return (
                <button
                  key={shade.id}
                  type="button"
                  onClick={() => setActiveShadeIndex(idx)}
                  className={`w-6 h-6 rounded-full transition-all duration-200 cursor-pointer ${
                    active
                      ? 'ring-2 ring-offset-2 ring-[#E0246A] scale-110 shadow-xs'
                      : 'opacity-80 hover:opacity-100 border border-black/10'
                  }`}
                  style={{ backgroundColor: shade.hex }}
                  title={shade.name}
                />
              );
            })}
          </div>
          <span className="font-semibold text-stone-900 text-xs pr-1">
            {activeShade.name}
          </span>
        </div>

        {/* Primary Full-Width CTA Button */}
        <button
          type="button"
          onClick={onSignUpClick || handleLaunchTryOn}
          className="w-full max-w-sm mx-auto h-12 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white text-sm font-semibold shadow-md shadow-[#E0246A]/25 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>Try it on</span>
        </button>

        {/* How It Works Link */}
        <div className="text-center pt-0.5">
          <button
            type="button"
            onClick={() => setHowItWorksOpen(true)}
            className="text-xs font-semibold text-stone-900 hover:text-[#E0246A] transition-colors cursor-pointer"
          >
            How it works
          </button>
        </div>
      </footer>

      {/* =====================================================================
          MODAL: HOW IT WORKS
          ===================================================================== */}
      {/* =====================================================================
          MODAL: HOW IT WORKS (MINIMAL EDITORIAL)
          ===================================================================== */}
      {howItWorksOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm sm:max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200/90 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#E0246A] font-semibold block">
                  HOW IT WORKS
                </span>
                <h3 className="font-serif text-2xl font-normal text-stone-900 tracking-tight mt-1">
                  Virtual Nail Try-On
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setHowItWorksOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer transition shrink-0"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3 Minimal Editorial Steps */}
            <div className="divide-y divide-stone-100 text-left">
              <div className="py-3 first:pt-0 flex items-start gap-3.5">
                <span className="font-mono text-xs font-semibold text-[#E0246A] tracking-wider pt-0.5 shrink-0">
                  01
                </span>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-stone-900">
                    Inspiration & AI
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Upload any photo from Instagram or Pinterest, or describe your aesthetic with AI.
                  </p>
                </div>
              </div>

              <div className="py-3 flex items-start gap-3.5">
                <span className="font-mono text-xs font-semibold text-[#E0246A] tracking-wider pt-0.5 shrink-0">
                  02
                </span>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-stone-900">
                    5-Finger Customizer
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Customize each finger individually — change shape, length, polish colors, and finishes.
                  </p>
                </div>
              </div>

              <div className="py-3 last:pb-0 flex items-start gap-3.5">
                <span className="font-mono text-xs font-semibold text-[#E0246A] tracking-wider pt-0.5 shrink-0">
                  03
                </span>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-stone-900">
                    Live Hand Try-On
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Point your camera or upload a hand photo to see real colors live on your own nails.
                  </p>
                </div>
              </div>
            </div>

            {/* Clean Pill CTA */}
            <button
              type="button"
              onClick={() => {
                setHowItWorksOpen(false);
                handleLaunchTryOn();
              }}
              className="w-full h-11 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#E0246A]/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Try it on</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: SHAPES SELECTOR
          ===================================================================== */}
      {shapesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-semibold block">
                  SILHOUETTES
                </span>
                <h3 className="font-serif text-lg font-normal text-stone-900">Choose Shape</h3>
              </div>
              <button
                type="button"
                onClick={() => setShapesModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {SHAPES.map((shape, idx) => {
                const active = idx === activeShapeIndex;
                return (
                  <button
                    key={shape.id}
                    type="button"
                    onClick={() => {
                      setActiveShapeIndex(idx);
                      setShapesModalOpen(false);
                    }}
                    className={`w-full p-3 rounded-2xl text-left border transition flex items-center justify-between cursor-pointer ${
                      active
                        ? 'bg-[#FDF2F8] border-[#E0246A] text-stone-900 shadow-xs'
                        : 'bg-white border-stone-200/80 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold">{shape.name}</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">{shape.desc}</div>
                    </div>
                    {active && <Check className="w-4 h-4 text-[#E0246A]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: SHADES SELECTOR
          ===================================================================== */}
      {shadesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-semibold block">
                  LACQUER SHADES
                </span>
                <h3 className="font-serif text-lg font-normal text-stone-900">Select Polish</h3>
              </div>
              <button
                type="button"
                onClick={() => setShadesModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {SHADES.map((shade, idx) => {
                const active = idx === activeShadeIndex;
                return (
                  <button
                    key={shade.id}
                    type="button"
                    onClick={() => {
                      setActiveShadeIndex(idx);
                      setShadesModalOpen(false);
                    }}
                    className={`w-full p-3 rounded-2xl text-left border transition flex items-center justify-between cursor-pointer ${
                      active
                        ? 'bg-[#FDF2F8] border-[#E0246A] shadow-xs'
                        : 'bg-white border-stone-200/80 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-6 h-6 rounded-full border border-black/10 shadow-xs shrink-0"
                        style={{ backgroundColor: shade.hex }}
                      />
                      <span className="text-xs font-semibold text-stone-900">{shade.name}</span>
                    </div>
                    {active && <Check className="w-4 h-4 text-[#E0246A]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
