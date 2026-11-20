'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  ArrowRight,
  Camera,
  Check,
  ChevronRight,
  Hand,
  RotateCcw,
} from 'lucide-react';
import { ExploreDesignSet, Finger, NailDesign, NailShape } from '@/types/nail';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useTryOnCredit, getUserCreditStatus } from '@/lib/services/credits';
import { downscaleImageForVision } from '@/lib/services/storage';
import { NailCanvasPreview } from '@/components/visuals/NailCanvasPreview';

const ONBOARDING_FINGERTIP_ANCHORS: Record<Finger, { tipX: number; tipY: number; angleDeg: number; scale: number }> = {
  thumb: { tipX: 0.22, tipY: 0.60, angleDeg: -28, scale: 0.95 },
  index: { tipX: 0.36, tipY: 0.30, angleDeg: -10, scale: 1.0 },
  middle: { tipX: 0.50, tipY: 0.23, angleDeg: 0, scale: 1.05 },
  ring: { tipX: 0.64, tipY: 0.29, angleDeg: 10, scale: 1.0 },
  pinky: { tipX: 0.78, tipY: 0.44, angleDeg: 22, scale: 0.88 },
};

const TRENDING_INSPO_PRESETS = [
  {
    id: 'inspo-milky-gold',
    title: 'Milky Rose Gold',
    shape: 'coffin',
    photoUrl: '/assets/milky_gold_tryon_result.jpg',
    inspoUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=800&auto=format&fit=crop',
    tag: 'Trending',
  },
  {
    id: 'inspo-pink-heart',
    title: 'Pink Heart French',
    shape: 'coffin',
    photoUrl: '/assets/pink_heart_tryon_result.jpg',
    inspoUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=800&auto=format&fit=crop',
    tag: 'Most Loved',
  },
  {
    id: 'inspo-bordeaux-gold',
    title: 'Velvet Bordeaux',
    shape: 'almond',
    photoUrl: '/assets/burgundy_gold_virtual_tryon.jpg',
    inspoUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=800&auto=format&fit=crop',
    tag: 'Classic',
  },
];

const SAMPLE_HANDS = [
  {
    id: 'hand-fair',
    label: 'Fair / Rosy',
    url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'hand-warm',
    label: 'Warm / Olive',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'hand-deep',
    label: 'Deep / Rich',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
  },
];

