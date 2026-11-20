import React, { useState, useEffect, useRef } from 'react';
import {
  ImagePlus,
  RotateCcw,
  ArrowLeft,
  Share2,
  Bookmark,
  Heart,
  Check,
  Paintbrush,
  RefreshCw,
  Sliders,
  AlertTriangle,
  Hand,
  Camera,
  UploadCloud,
} from 'lucide-react';
import { ExploreDesignSet, Finger, NailDesign, SkinTonePreset } from '@/types/nail';
import { FINGER_KEYS, FINGER_LABELS, CURATED_EDITORIAL_DESIGNS } from '@/constants/nail-data';
import { downscaleImageForVision } from '@/lib/services/storage';
import { HandCameraCaptureModal } from '@/components/common/HandCameraCaptureModal';

export function TryOnView({
  tryOnMode = 'upload',
  setTryOnMode,
  cameraStatus,
  cameraErrorNote,
  capturedFrameUrl,
  videoRef,
  onStartLiveCamera,
  onCaptureCameraFrame,
  onCancelCamera,
  tryOnView,
  setTryOnView,
  synthesizedHandUrl: propSynthesizedHandUrl,
  setSynthesizedHandUrl: propSetSynthesizedHandUrl,
  handOrientation,
  setHandOrientation,
  customTryOnHandUrl,
  setCustomTryOnHandUrl,
  overlayScale,
  setOverlayScale,
  overlayOffsetY,
  setOverlayOffsetY,
  activeSkinTone,
  orderedFingers,
  nails,
  setNails,
  onBackToStudioClick,
  onBackToHomeClick,
  activeSample,
  activePhotoUrl,
  onCustomizeWithAi,
  onSelectExploreDesign,
}: {
  tryOnMode?: 'camera' | 'upload' | 'sample';
  setTryOnMode?: (mode: 'camera' | 'upload' | 'sample') => void;
  cameraStatus?: 'idle' | 'starting' | 'live' | 'simulated' | 'captured';
  cameraErrorNote?: string;
  capturedFrameUrl?: string | null;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  onStartLiveCamera?: () => void;
  onCaptureCameraFrame?: () => void;
  onCancelCamera?: () => void;
  tryOnView: 'after' | 'before';
  setTryOnView: (view: 'after' | 'before') => void;
  synthesizedHandUrl?: string | null;
  setSynthesizedHandUrl?: (url: string | null) => void;
  handOrientation: 'left' | 'right';
  setHandOrientation: React.Dispatch<React.SetStateAction<'left' | 'right'>>;
  customTryOnHandUrl: string | null;
  setCustomTryOnHandUrl: (url: string | null) => void;
  overlayScale?: number;
  setOverlayScale?: (scale: number) => void;
  overlayOffsetY?: number;
  setOverlayOffsetY?: (offset: number) => void;
  tryOnZoom?: boolean;
  setTryOnZoom?: React.Dispatch<React.SetStateAction<boolean>>;
  skinToneId?: string;
  setSkinToneId?: (id: string) => void;
  activeSkinTone?: SkinTonePreset;
  orderedFingers?: Finger[];
  nails: Record<Finger, NailDesign>;
  setNails?: React.Dispatch<React.SetStateAction<Record<Finger, NailDesign>>>;
  mobilePreview?: boolean;
  onBackToStudioClick?: () => void;
  onBackToHomeClick?: () => void;
  onSelectFingerToEdit?: (fk: Finger) => void;
  exploreDesigns?: ExploreDesignSet[];
  onSelectExploreDesign?: (id: string) => void;
  activeSample?: ExploreDesignSet;
  activePhotoUrl?: string;
  onCustomizeWithAi?: (handUrl: string) => void;
}) {
  const [savedToast, setSavedToast] = useState(false);
  const [sharedToast, setSharedToast] = useState(false);
  const changeHandInputRef = useRef<HTMLInputElement>(null);
  const changeRefInspoInputRef = useRef<HTMLInputElement>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  // AI Per-Finger & All-in-all Customization State
  const [showAiCustomizer, setShowAiCustomizer] = useState(false);
  const [customizerScope, setCustomizerScope] = useState<'all' | 'single'>('all');
  const [targetFinger, setTargetFinger] = useState<Finger>('ring');
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [isApplyingAi, setIsApplyingAi] = useState(false);
  const [customizedToast, setCustomizedToast] = useState(false);

  const [internalSynthesizedHandUrl, setInternalSynthesizedHandUrl] = useState<string | null>(null);
  const synthesizedHandUrl = propSynthesizedHandUrl !== undefined ? propSynthesizedHandUrl : internalSynthesizedHandUrl;
  const setSynthesizedHandUrl = (url: string | null) => {
    setInternalSynthesizedHandUrl(url);
    propSetSynthesizedHandUrl?.(url);
  };
  const [isSynthesizingHand, setIsSynthesizingHand] = useState(false);
  const [synthesisError, setSynthesisError] = useState<string | null>(null);

  // When reference photo or active sample changes, clear previous synthesized hand so old look is never retained
  const prevRefPhotoRef = useRef(activePhotoUrl);
  const prevSampleIdRef = useRef(activeSample?.id);
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      prevRefPhotoRef.current = activePhotoUrl;
      prevSampleIdRef.current = activeSample?.id;
      if (synthesizedHandUrl) {
        setTryOnView('after');
      }
      return;
    }

    if (prevRefPhotoRef.current !== activePhotoUrl || prevSampleIdRef.current !== activeSample?.id) {
      prevRefPhotoRef.current = activePhotoUrl;
      prevSampleIdRef.current = activeSample?.id;
      setSynthesisError(null);
    }
  }, [activePhotoUrl, activeSample?.id, setTryOnView, synthesizedHandUrl]);

  useEffect(() => {
    if (synthesizedHandUrl) {
      setTryOnView('after');
    }
  }, [synthesizedHandUrl, setTryOnView]);

  const handleSynthesizeHand = async () => {
    const sourceHand = customTryOnHandUrl || capturedFrameUrl || '/assets/editorial_nail_hero.jpg';
    if (!sourceHand) return;
    setIsSynthesizingHand(true);
    setSynthesisError(null);
    // Explicitly reset the previous synthesized image immediately so old look is not shown
    setInternalSynthesizedHandUrl(null);
    propSetSynthesizedHandUrl?.(null);

    try {
      // Convert source hand to Base64
      let handBase64 = '';
      if (sourceHand.startsWith('data:image/')) {
        handBase64 = sourceHand;
      } else {
        handBase64 = await downscaleImageForVision(sourceHand, 1024, 0.88);
      }

      // Convert reference image to Base64 if available
      let refBase64: string | undefined = undefined;
      const refSource = activePhotoUrl || activeSample?.photoUrl;
      if (refSource) {
        if (refSource.startsWith('data:image/')) {
          refBase64 = refSource;
        } else {
          refBase64 = await downscaleImageForVision(refSource, 1024, 0.88);
        }
      }

      const prompt = `Complete manicure with ${nails.middle.shape} shape: Thumb has ${nails.thumb.title}, Index has ${nails.index.title}, Middle has ${nails.middle.title}, Ring has ${nails.ring.title}, Pinky has ${nails.pinky.title}. High gloss gel clearcoat on nails.`;

      const res = await fetch('/api/generate-nail-art', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'hand-tryon',
          handImageBase64: handBase64 || undefined,
          referenceImageBase64: refBase64 || undefined,
          prompt,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.imageUrl) {
          setSynthesizedHandUrl(data.imageUrl);
          setTryOnView('after');
          return;
        }
      }

      const errJson = await res.json().catch(() => ({}));
      const is429 = res.status === 429 || errJson?.isRateLimit || errJson?.error?.includes('RESOURCE_EXHAUSTED') || errJson?.error?.includes('Resource exhausted');
      if (is429) {
        setSynthesisError('Service is currently experiencing high demand. Please try again in a moment.');
      } else {
        setSynthesisError(errJson?.error || 'Could not generate manicure. Please try again.');
      }
    } catch (err: unknown) {
      setSynthesisError('Connection error. Please try again.');
    } finally {
      setIsSynthesizingHand(false);
    }
  };

  // Screen 7 is active when a frame has been captured, a personal photo is uploaded, or an AI manicure is synthesized
  const isShowingResult = cameraStatus === 'captured' || Boolean(customTryOnHandUrl) || Boolean(synthesizedHandUrl);

  // The base image is ALWAYS the user's authentic uploaded hand (NEVER salon drill photos)
  const resultImageUrl =
    customTryOnHandUrl ||
    capturedFrameUrl ||
    (tryOnView === 'after' ? '/assets/milky_gold_tryon_result.jpg' : '/assets/editorial_nail_hero.jpg');

  const handleSaveLook = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2200);
  };

  const handleRetake = () => {
    setCustomTryOnHandUrl(null);
    setInternalSynthesizedHandUrl(null);
    propSetSynthesizedHandUrl?.(null);
    try {
      localStorage.removeItem('finglora_custom_hand_photo');
      localStorage.removeItem('finglora_user_hand_photo');
    } catch {}
  };

  // Auto-generate if arriving on Try-On screen without a synthesized hand
  useEffect(() => {
    if (!synthesizedHandUrl && !isSynthesizingHand && (customTryOnHandUrl || capturedFrameUrl || activePhotoUrl)) {
      handleSynthesizeHand();
    }
  }, [synthesizedHandUrl, isSynthesizingHand]);

  return (
    <div className="max-w-4xl lg:max-w-5xl mx-auto w-full px-4 sm:px-6 py-3 sm:py-6">
      {/* Toast Notification */}
      {customizedToast && (
        <div className="fixed top-5 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
          <div className="bg-[#E0246A] text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg border border-white/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Check className="w-3.5 h-3.5 text-white" />
            <span>Manicure updated</span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SCREEN 7: YOUR TRY-ON RESULT                                   */}
      {/* ============================================================== */}
      {isShowingResult ? (
        <div className="space-y-5">
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
            <button
              type="button"
              onClick={handleRetake}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-900 transition cursor-pointer py-1.5 px-3 rounded-full hover:bg-stone-100"
              title="Retake or change photo"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Upload</span>
            </button>

            <div className="text-center">
              <h1 className="font-serif text-xl sm:text-2xl font-normal text-[#18181B] tracking-tight">
                Try-On Result
              </h1>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setHandOrientation((h) => (h === 'right' ? 'left' : 'right'))}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition cursor-pointer py-1.5 px-3 rounded-full hover:bg-stone-100 border border-stone-200/80 shadow-2xs"
                title="Switch Hand Orientation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="capitalize">{handOrientation} Hand</span>
              </button>
            </div>
          </div>

          {/* Desktop 2-Column Grid: Balanced 6/6 Split with Proportioned Hand Viewport */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Proportioned Hand Photo Viewport */}
            <div className="lg:col-span-6 space-y-3 flex flex-col items-center">
              {/* Pill Toggle: [Natural Hand] [Manicure] */}
              <div className="w-full max-w-[380px] sm:max-w-[420px] flex items-center justify-between">
                <div className="inline-flex rounded-full bg-stone-100 p-1 border border-stone-200/80 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setTryOnView('before')}
                    className={`px-3.5 py-1.5 sm:px-4 sm:py-1.5 rounded-full text-xs transition cursor-pointer ${
                      tryOnView === 'before'
                        ? 'bg-[#E0246A] text-white shadow-xs font-semibold'
                        : 'text-stone-600 hover:text-stone-900 font-medium'
                    }`}
                  >
                    Natural Hand
                  </button>
                  <button
                    type="button"
                    onClick={() => setTryOnView('after')}
                    className={`px-3.5 py-1.5 sm:px-4 sm:py-1.5 rounded-full text-xs transition cursor-pointer ${
                      tryOnView === 'after'
                        ? 'bg-[#E0246A] text-white shadow-xs font-semibold'
                        : 'text-stone-600 hover:text-stone-900 font-medium'
                    }`}
                  >
                    Manicure
                  </button>
                </div>
                <span className="text-xs text-stone-400 hidden sm:inline-block font-mono">
                  {tryOnView === 'after' ? 'Manicure Look' : 'Original Hand'}
                </span>
              </div>

              {/* Hand Result Photo Viewport - Tastefully Sized */}
              <div className="relative aspect-[3/4] max-h-[440px] sm:max-h-[480px] lg:max-h-[500px] w-full max-w-[380px] sm:max-w-[420px] rounded-3xl overflow-hidden bg-stone-100 shadow-md border border-stone-200/90 flex items-center justify-center mx-auto transition-all duration-300">
                <img
                  src={
                    (tryOnView === 'after' && synthesizedHandUrl)
                      ? synthesizedHandUrl
                      : (resultImageUrl || '/assets/editorial_nail_hero.jpg')
                  }
                  alt="Try-On Hand"
                  className="w-full h-full object-cover transition duration-300"
                />

                {/* Spinner Overlay */}
                {isSynthesizingHand && (
                  <div className="absolute inset-0 z-30 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center gap-2.5 text-white p-6 text-center">
                    <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    <span className="text-xs font-medium tracking-wide">Applying manicure to your hand...</span>
                  </div>
                )}

                {/* Subtle before/after indicator */}
                <div className="absolute top-3.5 left-3.5 z-20">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium tracking-wide">
                    {synthesizedHandUrl && tryOnView === 'after' ? 'Manicure' : 'Natural Hand'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Actions & Details */}
            <div className="lg:col-span-6 space-y-4">
              {/* Reference Inspo Look Preview Card */}
              {activePhotoUrl && (
                <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold">
                      Reference Design
                    </span>
                    <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-rose-50 text-[#E0246A] border border-rose-100/80 capitalize">
                      {activeSample?.category || 'Manicure'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                      <img src={activePhotoUrl} alt="Reference" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-stone-900 truncate">
                        {activeSample?.title || 'Reference Look'}
                      </h4>
                      <p className="text-xs text-stone-500">
                        Synthesized onto your nails
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Banner */}
              {synthesisError && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 text-left">
                      <span className="font-medium block">Notice</span>
                      <p className="text-amber-800 leading-relaxed">{synthesisError}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isSynthesizingHand}
                      onClick={handleSynthesizeHand}
                      className="px-3.5 py-1 rounded-lg bg-[#E0246A] hover:bg-[#BE185D] text-white font-medium transition cursor-pointer shadow-xs active:scale-95 disabled:opacity-60 text-xs"
                    >
                      Retry
                    </button>
                    <button
                      type="button"
                      onClick={() => setSynthesisError(null)}
                      className="px-3 py-1 rounded-lg bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-medium transition cursor-pointer active:scale-95 text-xs"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons Panel with Harmonized Heights (h-10 sm:h-11 rounded-xl font-medium) */}
              <div className="space-y-3">
                {/* Row 1: Primary Actions */}
                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    type="button"
                    disabled={isSynthesizingHand}
                    onClick={handleSynthesizeHand}
                    className="h-10 sm:h-11 px-3 sm:px-4 rounded-xl bg-white border border-stone-200 hover:border-stone-400 text-stone-900 text-xs sm:text-sm font-medium transition shadow-2xs hover:shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60 whitespace-nowrap min-w-0"
                  >
                    <RefreshCw className={`w-4 h-4 text-stone-600 shrink-0 ${isSynthesizingHand ? 'animate-spin' : ''}`} />
                    <span className="truncate">{isSynthesizingHand ? 'Updating...' : 'Regenerate'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const handImg = (tryOnView === 'after' && synthesizedHandUrl)
                        ? synthesizedHandUrl
                        : (customTryOnHandUrl || resultImageUrl || '/assets/editorial_nail_hero.jpg');
                      onCustomizeWithAi?.(handImg);
                    }}
                    className="h-10 sm:h-11 px-3 sm:px-4 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-medium transition shadow-md shadow-[#E0246A]/20 inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap min-w-0"
                  >
                    <Sliders className="w-4 h-4 text-white shrink-0" />
                    <span className="truncate">Customize</span>
                  </button>
                </div>

                {/* Row 2: Secondary Utilities */}
                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    type="button"
                    onClick={handleSaveLook}
                    className="h-10 sm:h-11 px-3 sm:px-4 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs sm:text-sm font-medium transition inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap min-w-0"
                  >
                    {savedToast ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-emerald-700 font-medium truncate">Saved</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4 text-stone-600 shrink-0" />
                        <span className="truncate">Save Look</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                      }
                      setSharedToast(true);
                      setTimeout(() => setSharedToast(false), 2200);
                    }}
                    className="h-10 sm:h-11 px-3 sm:px-4 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs sm:text-sm font-medium transition inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap min-w-0"
                  >
                    {sharedToast ? (
                      <>
                        <Check className="w-4 h-4 text-stone-900 shrink-0" strokeWidth={2} />
                        <span className="truncate">Copied</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 text-stone-600 shrink-0" />
                        <span className="truncate">Share</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Row 3: Photo Switchers */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-stone-500">
                  <button
                    type="button"
                    onClick={() => changeHandInputRef.current?.click()}
                    className="hover:text-stone-900 font-medium inline-flex items-center gap-1.5 cursor-pointer transition py-1.5 px-2.5 rounded-lg hover:bg-stone-100"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-stone-500" />
                    <span>Upload Hand</span>
                  </button>
                  <span className="text-stone-300">•</span>
                  <button
                    type="button"
                    onClick={() => setIsCameraModalOpen(true)}
                    className="hover:text-stone-900 font-medium inline-flex items-center gap-1.5 cursor-pointer transition py-1.5 px-2.5 rounded-lg hover:bg-stone-100"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#E0246A]" />
                    <span>Camera</span>
                  </button>
                  <span className="text-stone-300">•</span>
                  <button
                    type="button"
                    onClick={() => changeRefInspoInputRef.current?.click()}
                    className="hover:text-stone-900 font-medium inline-flex items-center gap-1.5 cursor-pointer transition py-1.5 px-2.5 rounded-lg hover:bg-stone-100"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
                    <span>Change Reference</span>
                  </button>
                </div>
              </div>

              {/* Quick Trending Reference Switcher */}
              <div className="bg-white rounded-3xl p-4 border border-stone-200/90 shadow-2xs space-y-2.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold block">
                  Switch Reference Inspo
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {CURATED_EDITORIAL_DESIGNS.slice(0, 4).map((design) => {
                    const isSelected = activeSample?.id === design.id || activePhotoUrl === design.photoUrl;
                    return (
                      <button
                        key={design.id}
                        type="button"
                        onClick={() => {
                          onSelectExploreDesign?.(design.id);
                          setTimeout(() => handleSynthesizeHand(), 60);
                        }}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer group active:scale-95 ${
                          isSelected
                            ? 'bg-rose-50/70 border-[#E0246A]/50 ring-1 ring-[#E0246A]/20'
                            : 'bg-stone-50/60 hover:bg-stone-100/80 border-stone-200/70'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-stone-200 shrink-0">
                          <img src={design.photoUrl} alt={design.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-medium text-stone-800 truncate block group-hover:text-[#E0246A] transition-colors">
                            {design.title}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Hidden File Inputs for Changing Hand and Reference */}
          <input
            ref={changeHandInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) {
                const dataUrl = await downscaleImageForVision(f, 1000, 0.85);
                const finalUrl = dataUrl || URL.createObjectURL(f);
                setCustomTryOnHandUrl(finalUrl);
                try {
                  localStorage.setItem('finglora_custom_hand_photo', finalUrl);
                  localStorage.setItem('finglora_user_hand_photo', finalUrl);
                } catch {}
                setTimeout(() => handleSynthesizeHand(), 60);
              }
            }}
          />
          <input
            ref={changeRefInspoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) {
                const dataUrl = await downscaleImageForVision(f, 1000, 0.85);
                const finalUrl = dataUrl || URL.createObjectURL(f);
                onSelectExploreDesign?.(finalUrl);
                setTimeout(() => handleSynthesizeHand(), 60);
              }
            }}
          />
        </div>
      ) : (
        /* ============================================================== */
        /* SCREEN 6: PHOTO TRY-ON (UPLOAD / SELECT HAND)                 */
        /* ============================================================== */
        <div className="space-y-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
            <button
              type="button"
              onClick={onBackToHomeClick || onBackToStudioClick}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-900 transition cursor-pointer py-1.5 px-3 rounded-full hover:bg-stone-100"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="text-center">
              <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-normal text-[#18181B] tracking-tight">
                Photo Try-On Atelier
              </h1>
              <p className="text-xs text-stone-500 hidden sm:block">
                Upload your hand photo to preview any couture manicure in studio realism.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setHandOrientation((h) => (h === 'right' ? 'left' : 'right'))}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition cursor-pointer py-1.5 px-3 rounded-full hover:bg-stone-100 border border-stone-200/80 shadow-2xs"
              title="Switch Hand Orientation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="capitalize">{handOrientation} Hand</span>
            </button>
          </div>

          {/* Desktop 2-Column Studio Grid: Balanced 6/6 Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Hand Photo Viewfinder Box */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative aspect-[3/4] max-h-[440px] sm:max-h-[480px] lg:max-h-[500px] w-full max-w-[380px] sm:max-w-[420px] rounded-3xl overflow-hidden bg-stone-50 border-2 border-dashed border-stone-200 flex flex-col items-center justify-center p-6 sm:p-8 text-center space-y-5 mx-auto hover:border-[#E0246A]/50 transition-colors shadow-2xs">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#FDF2F8] border border-[#E0246A]/20 text-[#E0246A] flex items-center justify-center shadow-xs">
                  <Hand className="w-10 h-10" strokeWidth={1.5} />
                </div>

                <div className="space-y-2 max-w-sm">
                  <h3 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
                    Your Hand Photo
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                    Take a quick photo with your camera or upload from files to preview any manicure on your hand.
                  </p>
                </div>

                {/* Action Buttons: Upload Photo in #E0246A + Camera in outline */}
                <div className="grid grid-cols-2 gap-3 w-full max-w-xs sm:max-w-sm mx-auto">
                  <label className="cursor-pointer h-10 sm:h-11 px-4 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95">
                    <UploadCloud className="w-4 h-4 shrink-0" />
                    <span className="truncate">Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const dataUrl = await downscaleImageForVision(f, 1000, 0.85);
                          const finalUrl = dataUrl || URL.createObjectURL(f);
                          setCustomTryOnHandUrl(finalUrl);
                          setInternalSynthesizedHandUrl(null);
                          propSetSynthesizedHandUrl?.(null);
                          try {
                            localStorage.setItem('finglora_custom_hand_photo', finalUrl);
                            localStorage.setItem('finglora_user_hand_photo', finalUrl);
                          } catch {}
                          setTimeout(() => handleSynthesizeHand(), 60);
                        }
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsCameraModalOpen(true)}
                    className="cursor-pointer h-10 sm:h-11 px-4 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 hover:border-stone-300 text-xs sm:text-sm font-medium inline-flex items-center justify-center gap-2 transition-all active:scale-95 shadow-2xs"
                  >
                    <Camera className="w-4 h-4 text-[#E0246A] shrink-0" />
                    <span className="truncate">Camera</span>
                  </button>
                </div>

                {/* Subtle Studio Sample Fallback */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const sampleUrl = '/assets/editorial_nail_hero.jpg';
                      setCustomTryOnHandUrl(sampleUrl);
                      setInternalSynthesizedHandUrl(null);
                      propSetSynthesizedHandUrl?.(null);
                      try {
                        localStorage.setItem('finglora_custom_hand_photo', sampleUrl);
                        localStorage.setItem('finglora_user_hand_photo', sampleUrl);
                      } catch {}
                      setTimeout(() => handleSynthesizeHand(), 60);
                    }}
                    className="text-xs text-stone-500 hover:text-[#E0246A] underline transition cursor-pointer"
                  >
                    or try with studio sample hand photo
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Quick Reference Inspo */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold block">
                      Studio Inspiration
                    </span>
                    <h3 className="text-base font-serif font-medium text-stone-900">
                      Quick Reference Inspo
                    </h3>
                  </div>
                  <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-rose-50 text-[#E0246A] border border-rose-100">
                    1-Click Try-On
                  </span>
                </div>

                {/* Active Reference Design */}
                {activePhotoUrl && (
                  <div className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-[#E0246A] font-bold">
                        Active Reference Look
                      </span>
                      <span className="text-[10px] text-stone-500 font-medium">Ready</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-200 border border-stone-300 shrink-0">
                        <img
                          src={activePhotoUrl}
                          alt={activeSample?.title || 'Active Reference'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-stone-900 truncate">
                          {activeSample?.title || 'Selected Design'}
                        </h4>
                        <p className="text-[11px] text-stone-500 truncate">
                          {activeSample?.category || 'Custom Style'} • Upload hand to apply
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4 Curated Trending Looks */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold block">
                    Curated Trending Looks
                  </span>
                  <div className="space-y-2">
                    {CURATED_EDITORIAL_DESIGNS.slice(0, 4).map((design) => {
                      const isSelected = activeSample?.id === design.id || activePhotoUrl === design.photoUrl;
                      return (
                        <button
                          key={design.id}
                          type="button"
                          onClick={() => {
                            onSelectExploreDesign?.(design.id);
                            if (customTryOnHandUrl || capturedFrameUrl) {
                              setTimeout(() => handleSynthesizeHand(), 60);
                            }
                          }}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-2xl border text-left transition-all cursor-pointer group active:scale-[0.98] ${
                            isSelected
                              ? 'bg-rose-50/70 border-[#E0246A]/50 ring-1 ring-[#E0246A]/20 shadow-2xs'
                              : 'bg-white hover:bg-stone-50/80 border-stone-200/80 hover:border-stone-300'
                          }`}
                        >
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0 relative">
                            <img
                              src={design.photoUrl}
                              alt={design.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <h5 className="text-xs font-semibold text-stone-900 truncate group-hover:text-[#E0246A] transition-colors">
                                {design.title}
                              </h5>
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-[#E0246A] shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-stone-500 truncate">
                              {design.category} • {design.nails?.middle?.shape || 'Almond'}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-App Live Hand Camera Capture Modal */}
      <HandCameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCaptureHand={(dataUrl) => {
          setCustomTryOnHandUrl(dataUrl);
          setInternalSynthesizedHandUrl(null);
          propSetSynthesizedHandUrl?.(null);
          try {
            localStorage.setItem('finglora_custom_hand_photo', dataUrl);
            localStorage.setItem('finglora_user_hand_photo', dataUrl);
          } catch {}
          setTimeout(() => handleSynthesizeHand(), 60);
        }}
        onUploadFileFallback={async (file) => {
          const dataUrl = await downscaleImageForVision(file, 1000, 0.85);
          const finalUrl = dataUrl || URL.createObjectURL(file);
          setCustomTryOnHandUrl(finalUrl);
          setInternalSynthesizedHandUrl(null);
          propSetSynthesizedHandUrl?.(null);
          try {
            localStorage.setItem('finglora_custom_hand_photo', finalUrl);
            localStorage.setItem('finglora_user_hand_photo', finalUrl);
          } catch {}
          setTimeout(() => handleSynthesizeHand(), 60);
        }}
      />
    </div>
  );
}
