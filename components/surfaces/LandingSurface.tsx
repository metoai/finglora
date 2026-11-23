'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, Sliders, X } from 'lucide-react';
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

const FEATURED_PAIRS: TryOnPair[] = [
  {
    id: 'glazed-pearl',
    title: 'Glazed Pearl Chrome',
    category: 'Hailey Chrome',
    shape: 'Almond',
    finish: 'Mirror Glaze',
    beforeUrl:
      'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_vanilla_squoval_05.jpg',
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
    beforeUrl:
      'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_vanilla_squoval_05.jpg',
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
    beforeUrl:
      'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_vanilla_squoval_05.jpg',
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
    beforeUrl:
      'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_vanilla_squoval_05.jpg',
    afterUrl:
      'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/coquette/coquette_pearl_bow_01.jpg',
    accentColor: '#801A35',
  },
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
  const [selectedPairIndex, setSelectedPairIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const activePair = FEATURED_PAIRS[selectedPairIndex];

  const handleLaunchTryOn = () => {
    if (onSignUpClick) onSignUpClick();
    else if (onTryOnClick) onTryOnClick();
    else if (onStudioClick) onStudioClick();
    else if (onOnboardingClick) onOnboardingClick();
  };

  const updateSliderFromClientX = (clientX: number, container: HTMLElement | null) => {
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const percent = Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 5), 95);
    setSliderPosition(percent);
  };

  return (
    <main className="min-h-screen bg-[#FCFAF8] text-[#181216] flex flex-col justify-between overflow-x-hidden relative selection:bg-[#E0246A]/20 font-sans">
      {/* Subtle ambient aura */}
      <div className="absolute top-0 inset-x-0 h-[420px] bg-[radial-gradient(ellipse_75%_55%_at_50%_-20%,rgba(224,36,106,0.10),transparent_70%)] pointer-events-none" />

      {/* Top Navigation */}
      <header className="w-full max-w-6xl mx-auto px-5 sm:px-8 pt-5 pb-3 flex items-center justify-between z-20">
        <BrandLogo size="md" />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setHowItWorksOpen(true)}
            className="text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-900 px-3 py-1.5 transition cursor-pointer"
          >
            How it works
          </button>

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
          {/* Left Column: Copy + Primary CTA */}
          <div className="lg:col-span-5 text-center lg:text-left space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-100 text-xs font-semibold text-[#E0246A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E0246A]" />
              <span>Virtual Hand Try-On</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-normal text-stone-900 tracking-tight leading-[1.12]">
              See any nail inspo on your{' '}
              <span className="italic text-[#E0246A]">actual hand</span> before you book.
            </h1>

            <p className="text-stone-600 text-sm sm:text-base max-w-md mx-auto lg:mx-0 leading-relaxed">
              Snap your hand once, drop any Pinterest or TikTok look, and preview it on your real skin tone in seconds.
            </p>

            <div className="pt-2 space-y-3 max-w-xs mx-auto lg:mx-0">
              <button
                type="button"
                onClick={handleLaunchTryOn}
                className="w-full h-12 sm:h-13 rounded-full bg-[#E0246A] hover:bg-[#CE1B5D] text-white text-sm sm:text-base font-semibold shadow-[0_6px_22px_rgba(224,36,106,0.32)] hover:shadow-[0_8px_28px_rgba(224,36,106,0.45)] flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
              >
                <span>Try On My Hand Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-xs text-stone-500 flex items-center justify-center lg:justify-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>1 free instant try-on · No card required</span>
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Before/After + Style Switcher */}
          <div className="lg:col-span-7 w-full max-w-xl mx-auto lg:max-w-none space-y-4">
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-[0_16px_48px_rgba(24,18,22,0.10)] select-none group">
              {/* After Image (Full Base) */}
              <img
                src={activePair.afterUrl}
                alt={`${activePair.title} manicure`}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />

              {/* Before Image (Clipped cleanly without distortion) */}
              <img
                src={activePair.beforeUrl}
                alt="Bare natural hand"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              />

              {/* Minimal Labels */}
              <span className="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] font-medium pointer-events-none">
                Bare
              </span>
              <span className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-full bg-[#E0246A]/90 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1 pointer-events-none">
                <Sparkles className="w-3 h-3" />
                <span>Try-On</span>
              </span>

              {/* Divider Line & Handle */}
              <div
                className="absolute inset-y-0 z-20 flex items-center justify-center -ml-4 w-8 cursor-ew-resize touch-none"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const container = e.currentTarget.parentElement;
                  const onMove = (ev: MouseEvent) => updateSliderFromClientX(ev.clientX, container);
                  const onUp = () => {
                    window.removeEventListener('mousemove', onMove);
                    window.removeEventListener('mouseup', onUp);
                  };
                  window.addEventListener('mousemove', onMove);
                  window.addEventListener('mouseup', onUp);
                }}
                onTouchMove={(e) => {
                  const touch = e.touches[0];
                  if (touch) updateSliderFromClientX(touch.clientX, e.currentTarget.parentElement);
                }}
              >
                <div className="absolute inset-y-0 w-0.5 bg-white/90 shadow-sm pointer-events-none" />
                <div className="relative w-8 h-8 rounded-full bg-white shadow-md border-2 border-[#E0246A] flex items-center justify-center text-[#E0246A] transition-transform group-hover:scale-110 active:scale-95">
                  <Sliders className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>
            </div>

            {/* Clean Wrapping Style Switcher */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {FEATURED_PAIRS.map((pair, idx) => {
                const isSelected = idx === selectedPairIndex;
                return (
                  <button
                    key={pair.id}
                    type="button"
                    onClick={() => {
                      setSelectedPairIndex(idx);
                      setSliderPosition(50);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
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
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-5 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-400 z-10 border-t border-stone-200/60">
        <span>© {new Date().getFullYear()} Finglora Atelier.</span>
        <span>Zero salon regrets.</span>
      </footer>

      {/* How It Works Modal */}
      {howItWorksOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setHowItWorksOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#E0246A] font-semibold">
                  How Finglora Works
                </span>
                <h3 className="font-serif text-2xl text-stone-900 mt-1">
                  3 steps to your next set
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setHowItWorksOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-stone-100">
              {[
                {
                  step: '01',
                  title: 'Snap Your Hand Once',
                  desc: 'Take a quick photo so Finglora matches your real skin tone and nail beds.',
                },
                {
                  step: '02',
                  title: 'Pick or Drop Inspo',
                  desc: 'Choose a trending look or upload any Pinterest, TikTok, or Instagram screenshot.',
                },
                {
                  step: '03',
                  title: 'Preview & Save',
                  desc: 'See the manicure live on your hand, tweak the shape, and bring it to your salon.',
                },
              ].map((item) => (
                <div key={item.step} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5">
                  <span className="font-mono text-xs font-semibold text-[#E0246A] pt-0.5">
                    {item.step}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-stone-900">{item.title}</h4>
                    <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setHowItWorksOpen(false);
                handleLaunchTryOn();
              }}
              className="w-full h-11 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
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
