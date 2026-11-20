'use client';

import React, { useState, useRef, useMemo } from 'react';
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
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { ExploreDesignSet, Finger, NailDesign, NailShape } from '@/types/nail';
import { INITIAL_EXPLORE_DESIGNS, FINGER_LABELS, HAND_SKIN_TONES } from '@/constants/nail-data';
import { NailCanvasPreview } from '@/components/visuals/NailCanvasPreview';
import { HandCameraCaptureModal } from '@/components/common/HandCameraCaptureModal';

const PROMPT_SUGGESTIONS = [
  'Glazed Pearl',
  'Micro-French',
  'Velvet Aura',
  'Tortoiseshell',
  'Bordeaux Lacquer',
  'Clean Girl Sheer',
];

const CATEGORY_TABS = ['All', 'French', 'Glazed', 'Aura', 'Minimalist'];

function createFallbackSet(
  id: string,
  title: string,
  category: string,
  photoUrl: string,
  baseColor: string,
  accentColor: string,
  pattern: any,
  finish: any = 'glossy'
): ExploreDesignSet {
  const fingerNail = (finger: Finger): NailDesign => ({
    finger,
    title,
    baseColor,
    accentColor,
    pattern,
    shape: 'almond',
    length: 'medium',
    finish,
    clientNote: `${title} bespoke atelier look`,
    status: 'detected',
  });

  return {
    id,
    passportCode: `FGL-${id.slice(-4).toUpperCase()}`,
    title,
    category,
    subtitle: `${category} · Almond · Atelier Finish`,
    photoUrl,
    likes: 128,
    isSaved: false,
    skinTone: HAND_SKIN_TONES[0],
    backdrop: '#FAF7F2',
    chairMinutes: 65,
    nails: {
      thumb: fingerNail('thumb'),
      index: fingerNail('index'),
      middle: fingerNail('middle'),
      ring: fingerNail('ring'),
      pinky: fingerNail('pinky'),
    },
  };
}

const FALLBACK_CURATED_DESIGNS: ExploreDesignSet[] = [
  createFallbackSet(
    'set-milky-gold',
    'Milky Glazed Gold',
    'Glazed',
    '/assets/milky_gold_tryon_result.jpg',
    '#F5ECE3',
    '#D4AF37',
    'aura',
    'chrome'
  ),
  createFallbackSet(
    'set-blush-heart',
    'Blush Heart French',
    'French',
    '/assets/pink_heart_tryon_result.jpg',
    '#FCE7F3',
    '#E0246A',
    'heart-french',
    'glossy'
  ),
  createFallbackSet(
    'set-burgundy-aura',
    'Burgundy Velvet Aura',
    'Aura',
    '/assets/burgundy_gold_virtual_tryon.jpg',
    '#FAF0EA',
    '#801A35',
    'aura',
    'glossy'
  ),
  createFallbackSet(
    'set-editorial-nude',
    'Atelier Nude Minimal',
    'Minimalist',
    '/assets/editorial_nail_hero.jpg',
    '#FAF0EA',
    '#FFFFFF',
    'solid',
    'glossy'
  ),
];

