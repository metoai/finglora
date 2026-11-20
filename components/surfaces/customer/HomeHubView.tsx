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
} from 'lucide-react';
import { ExploreDesignSet, Finger, NailDesign, NailShape } from '@/types/nail';
import { HandCameraCaptureModal } from '@/components/common/HandCameraCaptureModal';

interface FeaturedLook {
  id: string;
  title: string;
  category: string;
  displayCategory: string;
  photoUrl: string;
  shape: NailShape;
  finish: string;
  baseColor: string;
  accentColor: string;
}

interface InspirationCategory {
  id: string;
  label: string;
  thumbnailUrl: string;
}

const INSPIRATION_CATEGORIES: InspirationCategory[] = [
  {
    id: 'all',
    label: 'All Styles',
    thumbnailUrl: '/assets/editorial_nail_hero.jpg',
  },
  {
    id: 'glazed',
    label: 'Glazed & Chrome',
    thumbnailUrl: '/assets/milky_gold_tryon_result.jpg',
  },
  {
    id: 'french',
    label: 'French Tips',
    thumbnailUrl: '/images/ar-nail-hero.jpg',
  },
  {
    id: 'coquette',
    label: 'Coquette & Ribbons',
    thumbnailUrl: '/assets/pink_heart_tryon_result.jpg',
  },
  {
    id: 'velvet',
    label: 'Velvet Wine',
    thumbnailUrl: '/assets/burgundy_gold_virtual_tryon.jpg',
  },
  {
    id: 'minimal',
    label: 'Minimal Nude',
    thumbnailUrl: '/assets/editorial_nail_hero.jpg',
  },
];

const FEATURED_ATELIER_LOOKS: FeaturedLook[] = [
  {
    id: 'feat-french-bow',
    title: 'French Tip Ribbons',
    category: 'coquette',
    displayCategory: 'Coquette',
    photoUrl: '/assets/pink_heart_tryon_result.jpg',
    shape: 'almond',
    finish: 'Glossy Gel',
    baseColor: '#FCE7F3',
    accentColor: '#E0246A',
  },
  {
    id: 'feat-cherry-mocha',
    title: 'Cherry Mocha French',
    category: 'velvet',
    displayCategory: 'Velvet',
    photoUrl: '/assets/burgundy_gold_virtual_tryon.jpg',
    shape: 'coffin',
    finish: 'Velvet Gloss',
    baseColor: '#FAF0EA',
    accentColor: '#3B111D',
  },
  {
    id: 'feat-milky-gold',
    title: 'Milky Glazed Gold',
    category: 'glazed',
    displayCategory: 'Glazed',
    photoUrl: '/assets/milky_gold_tryon_result.jpg',
    shape: 'almond',
    finish: 'Chrome Powder',
    baseColor: '#F5ECE3',
    accentColor: '#D4AF37',
  },
  {
    id: 'feat-atelier-nude',
    title: 'Atelier Nude Minimal',
    category: 'minimal',
    displayCategory: 'Minimal',
    photoUrl: '/assets/editorial_nail_hero.jpg',
    shape: 'square',
    finish: 'High-Gloss',
    baseColor: '#FAF0EA',
    accentColor: '#FFFFFF',
  },
  {
    id: 'feat-clean-micro-french',
    title: 'Clean Micro-French',
    category: 'french',
    displayCategory: 'French',
    photoUrl: '/images/ar-nail-hero.jpg',
    shape: 'almond',
    finish: 'Sheer Glaze',
    baseColor: '#FAF0EA',
    accentColor: '#E0246A',
  },
  {
    id: 'feat-luminous-pearl',
    title: 'Luminous Pearl Sheen',
    category: 'glazed',
    displayCategory: 'Glazed',
    photoUrl: '/images/ar-nail-hero-pearl.jpg',
    shape: 'oval',
    finish: 'Pearl Glaze',
    baseColor: '#FAF4EF',
    accentColor: '#C59B27',
  },
  {
    id: 'feat-velvet-bordeaux',
    title: 'Deep Bordeaux Velvet',
    category: 'velvet',
    displayCategory: 'Velvet',
    photoUrl: '/assets/burgundy_gold_virtual_tryon.jpg',
    shape: 'almond',
    finish: 'Cat Eye Velvet',
    baseColor: '#3B111D',
    accentColor: '#D4AF37',
  },
  {
    id: 'feat-blush-pearl-french',
    title: 'Blush Micro French',
    category: 'french',
    displayCategory: 'French',
    photoUrl: '/images/ar-nail-hero.jpg',
    shape: 'almond',
    finish: 'Glossy Clearcoat',
    baseColor: '#FAF0EA',
    accentColor: '#FFFFFF',
  },
  {
    id: 'feat-pink-coquette-bow',
    title: 'Dusty Rose Ribbon Bows',
    category: 'coquette',
    displayCategory: 'Coquette',
    photoUrl: '/assets/pink_heart_tryon_result.jpg',
    shape: 'coffin',
    finish: 'Glossy 3D',
    baseColor: '#FCE7F3',
    accentColor: '#E0246A',
  },
  {
    id: 'feat-sheer-linen-minimal',
    title: 'Sheer Linen Minimalist',
    category: 'minimal',
    displayCategory: 'Minimal',
    photoUrl: '/assets/editorial_nail_hero.jpg',
    shape: 'oval',
    finish: 'Natural Sheen',
    baseColor: '#F7F3EE',
    accentColor: '#FFFFFF',
  },
];

