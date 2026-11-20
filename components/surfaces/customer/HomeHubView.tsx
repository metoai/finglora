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
} from 'lucide-react';
import { ExploreDesignSet, Finger, NailDesign, NailShape } from '@/types/nail';
import { INITIAL_EXPLORE_DESIGNS, HAND_SKIN_TONES, CURATED_EDITORIAL_DESIGNS } from '@/constants/nail-data';
import { HandCameraCaptureModal } from '@/components/common/HandCameraCaptureModal';

const CATEGORY_TABS = ['All', 'French', 'Glazed', 'Aura', 'Minimal'];

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
  const [activeCategory, setActiveCategory] = useState('All');
  const [promptText, setPromptText] = useState(aiStudioPrompt || '');
  const [isHandModalOpen, setIsHandModalOpen] = useState(false);
  const [isCameraCaptureOpen, setIsCameraCaptureOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const handFileInputRef = useRef<HTMLInputElement | null>(null);

  // High-fashion editorial photography only: filter out salon table/drill/gravel photos and polish titles
  const designs = useMemo(() => {
    const rawList = exploreDesigns?.filter((d) => {
      const url = d.photoUrl || '';
      return (
        !url.includes('unsplash.com') &&
        !url.includes('photo-1604654894610') &&
        !url.includes('photo-1607779097040') &&
        !url.includes('photo-1632345031435') &&
        !url.includes('imagefes.jpeg') &&
        !url.includes('images22.jpeg') &&
        !url.includes('1795176925816_images.jpeg') &&
        !url.includes('1795127479510_images.jpeg') &&
        !url.includes('ar-nail-hero.jpg')
      );
    });

    // If rawList has fewer than 8 designs, fallback to our curated 8-design luxury set
    const list = rawList && rawList.length >= 8 ? rawList : CURATED_EDITORIAL_DESIGNS;

    return list.map((d) => {
      let title = d.title || 'Atelier Set';
      if (title === 'AI Extracted Manicure') title = 'French Chrome Rose';
      if (title.startsWith("L'Atelier ")) title = title.replace("L'Atelier ", '');

      const photoUrl = d.photoUrl || '/assets/milky_gold_tryon_result.jpg';

      return {
        ...d,
        title,
        photoUrl,
      };
    });
  }, [exploreDesigns]);

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
      setTimeout(() => {
        document.getElementById('inspiration-feed')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
      showToast('Hand saved! Select an inspiration look below to try on');
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
      const cat = (d.category || '').toLowerCase();
      const title = (d.title || '').toLowerCase();
      const target = activeCategory.toLowerCase();
      return cat.includes(target) || title.includes(target);
    });
  }, [designs, activeCategory]);

  return (
    <div className="space-y-3.5 sm:space-y-4 w-full max-w-[1300px] pb-6">
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
      {/* 2. SYMMETRICAL ACTION CARDS (MY HAND & EXTRACT INSPO)              */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Card 1: My Hand Photo (Rule: Always 1st Option = Upload, 2nd = Camera) */}
        <button
          type="button"
          onClick={() => setIsHandModalOpen(true)}
          className="p-3 rounded-2xl bg-white hover:bg-stone-50/70 border border-stone-200/80 hover:border-[#E0246A]/40 text-left transition-all duration-200 shadow-2xs cursor-pointer group active:scale-[0.98] flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#FDF2F8] text-[#E0246A] flex items-center justify-center shrink-0 shadow-2xs">
              <Hand className="w-4.5 h-4.5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-[#E0246A] transition-colors truncate">
                My Hand
              </div>
              <div className="text-[10px] text-stone-400 font-medium">
                {customTryOnHandUrl ? 'Saved' : 'Upload'}
              </div>
            </div>
          </div>

          {customTryOnHandUrl ? (
            <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3" strokeWidth={2.5} />
            </span>
          ) : (
            <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#E0246A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition shrink-0" />
          )}
        </button>

        {/* Card 2: Extract Inspo Photo */}
        <button
          type="button"
          onClick={onUploadClick}
          className="p-3 rounded-2xl bg-white hover:bg-stone-50/70 border border-stone-200/80 hover:border-[#E0246A]/40 text-left transition-all duration-200 shadow-2xs cursor-pointer group active:scale-[0.98] flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#FDF2F8] text-[#E0246A] flex items-center justify-center shrink-0 shadow-2xs">
              <ImagePlus className="w-4.5 h-4.5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-[#E0246A] transition-colors truncate">
                Extract Inspo
              </div>
              <div className="text-[10px] text-stone-400 font-medium">
                Pinterest · IG
              </div>
            </div>
          </div>

          <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#E0246A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition shrink-0" />
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. SLEEK STUDIO PROMPT GENERATION BAR                              */}
      {/* ------------------------------------------------------------------ */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleGenerate();
        }}
        className="bg-white rounded-2xl border border-stone-200/80 pl-3.5 pr-2 py-2 shadow-2xs focus-within:border-[#E0246A] focus-within:ring-1 focus-within:ring-[#E0246A]/20 transition flex items-center gap-2.5"
      >
        <Sparkles className="w-4 h-4 text-[#E0246A] shrink-0" />

        <input
          type="text"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Describe any look or aesthetic..."
          className="flex-1 bg-transparent border-none text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none min-w-0 leading-normal"
        />

        <button
          type="submit"
          className="h-8 px-3 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold inline-flex items-center gap-1 active:scale-95 shadow-xs shrink-0 cursor-pointer transition"
          title="Generate look"
        >
          <span>Create</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* ------------------------------------------------------------------ */}
      {/* 4. CURATED INSPIRATION (HIGH CONVERSION & FAST ACTION)             */}
      {/* ------------------------------------------------------------------ */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg sm:text-xl font-normal text-stone-900 tracking-tight">
              Inspiration
            </h2>
            {customTryOnHandUrl && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-medium inline-flex items-center gap-1">
                <Check className="w-2.5 h-2.5" />
                <span>Hand Ready</span>
              </span>
            )}
          </div>

          {onExploreClick && (
            <button
              type="button"
              onClick={onExploreClick}
              className="h-7 px-2.5 rounded-lg text-xs font-medium text-stone-600 hover:text-[#E0246A] hover:bg-stone-100 transition inline-flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Compact Category Filter Tabs */}
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

        {/* Responsive Editorial Manicure Grid (Exactly 2 Rows: 4 on mobile, 6 on tablet, 8 on desktop) */}
        <div
          id="inspiration-feed"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5 pb-8 scroll-mt-4"
        >
          {filteredDesigns.slice(0, 8).map((design, index) => {
            const isActive = design.id === activeSample?.id;
            const primaryFinger = design.nails?.middle || design.nails?.index;
            const shapeLabel = primaryFinger?.shape || 'almond';

            // 2 rows limit: 4 cards on mobile (<sm: 2 cols x 2 rows), 6 on tablet (sm-lg: 3 cols x 2 rows), 8 on desktop (>=lg: 4 cols x 2 rows)
            const hideClass =
              index >= 6 ? 'hidden lg:block' : index >= 4 ? 'hidden sm:block' : '';

            return (
              <div
                key={design.id}
                onClick={() => {
                  onSelectExploreDesign?.(design.id);
                  onTryOnClick();
                }}
                className={`group relative rounded-2xl overflow-hidden border transition-all duration-200 text-left cursor-pointer active:scale-[0.98] aspect-[3/4] bg-stone-100 ${hideClass} ${
                  isActive
                    ? 'border-[#E0246A] ring-2 ring-[#E0246A]/25 shadow-sm'
                    : 'border-stone-200/80 hover:border-stone-300 shadow-2xs'
                }`}
              >
                <img
                  src={design.photoUrl || '/assets/milky_gold_tryon_result.jpg'}
                  alt={design.title || 'Manicure Design'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

                {/* Top Shape Badge */}
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded-full bg-black/40 text-white text-[10px] font-medium backdrop-blur-xs capitalize">
                    {shapeLabel}
                  </span>
                </div>

                {/* Bottom Card Scrim & Try-On Action */}
                <div className="absolute inset-x-2.5 bottom-2.5 space-y-1.5 sm:space-y-2">
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
                    className="w-full h-8 sm:h-8.5 rounded-xl bg-white/95 hover:bg-white text-stone-900 text-xs font-semibold shadow-xs backdrop-blur-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Hand className="w-3.5 h-3.5 text-[#E0246A]" strokeWidth={2} />
                    <span>{customTryOnHandUrl ? 'Try on My Hand' : 'Try On'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDesigns.length === 0 && (
          <div className="py-10 text-center space-y-2 bg-white rounded-2xl border border-stone-200/80 p-6">
            <p className="text-xs text-stone-500">No manicures found in this category.</p>
            <button
              type="button"
              onClick={() => setActiveCategory('All')}
              className="text-xs font-semibold text-[#E0246A] hover:underline cursor-pointer"
            >
              Show all designs
            </button>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 5. MODAL: SAVE HAND PHOTO (STRICT: 1ST = UPLOAD, 2ND = CAMERA)     */}
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
                  {/* Primary CTA: Choose Look from Inspiration */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsHandModalOpen(false);
                      setTimeout(() => {
                        document.getElementById('inspiration-feed')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                      showToast('Select any manicure below to try on your hand');
                    }}
                    className="w-full h-11 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Choose Look from Inspiration</span>
                  </button>

                  {/* Secondary CTA: Direct Virtual Try-On */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsHandModalOpen(false);
                      onTryOnClick();
                    }}
                    className="w-full h-10 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-semibold shadow-2xs transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Hand className="w-3.5 h-3.5 text-[#E0246A]" />
                    <span>Open Virtual Try-On</span>
                  </button>

                  {/* Symmetrical 2-Column: 1st Option = Upload, 2nd Option = Camera */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handFileInputRef.current?.click()}
                      className="h-9 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-2xs"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-stone-600" />
                      <span>Upload New</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCameraCaptureOpen(true)}
                      className="h-9 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-2xs"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#E0246A]" />
                      <span>Camera</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveHandPhoto}
                    className="w-full h-7 text-[11px] text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove hand photo</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="aspect-[4/3] w-full rounded-2xl border border-dashed border-stone-200 bg-[#FAF8F5] flex flex-col items-center justify-center p-5 text-center space-y-2">
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
          setIsHandModalOpen(false);
          setIsCameraCaptureOpen(false);
          setTimeout(() => {
            document.getElementById('inspiration-feed')?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
          showToast('Hand saved! Select an inspiration look below to try on');
        }}
        onUploadFileFallback={(file) => {
          handleHandPhotoUpload(file);
        }}
      />
    </div>
  );
}
