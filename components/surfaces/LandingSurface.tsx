'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Camera,
  Check,
} from 'lucide-react';
import { ExploreDesignSet, Finger } from '@/types/nail';
import { BrandLogo } from '@/components/common/BrandLogo';

interface TryOnPair {
  id: string;
  title: string;
  category: string;
  shape: string;
  finish: string;
  beforeUrl: string;
  afterUrl: string;
  inspoThumbUrl: string;
  accentColor: string;
}

// Real bare hand capture and matched try-on outputs on the identical hand
const BARE_HAND_URL = '/assets/bare_hand.webp';

const FEATURED_PAIRS: TryOnPair[] = [
  {
    id: 'glazed-pearl',
    title: 'Glazed Pearl Chrome',
    category: 'Hailey Chrome',
    shape: 'Almond',
    finish: 'Mirror Glaze',
    beforeUrl: BARE_HAND_URL,
    afterUrl: '/assets/tryon_glazed_pearl.webp',
    inspoThumbUrl: '/assets/designs/glazed_pearl_almond_01.webp',
    accentColor: '#E0246A',
  },
  {
    id: 'blush-french',
    title: 'Blush Micro French',
    category: 'French Studio',
    shape: 'Almond',
    finish: 'Glossy Sheer',
    beforeUrl: BARE_HAND_URL,
    afterUrl: '/assets/tryon_french_micro.webp',
    inspoThumbUrl: '/assets/designs/french_micro_almond_01.webp',
    accentColor: '#E0246A',
  },
  {
    id: 'rose-aura',
    title: 'Rose Gold Velvet',
    category: 'Aura Velvet',
    shape: 'Oval',
    finish: 'Cat-Eye Shimmer',
    beforeUrl: BARE_HAND_URL,
    afterUrl: '/assets/tryon_rose_velvet.webp',
    inspoThumbUrl: '/assets/designs/glazed_rosegold_square_04.webp',
    accentColor: '#C59B27',
  },
  {
    id: 'coquette-ribbon',
    title: 'Dusty Rose Ribbon',
    category: 'Coquette 3D',
    shape: 'Coffin',
    finish: 'High-Gloss',
    beforeUrl: BARE_HAND_URL,
    afterUrl: '/assets/tryon_dusty_ribbon.webp',
    inspoThumbUrl: '/assets/designs/coquette_pearl_bow_01.webp',
    accentColor: '#801A35',
  },
];

const STEPS = [
  { id: 0, label: '1. Pick Inspo' },
  { id: 1, label: '2. Snap Hand' },
  { id: 2, label: '3. Preview' },
];

