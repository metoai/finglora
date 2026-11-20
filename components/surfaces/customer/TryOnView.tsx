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
} from 'lucide-react';
import { ExploreDesignSet, Finger, NailDesign, SkinTonePreset } from '@/types/nail';
import { FINGER_KEYS, FINGER_LABELS } from '@/constants/nail-data';
import { downscaleImageForVision } from '@/lib/services/storage';

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
      if (synthesizedHandUrl) {
        setTryOnView('after');
      }
      return;
    }

    if (prevRefPhotoRef.current !== activePhotoUrl || prevSampleIdRef.current !== activeSample?.id) {
      prevRefPhotoRef.current = activePhotoUrl;
      prevSampleIdRef.current = activeSample?.id;
      setInternalSynthesizedHandUrl(null);
      propSetSynthesizedHandUrl?.(null);
      setSynthesisError(null);
      try {
        localStorage.removeItem('finglora_synthesized_hand_url');
      } catch {}
    }
  }, [activePhotoUrl, activeSample?.id, propSetSynthesizedHandUrl, synthesizedHandUrl, setTryOnView]);

  useEffect(() => {
    if (synthesizedHandUrl) {
      setTryOnView('after');
    }
  }, [synthesizedHandUrl, setTryOnView]);

  const handleSynthesizeHand = async () => {
    const sourceHand = customTryOnHandUrl || capturedFrameUrl || activeSample?.photoUrl || '/assets/editorial_nail_hero.jpg';
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

  // The base image is ALWAYS the user's authentic uploaded hand (NEVER swapped with stock photos)
  const resultImageUrl =
    customTryOnHandUrl ||
    capturedFrameUrl ||
    (tryOnView === 'before' && activeSample?.id === 'set-berry-aura' ? '/assets/editorial_nail_hero.jpg' : activeSample?.photoUrl) ||
    '/assets/editorial_nail_hero.jpg';

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

  return (
    <div className="max-w-md mx-auto w-full px-2 sm:px-0">
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
      {/* SCREEN 7: YOUR TRY-ON RESULT                                    */}
      {/* ============================================================== */}
      {isShowingResult ? (
        <div className="space-y-3">
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-1">
            <button
              type="button"
              onClick={handleRetake}
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition cursor-pointer active:scale-95"
              title="Retake or change photo"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="text-center">
              <h1 className="font-serif text-xl sm:text-2xl font-normal text-[#18181B] tracking-tight">
                Try-On Result
              </h1>
            </div>

            <div className="w-9 h-9" />
          </div>

          {/* Pill Toggle: [Natural Hand] [Manicure] */}
          {synthesizedHandUrl && (
            <div className="flex justify-center">
              <div className="inline-flex rounded-full bg-stone-100 p-0.5 border border-stone-200/80">
                <button
                  type="button"
                  onClick={() => setTryOnView('before')}
                  className={`px-4 py-1.5 rounded-full text-xs transition cursor-pointer ${
                    tryOnView === 'before'
                      ? 'bg-[#E0246A] text-white shadow-xs font-medium'
                      : 'text-stone-600 hover:text-stone-900 font-medium'
                  }`}
                >
                  Natural Hand
                </button>
                <button
                  type="button"
                  onClick={() => setTryOnView('after')}
                  className={`px-4 py-1.5 rounded-full text-xs transition cursor-pointer ${
                    tryOnView === 'after'
                      ? 'bg-[#E0246A] text-white shadow-xs font-medium'
                      : 'text-stone-600 hover:text-stone-900 font-medium'
                  }`}
                >
                  Manicure
                </button>
              </div>
            </div>
          )}

          {/* Hand Result Photo Viewport */}
          <div className="relative aspect-[3/4] max-h-[380px] sm:max-h-[420px] w-full rounded-2xl overflow-hidden bg-stone-100 shadow-sm border border-stone-200 flex items-center justify-center mx-auto">
            <img
              src={
                (tryOnView === 'after' && synthesizedHandUrl)
                  ? synthesizedHandUrl
                  : (resultImageUrl || '/assets/editorial_nail_hero.jpg')
              }
              alt="Try-On Hand"
              className="w-full h-full object-cover transition duration-200"
            />

            {/* Spinner Overlay */}
            {isSynthesizingHand && (
              <div className="absolute inset-0 z-30 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white p-4 text-center">
                <div className="w-7 h-7 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <span className="text-xs font-medium">Applying manicure...</span>
              </div>
            )}

            {/* Subtle before/after indicator */}
            <div className="absolute top-3 left-3 z-20">
              <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium tracking-wide">
                {synthesizedHandUrl && tryOnView === 'after' ? 'Manicure' : 'Natural Hand'}
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {synthesisError && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2 animate-in fade-in duration-200">
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

          {/* Action Panels */}
          {!synthesizedHandUrl ? (
            <div className="space-y-3 pt-1">
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-center space-y-3">
                <div className="space-y-0.5">
                  <h3 className="font-serif text-base font-normal text-stone-900">
                    Apply Reference to Hand
                  </h3>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                    Preview this manicure fitted directly onto your hand photo.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isSynthesizingHand}
                  onClick={handleSynthesizeHand}
                  className="w-full h-11 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-medium transition inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-75 shadow-md shadow-[#E0246A]/20"
                >
                  {isSynthesizingHand ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Applying...</span>
                    </>
                  ) : (
                    <span>Apply Manicure</span>
                  )}
                </button>
              </div>

              {/* Photo Switchers */}
              <div className="flex items-center justify-center gap-4 pt-1 text-xs text-stone-500">
                <button
                  type="button"
                  onClick={() => changeHandInputRef.current?.click()}
                  className="hover:text-stone-900 font-medium inline-flex items-center gap-1.5 cursor-pointer transition py-1 px-2 rounded-md hover:bg-stone-100"
                >
                  <ImagePlus className="w-3.5 h-3.5 text-stone-400" />
                  <span>Change Hand</span>
                </button>
                <span className="text-stone-300">•</span>
                <button
                  type="button"
                  onClick={() => changeRefInspoInputRef.current?.click()}
                  className="hover:text-stone-900 font-medium inline-flex items-center gap-1.5 cursor-pointer transition py-1 px-2 rounded-md hover:bg-stone-100"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
                  <span>Change Reference</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 pt-1">
              {/* Row 1: Primary Actions */}
              <div className="grid grid-cols-2 gap-2.5 w-full">
                <button
                  type="button"
                  disabled={isSynthesizingHand}
                  onClick={handleSynthesizeHand}
                  className="h-11 px-3 rounded-xl bg-white border border-stone-200 hover:border-stone-400 text-stone-900 text-xs sm:text-sm font-medium transition shadow-2xs hover:shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-stone-600 ${isSynthesizingHand ? 'animate-spin' : ''}`} />
                  <span>{isSynthesizingHand ? 'Updating...' : 'Regenerate'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const handImg = (tryOnView === 'after' && synthesizedHandUrl)
                      ? synthesizedHandUrl
                      : (customTryOnHandUrl || resultImageUrl || '/assets/editorial_nail_hero.jpg');
                    onCustomizeWithAi?.(handImg);
                  }}
                  className="h-11 px-3 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-medium transition shadow-md shadow-[#E0246A]/20 inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Sliders className="w-3.5 h-3.5 text-white" />
                  <span>Customize</span>
                </button>
              </div>

              {/* Row 2: Secondary Utilities */}
              <div className="grid grid-cols-2 gap-2.5 w-full">
                <button
                  type="button"
                  onClick={handleSaveLook}
                  className="h-10 px-3 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs font-medium transition inline-flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  {savedToast ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5 text-stone-600" />
                      <span>Save</span>
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
                  className="h-10 px-3 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs font-medium transition inline-flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  {sharedToast ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-stone-900" strokeWidth={2} />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-stone-600" />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>

              {/* Row 3: Photo Switchers */}
              <div className="flex items-center justify-center gap-4 pt-0.5 text-xs text-stone-500">
                <button
                  type="button"
                  onClick={() => changeHandInputRef.current?.click()}
                  className="hover:text-stone-900 font-medium inline-flex items-center gap-1 cursor-pointer transition py-0.5 px-2 rounded-md hover:bg-stone-100"
                >
                  <ImagePlus className="w-3.5 h-3.5 text-stone-400" />
                  <span>Change Hand</span>
                </button>
                <span className="text-stone-300">•</span>
                <button
                  type="button"
                  onClick={() => changeRefInspoInputRef.current?.click()}
                  className="hover:text-stone-900 font-medium inline-flex items-center gap-1 cursor-pointer transition py-0.5 px-2 rounded-md hover:bg-stone-100"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
                  <span>Change Reference</span>
                </button>
              </div>
            </div>
          )}

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
                setInternalSynthesizedHandUrl(null);
                propSetSynthesizedHandUrl?.(null);
                try {
                  localStorage.setItem('finglora_custom_hand_photo', finalUrl);
                  localStorage.setItem('finglora_user_hand_photo', finalUrl);
                } catch {}
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
                setInternalSynthesizedHandUrl(null);
                propSetSynthesizedHandUrl?.(null);
                onSelectExploreDesign?.(finalUrl);
              }
            }}
          />
        </div>
      ) : (
        /* ============================================================== */
        /* SCREEN 6: PHOTO TRY-ON (UPLOAD / SELECT HAND)                 */
        /* ============================================================== */
        <div className="space-y-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-1">
            <button
              type="button"
              onClick={onBackToHomeClick || onBackToStudioClick}
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200/80 flex items-center justify-center text-stone-700 transition-all cursor-pointer active:scale-95"
              title="Back"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
            </button>

            <div className="text-center">
              <h1 className="font-serif text-xl sm:text-2xl font-normal text-[#18181B] tracking-tight">
                Photo Try-On
              </h1>
              <p className="text-[11px] text-stone-500">
                Upload your hand photo to preview any manicure.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setHandOrientation((h) => (h === 'right' ? 'left' : 'right'))}
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200/80 flex items-center justify-center text-stone-700 transition-all cursor-pointer active:scale-95"
              title="Switch Hand Orientation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Photo Upload Viewfinder */}
          <div className="relative aspect-[3/4] max-h-[380px] sm:max-h-[420px] w-full rounded-3xl overflow-hidden bg-stone-50 border-2 border-dashed border-stone-200 flex flex-col items-center justify-center p-6 text-center space-y-4 mx-auto hover:border-[#E0246A]/50 transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-[#FDF2F8] border border-[#E0246A]/20 text-[#E0246A] flex items-center justify-center shadow-xs">
              <Hand className="w-8 h-8" strokeWidth={1.5} />
            </div>

            <div className="space-y-1 max-w-xs">
              <h3 className="font-serif text-xl font-normal text-stone-900">
                Upload Hand Photo
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Take or upload a clean, well-lit photo of your hand facing flat to preview designs.
              </p>
            </div>

            <label className="cursor-pointer h-11 px-6 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-md shadow-[#E0246A]/25 transition-all active:scale-95">
              <Hand className="w-4 h-4" />
              <span>Choose Hand Photo</span>
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
                  }
                }}
              />
            </label>

            {/* Quick Sample Hand Preset */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  const sampleUrl = '/assets/editorial_nail_hero.jpg';
                  setCustomTryOnHandUrl(sampleUrl);
                  setInternalSynthesizedHandUrl(null);
                  propSetSynthesizedHandUrl?.(null);
                }}
                className="text-[11px] text-stone-500 hover:text-[#E0246A] underline transition cursor-pointer"
              >
                or try with studio sample hand photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