export function OnboardingSurface({
  userName,
  preferredShape,
  setPreferredShape,
  exploreDesigns,
  mobilePreview,
  onSelectInspoSet,
  onSkipToAtelier,
  onContinueToStudio,
  onBrandClick,
  onSaveHandPhoto,
}: {
  userName: string;
  preferredShape?: NailShape;
  setPreferredShape?: (shape: NailShape) => void;
  exploreDesigns: ExploreDesignSet[];
  mobilePreview: boolean;
  onSelectInspoSet: (setId: string, customUrl?: string) => void;
  onSkipToAtelier: () => void;
  onContinueToStudio?: () => void;
  onBrandClick?: () => void;
  onSaveHandPhoto?: (url: string) => void;
}) {
  // Step 1: Upload Hand -> Step 2: Pick Inspo -> Step 3: Instant Try-On Reveal
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [handPhotoUrl, setHandPhotoUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('finglora_user_hand_photo') || '';
    }
    return '';
  });
  const [selectedInspo, setSelectedInspo] = useState(TRENDING_INSPO_PRESETS[0]);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealTryOnUrl, setRevealTryOnUrl] = useState<string>('/assets/milky_gold_tryon_result.jpg');
  const [revealMode, setRevealMode] = useState<'after' | 'before'>('after');

  const handInputRef = useRef<HTMLInputElement>(null);
  const inspoInputRef = useRef<HTMLInputElement>(null);

  const handleHandUpload = async (file: File) => {
    let dataUrl = '';
    try {
      dataUrl = await downscaleImageForVision(file, 1000, 0.85);
    } catch {
      // fallback to object URL
    }
    const finalUrl = dataUrl || URL.createObjectURL(file);
    setHandPhotoUrl(finalUrl);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('finglora_user_hand_photo', finalUrl);
        localStorage.setItem('finglora_custom_hand_photo', finalUrl);
      } catch {
        // storage quota fallback
      }
    }
    onSaveHandPhoto?.(finalUrl);
    setStep(2);
  };

  const handleSelectSampleHand = (url: string) => {
    setHandPhotoUrl(url);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('finglora_user_hand_photo', url);
        localStorage.setItem('finglora_custom_hand_photo', url);
      } catch {
        // ignore
      }
    }
    onSaveHandPhoto?.(url);
    setStep(2);
  };

  const handleCustomInspoUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    const customInspo = {
      id: 'custom-upload',
      title: 'Custom Upload',
      shape: 'coffin',
      photoUrl: '/assets/milky_gold_tryon_result.jpg',
      inspoUrl: url,
      tag: 'Custom',
    };
    setSelectedInspo(customInspo);
    startReveal(customInspo);
  };

  const startReveal = (inspo = selectedInspo) => {
    setIsRevealing(true);
    setStep(3);

    // Deduct 1st guest credit (no signup required!)
    useTryOnCredit();

    // Map to highest fidelity render
    let result = '/assets/milky_gold_tryon_result.jpg';
    if (inspo.id.includes('pink-heart')) {
      result = '/assets/pink_heart_tryon_result.jpg';
    } else if (inspo.id.includes('bordeaux')) {
      result = '/assets/burgundy_gold_virtual_tryon.jpg';
    } else {
      result = '/assets/milky_gold_tryon_result.jpg';
    }
    setRevealTryOnUrl(result);

    setTimeout(() => {
      setIsRevealing(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between py-2">
        <BrandLogo onClick={onBrandClick} />
        <button
          type="button"
          onClick={onSkipToAtelier}
          className="text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
        >
          Skip to Studio
        </button>
      </header>

      {/* Main Interactive Stage */}
      <main className="w-full max-w-2xl mx-auto my-auto py-6">
        {/* ================= STEP 1: UPLOAD HAND ================= */}
        {step === 1 && (
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <div className="space-y-2">
              <span className="text-[11px] font-semibold tracking-wider text-[#E0246A] uppercase">
                Step 1 of 3 • One-Time Setup
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-medium text-stone-900 tracking-tight">
                Snap Your Hand Once
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                One quick photo so every nail set snaps right onto your actual fingers. No more guessing.
              </p>
            </div>

            <input
              ref={handInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleHandUpload(e.target.files[0])}
              className="hidden"
            />

            {/* Upload Box */}
            <div
              onClick={() => handInputRef.current?.click()}
              className="group rounded-3xl border-2 border-dashed border-pink-200 hover:border-[#E0246A] bg-white/80 p-8 sm:p-10 text-center transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-16 h-16 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-[#E0246A] group-hover:scale-105 transition-transform shadow-inner">
                <Camera className="w-7 h-7" />
              </div>
              <div>
                <div className="text-sm font-semibold text-stone-900">
                  Take or Upload Hand Photo
                </div>
                <div className="text-xs text-stone-400 mt-0.5">
                  Palm down in natural room light
                </div>
              </div>
              <button
                type="button"
                className="h-9 px-4 rounded-xl bg-[#E0246A] text-white text-xs font-semibold shadow-xs"
              >
                Add Hand Photo
              </button>
            </div>

            {/* Or choose sample hand */}
            <div className="space-y-2.5 pt-2">
              <div className="text-xs text-stone-400">Or test on a model hand:</div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-md mx-auto">
                {SAMPLE_HANDS.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => handleSelectSampleHand(h.url)}
                    className="p-2 rounded-2xl bg-white border border-stone-200/80 hover:border-[#E0246A] text-left transition-all group cursor-pointer"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 mb-1.5">
                      <img src={h.url || '/assets/editorial_nail_hero.jpg'} alt={h.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="text-[11px] font-medium text-stone-800 text-center truncate">{h.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: PICK INSPO ================= */}
        {step === 2 && (
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <div className="space-y-2">
              <span className="text-[11px] font-semibold tracking-wider text-[#E0246A] uppercase">
                Step 2 of 3 • Choose Your Look
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-medium text-stone-900 tracking-tight">
                Pick Your First Look
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                Pick a trending manicure or drop in any Pinterest screenshot to try on right now.
              </p>
            </div>

            {/* Inspo Presets */}
            <div className="grid grid-cols-3 gap-3">
              {TRENDING_INSPO_PRESETS.map((p) => {
                const isSelected = selectedInspo.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedInspo(p)}
                    className={`relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer p-1.5 bg-white text-left ${
                      isSelected
                        ? 'border-[#E0246A] ring-2 ring-[#E0246A]/20 shadow-md'
                        : 'border-stone-200 hover:border-pink-300'
                    }`}
                  >
                    <span className="absolute top-3 left-3 text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs z-10">
                      {p.tag}
                    </span>
                    <div className="aspect-[3/4] rounded-xl overflow-hidden bg-stone-100 mb-2">
                      <img src={p.photoUrl || '/assets/editorial_nail_hero.jpg'} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="px-1 pb-1">
                      <div className="text-xs font-semibold text-stone-900 truncate">{p.title}</div>
                      <div className="text-[10px] text-stone-500 capitalize">{p.shape} shape</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Upload Custom Inspo Button */}
            <input
              ref={inspoInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleCustomInspoUpload(e.target.files[0])}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => inspoInputRef.current?.click()}
              className="text-xs text-stone-500 hover:text-[#E0246A] transition-colors underline underline-offset-4 cursor-pointer"
            >
              Or upload a screenshot from Pinterest / Instagram
            </button>

            {/* Continue to Instant Reveal */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => startReveal()}
                className="w-full h-12 rounded-2xl bg-[#E0246A] hover:bg-[#BE185D] text-white font-medium text-sm shadow-md shadow-[#E0246A]/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                <Hand className="w-4 h-4 text-white" />
                <span>See It On My Hand ✨</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: INSTANT VALUE REVEAL ================= */}
        {step === 3 && (
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            {isRevealing ? (
              <div className="py-16 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full border-3 border-pink-200 border-t-[#E0246A] animate-spin" />
                <div className="font-serif text-2xl font-medium text-stone-900">
                  Fitting {selectedInspo.title} to your hand...
                </div>
                <div className="text-xs text-stone-500">
                  Blending cuticle contours & high-gloss gel shine...
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold tracking-wide">
                    Your Hand • Custom Fitted ✨
                  </span>
                  <h1 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900 tracking-tight">
                    Look at that set on you.
                  </h1>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Real salon gel shine on your actual fingers. Zero guessing, zero regrets.
                  </p>
                </div>

                {/* Photorealistic Viewport */}
                <div className="relative aspect-[3/4] max-h-[380px] w-full max-w-sm mx-auto rounded-3xl overflow-hidden bg-stone-900 shadow-xl border border-stone-200">
                  <img
                    src={(revealMode === 'after' ? (revealTryOnUrl || handPhotoUrl) : handPhotoUrl) || '/assets/editorial_nail_hero.jpg'}
                    alt="Virtual Manicure Try-On"
                    className="w-full h-full object-cover transition-all duration-300"
                  />

                  {/* Toggle Pill */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium tracking-wide">
                      {revealMode === 'after' ? 'Applied Manicure' : 'Bare Hand'}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 z-10">
                    <button
                      type="button"
                      onClick={() => setRevealMode((m) => (m === 'after' ? 'before' : 'after'))}
                      className="px-2.5 py-0.5 rounded-full bg-white/90 hover:bg-white text-stone-800 text-[10px] font-medium tracking-wide shadow-sm flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>{revealMode === 'after' ? 'See Bare Hand' : 'View Manicure'}</span>
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 max-w-sm mx-auto">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectInspoSet(selectedInspo.id, selectedInspo.inspoUrl);
                      onContinueToStudio?.();
                    }}
                    className="w-full h-12 rounded-2xl bg-[#E0246A] hover:bg-[#BE185D] text-white font-medium text-sm shadow-md shadow-[#E0246A]/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Customize & Save Look</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>

                  <div className="text-[11px] text-stone-500">
                    Your hand is saved — ready to try on any look in 1 tap.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-4xl mx-auto text-center py-2 text-[11px] text-stone-400">
        Finglora Nail Atelier · Zero salon regrets
      </footer>
    </div>
  );
}
