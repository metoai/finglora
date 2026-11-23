'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Hand,
  ImagePlus,
  RotateCcw,
  Sliders,
  Check,
  X,
} from 'lucide-react';
import { ExploreDesignSet, NailShape, Finger } from '@/types/nail';
import { BrandLogo } from '@/components/common/BrandLogo';

interface TryOnPair {
  id: string;
  title: string;
  category: string;
  shape: string;
  finish: string;
  // Natural bare hand baseline
  beforeUrl: string;
  // Real manicured hand try-on result
  afterUrl: string;
  accentColor: string;
}

const FEATURED_PAIRS: TryOnPair[] = [
  {
    id: 'glazed-pearl',
    title: 'Glazed Pearl Chrome',
    category: 'Hailey Chrome',
    shape: 'Almond',
    finish: 'Mirror Glaze',
    beforeUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_vanilla_squoval_05.jpg',
    afterUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_pearl_almond_01.jpg',
    accentColor: '#E0246A',
  },
  {
    id: 'blush-french',
    title: 'Blush Micro French',
    category: 'French Atelier',
    shape: 'Almond',
    finish: 'Glossy Sheer',
    beforeUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_vanilla_squoval_05.jpg',
    afterUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/french/french_micro_almond_01.jpg',
    accentColor: '#E0246A',
  },
  {
    id: 'rose-aura',
    title: 'Rose Gold Velvet',
    category: 'Aura Velvet',
    shape: 'Oval',
    finish: 'Cat-Eye Shimmer',
    beforeUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_vanilla_squoval_05.jpg',
    afterUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_rosegold_square_04.jpg',
    accentColor: '#C59B27',
  },
  {
    id: 'coquette-ribbon',
    title: 'Dusty Rose Ribbon',
    category: 'Coquette 3D',
    shape: 'Coffin',
    finish: 'High-Gloss',
    beforeUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_vanilla_squoval_05.jpg',
    afterUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/coquette/coquette_pearl_bow_01.jpg',
    accentColor: '#801A35',
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
  const [selectedPairIndex, setSelectedPairIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(55); // 0 to 100 percentage
  const [isLiveComparing, setIsLiveComparing] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const activePair = FEATURED_PAIRS[selectedPairIndex];

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

  return (
    <main className="min-h-screen bg-[#FCFAF8] text-[#181216] flex flex-col justify-between overflow-x-hidden relative selection:bg-[#E0246A]/20 font-sans">
      {/* Subtle luxury ambient pink gradient aura */}
      <div className="absolute top-0 inset-x-0 h-[480px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(224,36,106,0.12),transparent_70%)] pointer-events-none" />

      {/* =====================================================================
          1. TOP NAVIGATION BAR (Clean, Editorial, Sign In Action)
          ===================================================================== */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6 pb-2 flex items-center justify-between z-20">
        <BrandLogo size="md" />

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setHowItWorksOpen(true)}
            className="hidden sm:inline-flex text-xs font-semibold text-stone-600 hover:text-stone-900 px-3 py-1.5 transition cursor-pointer"
          >
            How it works
          </button>

          {onSignInClick && (
            <button
              type="button"
              onClick={onSignInClick}
              className="h-8.5 sm:h-9 px-4 sm:px-5 rounded-full bg-white hover:bg-stone-50 border border-stone-200/90 text-xs sm:text-sm font-semibold text-stone-800 hover:text-[#E0246A] hover:border-[#E0246A]/40 transition cursor-pointer shadow-2xs active:scale-95"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* =====================================================================
          2. CORE HERO SECTION: ONE SCREEN VIEW, BEFORE & AFTER TRANSFORMATION
          ===================================================================== */}
      <section className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-3 sm:px-6 py-2 sm:py-4 z-10">
        {/* Value Proposition Headline: Instantly Understood by Anyone */}
        <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-3 mb-3.5 sm:mb-5">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-100/90 text-[11px] sm:text-xs font-semibold text-[#E0246A] shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E0246A] animate-pulse" />
            <span>Virtual Hand Try-On Atelier</span>
          </div>

          {/* Punchy, Clear Title */}
          <h1 className="font-serif text-2xl sm:text-4xl lg:text-[44px] font-normal text-stone-900 tracking-tight leading-[1.15]">
            See any nail inspo on your{' '}
            <span className="italic font-serif text-[#E0246A]">actual hand</span>{' '}
            before you book.
          </h1>

          {/* Subtitle */}
          <p className="text-stone-600 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Snap your hand once. Drop any Pinterest, TikTok, or Instagram look. See the manicure tailored to your real skin tone & fingers in seconds.
          </p>
        </div>

        {/* =====================================================================
            INTERACTIVE BEFORE / AFTER TRANSFORMATION CANVAS
            (Shows real hand vs. applied manicure side-by-side with slider or tabs)
            ===================================================================== */}
        <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto space-y-3">
          {/* The Viewport Container */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-3xl overflow-hidden bg-white border border-stone-200/90 shadow-[0_12px_40px_rgba(224,36,106,0.14)] select-none group">
            {/* Layer 1: Manicured Hand (After - Full Base) */}
            <img
              src={activePair.afterUrl}
              alt="Manicured Hand"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />

            {/* Layer 2: Bare Natural Hand (Before - Clipped by Slider) */}
            <div
              className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none border-r-2 border-white shadow-[2px_0_12px_rgba(0,0,0,0.25)]"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={activePair.beforeUrl}
                alt="Bare Natural Hand"
                className="absolute inset-y-0 left-0 max-w-none h-full object-cover"
                style={{ width: '100%', minWidth: '100%' }}
              />

              {/* Bare Hand Floating Pill */}
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-xs font-semibold tracking-wide border border-white/10 shadow-xs flex items-center gap-1">
                  <Hand className="w-3 h-3 text-pink-300" />
                  <span>Bare Hand</span>
                </span>
              </div>
            </div>

            {/* Manicure Look Floating Pill (Right side) */}
            <div className="absolute top-3 right-3 z-10 pointer-events-none">
              <span className="px-2.5 py-1 rounded-full bg-[#E0246A] text-white text-[10px] sm:text-xs font-semibold tracking-wide shadow-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-white" />
                <span>With Manicure</span>
              </span>
            </div>

            {/* Interactive Slider Divider Handle */}
            <div
              className="absolute top-0 bottom-0 z-20 flex items-center justify-center -ml-4 w-8 cursor-ew-resize touch-none"
              style={{ left: `${sliderPosition}%` }}
              onMouseDown={(e) => {
                e.preventDefault();
                setIsLiveComparing(true);
                const container = e.currentTarget.parentElement;
                if (!container) return;
                const rect = container.getBoundingClientRect();

                const onMouseMove = (moveEvent: MouseEvent) => {
                  const x = moveEvent.clientX - rect.left;
                  const percent = Math.min(Math.max((x / rect.width) * 100, 5), 95);
                  setSliderPosition(percent);
                };

                const onMouseUp = () => {
                  setIsLiveComparing(false);
                  window.removeEventListener('mousemove', onMouseMove);
                  window.removeEventListener('mouseup', onMouseUp);
                };

                window.addEventListener('mousemove', onMouseMove);
                window.addEventListener('mouseup', onMouseUp);
              }}
              onTouchMove={(e) => {
                const container = e.currentTarget.parentElement;
                if (!container) return;
                const rect = container.getBoundingClientRect();
                const touch = e.touches[0];
                if (!touch) return;
                const x = touch.clientX - rect.left;
                const percent = Math.min(Math.max((x / rect.width) * 100, 5), 95);
                setSliderPosition(percent);
              }}
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.35)] border-2 border-[#E0246A] flex items-center justify-center text-[#E0246A] transition-transform group-hover:scale-110 active:scale-95">
                <Sliders className="w-3.5 h-3.5 rotate-90" />
              </div>
            </div>

            {/* Bottom Inspo Spec Pill */}
            <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
              <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-stone-900 text-[10px] sm:text-xs font-semibold border border-stone-200/90 shadow-xs">
                {activePair.title} · {activePair.shape}
              </span>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white text-[9px] font-medium tracking-wide">
                Drag slider to compare
              </span>
            </div>
          </div>

          {/* 4 Manicure Style Selector Chips (1-tap to switch look) */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto py-1 scrollbar-none">
            {FEATURED_PAIRS.map((pair, idx) => {
              const isSelected = idx === selectedPairIndex;
              return (
                <button
                  key={pair.id}
                  type="button"
                  onClick={() => {
                    setSelectedPairIndex(idx);
                    setSliderPosition(55);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap active:scale-95 flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200/90'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: pair.accentColor }}
                  />
                  <span>{pair.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =====================================================================
            3-STEP VALUE PROPOSITION (Clear, 3 Visual Icons)
            ===================================================================== */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto w-full pt-3 sm:pt-4 text-center">
          <div className="p-2 sm:p-2.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex flex-col items-center">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-pink-50 text-[#E0246A] flex items-center justify-center mb-1">
              <Hand className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-stone-900">
              1. Snap Hand
            </span>
            <span className="text-[9px] sm:text-[10px] text-stone-500 mt-0.5">
              1-time phone photo
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex flex-col items-center">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-pink-50 text-[#E0246A] flex items-center justify-center mb-1">
              <ImagePlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-stone-900">
              2. Drop Inspo
            </span>
            <span className="text-[9px] sm:text-[10px] text-stone-500 mt-0.5">
              Any Pinterest/IG look
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex flex-col items-center">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#E0246A] text-white flex items-center justify-center mb-1 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-stone-900">
              3. Instant Try-On
            </span>
            <span className="text-[9px] sm:text-[10px] text-stone-500 mt-0.5">
              Live on your fingers
            </span>
          </div>
        </div>

        {/* =====================================================================
            PRIMARY CALL TO ACTION: INSTANT FREE TRY-ON
            ===================================================================== */}
        <div className="pt-4 sm:pt-5 w-full max-w-sm mx-auto text-center space-y-2">
          <button
            type="button"
            onClick={onSignUpClick || handleLaunchTryOn}
            className="w-full h-12 sm:h-13 rounded-full bg-[#E0246A] hover:bg-[#CE1B5D] text-white text-sm sm:text-base font-semibold shadow-[0_6px_22px_rgba(224,36,106,0.38)] hover:shadow-[0_8px_30px_rgba(224,36,106,0.5)] flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <span>Try On My Hand Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-stone-500 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>1 free instant try-on · No credit card required</span>
          </p>
        </div>
      </section>

      {/* =====================================================================
          FOOTER: REFINED EDITORIAL SUBTLETY
          ===================================================================== */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between text-[11px] text-stone-400 z-10 border-t border-stone-200/60">
        <span>© {new Date().getFullYear()} Finglora Atelier. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setHowItWorksOpen(true)}
            className="hover:text-stone-700 transition cursor-pointer"
          >
            How it works
          </button>
          <span>Zero salon regrets.</span>
        </div>
      </footer>

      {/* =====================================================================
          MODAL: HOW IT WORKS (CLEAN LUXURY EDITORIAL)
          ===================================================================== */}
      {howItWorksOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setHowItWorksOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200/90 space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#E0246A] font-semibold block">
                  HOW FINGLORA WORKS
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-normal text-stone-900 tracking-tight mt-1">
                  Virtual Manicure Try-On
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setHowItWorksOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer transition shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-stone-100 text-left">
              <div className="py-3 first:pt-0 flex items-start gap-3.5">
                <span className="font-mono text-xs font-semibold text-[#E0246A] tracking-wider pt-0.5 shrink-0">
                  01
                </span>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-stone-900">
                    Snap Your Hand Once
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Take a clear photo with your phone or webcam. Finglora learns your unique skin tone and cuticle lines.
                  </p>
                </div>
              </div>

              <div className="py-3 flex items-start gap-3.5">
                <span className="font-mono text-xs font-semibold text-[#E0246A] tracking-wider pt-0.5 shrink-0">
                  02
                </span>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-stone-900">
                    Pick or Upload Inspo
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Choose from trending aesthetics or drop any Pinterest, Instagram, or TikTok screenshot.
                  </p>
                </div>
              </div>

              <div className="py-3 last:pb-0 flex items-start gap-3.5">
                <span className="font-mono text-xs font-semibold text-[#E0246A] tracking-wider pt-0.5 shrink-0">
                  03
                </span>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-stone-900">
                    See It Fitted Live
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Instantly preview the realistic manicure on your actual hand. Customize shape or colors, then bring the exact formula to your technician.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setHowItWorksOpen(false);
                handleLaunchTryOn();
              }}
              className="w-full h-11 sm:h-12 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#E0246A]/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
            >
              <span>Try On My Hand Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