export function HomeHubView({
  userName,
  preferredShape,
  activeSample,
  activePhotoUrl,
  activeSetName,
  orderedFingers,
  nails,
  aiStudioPrompt,
  setAiStudioPrompt,
  mobilePreview,
  exploreDesigns = INITIAL_EXPLORE_DESIGNS,
  onSelectExploreDesign,
  onTuneVibeClick,
  onSelectFinger,
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
  activeSample: ExploreDesignSet;
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
  onExploreClick?: () => void;
  onCreatePromptClick?: (prompt: string) => void;
  customTryOnHandUrl?: string | null;
  setCustomTryOnHandUrl?: (url: string | null) => void;
}) {
  const designs = useMemo(() => {
    return exploreDesigns?.length ? exploreDesigns : FALLBACK_CURATED_DESIGNS;
  }, [exploreDesigns]);

  const [activeCategory, setActiveCategory] = useState('All');
  const [promptText, setPromptText] = useState(aiStudioPrompt || '');
  const [isHandModalOpen, setIsHandModalOpen] = useState(false);
  const [isCameraCaptureOpen, setIsCameraCaptureOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const handFileInputRef = useRef<HTMLInputElement | null>(null);

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
      showToast('Hand photo saved for instant try-on');
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

  // Filter curated designs by active category
  const filteredDesigns = useMemo(() => {
    if (activeCategory === 'All') return designs;
    return designs.filter((d) => {
      const cat = d.category || '';
      const title = d.title || '';
      return (
        cat.toLowerCase().includes(activeCategory.toLowerCase()) ||
        title.toLowerCase().includes(activeCategory.toLowerCase())
      );
    });
  }, [designs, activeCategory]);

  // Derived active manicure look specs
  const middleNail = nails?.middle || nails?.index;
  const currentShape = middleNail?.shape || preferredShape || 'almond';
  const currentFinish = middleNail?.finish || 'glossy';

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-[1300px] pb-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
          <div className="bg-[#1F1A1C] text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg border border-white/10 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Check className="w-3.5 h-3.5 text-[#E0246A]" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 1. ATELIER STATUS & REFINED GREETING BAR                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center justify-between px-0.5">
        <div>
          <div className="text-[10px] font-mono tracking-wider uppercase text-stone-600 font-medium">
            Finglora Atelier
          </div>
          <h1 className="font-serif text-xl sm:text-2xl text-stone-900 font-normal tracking-tight mt-0.5">
            {userName ? `Welcome, ${userName}` : 'Personal Atelier'}
          </h1>
        </div>

        {/* Preferred Shape Calibration Pill */}
        <button
          type="button"
          onClick={onTuneVibeClick}
          className="h-8 px-3 rounded-full bg-white border border-stone-200 hover:border-stone-300 text-stone-700 text-xs font-medium inline-flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-2xs"
          title="Change preferred nail shape"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#E0246A]" />
          <span className="capitalize">{preferredShape || 'Almond'}</span>
          <span className="text-stone-300">/</span>
          <span className="text-[11px] text-stone-500 font-normal">Shape</span>
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. FLAGSHIP CENTERPIECE: ACTIVE MANICURE STUDIO CARD               */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-white rounded-3xl border border-stone-200/80 p-4 sm:p-5 shadow-2xs space-y-4">
        {/* Card Header: Set Name & Specs */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-600 font-medium">
                Active Look
              </span>
              {customTryOnHandUrl && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 inline-flex items-center gap-1">
                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                  <span>On Your Hand</span>
                </span>
              )}
            </div>
            <h2 className="font-serif text-lg sm:text-xl font-normal text-stone-900 truncate tracking-tight mt-0.5">
              {activeSetName || 'Glazed Pearl Almond'}
            </h2>
          </div>

          <div className="shrink-0 text-right">
            <span className="text-[11px] text-stone-500 font-medium capitalize">
              {currentShape} · {currentFinish}
            </span>
          </div>
        </div>

        {/* 5-Finger Tactile Visual Workbench */}
        <div className="pt-2 pb-1">
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5 items-end justify-items-center bg-[#FAF8F5] rounded-2xl p-3 sm:p-4 border border-stone-200/60">
            {orderedFingers.map((fk) => {
              const nail = nails[fk];
              // Anatomical visual height scale
              const heightMap: Record<Finger, number> = {
                thumb: 60,
                index: 68,
                middle: 74,
                ring: 70,
                pinky: 54,
              };
              const widthMap: Record<Finger, number> = {
                thumb: 40,
                index: 38,
                middle: 40,
                ring: 38,
                pinky: 34,
              };

              return (
                <button
                  key={fk}
                  type="button"
                  onClick={() => onSelectFinger(fk)}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none"
                  title={`Inspect ${FINGER_LABELS[fk]}`}
                >
                  <div className="transition-transform group-hover:scale-105 group-active:scale-95 duration-150">
                    <NailCanvasPreview
                      nail={nail}
                      width={widthMap[fk]}
                      height={heightMap[fk]}
                      showCuticle={true}
                    />
                  </div>
                  <span className="text-[10px] font-mono uppercase text-stone-600 font-medium">
                    {FINGER_LABELS[fk].slice(0, 3)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls: 1st Option = Try On, 2nd Option = Studio / Hand */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={onTryOnClick}
            className="h-11 px-3 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-semibold transition inline-flex items-center justify-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
          >
            <Hand className="w-4 h-4 shrink-0" />
            <span className="truncate">Virtual Try-On</span>
          </button>

          <button
            type="button"
            onClick={onCustomizeClick}
            className="h-11 px-3 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 hover:border-stone-300 text-xs sm:text-sm font-medium transition inline-flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-2xs"
          >
            <Sliders className="w-4 h-4 text-stone-600 shrink-0" />
            <span className="truncate">Customize Look</span>
          </button>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. SYMMETRICAL STUDIO VERB CARDS (MY HAND & INSPIRATION)           */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
        {/* Card 1: My Hand Photo (Rule: Always 1st Option = Upload, 2nd = Camera) */}
        <button
          type="button"
          onClick={() => setIsHandModalOpen(true)}
          className="p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-[#FAF8F5] border border-stone-200/80 hover:border-[#E0246A]/40 text-left transition duration-200 shadow-2xs flex flex-col justify-between min-h-[96px] cursor-pointer group active:scale-[0.98]"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-8 h-8 rounded-xl bg-[#FDF2F8] text-[#E0246A] flex items-center justify-center transition shadow-2xs">
              <Hand className="w-4 h-4" strokeWidth={1.75} />
            </div>

            {customTryOnHandUrl ? (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                <Check className="w-2.5 h-2.5 text-emerald-600" />
                <span>Saved</span>
              </span>
            ) : (
              <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#E0246A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            )}
          </div>

          <div className="mt-2.5">
            <div className="text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-[#E0246A] transition-colors tracking-tight">
              {customTryOnHandUrl ? 'My Hand Photo' : 'Save Hand Photo'}
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5 leading-tight truncate">
              {customTryOnHandUrl ? '1-tap instant try-on ready' : 'Upload or camera capture'}
            </div>
          </div>
        </button>

        {/* Card 2: Extract from Inspiration Photo */}
        <button
          type="button"
          onClick={onUploadClick}
          className="p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-[#FAF8F5] border border-stone-200/80 hover:border-[#E0246A]/40 text-left transition duration-200 shadow-2xs flex flex-col justify-between min-h-[96px] cursor-pointer group active:scale-[0.98]"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-8 h-8 rounded-xl bg-[#FDF2F8] text-[#E0246A] flex items-center justify-center transition shadow-2xs">
              <ImagePlus className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#E0246A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>

          <div className="mt-2.5">
            <div className="text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-[#E0246A] transition-colors tracking-tight">
              Extract from Photo
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5 leading-tight truncate">
              Decode Pinterest or IG inspo
            </div>
          </div>
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 4. REFINED ATELIER CREATION BAR ("DESCRIBE YOUR DESIGN")           */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-white rounded-3xl border border-stone-200/80 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E0246A]" />
            <h2 className="text-xs sm:text-sm font-semibold text-stone-900 tracking-tight">
              Describe Your Look
            </h2>
          </div>
          <span className="text-[11px] text-stone-500">
            Tailored to {preferredShape || 'Almond'}
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate();
          }}
          className="flex items-center gap-2 bg-[#FAF8F5] rounded-xl border border-stone-200/80 px-3 py-1.5 focus-within:border-[#E0246A] focus-within:ring-1 focus-within:ring-[#E0246A]/20 transition"
        >
          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="e.g. sheer blush almond with glazed chrome tips..."
            className="flex-1 bg-transparent border-none text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none min-w-0"
          />

          <button
            type="submit"
            className="h-8 px-3.5 rounded-lg bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold inline-flex items-center gap-1 transition shadow-xs cursor-pointer shrink-0 active:scale-95"
          >
            <span>Create</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </form>

        {/* Curated Aesthetic Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 -mx-1 px-1">
          {PROMPT_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                setPromptText(suggestion);
                handleGenerate(suggestion);
              }}
              className="px-2.5 py-1 rounded-full text-[11px] bg-white hover:bg-[#FDF2F8] hover:text-[#E0246A] border border-stone-200/80 text-stone-600 transition cursor-pointer shrink-0 font-medium shadow-2xs active:scale-95"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 5. CURATED INSPIRATION CAROUSEL (MOBILE & DESKTOP)                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-normal text-stone-900 tracking-tight">
              Curated Inspiration
            </h2>
            <p className="text-[11px] text-stone-500">
              Handcrafted sets ready to try on instantly
            </p>
          </div>

          {onExploreClick && (
            <button
              type="button"
              onClick={onExploreClick}
              className="h-8 px-3 rounded-lg text-xs font-medium text-stone-800 hover:text-[#E0246A] hover:bg-stone-100 transition inline-flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 -mx-1 px-1">
          {CATEGORY_TABS.map((tab) => {
            const active = activeCategory === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveCategory(tab)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer shrink-0 active:scale-95 ${
                  active
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Mobile Horizontal Carousel */}
        <div className="flex lg:hidden items-center gap-3 overflow-x-auto pb-2 scrollbar-none -mx-2 px-2 snap-x snap-mandatory scroll-smooth">
          {filteredDesigns.map((design) => {
            const isActive = design.id === activeSample?.id;
            const primaryFinger = design.nails?.middle || design.nails?.index;
            const shapeLabel = primaryFinger?.shape || 'almond';

            return (
              <div
                key={design.id}
                onClick={() => onSelectExploreDesign?.(design.id)}
                className={`group relative rounded-2xl overflow-hidden border transition-all duration-200 text-left shrink-0 cursor-pointer snap-start active:scale-[0.98] w-48 sm:w-56 h-64 sm:h-72 bg-stone-100 ${
                  isActive
                    ? 'border-[#E0246A] ring-2 ring-[#E0246A]/25 shadow-sm'
                    : 'border-stone-200/80 hover:border-stone-300 shadow-2xs'
                }`}
              >
                <img
                  src={design.photoUrl || '/assets/editorial_nail_hero.jpg'}
                  alt={design.title || 'Manicure Design'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent pointer-events-none" />

                {/* Top Shape Badge */}
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded-full bg-black/45 text-white text-[10px] font-medium backdrop-blur-xs capitalize">
                    {shapeLabel}
                  </span>
                </div>

                {/* Bottom Card Scrim & Try-On Action */}
                <div className="absolute inset-x-2.5 bottom-2.5 space-y-1.5">
                  <div className="text-white text-xs font-medium leading-tight truncate drop-shadow-xs">
                    {design.title}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectExploreDesign?.(design.id);
                      onTryOnClick();
                    }}
                    className="w-full h-8.5 rounded-xl bg-white/95 hover:bg-white text-stone-900 text-xs font-semibold shadow-xs backdrop-blur-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Hand className="w-3.5 h-3.5 text-[#E0246A]" strokeWidth={1.75} />
                    <span>Try On</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDesigns.slice(0, 8).map((design) => {
            const isActive = design.id === activeSample?.id;
            const primaryFinger = design.nails?.middle || design.nails?.index;
            const shapeLabel = primaryFinger?.shape || 'almond';

            return (
              <div
                key={design.id}
                onClick={() => onSelectExploreDesign?.(design.id)}
                className={`group relative rounded-2xl overflow-hidden border transition-all duration-200 text-left cursor-pointer active:scale-[0.98] h-72 bg-stone-100 ${
                  isActive
                    ? 'border-[#E0246A] ring-2 ring-[#E0246A]/25 shadow-sm'
                    : 'border-stone-200/80 hover:border-stone-300 shadow-2xs'
                }`}
              >
                <img
                  src={design.photoUrl || '/assets/editorial_nail_hero.jpg'}
                  alt={design.title || 'Manicure Design'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent pointer-events-none" />

                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded-full bg-black/45 text-white text-[10px] font-medium backdrop-blur-xs capitalize">
                    {shapeLabel}
                  </span>
                </div>

                <div className="absolute inset-x-3 bottom-3 space-y-2">
                  <div className="text-white text-xs font-medium leading-tight truncate drop-shadow-xs">
                    {design.title}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectExploreDesign?.(design.id);
                      onTryOnClick();
                    }}
                    className="w-full h-8.5 rounded-xl bg-white/95 hover:bg-white text-stone-900 text-xs font-semibold shadow-xs backdrop-blur-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Hand className="w-3.5 h-3.5 text-[#E0246A]" strokeWidth={1.75} />
                    <span>Try On</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 6. MODAL: SAVE HAND PHOTO (STRICT: 1ST = UPLOAD, 2ND = CAMERA)     */}
      {/* ------------------------------------------------------------------ */}
      {isHandModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-normal text-stone-900">
                  Your Hand Photo
                </h3>
                <p className="text-[11px] text-stone-500">
                  Save once to preview all atelier manicures instantly
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
                    <span>Saved on Your Hand</span>
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
                    <span>Open in Virtual Try-On</span>
                  </button>

                  {/* Symmetrical 2-Column: 1st Option = Upload, 2nd Option = Camera */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handFileInputRef.current?.click()}
                      className="h-10 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-2xs"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-stone-600" />
                      <span>Upload New</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCameraCaptureOpen(true)}
                      className="h-10 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-2xs"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#E0246A]" />
                      <span>Camera</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveHandPhoto}
                    className="w-full h-8 text-[11px] text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove saved hand photo</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="aspect-[4/3] w-full rounded-2xl border-2 border-dashed border-stone-200 bg-[#FAF8F5] flex flex-col items-center justify-center p-5 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#FDF2F8] text-[#E0246A] flex items-center justify-center shadow-2xs">
                    <Hand className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-stone-900">Your Hand Photo</p>
                    <p className="text-[10px] text-stone-500 mt-0.5">
                      Upload from files or capture with camera
                    </p>
                  </div>
                </div>

                {/* Symmetrical 2-Column: 1st Option = Upload, 2nd Option = Camera */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handFileInputRef.current?.click()}
                    className="h-11 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCameraCaptureOpen(true)}
                    className="h-11 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs sm:text-sm font-medium transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-2xs"
                  >
                    <Camera className="w-4 h-4 text-[#E0246A]" />
                    <span>Camera</span>
                  </button>
                </div>

                <p className="text-[11px] text-stone-500 text-center leading-relaxed">
                  Saved once so every look in the atelier will instantly render onto your own hand.
                </p>
              </div>
            )}

            <input
              type="file"
              ref={handFileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleHandPhotoUpload(file);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Live Hand Camera Capture Modal */}
      <HandCameraCaptureModal
        isOpen={isCameraCaptureOpen}
        onClose={() => setIsCameraCaptureOpen(false)}
        onCaptureHand={(dataUrl) => {
          if (setCustomTryOnHandUrl) {
            setCustomTryOnHandUrl(dataUrl);
          }
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem('finglora_custom_hand_photo', dataUrl);
              localStorage.setItem('finglora_user_hand_photo', dataUrl);
            }
          } catch {}
          showToast('Hand photo saved for instant try-on');
        }}
        onUploadFileFallback={(file) => {
          handleHandPhotoUpload(file);
        }}
      />
    </div>
  );
}
