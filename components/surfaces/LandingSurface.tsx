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
  accentColor: string;
}

// TODO: Swap this with an unpolished bare hand photo from your Supabase bucket
const BARE_HAND_URL =
  'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_vanilla_squoval_05.jpg';

const FEATURED_PAIRS: TryOnPair[] = [
  {
    id: 'glazed-pearl',
    title: 'Glazed Pearl Chrome',
    category: 'Hailey Chrome',
    shape: 'Almond',
    finish: 'Mirror Glaze',
    beforeUrl: BARE_HAND_URL,
    afterUrl:
      'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_pearl_almond_01.jpg',
    accentColor: '#E0246A',
  },
  {
    id: 'blush-french',
    title: 'Blush Micro French',
    category: 'French Atelier',
    shape: 'Almond',
    finish: 'Glossy Sheer',
    beforeUrl: BARE_HAND_URL,
    afterUrl:
      'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/french/french_micro_almond_01.jpg',
    accentColor: '#E0246A',
  },
  {
    id: 'rose-aura',
    title: 'Rose Gold Velvet',
    category: 'Aura Velvet',
    shape: 'Oval',
    finish: 'Cat-Eye Shimmer',
    beforeUrl: BARE_HAND_URL,
    afterUrl:
      'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_rosegold_square_04.jpg',
    accentColor: '#C59B27',
  },
  {
    id: 'coquette-ribbon',
    title: 'Dusty Rose Ribbon',
    category: 'Coquette 3D',
    shape: 'Coffin',
    finish: 'High-Gloss',
    beforeUrl: BARE_HAND_URL,
    afterUrl:
      'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/coquette/coquette_pearl_bow_01.jpg',
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

  const handleLaunchTryOn = () => {
    if (onSignUpClick) onSignUpClick();
    else if (onTryOnClick) onTryOnClick();
    else if (onStudioClick) onStudioClick();
    else if (onOnboardingClick) onOnboardingClick();
  };

  return (
    <main className="min-h-screen bg-[#FCFAF8] text-[#181216] flex flex-col justify-between overflow-x-hidden relative selection:bg-[#E0246A]/20 font-sans">
      {/* Subtle ambient aura */}
      <div className="absolute top-0 inset-x-0 h-[420px] bg-[radial-gradient(ellipse_75%_55%_at_50%_-20%,rgba(224,36,106,0.10),transparent_70%)] pointer-events-none" />

      {/* Top Navigation */}
      <header className="w-full max-w-6xl mx-auto px-5 sm:px-8 pt-5 pb-3 flex items-center justify-between z-20">
        <BrandLogo size="md" />

        <div className="flex items-center gap-3">
          {onSignInClick && (
            <button
              type="button"
              onClick={onSignInClick}
              className="h-9 px-5 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-xs sm:text-sm font-semibold text-stone-800 hover:border-stone-300 transition cursor-pointer shadow-2xs active:scale-95"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Split Hero Section */}
      <section className="flex-1 flex items-center w-full max-w-6xl mx-auto px-5 sm:px-8 py-6 lg:py-10 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center w-full">
          {/* Left Column: Headline + Primary CTA */}
          <div className="lg:col-span-5 text-center lg:text-left space-y-5">
            <h1 className="font-serif text-3xl sm:text-5xl font-normal text-stone-900 tracking-tight leading-[1.12]">
              See any nail inspo on your{' '}
              <span className="italic text-[#E0246A]">actual hand</span> before you book.
            </h1>

            <p className="text-stone-600 text-sm sm:text-base max-w-md mx-auto lg:mx-0 leading-relaxed">
              Pick a look, snap your hand once, and see how it fits your real skin tone.
            </p>

            <div className="pt-2 space-y-3 max-w-xs mx-auto lg:mx-0">
              <button
                type="button"
                onClick={handleLaunchTryOn}
                className="w-full h-12 sm:h-13 rounded-full bg-[#E0246A] hover:bg-[#CE1B5D] text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer shadow-xs"
              >
                <span>Try On My Hand Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-xs text-stone-500 text-center lg:text-left">
                1 free instant try-on · No card required
              </p>
            </div>
          </div>

          {/* Right Column: Interactive 3-Step Visual Progress Card */}
          <div
            className="lg:col-span-7 w-full max-w-xl mx-auto lg:max-w-none space-y-3.5"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Step Progress Tabs - Clean Text-Only */}
            <div className="grid grid-cols-3 gap-2 bg-white p-1.5 rounded-2xl border border-stone-200/80 shadow-2xs">
              {STEPS.map((step) => {
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
                    className={`flex items-center justify-center py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-stone-900 text-white shadow-xs'
                        : isCompleted
                        ? 'bg-pink-50/70 text-[#E0246A]'
                        : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
                    }`}
                  >
                    <span className="truncate">{step.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Visual Stage */}
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-white border border-stone-200/80 shadow-[0_16px_48px_rgba(24,18,22,0.08)]">
              {/* STEP 1: Choose Inspo Grid */}
              {activeStep === 0 && (
                <div className="absolute inset-0 p-3 sm:p-4 bg-[#FAF7F5] flex flex-col justify-between animate-in fade-in duration-300">
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3 flex-1 min-h-0">
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
                          className={`relative rounded-2xl overflow-hidden group cursor-pointer border-2 transition-all text-left ${
                            isSelected
                              ? 'border-[#E0246A] shadow-md'
                              : 'border-transparent hover:border-stone-300'
                          }`}
                        >
                          <img
                            src={pair.afterUrl}
                            alt={pair.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                          {isSelected && (
                            <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#E0246A] text-white flex items-center justify-center shadow-sm">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          )}

                          <div className="absolute bottom-2 left-2.5 right-2.5">
                            <p className="text-white text-xs font-semibold truncate">
                              {pair.title}
                            </p>
                            <p className="text-white/75 text-[10px]">{pair.shape}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: Upload or Capture Your Hand */}
              {activeStep === 1 && (
                <div className="absolute inset-0 animate-in fade-in duration-300">
                  <img
                    src={activePair.beforeUrl}
                    alt="Bare hand capture"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/15" />

                  {/* Floating Status Pill */}
                  <div className="absolute bottom-4 inset-x-4 flex items-center justify-between gap-2">
                    <div className="px-3.5 py-2 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5 whitespace-nowrap">
                      <Camera className="w-3.5 h-3.5 text-pink-300 shrink-0" />
                      <span>Your bare hand</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="px-3.5 py-2 rounded-full bg-white text-stone-900 hover:bg-stone-100 text-xs font-semibold flex items-center gap-1 shadow-md cursor-pointer transition whitespace-nowrap"
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

                  {/* Top Result Badge */}
                  <div className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-[#E0246A] text-white text-xs font-semibold shadow-sm">
                    <span>Fitted to your hand</span>
                  </div>

                  {/* Bottom Applied Inspo Card */}
                  <div className="absolute bottom-3.5 inset-x-3.5 flex items-center justify-between gap-2 bg-white p-2 pr-3.5 rounded-2xl border border-stone-200/80 shadow-lg">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={activePair.afterUrl}
                        alt={activePair.title}
                        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-stone-200"
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
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-5 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-400 z-10 border-t border-stone-200/60">
        <span>© {new Date().getFullYear()} Finglora</span>
      </footer>
    </main>
  );
}
