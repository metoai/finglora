'use client';

import React, { useState, useRef } from 'react';
import {
  Hand,
  ImagePlus,
  ArrowRight,
  ArrowUpRight,
  UploadCloud,
  Camera,
  Check,
  X,
  Trash2,
  Sparkles,
  Compass,
  SlidersHorizontal,
} from 'lucide-react';
import { ExploreDesignSet, Finger, NailDesign, NailShape } from '@/types/nail';
import { HandCameraCaptureModal } from '@/components/common/HandCameraCaptureModal';

interface FeaturedLook {
  id: string;
  title: string;
  category: string;
  photoUrl: string;
  shape: NailShape;
  finish: string;
  baseColor: string;
  accentColor: string;
}

const FEATURED_ATELIER_LOOKS: FeaturedLook[] = [
  {
    id: 'feat-french-bow',
    title: 'French Tip Ribbons',
    category: 'Coquette',
    photoUrl: '/assets/pink_heart_tryon_result.jpg',
    shape: 'almond',
    finish: 'Glossy Gel',
    baseColor: '#FCE7F3',
    accentColor: '#E0246A',
  },
  {
    id: 'feat-cherry-mocha',
    title: 'Cherry Mocha French',
    category: 'Velvet',
    photoUrl: '/assets/burgundy_gold_virtual_tryon.jpg',
    shape: 'coffin',
    finish: 'Velvet Gloss',
    baseColor: '#FAF0EA',
    accentColor: '#3B111D',
  },
  {
    id: 'feat-milky-gold',
    title: 'Milky Glazed Gold',
    category: 'Chrome',
    photoUrl: '/assets/milky_gold_tryon_result.jpg',
    shape: 'almond',
    finish: 'Chrome Powder',
    baseColor: '#F5ECE3',
    accentColor: '#D4AF37',
  },
  {
    id: 'feat-atelier-nude',
    title: 'Atelier Nude Minimal',
    category: 'Minimalist',
    photoUrl: '/assets/editorial_nail_hero.jpg',
    shape: 'square',
    finish: 'High-Gloss',
    baseColor: '#FAF0EA',
    accentColor: '#FFFFFF',
  },
  {
    id: 'feat-clean-micro-french',
    title: 'Clean Micro-French',
    category: 'French',
    photoUrl: '/images/ar-nail-hero.jpg',
    shape: 'almond',
    finish: 'Sheer Glaze',
    baseColor: '#FAF0EA',
    accentColor: '#E0246A',
  },
  {
    id: 'feat-luminous-pearl',
    title: 'Luminous Pearl Sheen',
    category: 'Glazed',
    photoUrl: '/images/ar-nail-hero-pearl.jpg',
    shape: 'oval',
    finish: 'Pearl Glaze',
    baseColor: '#FAF4EF',
    accentColor: '#C59B27',
  },
];

interface AestheticCollection {
  id: string;
  title: string;
  subtitle: string;
  photoUrl: string;
  tag: string;
}

const AESTHETIC_COLLECTIONS: AestheticCollection[] = [
  {
    id: 'col-glazed',
    title: 'Glazed Chrome & Pearl',
    subtitle: 'Hailey Bieber pearl powder, chrome swirls & dewy reflections',
    photoUrl: '/assets/milky_gold_tryon_result.jpg',
    tag: 'chrome',
  },
  {
    id: 'col-coquette',
    title: 'Coquette & Nail Art',
    subtitle: 'Blush pink aura, miniature ribbons & delicate negative space',
    photoUrl: '/assets/pink_heart_tryon_result.jpg',
    tag: 'coquette',
  },
  {
    id: 'col-velvet',
    title: 'Velvet & Deep Burgundy',
    subtitle: 'Cherry mocha, rich bordeaux lacquer & 24K gold foil accents',
    photoUrl: '/assets/burgundy_gold_virtual_tryon.jpg',
    tag: 'red',
  },
  {
    id: 'col-minimal',
    title: 'Clean Girl Micro-French',
    subtitle: 'Ultra-fine smile curves, sheer milky bases & reinforced apex',
    photoUrl: '/assets/editorial_nail_hero.jpg',
    tag: 'french',
  },
];

const QUICK_PROMPT_CHIPS = [
  'Glazed Donut Chrome',
  'Cherry Mocha French',
  'Blush Heart Coquette',
  'Burgundy Velvet & Gold',
  'Clean Minimalist Nude',
  'Cat Eye Magnetic Shimmer',
  'Almond French Tip',
];

