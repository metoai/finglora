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
} from 'lucide-react';
import { ExploreDesignSet, Finger, NailDesign, NailShape } from '@/types/nail';
import { INITIAL_EXPLORE_DESIGNS } from '@/constants/nail-data';
import { HandCameraCaptureModal } from '@/components/common/HandCameraCaptureModal';

const PROMPT_SUGGESTIONS = [
  'Glazed pearl',
  'Micro-French',
  'Velvet aura',
  'Tortoiseshell',
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
  const designs = exploreDesigns?.length ? exploreDesigns : INITIAL_EXPLORE_DESIGNS;
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
    const text = suggestion || promptText || 'Glazed Pearl Chrome Almond';
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
        }
      } catch {
        // quota safety
      }
      showToast('My Hand photo saved — ready for 1-tap try-on');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveHandPhoto = () => {
    if (setCustomTryOnHandUrl) {
      setCustomTryOnHandUrl(null);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('finglora_custom_hand_photo');
    }
    showToast('Hand photo removed');
  };

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-[1300px]">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
          <div className="bg-[#281720] text-white text-xs font-medium px-4 py-2 rounded-full shadow-xl border border-white/10 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Check className="w-3.5 h-3.5 text-[#D6336C]" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* 1. Header & Minimal Prompt Input */}
      <div className="space-y-3">
        <div className="px-0.5">
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 font-medium tracking-tight">
            Create with AI
          </h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate();
          }}
          className="flex flex-col justify-between bg-white rounded-2xl border border-stone-200/80 focus-within:border-[#E0246A] focus-within:ring-1 focus-within:ring-[#E0246A]/20 transition-colors p-4 sm:p-5 shadow-xs min-h-[135px] sm:min-h-[150px]"
        >
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            placeholder="Describe your design (e.g. sheer blush almond nails with delicate chrome tips)..."
            className="w-full flex-1 bg-transparent border-none text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none resize-none leading-relaxed"
            rows={3}
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-auto border-t border-stone-100">
            {/* Clean Minimal Suggestion Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              {PROMPT_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setPromptText(suggestion);
                  }}
                  className="px-3 py-1 rounded-full text-[11px] sm:text-xs bg-[#FAF8F6] hover:bg-[#FDF2F8] hover:text-[#E0246A] border border-stone-200/80 text-stone-600 transition-colors cursor-pointer shrink-0 font-medium"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 ml-auto active:scale-95"
            >
              <span>Create</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* 2. Primary Action Cards: "Upload My Hand" (Replaced from Try-On) & "Upload Inspo" */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Card 1: Upload My Hand */}
        <button
          type="button"
          onClick={() => setIsHandModalOpen(true)}
          className="group relative p-4 sm:p-5 rounded-2xl bg-[#E0246A] hover:bg-[#BE185D] text-white transition-all duration-300 text-left shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer flex flex-col justify-between min-h-[96px] sm:min-h-[104px] active:scale-[0.98]"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center transition-all duration-300 shadow-2xs">
              <Hand className="w-4.5 h-4.5" strokeWidth={1.75} />
            </div>
            {customTryOnHandUrl ? (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/25 text-white backdrop-blur-xs flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>Saved</span>
              </span>
            ) : (
              <ArrowUpRight className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" strokeWidth={1.5} />
            )}
          </div>

          <div>
            <div className="text-xs sm:text-sm font-semibold text-white tracking-tight">
              {customTryOnHandUrl ? 'My Hand' : 'Upload My Hand'}
            </div>
            <div className="text-[10px] text-white/85 mt-0.5 truncate leading-tight">
              {customTryOnHandUrl
                ? 'Ready for instant 1-tap try-on'
                : 'Upload once for instant try-on'}
            </div>
          </div>
        </button>

        {/* Card 2: Upload Inspo */}
        <button
          type="button"
          onClick={onUploadClick}
          className="group relative p-4 sm:p-5 rounded-2xl bg-white hover:bg-[#FAF9F6] border border-black/[0.08] hover:border-[#E0246A]/50 transition-all duration-300 text-left shadow-2xs hover:shadow-md hover:-translate-y-1 cursor-pointer flex flex-col justify-between min-h-[96px] sm:min-h-[104px] active:scale-[0.98]"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-9 h-9 rounded-xl bg-[#FDF2F8] text-[#E0246A] group-hover:bg-[#E0246A] group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-2xs">
              <ImagePlus className="w-4.5 h-4.5" strokeWidth={1.75} />
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#8C8085] opacity-40 group-hover:opacity-100 group-hover:text-[#E0246A] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" strokeWidth={1.5} />
          </div>

          <div>
            <div className="text-xs sm:text-sm font-semibold text-[#18181B] group-hover:text-[#E0246A] transition-colors tracking-tight">
              Upload Inspo
            </div>
            <div className="text-[10px] text-[#8C8085] mt-0.5 truncate leading-tight">
              Extract designs from photo
            </div>
          </div>
        </button>
      </div>

      {/* 3. Curated Looks Carousel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#18181B] tracking-tight">
            Curated Inspiration
          </h2>

          {onExploreClick && (
            <button
              type="button"
              onClick={onExploreClick}
              className="h-8 px-3 rounded-lg text-xs font-medium text-[#18181B] hover:text-[#E0246A] hover:bg-black/5 transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          )}
        </div>

        {designs.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-3xl border border-stone-200/80 p-6 space-y-2">
            <p className="font-serif text-base text-stone-800">No Curated Designs</p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Drop any manicure inspiration photo above to extract your custom 5-finger look with Free.ai.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: Horizontal Carousel (Slidable) */}
            <div className="flex lg:hidden items-center gap-3 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1 snap-x snap-mandatory scroll-smooth">
              {designs.map((design) => {
                const isActive = design.id === activeSample?.id;
                return (
                  <div
                    key={design.id}
                    onClick={() => {
                      onSelectExploreDesign?.(design.id);
                    }}
                    className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 text-left shrink-0 cursor-pointer snap-start hover:-translate-y-1 active:scale-[0.98] ${
                      isActive
                        ? 'border-[#E0246A] ring-2 ring-[#E0246A]/30 shadow-md'
                        : 'border-black/[0.08] hover:border-black/25 bg-white shadow-2xs'
                    }`}
                  >
                    <div className="w-44 sm:w-52 h-56 sm:h-64 relative overflow-hidden bg-black/5">
                      <img
                        src={design.photoUrl || '/assets/editorial_nail_hero.jpg'}
                        alt={design.title || 'Nail Design'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />

                      {/* Try On button matching Favorite page */}
                      <div className="absolute inset-x-2.5 bottom-2.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectExploreDesign?.(design.id);
                          }}
                          className="w-full h-8 rounded-xl bg-white/95 hover:bg-white text-[#281720] text-xs font-semibold shadow-md backdrop-blur-sm flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                        >
                          <Hand className="w-3.5 h-3.5 text-[#E0246A]" strokeWidth={1.75} />
                          <span>Try On</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: 2-Row Grid (Not Slidable, Same Exact Card Design) */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-3.5 sm:gap-4">
              {designs.slice(0, 6).map((design) => {
                const isActive = design.id === activeSample?.id;
                return (
                  <div
                    key={design.id}
                    onClick={() => {
                      onSelectExploreDesign?.(design.id);
                    }}
                    className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 text-left cursor-pointer hover:-translate-y-1 active:scale-[0.98] ${
                      isActive
                        ? 'border-[#E0246A] ring-2 ring-[#E0246A]/30 shadow-md'
                        : 'border-black/[0.08] hover:border-black/25 bg-white shadow-2xs'
                    }`}
                  >
                    <div className="w-full h-56 sm:h-64 relative overflow-hidden bg-black/5">
                      <img
                        src={design.photoUrl || '/assets/editorial_nail_hero.jpg'}
                        alt={design.title || 'Nail Design'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />

                      {/* Try On button matching Favorite page */}
                      <div className="absolute inset-x-2.5 bottom-2.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectExploreDesign?.(design.id);
                          }}
                          className="w-full h-8 rounded-xl bg-white/95 hover:bg-white text-[#281720] text-xs font-semibold shadow-md backdrop-blur-sm flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                        >
                          <Hand className="w-3.5 h-3.5 text-[#E0246A]" strokeWidth={1.75} />
                          <span>Try On</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ---------------------------------------------------------------------
          MODAL: UPLOAD MY HAND (UPLOAD ONCE & TRY ON ANYTIME)
          --------------------------------------------------------------------- */}
      {isHandModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-[#F0DFE4] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-semibold text-[#281720]">My Hand</h3>
                <p className="text-[11px] text-[#806D76]">
                  Upload once to try on designs anytime
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsHandModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {customTryOnHandUrl ? (
              <div className="space-y-3">
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-[#F0DFE4] bg-stone-100">
                  <img
                    src={customTryOnHandUrl || '/assets/editorial_nail_hero.jpg'}
                    alt="My Hand"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-semibold backdrop-blur-xs flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#E8F5E9]" />
                    <span>Saved for 1-Tap Try-On</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsHandModalOpen(false);
                      onTryOnClick();
                    }}
                    className="w-full h-10 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <Hand className="w-4 h-4" />
                    <span>Open in Virtual Try-On</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCameraCaptureOpen(true)}
                      className="flex-1 h-9 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Retake Camera</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handFileInputRef.current?.click()}
                      className="flex-1 h-9 rounded-xl border border-[#F0DFE4] text-[#281720] hover:bg-stone-50 text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload File</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveHandPhoto}
                      className="h-9 px-3 rounded-xl border border-[#F0DFE4] hover:bg-red-50 text-red-600 text-xs font-medium transition cursor-pointer flex items-center justify-center"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="aspect-[4/3] w-full rounded-2xl border-2 border-dashed border-[#F0DFE4] bg-[#FFFAF8] flex flex-col items-center justify-center p-5 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#FDF2F8] text-[#E0246A] flex items-center justify-center">
                    <Hand className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#281720]">Your Hand Photo</p>
                    <p className="text-[10px] text-[#806D76] mt-0.5">
                      Capture with your camera or upload from files
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsCameraCaptureOpen(true)}
                    className="h-10 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Take Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handFileInputRef.current?.click()}
                    className="h-10 rounded-xl border border-[#F0DFE4] text-[#281720] hover:bg-stone-50 text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </button>
                </div>

                <p className="text-[11px] text-[#806D76] text-center leading-relaxed">
                  Saved once so every look in the atelier will instantly render onto your own hand!
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
            }
          } catch {}
          showToast('Hand photo saved — ready for 1-tap try-on');
        }}
        onUploadFileFallback={(file) => {
          handleHandPhotoUpload(file);
        }}
      />
    </div>
  );
}