const QUICK_PROMPT_CHIPS = [
  'Glazed Chrome',
  'Cherry Mocha',
  'Blush Coquette',
  'Velvet Wine',
  'Micro French',
  'Cat Eye Aura',
  'Clean Nude',
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
  const [activeCategory, setActiveCategory] = useState<string>('all');
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

  const cleanUserName =
    userName && userName !== 'VIP Creator' && userName !== 'Guest'
      ? userName
      : 'Flora';

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

  // Filter curated looks by active category
  const displayedLooks = FEATURED_ATELIER_LOOKS.filter((look) => {
    if (activeCategory === 'all') return true;
    return look.category === activeCategory;
  });

  return (
    <div className="w-full max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-10 py-3 sm:py-5 space-y-5 sm:space-y-6 lg:space-y-7 pb-24 md:pb-16">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
          <div className="bg-[#1F1A1C] text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg border border-white/10 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Check className="w-3.5 h-3.5 text-[#E0246A]" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* 1. Header: Greeting & Status Indicators */}
      <div className="flex items-center justify-between gap-3 pt-0.5">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-medium text-stone-900 tracking-tight">
            {getGreeting()}, {cleanUserName}
          </h1>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Silhouette Badge */}
          <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-stone-100 border border-stone-200/80 text-[11px] sm:text-xs font-semibold text-stone-700 select-none">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E0246A]" />
            <span className="capitalize">{preferredShape}</span>
          </div>

          {/* Hand Status Pill */}
          <button
            type="button"
            onClick={() => setIsHandModalOpen(true)}
            className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition cursor-pointer active:scale-95 border ${
              customTryOnHandUrl
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
            }`}
          >
            {customTryOnHandUrl ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
                <span className="hidden sm:inline">Hand Ready</span>
                <span className="sm:hidden">Ready</span>
              </>
            ) : (
              <>
                <Hand className="w-3.5 h-3.5 text-[#E0246A]" />
                <span>+ Hand</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. AI Creation Studio Dock */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E0246A]" />
            <h2 className="text-xs sm:text-sm font-semibold text-stone-900 tracking-tight">
              AI Creation Studio
            </h2>
          </div>
          <span className="text-[10px] sm:text-[11px] text-stone-400 font-normal">
            Generate custom sets with prompt
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate();
          }}
          className="w-full bg-[#E9E9E9] hover:bg-[#E1E1E1] focus-within:bg-white focus-within:ring-2 focus-within:ring-stone-400 rounded-full h-11 sm:h-12 px-2.5 sm:px-3.5 transition-all flex items-center gap-2 sm:gap-2.5 border border-transparent shadow-2xs"
        >
          {/* AI Creation Badge inside dock */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FDF2F8] text-[#E0246A] text-[10px] sm:text-[11px] font-bold shrink-0 border border-[#FCE7F3]">
            <Sparkles className="w-3 h-3 text-[#E0246A]" />
            <span className="hidden sm:inline">AI Creation</span>
            <span className="sm:hidden">AI</span>
          </span>

          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Describe any design (e.g. Glazed donut chrome with blush hearts)..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-stone-900 placeholder:text-stone-500 focus:outline-none min-w-0"
          />

          <button
            type="submit"
            className="h-8 sm:h-8.5 px-3 sm:px-4 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold inline-flex items-center gap-1 active:scale-95 shadow-xs shrink-0 cursor-pointer transition"
          >
            <span className="hidden sm:inline">Create with AI</span>
            <span className="sm:hidden">Create</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Short 1-2 Word Aesthetic Prompt Chips */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-0.5 select-none">
          <span className="text-[10px] sm:text-[11px] font-semibold text-stone-400 shrink-0">
            Prompts:
          </span>
          {QUICK_PROMPT_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setPromptText(chip);
                handleGenerate(chip);
              }}
              className="h-6.5 sm:h-7 px-2.5 sm:px-3 rounded-full bg-white hover:bg-stone-100 border border-stone-200/80 text-[11px] font-medium text-stone-700 whitespace-nowrap transition cursor-pointer active:scale-95 shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Four Compact Action Tiles (2x2 on Mobile, 4-col on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Station 1: Virtual Try-On */}
        <div
          onClick={onTryOnClick}
          className="p-3 sm:p-4 rounded-2xl bg-white hover:bg-stone-50/80 border border-stone-200/80 hover:border-[#E0246A]/40 transition-all shadow-2xs cursor-pointer group flex items-center justify-between gap-2.5 active:scale-98"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FDF2F8] text-[#E0246A] flex items-center justify-center shrink-0">
              <Hand className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-xs sm:text-sm text-stone-900 group-hover:text-[#E0246A] transition-colors truncate">
                Virtual Try-On
              </h3>
              <p className="text-[10px] sm:text-[11px] text-stone-400 truncate">
                Live AR on hand
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#E0246A] shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>

        {/* Station 2: Extract Inspo */}
        <div
          onClick={onUploadClick}
          className="p-3 sm:p-4 rounded-2xl bg-white hover:bg-stone-50/80 border border-stone-200/80 hover:border-[#E0246A]/40 transition-all shadow-2xs cursor-pointer group flex items-center justify-between gap-2.5 active:scale-98"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FDF2F8] text-[#E0246A] flex items-center justify-center shrink-0">
              <ImagePlus className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-xs sm:text-sm text-stone-900 group-hover:text-[#E0246A] transition-colors truncate">
                Extract Inspo
              </h3>
              <p className="text-[10px] sm:text-[11px] text-stone-400 truncate">
                From photo or IG
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#E0246A] shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>

        {/* Station 3: AI Studio */}
        <div
          onClick={() => {
            if (onCreatePromptClick) {
              onCreatePromptClick(promptText || 'Glazed Donut Chrome');
            } else {
              onCustomizeClick();
            }
          }}
          className="p-3 sm:p-4 rounded-2xl bg-white hover:bg-stone-50/80 border border-stone-200/80 hover:border-[#E0246A]/40 transition-all shadow-2xs cursor-pointer group flex items-center justify-between gap-2.5 active:scale-98"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FDF2F8] text-[#E0246A] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-xs sm:text-sm text-stone-900 group-hover:text-[#E0246A] transition-colors truncate">
                AI Studio
              </h3>
              <p className="text-[10px] sm:text-[11px] text-stone-400 truncate">
                Generate custom set
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#E0246A] shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>

        {/* Station 4: Explore Pins */}
        <div
          onClick={() => onExploreClick?.()}
          className="p-3 sm:p-4 rounded-2xl bg-white hover:bg-stone-50/80 border border-stone-200/80 hover:border-[#E0246A]/40 transition-all shadow-2xs cursor-pointer group flex items-center justify-between gap-2.5 active:scale-98"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FDF2F8] text-[#E0246A] flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-xs sm:text-sm text-stone-900 group-hover:text-[#E0246A] transition-colors truncate">
                Explore Pins
              </h3>
              <p className="text-[10px] sm:text-[11px] text-stone-400 truncate">
                Trending gallery
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#E0246A] shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>

      {/* 4. Curated Inspiration with Normal Category Navigation Above */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-base sm:text-lg lg:text-xl font-medium text-stone-900 tracking-tight">
            Curated Inspiration
          </h2>

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

        {/* Normal Category Navigation Pills (Half-Image, Half-Text) */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 select-none">
          {INSPIRATION_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`h-9 sm:h-9.5 rounded-xl overflow-hidden flex items-center transition-all cursor-pointer active:scale-95 shrink-0 border ${
                  isActive
                    ? 'ring-2 ring-stone-900 bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-[#E9E9E9] hover:bg-[#DFDFDF] text-stone-900 border-transparent'
                }`}
              >
                {/* Left Half: Image */}
                <div className="w-10 sm:w-11 h-full shrink-0 relative overflow-hidden">
                  <img
                    src={cat.thumbnailUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Right Half: Text Label */}
                <div className="px-3 sm:px-3.5 flex items-center justify-center font-semibold text-xs sm:text-[13px] whitespace-nowrap">
                  <span>{cat.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Featured Editorial Manicure Cards in a Responsive Full-Width Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
          {displayedLooks.map((look) => (
            <div
              key={look.id}
              onClick={() => {
                onSelectExploreDesign?.(look.id);
                onTryOnClick();
              }}
              className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-100 shadow-2xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-end aspect-[3/4.2]"
            >
              <img
                src={look.photoUrl}
                alt={look.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              {/* Top Category Badge */}
              <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10">
                <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-black/40 text-white text-[9px] sm:text-[10px] font-semibold backdrop-blur-xs capitalize border border-white/10">
                  {look.displayCategory}
                </span>
              </div>

              {/* Bottom Details & 1-Tap Try On */}
              <div className="relative z-10 p-2.5 sm:p-3.5 space-y-1.5 sm:space-y-2">
                <div>
                  <h4 className="text-white text-xs sm:text-sm font-semibold leading-tight drop-shadow-xs truncate">
                    {look.title}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-white/70 mt-0.5 truncate">
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
                  className="w-full h-8 sm:h-8.5 rounded-full bg-white hover:bg-stone-50 text-stone-900 text-[11px] sm:text-xs font-bold shadow-md flex items-center justify-center gap-1 sm:gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Hand className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E0246A]" strokeWidth={2} />
                  <span>{customTryOnHandUrl ? 'Try on Hand' : 'Try On'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. MODAL: SAVE HAND PHOTO (STRICT: 1ST = UPLOAD, 2ND = CAMERA) */}
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

      {/* 6. LIVE CAMERA CAPTURE MODAL */}
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