export function HomeHubView({
  userName = 'Flora',
  preferredShape = 'almond',
  aiStudioPrompt,
  setAiStudioPrompt,
  onSelectExploreDesign,
  onTryOnClick,
  onCustomizeClick,
  onUploadClick,
  onExploreClick,
  onCreatePromptClick,
  customTryOnHandUrl,
  setCustomTryOnHandUrl,
}: {
  userName?: string;
  preferredShape: NailShape;
  activeSample?: ExploreDesignSet;
  activePhotoUrl?: string;
  activeSetName: string;
  orderedFingers: Finger[];
  nails: Record<Finger, NailDesign>;
  aiStudioPrompt?: string;
  setAiStudioPrompt?: (prompt: string) => void;
  mobilePreview?: boolean;
  exploreDesigns?: ExploreDesignSet[];
  onSelectExploreDesign?: (id: string) => void;
  onTuneVibeClick: () => void;
  onSelectFinger: (fk: Finger) => void;
  onTryOnClick: () => void;
  onCustomizeClick: () => void;
  onUploadClick: () => void;
  onExploreClick?: (query?: string) => void;
  onCreatePromptClick?: (prompt: string) => void;
  customTryOnHandUrl?: string | null;
  setCustomTryOnHandUrl?: (url: string | null) => void;
}) {
  const [promptText, setPromptText] = useState(aiStudioPrompt || '');
  const [isHandModalOpen, setIsHandModalOpen] = useState(false);
  const [isCameraCaptureOpen, setIsCameraCaptureOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const handFileInputRef = useRef<HTMLInputElement | null>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2400);
  };

  const handleGenerate = (suggestion?: string) => {
    const text = (suggestion || promptText || 'Glazed Pearl Chrome Almond').trim();
    setAiStudioPrompt?.(text);
    if (onCreatePromptClick) {
      onCreatePromptClick(text);
    } else {
      onCustomizeClick();
    }
  };

  const handleHandPhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (setCustomTryOnHandUrl) {
        setCustomTryOnHandUrl(result);
      }
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('finglora_custom_hand_photo', result);
          localStorage.setItem('finglora_user_hand_photo', result);
        }
      } catch {
        // quota safety
      }
      setIsHandModalOpen(false);
      showToast('Hand photo saved! Ready for 1-tap try on');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveHandPhoto = () => {
    if (setCustomTryOnHandUrl) {
      setCustomTryOnHandUrl(null);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('finglora_custom_hand_photo');
      localStorage.removeItem('finglora_user_hand_photo');
    }
    showToast('Hand photo removed');
  };

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-10 py-5 space-y-8 pb-20">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
          <div className="bg-[#1F1A1C] text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg border border-white/10 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Check className="w-3.5 h-3.5 text-[#E0246A]" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* 1. Atelier Greeting & Live Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-stone-900 tracking-tight">
            {getGreeting()}, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-normal mt-1">
            Your personal nail atelier. Try on looks live, extract from inspiration, or create with AI.
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Silhouette Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-100 border border-stone-200/80 text-xs font-semibold text-stone-700 select-none">
            <Sparkles className="w-3.5 h-3.5 text-[#E0246A]" />
            <span className="capitalize">{preferredShape} Silhouette</span>
          </div>

          {/* Hand Status Pill */}
          <button
            type="button"
            onClick={() => setIsHandModalOpen(true)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer active:scale-95 border ${
              customTryOnHandUrl
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
            }`}
          >
            {customTryOnHandUrl ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
                <span>Hand Photo Ready</span>
              </>
            ) : (
              <>
                <Hand className="w-3.5 h-3.5 text-[#E0246A]" />
                <span>+ Add Hand Photo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Sleek Pinterest-Ease Search & AI Generation Dock */}
      <div className="space-y-2.5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate();
          }}
          className="w-full bg-[#E9E9E9] hover:bg-[#E1E1E1] focus-within:bg-white focus-within:ring-2 focus-within:ring-stone-400 rounded-full h-13 px-4 sm:px-5 transition-all flex items-center gap-3 border border-transparent shadow-2xs"
        >
          <Sparkles className="w-5 h-5 text-[#E0246A] shrink-0" />

          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Describe or search any look (e.g. Hailey Bieber glazed donut chrome, cherry mocha french, blush aura)..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-stone-900 placeholder:text-stone-500 focus:outline-none min-w-0"
          />

          <button
            type="submit"
            className="h-9 px-4 sm:px-5 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 active:scale-95 shadow-xs shrink-0 cursor-pointer transition"
          >
            <span>Create with AI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 select-none">
          <span className="text-[11px] font-medium text-stone-400 shrink-0">Try:</span>
          {QUICK_PROMPT_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setPromptText(chip);
                handleGenerate(chip);
              }}
              className="h-7 px-3 rounded-full bg-white hover:bg-stone-100 border border-stone-200/80 text-[11px] font-medium text-stone-700 whitespace-nowrap transition cursor-pointer active:scale-95 shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Four Tactile Studio Launchpad Stations (Balanced Across Widescreen) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Station 1: Virtual Try-On */}
        <div
          onClick={onTryOnClick}
          className="p-5 sm:p-6 rounded-3xl bg-white hover:bg-stone-50/80 border border-stone-200/80 hover:border-[#E0246A]/40 transition-all duration-300 shadow-2xs cursor-pointer group flex flex-col justify-between gap-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FDF2F8] text-[#E0246A] flex items-center justify-center shadow-xs">
              <Hand className="w-6 h-6" strokeWidth={1.75} />
            </div>

            <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-[10px] font-semibold uppercase tracking-wider group-hover:bg-[#E0246A] group-hover:text-white transition-colors">
              Live AR
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="font-serif text-lg sm:text-xl font-medium text-stone-900 group-hover:text-[#E0246A] transition-colors">
              Virtual Try-On
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              {customTryOnHandUrl
                ? 'Your hand photo is active. Tap any manicure to try it on live.'
                : 'Upload your hand once or open camera to see sets live on your fingers.'}
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <span className="text-xs font-semibold text-[#E0246A] inline-flex items-center gap-1 group-hover:underline">
              <span>Open Try-On Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Station 2: Extract Inspiration */}
        <div
          onClick={onUploadClick}
          className="p-5 sm:p-6 rounded-3xl bg-white hover:bg-stone-50/80 border border-stone-200/80 hover:border-[#E0246A]/40 transition-all duration-300 shadow-2xs cursor-pointer group flex flex-col justify-between gap-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FDF2F8] text-[#E0246A] flex items-center justify-center shadow-xs">
              <ImagePlus className="w-6 h-6" strokeWidth={1.75} />
            </div>

            <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-[10px] font-semibold uppercase tracking-wider group-hover:bg-[#E0246A] group-hover:text-white transition-colors">
              5-Finger AI
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="font-serif text-lg sm:text-xl font-medium text-stone-900 group-hover:text-[#E0246A] transition-colors">
              Extract Inspo Photo
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              Upload any Pinterest or Instagram manicure photo to decompose it into 5 distinct finger recipes.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <span className="text-xs font-semibold text-[#E0246A] inline-flex items-center gap-1 group-hover:underline">
              <span>Upload Manicure</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Station 3: AI Creation Studio */}
        <div
          onClick={() => {
            if (onCreatePromptClick) {
              onCreatePromptClick(promptText || 'Glazed Donut Chrome');
            } else {
              onCustomizeClick();
            }
          }}
          className="p-5 sm:p-6 rounded-3xl bg-white hover:bg-stone-50/80 border border-stone-200/80 hover:border-[#E0246A]/40 transition-all duration-300 shadow-2xs cursor-pointer group flex flex-col justify-between gap-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FDF2F8] text-[#E0246A] flex items-center justify-center shadow-xs">
              <Sparkles className="w-6 h-6" strokeWidth={1.75} />
            </div>

            <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-[10px] font-semibold uppercase tracking-wider group-hover:bg-[#E0246A] group-hover:text-white transition-colors">
              Conversational
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="font-serif text-lg sm:text-xl font-medium text-stone-900 group-hover:text-[#E0246A] transition-colors">
              AI Design Studio
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              Chat directly with our AI to generate custom nail art, chrome powders, or color palettes.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <span className="text-xs font-semibold text-[#E0246A] inline-flex items-center gap-1 group-hover:underline">
              <span>Start Creating</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Station 4: Bespoke 5-Finger Studio */}
        <div
          onClick={onCustomizeClick}
          className="p-5 sm:p-6 rounded-3xl bg-white hover:bg-stone-50/80 border border-stone-200/80 hover:border-[#E0246A]/40 transition-all duration-300 shadow-2xs cursor-pointer group flex flex-col justify-between gap-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FDF2F8] text-[#E0246A] flex items-center justify-center shadow-xs">
              <SlidersHorizontal className="w-6 h-6" strokeWidth={1.75} />
            </div>

            <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-[10px] font-semibold uppercase tracking-wider group-hover:bg-[#E0246A] group-hover:text-white transition-colors">
              Customizer
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="font-serif text-lg sm:text-xl font-medium text-stone-900 group-hover:text-[#E0246A] transition-colors">
              Bespoke Workbench
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              Hand-craft each finger&apos;s lacquer hue, apex curvature, shape silhouette, and gel finish.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <span className="text-xs font-semibold text-[#E0246A] inline-flex items-center gap-1 group-hover:underline">
              <span>Customize Nails</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* 4. Curated Atelier Spotlight (6 Editorial Looks across the Widescreen) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-medium text-stone-900 tracking-tight">
              Curated Atelier Looks
            </h2>
            <p className="text-xs text-stone-500">
              Ready for immediate 1-tap try-on on your hand.
            </p>
          </div>

          {onExploreClick && (
            <button
              type="button"
              onClick={() => onExploreClick()}
              className="text-xs font-semibold text-[#E0246A] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Explore All Pins</span>
              <Compass className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 6 Featured Large Editorial Cards in a Responsive Full-Width Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {FEATURED_ATELIER_LOOKS.map((look) => (
            <div
              key={look.id}
              onClick={() => {
                onSelectExploreDesign?.(look.id);
                onTryOnClick();
              }}
              className="group relative rounded-3xl overflow-hidden bg-stone-100 shadow-2xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-end aspect-[3/4.2]"
            >
              <img
                src={look.photoUrl}
                alt={look.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              {/* Top Category Badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2.5 py-1 rounded-full bg-black/40 text-white text-[10px] font-semibold backdrop-blur-xs capitalize border border-white/10">
                  {look.category}
                </span>
              </div>

              {/* Bottom Details & 1-Tap Try On */}
              <div className="relative z-10 p-3 sm:p-4 space-y-2">
                <div>
                  <h4 className="text-white text-xs sm:text-sm font-semibold leading-tight drop-shadow-xs">
                    {look.title}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-white/70 mt-0.5">
                    {look.finish} · <span className="capitalize">{look.shape}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectExploreDesign?.(look.id);
                    onTryOnClick();
                  }}
                  className="w-full h-8.5 rounded-full bg-white hover:bg-stone-50 text-stone-900 text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Hand className="w-3.5 h-3.5 text-[#E0246A]" strokeWidth={2} />
                  <span>{customTryOnHandUrl ? 'Try on My Hand' : 'Try On'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Distinct Aesthetic Collection Shelves */}
      <div className="space-y-4">
        <div>
          <h2 className="font-serif text-lg sm:text-xl font-medium text-stone-900 tracking-tight">
            Explore by Aesthetic
          </h2>
          <p className="text-xs text-stone-500">
            Discover curated moodboards tailored to your silhouette.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {AESTHETIC_COLLECTIONS.map((col) => (
            <div
              key={col.id}
              onClick={() => onExploreClick?.(col.tag)}
              className="p-4 sm:p-5 rounded-3xl bg-white hover:bg-stone-50/80 border border-stone-200/80 hover:border-stone-300 transition-all shadow-2xs cursor-pointer group flex flex-col justify-between gap-3"
            >
              <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-stone-100 relative">
                <img
                  src={col.photoUrl}
                  alt={col.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="space-y-1">
                <h4 className="font-serif text-base font-medium text-stone-900 group-hover:text-[#E0246A] transition-colors">
                  {col.title}
                </h4>
                <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                  {col.subtitle}
                </p>
              </div>

              <div className="pt-1 flex items-center gap-1 text-xs font-semibold text-stone-700 group-hover:text-[#E0246A]">
                <span>Browse Collection</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. MODAL: SAVE HAND PHOTO (STRICT: 1ST = UPLOAD, 2ND = CAMERA) */}
      {isHandModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-normal text-stone-900">
                  Your Hand Photo
                </h3>
                <p className="text-[11px] text-stone-500">
                  Preview any look instantly on your hand
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsHandModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer transition active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {customTryOnHandUrl ? (
              <div className="space-y-3">
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-stone-200 bg-stone-100">
                  <img
                    src={customTryOnHandUrl}
                    alt="Saved Hand Photo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-emerald-600/90 text-white text-[10px] font-semibold backdrop-blur-xs flex items-center gap-1 shadow-xs">
                    <Check className="w-3 h-3 text-white" />
                    <span>Saved</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsHandModalOpen(false);
                      onTryOnClick();
                    }}
                    className="w-full h-11 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Open Virtual Try-On</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveHandPhoto}
                    className="w-full h-9 rounded-xl border border-stone-200 hover:bg-rose-50 hover:border-rose-200 text-rose-600 text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Photo</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  ref={handFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleHandPhotoUpload(file);
                  }}
                />

                <button
                  type="button"
                  onClick={() => handFileInputRef.current?.click()}
                  className="w-full h-11 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Option 1: Upload Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsHandModalOpen(false);
                    setIsCameraCaptureOpen(true);
                  }}
                  className="w-full h-11 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-800 text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <Camera className="w-4 h-4 text-stone-600" />
                  <span>Option 2: Live Camera</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. LIVE CAMERA CAPTURE MODAL */}
      <HandCameraCaptureModal
        isOpen={isCameraCaptureOpen}
        onClose={() => setIsCameraCaptureOpen(false)}
        onCaptureHand={(dataUrl: string) => {
          if (setCustomTryOnHandUrl) {
            setCustomTryOnHandUrl(dataUrl);
          }
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem('finglora_custom_hand_photo', dataUrl);
              localStorage.setItem('finglora_user_hand_photo', dataUrl);
            }
          } catch {
            // quota safety
          }
          setIsCameraCaptureOpen(false);
          showToast('Live camera photo saved!');
        }}
      />
    </div>
  );
}
