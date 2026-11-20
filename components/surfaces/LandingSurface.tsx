'use client';

import React, { useState } from 'react';
import { Camera, X, Check, ArrowRight, SlidersHorizontal, Info, Scan, Palette, CheckCircle2, UploadCloud, ChevronRight, ChevronLeft, Layers } from 'lucide-react';
import { ExploreDesignSet, NailShape, Finger } from '@/types/nail';
import { BrandLogo } from '@/components/common/BrandLogo';
import { NailCanvasPreview } from '@/components/visuals/NailCanvasPreview';

interface ShadeOption {
  id: string;
  name: string;
  hex: string;
  gradient: { base: string; mid: string; tip: string };
  finish?: 'glossy' | 'matte' | 'chrome' | 'glitter';
  pattern?: 'solid' | 'classic-french';
  accentColor?: string;
  hasTip?: boolean;
}

const SHADES: ShadeOption[] = [
  {
    id: 'milk-glaze',
    name: 'Milk Glaze',
    hex: '#FDF6F8',
    gradient: { base: '#FFFFFF', mid: '#FBF0F5', tip: '#F2D3DF' },
    finish: 'chrome',
    pattern: 'solid',
    hasTip: false,
  },
  {
    id: 'petal',
    name: 'Petal',
    hex: '#E892A8',
    gradient: { base: '#FFF0F5', mid: '#F4A7BD', tip: '#E0246A' },
    finish: 'glossy',
    pattern: 'solid',
    hasTip: false,
  },
  {
    id: 'french-rose',
    name: 'French Rose',
    hex: '#DF6A89',
    gradient: { base: '#FDF0F4', mid: '#F2AFC4', tip: '#DF6A89' },
    finish: 'glossy',
    pattern: 'classic-french',
    accentColor: '#FFFFFF',
    hasTip: true,
  },
  {
    id: 'berry-rouge',
    name: 'Berry Rouge',
    hex: '#CF3168',
    gradient: { base: '#F78DB0', mid: '#DF2466', tip: '#A81144' },
    finish: 'glossy',
    pattern: 'solid',
    hasTip: false,
  },
  {
    id: 'deep-wine',
    name: 'Deep Wine',
    hex: '#851838',
    gradient: { base: '#A3294C', mid: '#73142F', tip: '#420818' },
    finish: 'glossy',
    pattern: 'solid',
    hasTip: false,
  },
];