export function LandingSurface({
  onSignInClick,
  onSignUpClick,
  onStudioClick,
  onTryOnClick,
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
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPairIndex, setSelectedPairIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activePair = FEATURED_PAIRS[selectedPairIndex];

  // Gently cycle through the 3 steps unless the user is interacting
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused]);

  // Preload all try-on assets immediately into browser cache for instant zero-lag switching
  useEffect(() => {
    const urlsToPreload = [
      BARE_HAND_URL,
      ...FEATURED_PAIRS.map((p) => p.afterUrl),
      ...FEATURED_PAIRS.map((p) => p.inspoThumbUrl),
    ];
    urlsToPreload.forEach((url) => {
      const img = new window.Image();
      img.src = url;
    });
  }, []);

  const handleLaunchTryOn = () => {
    if (onTryOnClick) onTryOnClick();
    else if (onStudioClick) onStudioClick();
    else if (onOnboardingClick) onOnboardingClick();
    else if (onSignUpClick) onSignUpClick();
  };

  return (
    <main className="min-h-screen bg-[#FCFAF8] text-[#181216] flex flex-col justify-between overflow-x-hidden relative selection:bg-[#E0246A]/20 font-sans">
      {/* Subtle ambient aura */}
      <div className="absolute top-0 inset-x-0 h-[420px] bg-[radial-gradient(ellipse_75%_55%_at_50%_-20%,rgba(224,36,106,0.10),transparent_70%)] pointer-events-none" />

      {/* Split Hero Section */}
      <section className="flex-1 flex items-center w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-3 sm:pb-5 lg:pb-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-5 lg:gap-10 items-center w-full">
          {/* 1. Logo + Headline (Mobile: 1st, Desktop: Top-Left) */}
          <div className="order-1 lg:col-span-5 text-center lg:text-left space-y-2 sm:space-y-3">
            <div className="flex justify-center lg:justify-start">
              <BrandLogo size="sm" />
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-[42px] font-normal text-stone-900 tracking-tight leading-[1.15] sm:leading-[1.12]">
              See any nail inspo on your{' '}
              <span className="italic font-normal text-[#E0246A]">actual hand</span> before you book.
            </h1>
          </div>

          {/* 2. Interactive 3-Step Visual Progress Card (Mobile: 2nd, Desktop: Right Column row-span-2) */}
          <div
            className="order-2 lg:col-span-7 lg:col-start-6 lg:row-span-2 w-full max-w-sm sm:max-w-md lg:max-w-none mx-auto space-y-2 sm:space-y-3"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Step Progress Tabs - Connected Flow Stepper */}
            <div className="bg-white p-1 sm:p-1.5 rounded-2xl border border-stone-200/80 shadow-2xs">
              <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
                {STEPS.map((step, idx) => {
                  const isActive = activeStep === step.id;
                  const isCompleted = activeStep > step.id;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => {
                        setActiveStep(step.id);
                        setIsPaused(true);
                      }}
                      className={`relative flex items-center justify-center py-1.5 sm:py-2 px-1 rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-stone-900 text-white shadow-xs'
                          : isCompleted
                          ? 'bg-pink-50 text-[#E0246A]'
                          : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
                      }`}
                    >
                      <span className="truncate">{step.label}</span>
                      {idx < STEPS.length - 1 && (
                        <span className="hidden sm:inline-block ml-1 text-[10px] opacity-40">→</span>
                      )}
                      {/* Active timer progress line */}
                      {isActive && !isPaused && (
                        <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-stone-700/60 rounded-full overflow-hidden">
                          <span className="block h-full bg-[#E0246A] animate-step-progress rounded-full" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual Stage */}
            <div className="relative w-full aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-stone-200/80 shadow-[0_12px_40px_rgba(24,18,22,0.08)]">
              {/* STEP 1: Choose Inspo Grid */}
              {activeStep === 0 && (
                <div className="absolute inset-0 p-2.5 sm:p-3 bg-[#FAF7F5] flex flex-col justify-between animate-in fade-in duration-300">
                  <div className="grid grid-cols-2 gap-2 sm:gap-2.5 flex-1 min-h-0">
                    {FEATURED_PAIRS.map((pair, idx) => {
                      const isSelected = idx === selectedPairIndex;
                      return (
                        <button
                          key={pair.id}
                          type="button"
                          onClick={() => {
                            setSelectedPairIndex(idx);
                            setActiveStep(1);
                            setIsPaused(true);
                          }}
                          className={`relative rounded-xl sm:rounded-2xl overflow-hidden group cursor-pointer border-2 transition-all text-left ${
                            isSelected
                              ? 'border-[#E0246A] shadow-md ring-2 ring-[#E0246A]/20'
                              : 'border-transparent hover:border-stone-300'
                          }`}
                        >
                          <img
                            src={pair.inspoThumbUrl || pair.afterUrl}
                            alt={pair.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

                          {isSelected ? (
                            <span className="absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#E0246A] text-white flex items-center justify-center shadow-sm">
                              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </span>
                          ) : (
                            <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-xs text-[9px] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              Try
                            </span>
                          )}

                          <div className="absolute bottom-1.5 sm:bottom-2 left-2 right-2 sm:left-2.5 sm:right-2.5">
                            <p className="text-white text-[11px] sm:text-xs font-semibold truncate drop-shadow-xs">
                              {pair.title}
                            </p>
                            <p className="text-white/80 text-[9px] sm:text-[10px]">{pair.shape}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Micro Hint to guide user action */}
                  <div className="mt-1 pt-0.5 text-center">
                    <p className="text-[10px] sm:text-[11px] font-medium text-stone-500">
                      Tap any style to preview on hand →
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2: Upload or Capture Your Hand */}
              {activeStep === 1 && (
                <div
                  onClick={handleLaunchTryOn}
                  className="absolute inset-0 animate-in fade-in duration-300 cursor-pointer group/camera"
                  title="Click to snap or upload your hand"
                >
                  <img
                    src={activePair.beforeUrl}
                    alt="Bare hand capture"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/camera:scale-102"
                  />
                  <div className="absolute inset-0 bg-black/15 group-hover/camera:bg-black/10 transition-colors" />

                  {/* Floating Status Pill */}
                  <div
                    className="absolute bottom-4 inset-x-4 flex items-center justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-3.5 py-2 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5 whitespace-nowrap">
                      <Camera className="w-3.5 h-3.5 text-pink-300 shrink-0" />
                      <span>Your bare hand</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="px-3.5 py-2 rounded-full bg-white text-stone-900 hover:bg-stone-100 text-xs font-semibold flex items-center gap-1 shadow-md cursor-pointer transition whitespace-nowrap active:scale-95"
                    >
                      <span>Preview</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: See Nail Design on Your Hand */}
              {activeStep === 2 && (
                <div className="absolute inset-0 animate-in fade-in duration-300">
                  <img
                    src={activePair.afterUrl}
                    alt={`${activePair.title} applied on hand`}
                    className="w-full h-full object-cover"
                  />

                  {/* Bottom Applied Inspo Card */}
                  <div className="absolute bottom-3.5 inset-x-3.5 flex items-center justify-between gap-2 bg-white p-2 pr-3.5 rounded-2xl border border-stone-200/80 shadow-lg">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={activePair.inspoThumbUrl || activePair.afterUrl}
                        alt={`${activePair.title} inspo`}
                        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-stone-200 shadow-2xs"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-stone-900 truncate">
                          {activePair.title}
                        </p>
                        <p className="text-[11px] text-stone-600">
                          {activePair.shape} · {activePair.finish}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveStep(0)}
                      className="text-xs font-semibold text-[#E0246A] hover:text-[#BE185D] shrink-0 cursor-pointer"
                    >
                      Try another
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Subheadline & CTA Block (Mobile: 3rd, Desktop: Left Column under Headline) */}
          <div className="order-3 lg:col-span-5 lg:col-start-1 lg:row-start-2 text-center lg:text-left space-y-2.5 sm:space-y-3">
            <p className="text-stone-600 text-xs sm:text-sm lg:text-base max-w-md mx-auto lg:mx-0 leading-relaxed">
              Pick a look, snap your hand once, and see how it fits your real skin tone.
            </p>

            <div className="space-y-2 max-w-sm mx-auto lg:mx-0">
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <button
                  type="button"
                  onClick={handleLaunchTryOn}
                  className="flex-1 h-11 sm:h-12 px-4 sm:px-6 rounded-full bg-[#E0246A] hover:bg-[#CE1B5D] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <span>Try On My Hand Free</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </button>

                {onSignInClick && (
                  <button
                    type="button"
                    onClick={onSignInClick}
                    className="h-11 sm:h-12 px-4 sm:px-5 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-xs sm:text-sm font-semibold text-stone-800 hover:border-stone-300 transition cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap"
                  >
                    Sign In
                  </button>
                )}
              </div>

              <p className="text-[11px] sm:text-xs text-stone-500 text-center lg:text-left">
                1 free instant try-on · No card required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-5 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-400 z-10 border-t border-stone-200/60">
        <span>© {new Date().getFullYear()} Finglora</span>
      </footer>
    </main>
  );
}
