'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Palette,
  Compass,
  Heart,
  LayoutGrid,
  Wand2,
  Wine,
  Circle,
  Eye,
  Coffee,
  Square,
  Scissors,
  Gem,
  ChevronLeft,
  ChevronRight,
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
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const INSPIRATION_CATEGORIES: InspirationCategory[] = [
  { id: 'all', label: 'All 100 Styles', Icon: LayoutGrid },
  { id: 'glazed', label: 'Glazed & Chrome', Icon: Wand2 },
  { id: 'french', label: 'French Tips', Icon: Palette },
  { id: 'coquette', label: 'Coquette & Ribbons', Icon: Heart },
  { id: 'velvet', label: 'Velvet & Aura', Icon: Wine },
  { id: 'minimal', label: 'Clean Girl Minimal', Icon: Circle },
  { id: 'cat-eye', label: 'Cat-Eye & 3D', Icon: Eye },
  { id: 'cherry-mocha', label: 'Cherry Mocha', Icon: Coffee },
  { id: 'black-minimal', label: 'Noir & Black', Icon: Square },
  { id: 'short-natural', label: 'Short & Natural', Icon: Scissors },
  { id: 'almond-coffin', label: 'Sculpted Extensions', Icon: Gem },
];

const FEATURED_ATELIER_LOOKS: FeaturedLook[] = [
  {
    id: 'feat-french-bow',
    title: 'French Tip Ribbons',
    category: 'coquette',
    displayCategory: 'Coquette',
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/coquette/coquette_pearl_bow_01.jpg',
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
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/french/french_cherry_wine_04.jpg',
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
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_pearl_almond_01.jpg',
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
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_vanilla_squoval_05.jpg',
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
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/french/french_micro_almond_01.jpg',
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
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_chrome_classic_02.jpg',
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
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_bronze_gold_07.jpg',
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
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/french/french_noir_classic_03.jpg',
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
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/coquette/coquette_french_bow_03.jpg',
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
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_liquid_silver_03.jpg',
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

const TYPING_PROMPTS = [
  'Hailey Bieber glazed chrome almond...',
  'Cherry mocha french with micro glitter...',
  'Blush pink velvet aura almond nails...',
  'Milky nude with subtle 3D gold swirls...',
  'Minimalist clean girl French tips...',
  'Cat-eye velvet emerald on coffin shape...',
];

export function HomeHubView({
  userName = 'Flora',
  preferredShape = 'almond',
  aiStudioPrompt,
  setAiStudioPrompt,
  exploreDesigns = [],
  onSelectExploreDesign,
  onTryOnClick,
  onCustomizeClick,
  onUploadClick,
  onExploreClick,
  onFavoritesClick,
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
  onFavoritesClick?: () => void;
  onCreatePromptClick?: (prompt: string) => void;
  customTryOnHandUrl?: string | null;
  setCustomTryOnHandUrl?: (url: string | null) => void;
}) {
  const [promptText, setPromptText] = useState(aiStudioPrompt || '');
  const [isHandModalOpen, setIsHandModalOpen] = useState(false);
  const [isCameraCaptureOpen, setIsCameraCaptureOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const handFileInputRef = useRef<HTMLInputElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Typewriter animation effect for Design with AI input
  const [typingIndex, setTypingIndex] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (promptText) return;

    const currentPrompt = TYPING_PROMPTS[typingIndex % TYPING_PROMPTS.length];
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      if (typingText.length < currentPrompt.length) {
        timeout = setTimeout(() => {
          setTypingText(currentPrompt.slice(0, typingText.length + 1));
        }, 50);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (typingText.length > 0) {
        timeout = setTimeout(() => {
          setTypingText(currentPrompt.slice(0, typingText.length - 1));
        }, 25);
      } else {
        setIsDeleting(false);
        setTypingIndex((prev) => prev + 1);
      }
    }

    return () => clearTimeout(timeout);
  }, [typingText, isDeleting, typingIndex, promptText]);

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
    const text = (suggestion || promptText || typingText || 'Glazed Pearl Chrome Almond').trim();
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

  // Mixed 10 curated looks representing diverse categories on homepage
  const displayedLooks = useMemo(() => {
    if (exploreDesigns && exploreDesigns.length > 0) {
      const mapped = exploreDesigns.map((d) => ({
        id: d.id,
        title: d.title,
        category: (d.category || 'curated').toLowerCase(),
        displayCategory: d.category ? d.category.replace('-', ' ') : 'Curated',
        photoUrl: d.photoUrl,
        shape: (d.nails?.middle?.shape || d.nails?.thumb?.shape || 'almond') as NailShape,
        finish: d.nails?.middle?.finish || 'glossy',
        baseColor: d.nails?.middle?.baseColor || '#FAF0EA',
        accentColor: d.nails?.middle?.accentColor || '#FFFFFF',
      }));

      const categoryOrder = [
        'glazed',
        'french',
        'coquette',
        'velvet',
        'minimal',
        'cat-eye',
        'cherry-mocha',
        'black-minimal',
        'short-natural',
        'almond-coffin',
      ];

      const mixed: typeof mapped = [];
      const usedIds = new Set<string>();

      for (const cat of categoryOrder) {
        const found = mapped.find(
          (m) =>
            !usedIds.has(m.id) &&
            (m.category === cat || m.category.includes(cat) || cat.includes(m.category))
        );
        if (found) {
          mixed.push(found);
          usedIds.add(found.id);
        }
      }

      for (const m of mapped) {
        if (mixed.length >= 10) break;
        if (!usedIds.has(m.id)) {
          mixed.push(m);
          usedIds.add(m.id);
        }
      }

      return mixed;
    }

    return FEATURED_ATELIER_LOOKS.slice(0, 10);
  }, [exploreDesigns]);

  return (
    <div className="w-full max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-10 py-3 sm:py-5 space-y-4 sm:space-y-6 pb-24 md:pb-8">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
          <div className="bg-[#1F1A1C] text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg border border-white/10 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Check className="w-3.5 h-3.5 text-[#E0246A]" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* 1. Header: Greeting & Status Indicators (Hidden on Mobile per user request) */}
      <div className="hidden sm:flex items-center justify-between gap-3 pt-0.5">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-medium text-stone-900 tracking-tight">
            {getGreeting()}, {cleanUserName}
          </h1>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Silhouette Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-stone-100 border border-stone-200/80 text-[11px] sm:text-xs font-semibold text-stone-700 select-none">
            <span className="w-2 h-2 rounded-full bg-[#E0246A] ring-2 ring-pink-100 shrink-0" />
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

      {/* 2. AI Creation Studio Box - 1 Row Design with Typing Animation & Fixed Generate Button */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 px-1">
          <h2 className="text-xs sm:text-sm font-semibold text-stone-900 tracking-tight">
            Design with AI
          </h2>
        </div>

        {/* 1 Row Input Dock */}
        <div className="w-full bg-white rounded-2xl sm:rounded-full border border-stone-200/90 hover:border-stone-300 focus-within:border-[#E0246A]/60 focus-within:ring-2 focus-within:ring-[#E0246A]/10 p-1.5 sm:p-2 transition-all shadow-2xs flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pink-50 text-[#E0246A] flex items-center justify-center shrink-0 ml-1">
            <Palette className="w-4 h-4" />
          </div>

          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleGenerate(promptText || typingText);
              }
            }}
            placeholder={typingText || 'Describe any manicure look or aesthetic...'}
            className="flex-1 bg-transparent text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none min-w-0 px-1"
          />

          {/* Fixed Generate Button */}
          <button
            type="button"
            onClick={() => handleGenerate(promptText || typingText)}
            className="h-9 sm:h-10 px-4 sm:px-5 rounded-xl sm:rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 active:scale-95 shadow-xs shrink-0 cursor-pointer transition"
          >
            <span>Generate</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Suggestion Chips - 1 Row horizontal scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 px-1 select-none">
          <span className="text-[10px] sm:text-[11px] font-semibold text-stone-400 shrink-0">
            Try:
          </span>
          {QUICK_PROMPT_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setPromptText(chip);
                handleGenerate(chip);
              }}
              className="h-6.5 sm:h-7 px-2.5 sm:px-3 rounded-full bg-stone-100 hover:bg-stone-200/80 text-[11px] font-medium text-stone-700 whitespace-nowrap transition cursor-pointer active:scale-95 shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Four Tactile Action Tiles with Brand Colors & Whole Card Fill on Hero Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Station 1: Virtual Try-On - WHOLE CARD SIGNATURE BRAND PINK */}
        <div
          onClick={onTryOnClick}
          className="group relative overflow-hidden p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-[#E0246A] hover:bg-[#CE1B5D] text-white transition-all duration-300 shadow-[0_4px_16px_rgba(224,36,106,0.22)] hover:shadow-[0_8px_28px_rgba(224,36,106,0.35)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] cursor-pointer flex flex-col justify-between min-h-[110px] sm:min-h-[122px]"
        >
          {/* Subtle corner light sheen */}
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10 group-hover:bg-white/20 blur-xl transition-all duration-500 pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-xs text-white border border-white/25 flex items-center justify-center shadow-xs transition-all duration-300 ease-out group-hover:scale-105 group-hover:bg-white/25">
              <Hand className="w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform duration-300 ease-out group-hover:rotate-12 group-hover:scale-110 origin-bottom-left" strokeWidth={2} />
            </div>
            <div className="w-7 h-7 rounded-full bg-white/20 hover:bg-white text-white hover:text-[#E0246A] border border-white/20 flex items-center justify-center transition-all duration-200 shadow-2xs">
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.25} />
            </div>
          </div>
          <div className="relative z-10 mt-3">
            <h3 className="font-semibold text-xs sm:text-sm text-white leading-tight truncate">
              Virtual Try-On
            </h3>
            <p className="text-[10px] sm:text-[11px] text-pink-100/90 mt-0.5 truncate font-normal">
              Live AR on your hand
            </p>
          </div>
        </div>

        {/* Station 2: Extract Inspo - WHOLE CARD DEEP BRAND NOIR */}
        <div
          onClick={onUploadClick}
          className="group relative overflow-hidden p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-[#181416] hover:bg-[#231E21] text-white transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.22)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] cursor-pointer flex flex-col justify-between min-h-[110px] sm:min-h-[122px]"
        >
          {/* Subtle corner light sheen */}
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/5 group-hover:bg-white/10 blur-xl transition-all duration-500 pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-xs text-[#FCE7F3] border border-white/15 flex items-center justify-center shadow-xs transition-all duration-300 ease-out group-hover:scale-105 group-hover:bg-white/15">
              <ImagePlus className="w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-110" strokeWidth={1.8} />
            </div>
            <div className="w-7 h-7 rounded-full bg-white/10 hover:bg-white text-white hover:text-[#181416] border border-white/10 flex items-center justify-center transition-all duration-200 shadow-2xs">
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.25} />
            </div>
          </div>
          <div className="relative z-10 mt-3">
            <h3 className="font-semibold text-xs sm:text-sm text-white leading-tight truncate">
              Extract Inspo
            </h3>
            <p className="text-[10px] sm:text-[11px] text-stone-300 mt-0.5 truncate font-normal">
              From Pinterest or photos
            </p>
          </div>
        </div>

        {/* Station 3: Saved Looks - WHOLE CARD SOFT BRAND ROSE BLUSH */}
        <div
          onClick={() => {
            if (onFavoritesClick) {
              onFavoritesClick();
            } else if (onExploreClick) {
              onExploreClick();
            }
          }}
          className="group relative overflow-hidden p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-[#FDF2F8] hover:bg-[#FCE7F3] border border-[#FCE7F3] hover:border-[#E0246A]/40 transition-all duration-300 shadow-[0_2px_8px_rgba(224,36,106,0.04)] hover:shadow-[0_8px_24px_rgba(224,36,106,0.12)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] cursor-pointer flex flex-col justify-between min-h-[110px] sm:min-h-[122px]"
        >
          <div className="flex items-center justify-between relative z-10">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white text-[#E0246A] border border-pink-100 flex items-center justify-center shadow-2xs transition-all duration-300 ease-out group-hover:scale-105">
              <Heart className="w-4.5 h-4.5 sm:w-5 sm:h-5 transition-all duration-300 ease-out group-hover:scale-115 group-hover:fill-[#E0246A]" strokeWidth={2} />
            </div>
            <div className="w-7 h-7 rounded-full bg-white group-hover:bg-[#E0246A] text-[#E0246A] group-hover:text-white border border-pink-100 flex items-center justify-center transition-all duration-200 shadow-2xs">
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2} />
            </div>
          </div>
          <div className="relative z-10 mt-3">
            <h3 className="font-semibold text-xs sm:text-sm text-stone-900 group-hover:text-[#E0246A] transition-colors leading-tight truncate">
              Saved Looks
            </h3>
            <p className="text-[10px] sm:text-[11px] text-stone-500 mt-0.5 truncate font-normal">
              Your saved manicures
            </p>
          </div>
        </div>

        {/* Station 4: Explore Pins - BRAND PINK ACCENT CARD */}
        <div
          onClick={() => onExploreClick?.()}
          className="group relative overflow-hidden p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white hover:bg-[#FFF5F8] border border-stone-200/90 hover:border-[#E0246A]/40 transition-all duration-300 shadow-[0_2px_8px_rgba(224,36,106,0.04)] hover:shadow-[0_8px_24px_rgba(224,36,106,0.12)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] cursor-pointer flex flex-col justify-between min-h-[110px] sm:min-h-[122px]"
        >
          <div className="flex items-center justify-between relative z-10">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#E0246A] to-[#BE185D] text-white flex items-center justify-center shadow-[0_2px_10px_rgba(224,36,106,0.22)] transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-[0_4px_14px_rgba(224,36,106,0.35)]">
              <Compass className="w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform duration-500 ease-out group-hover:rotate-45 group-hover:scale-110" strokeWidth={2} />
            </div>
            <div className="w-7 h-7 rounded-full bg-pink-50 group-hover:bg-[#E0246A] text-[#E0246A] group-hover:text-white border border-pink-100/80 flex items-center justify-center transition-all duration-200 shadow-2xs">
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.25} />
            </div>
          </div>
          <div className="relative z-10 mt-3">
            <h3 className="font-semibold text-xs sm:text-sm text-stone-900 group-hover:text-[#E0246A] transition-colors leading-tight truncate">
              Explore Pins
            </h3>
            <p className="text-[10px] sm:text-[11px] text-stone-500 group-hover:text-[#BE185D] transition-colors mt-0.5 truncate font-normal">
              Trending discovery
            </p>
          </div>
        </div>
      </div>

      {/* 4. Curated Inspiration - Minimal Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-stone-900 tracking-tight">
              Inspiration
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => scrollCarousel('left')}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs"
              title="Previous"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel('right')}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs"
              title="Next"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {onExploreClick && (
              <button
                type="button"
                onClick={() => onExploreClick()}
                className="text-xs font-semibold text-[#E0246A] hover:text-[#BE185D] inline-flex items-center gap-0.5 cursor-pointer transition active:scale-95 py-1 px-2 rounded-lg hover:bg-pink-50"
              >
                <span>See All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Featured Editorial Manicure Cards - Generous Large Cards */}
        <div
          ref={carouselRef}
          className="flex gap-3.5 sm:gap-5 overflow-x-auto scrollbar-none py-2 px-1 snap-x snap-mandatory scroll-smooth"
        >
          {displayedLooks.map((look) => (
            <div
              key={look.id}
              onClick={() => {
                onSelectExploreDesign?.(look.id);
                onTryOnClick();
              }}
              className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-end aspect-[3/4.2] w-[230px] xs:w-[250px] sm:w-[280px] lg:w-[320px] shrink-0 snap-start"
            >
              <img
                src={look.photoUrl}
                alt={look.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

              {/* Top Category Badge */}
              <div className="absolute top-3 left-3 sm:top-3.5 sm:left-3.5 z-10">
                <span className="px-2.5 sm:px-3 py-1 rounded-full bg-black/55 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-semibold capitalize border border-white/15 shadow-2xs">
                  {look.displayCategory}
                </span>
              </div>

              {/* Bottom Details & 1-Tap Try On */}
              <div className="relative z-10 p-3 sm:p-4 space-y-2 sm:space-y-2.5">
                <div>
                  <h4 className="text-white text-sm sm:text-base font-semibold leading-tight drop-shadow-md line-clamp-1 group-hover:text-pink-100 transition-colors">
                    {look.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-stone-200 mt-0.5 capitalize">
                    {look.shape} · {look.finish}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectExploreDesign?.(look.id);
                    onTryOnClick();
                  }}
                  className="w-full h-9 sm:h-10 rounded-xl sm:rounded-2xl bg-white hover:bg-stone-50 text-stone-900 text-xs sm:text-[13px] font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 sm:gap-2 transition active:scale-95 cursor-pointer"
                >
                  <Hand className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E0246A]" strokeWidth={2} />
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
                    <Hand className="w-4 h-4" />
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