const SHAPES: { id: NailShape; name: string; desc: string }[] = [
  {
    id: 'almond',
    name: 'Almond',
    desc: 'Softly tapered lateral walls with an elegant curved apex',
  },
  {
    id: 'coffin',
    name: 'Coffin',
    desc: 'Tapered edges squaring off into a crisp flat free edge',
  },
  {
    id: 'oval',
    name: 'Oval',
    desc: 'Classic rounded contours mirroring the cuticle curvature',
  },
  {
    id: 'square',
    name: 'Square',
    desc: 'Parallel straight side walls with a precise horizontal tip',
  },
  {
    id: 'stiletto',
    name: 'Stiletto',
    desc: 'Dramatic architectural silhouette tapering to a razor point',
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
  const [frenchTipActive, setFrenchTipActive] = useState<boolean | null>(null);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [shapesModalOpen, setShapesModalOpen] = useState(false);
  const [shadesModalOpen, setShadesModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeShade = SHADES[activeShadeIndex];
  const activeShape = SHAPES[activeShapeIndex];
  const isFrenchTip = frenchTipActive !== null ? frenchTipActive : Boolean(activeShade.hasTip);

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

            {/* 3D Glass Nail Silhouette on Real Finger (Pure CSS Micro-Geometry, ZERO SVG) */}
            <div
              onClick={handleToggleShape}
              className="relative w-[180px] h-[310px] xl:w-[200px] xl:h-[340px] flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-[1.03] active:scale-95 group"
              title="Click nail to cycle shape: Almond · Coffin · Oval · Square · Stiletto"
            >
              <NailCanvasPreview
                nail={{
                  finger: 'middle',
                  title: 'Editorial Hero Nail',
                  shape: activeShape.id,
                  length: 'long',
                  finish: activeShade.finish || 'glossy',
                  baseColor: activeShade.hex,
                  accentColor: isFrenchTip ? '#FFFFFF' : activeShade.gradient.tip,
                  pattern: isFrenchTip ? 'classic-french' : 'solid',
                  clientNote: 'Pure CSS Micro-Geometry',
                  status: 'detected',
                }}
                gradient={activeShade.gradient}
                glowColor={activeShade.gradient.tip}
                width={190}
                height={320}
                showFinger={true}
              />
            </div>

            {/* Label Below Viewfinder: Shape · Finish · Shade */}
            <button
              type="button"
              onClick={() => setShapesModalOpen(true)}
              className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-medium text-stone-700 hover:text-[#E0246A] tracking-wide whitespace-nowrap bg-white/95 hover:bg-white border border-stone-200/80 hover:border-[#E0246A]/50 shadow-xs rounded-full transition cursor-pointer flex items-center gap-1.5 active:scale-95 z-20 group"
              title="Click to select nail silhouette"
            >
              <span className="font-semibold text-stone-900 group-hover:text-[#E0246A] transition-colors">{activeShape.name}</span>
              <span className="text-stone-300">·</span>
              <span className="text-stone-500">{isFrenchTip ? 'French Tip' : activeShade.finish === 'chrome' ? 'Glazed' : 'Glossy'}</span>
              <span className="text-stone-300">·</span>
              <span className="text-stone-600">{activeShade.name}</span>
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

          {/* 3D Glass Nail Silhouette on Real Finger (Pure CSS Micro-Geometry, ZERO SVG) */}
          <div
            onClick={handleToggleShape}
            className="relative w-[145px] h-[250px] sm:w-[165px] sm:h-[285px] flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            title="Click to cycle nail shape"
          >
            <NailCanvasPreview
              nail={{
                finger: 'middle',
                title: 'Editorial Hero Nail',
                shape: activeShape.id,
                length: 'long',
                finish: activeShade.finish || 'glossy',
                baseColor: activeShade.hex,
                accentColor: isFrenchTip ? '#FFFFFF' : activeShade.gradient.tip,
                pattern: isFrenchTip ? 'classic-french' : 'solid',
                clientNote: 'Pure CSS Micro-Geometry',
                status: 'detected',
              }}
              gradient={activeShade.gradient}
              glowColor={activeShade.gradient.tip}
              width={150}
              height={260}
              showFinger={true}
            />
          </div>

          {/* Bottom Label: Almond · Finish */}
          <button
            type="button"
            onClick={() => setShapesModalOpen(true)}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 text-xs font-medium text-stone-700 tracking-wide whitespace-nowrap bg-white/95 border border-stone-200/80 shadow-2xs rounded-full active:scale-95 flex items-center gap-1.5"
            title="Choose nail shape"
          >
            <span className="font-semibold text-stone-900">{activeShape.name}</span>
            <span className="text-stone-300">·</span>
            <span className="text-stone-500">{isFrenchTip ? 'French' : activeShade.finish === 'chrome' ? 'Glazed' : 'Glossy'}</span>
          </button>
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

          {/* Center: Interactive Shade Selector Pill with French Tip Toggle */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-stone-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
              {SHADES.map((shade, idx) => {
                const active = idx === activeShadeIndex;
                return (
                  <button
                    key={shade.id}
                    type="button"
                    onClick={() => {
                      setActiveShadeIndex(idx);
                      if (frenchTipActive !== null) {
                        setFrenchTipActive(null);
                      }
                    }}
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

              <div className="w-[1px] h-4 bg-stone-200 mx-0.5" />

              {/* French Tip Quick Toggle */}
              <button
                type="button"
                onClick={() => setFrenchTipActive((prev) => (prev === null ? !activeShade.hasTip : !prev))}
                className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                  isFrenchTip
                    ? 'bg-[#E0246A] text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200/70 text-stone-600'
                }`}
                title="Toggle French smile-line tip"
              >
                French tip
              </button>
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

        {/* Swatch Pill with Shade Name & French Tip Toggle on Mobile */}
        <div className="w-full max-w-sm mx-auto flex items-center justify-between px-3.5 py-2 rounded-full bg-white border border-stone-200/80 shadow-xs">
          <div className="flex items-center gap-2">
            {SHADES.map((shade, idx) => {
              const active = idx === activeShadeIndex;
              return (
                <button
                  key={shade.id}
                  type="button"
                  onClick={() => {
                    setActiveShadeIndex(idx);
                    if (frenchTipActive !== null) {
                      setFrenchTipActive(null);
                    }
                  }}
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFrenchTipActive((prev) => (prev === null ? !activeShade.hasTip : !prev))}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition cursor-pointer ${
                isFrenchTip
                  ? 'bg-[#E0246A] text-white'
                  : 'bg-stone-100 text-stone-600'
              }`}
            >
              French
            </button>
            <span className="font-semibold text-stone-900 text-xs pr-1">
              {activeShade.name}
            </span>
          </div>
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
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-11 flex items-center justify-center shrink-0">
                        <NailCanvasPreview
                          nail={{
                            finger: 'middle',
                            title: shape.name,
                            shape: shape.id,
                            length: 'medium',
                            finish: activeShade.finish || 'glossy',
                            baseColor: activeShade.hex,
                            accentColor: isFrenchTip ? '#FFFFFF' : activeShade.gradient.tip,
                            pattern: isFrenchTip ? 'classic-french' : 'solid',
                            clientNote: '',
                            status: 'detected',
                          }}
                          gradient={activeShade.gradient}
                          glowColor={activeShade.gradient.tip}
                          width={28}
                          height={42}
                          showFinger={true}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-stone-900">{shape.name}</div>
                        <div className="text-[11px] text-stone-500 mt-0.5">{shape.desc}</div>
                      </div>
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
