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
import { FINGER_KEYS, FINGER_LABELS } from '@/constants/nail-data';
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

  // Auto-generate if arriving on Try-On screen without a synthesized hand
  useEffect(() => {
    if (!synthesizedHandUrl && !isSynthesizingHand && (customTryOnHandUrl || capturedFrameUrl || activePhotoUrl)) {
      handleSynthesizeHand();
    }
  }, [synthesizedHandUrl, isSynthesizingHand]);

  return (
    <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto w-full px-3 sm:px-6 py-4 lg:py-8">
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
      {/* SCREEN 7: YOUR TRY-ON RESULT (BIG ON DESKTOP)                  */}
      {/* ============================================================== */}
      {isShowingResult ? (
        <div className="space-y-6">
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
              <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-normal text-[#18181B] tracking-tight">
                Try-On Result
              </h1>
            </div>

            <div className="w-20" />
          </div>

          {/* Desktop 2-Column Grid: Left BIG Hand Viewport + Right Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: BIG Hand Photo Viewport */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              {/* Pill Toggle: [Natural Hand] [Manicure] */}
              {synthesizedHandUrl && (
                <div className="flex justify-center lg:justify-start">
                  <div className="inline-flex rounded-full bg-stone-100 p-1 border border-stone-200/80 shadow-xs">
                    <button
                      type="button"
                      onClick={() => setTryOnView('before')}
                      className={`px-5 py-2 rounded-full text-xs sm:text-sm transition cursor-pointer ${
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
                      className={`px-5 py-2 rounded-full text-xs sm:text-sm transition cursor-pointer ${
                        tryOnView === 'after'
                          ? 'bg-[#E0246A] text-white shadow-xs font-semibold'
                          : 'text-stone-600 hover:text-stone-900 font-medium'
                      }`}
                    >
                      Manicure
                    </button>
                  </div>
                </div>
              )}

              {/* Hand Result Photo Viewport - BIG on Desktop */}
              <div className="relative aspect-[3/4] max-h-[540px] sm:max-h-[620px] lg:max-h-[720px] xl:max-h-[780px] w-full rounded-3xl overflow-hidden bg-stone-100 shadow-xl border border-stone-200/90 flex items-center justify-center mx-auto transition-all duration-300">
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
                  <div className="absolute inset-0 z-30 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-white p-6 text-center">
                    <div className="w-10 h-10 rounded-full border-3 border-white/20 border-t-white animate-spin" />
                    <span className="text-sm font-medium tracking-wide">Applying manicure to your hand...</span>
                  </div>
                )}

                {/* Subtle before/after indicator */}
                <div className="absolute top-4 left-4 z-20">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium tracking-wide">
                    {synthesizedHandUrl && tryOnView === 'after' ? 'Manicure' : 'Natural Hand'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Actions & Details */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-8">
              {/* Reference Inspo Look Preview Card */}
              {activePhotoUrl && (
                <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold">
                    Reference Design
                  </span>
                  <div className="flex items-center gap-3.5">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
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

              {/* Action Buttons Panel */}
              <div className="space-y-3">
                {/* Row 1: Primary Actions */}
                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    type="button"
                    disabled={isSynthesizingHand}
                    onClick={handleSynthesizeHand}
                    className="h-12 px-3 sm:px-4 rounded-2xl bg-white border border-stone-200 hover:border-stone-400 text-stone-900 text-xs sm:text-sm font-medium transition shadow-2xs hover:shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60 whitespace-nowrap min-w-0"
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
                    className="h-12 px-3 sm:px-4 rounded-2xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-medium transition shadow-md shadow-[#E0246A]/20 inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap min-w-0"
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
                    className="h-11 px-3 sm:px-4 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs font-medium transition inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap min-w-0"
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
                    className="h-11 px-3 sm:px-4 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs font-medium transition inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap min-w-0"
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
                <div className="pt-2 flex items-center justify-center gap-4 text-xs text-stone-500">
                  <button
                    type="button"
                    onClick={() => setIsCameraModalOpen(true)}
                    className="hover:text-stone-900 font-medium inline-flex items-center gap-1.5 cursor-pointer transition py-1.5 px-2.5 rounded-lg hover:bg-stone-100"
                  >
                    <Hand className="w-4 h-4 text-stone-400" />
                    <span>Change Hand</span>
                  </button>
                  <span className="text-stone-300">•</span>
                  <button
                    type="button"
                    onClick={() => changeRefInspoInputRef.current?.click()}
                    className="hover:text-stone-900 font-medium inline-flex items-center gap-1.5 cursor-pointer transition py-1.5 px-2.5 rounded-lg hover:bg-stone-100"
                  >
                    <RotateCcw className="w-4 h-4 text-stone-400" />
                    <span>Change Reference</span>
                  </button>
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

          {/* Photo Upload Viewfinder - Big on Desktop */}
          <div className="relative aspect-[3/4] max-h-[440px] sm:max-h-[520px] lg:max-h-[580px] w-full max-w-lg lg:max-w-xl rounded-3xl overflow-hidden bg-stone-50 border-2 border-dashed border-stone-200 flex flex-col items-center justify-center p-8 sm:p-12 text-center space-y-6 mx-auto hover:border-[#E0246A]/50 transition-colors">
            <div className="w-20 h-20 rounded-3xl bg-[#FDF2F8] border border-[#E0246A]/20 text-[#E0246A] flex items-center justify-center shadow-xs">
              <Hand className="w-10 h-10" strokeWidth={1.5} />
            </div>

            <div className="space-y-1.5 max-w-xs sm:max-w-sm">
              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
                Your Hand Photo
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                Take a quick photo with your camera or upload from files to preview any manicure on your hand.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs sm:max-w-md justify-center">
              <button
                type="button"
                onClick={() => setIsCameraModalOpen(true)}
                className="cursor-pointer h-13 px-6 rounded-2xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-sm font-semibold inline-flex items-center justify-center gap-2.5 shadow-lg shadow-[#E0246A]/25 transition-all active:scale-95 w-full sm:w-auto"
              >
                <Camera className="w-4.5 h-4.5" />
                <span>Take Photo with Camera</span>
              </button>

              <label className="cursor-pointer h-13 px-6 rounded-2xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 text-sm font-medium inline-flex items-center justify-center gap-2 transition-all active:scale-95 w-full sm:w-auto shadow-2xs">
                <UploadCloud className="w-4.5 h-4.5" />
                <span>Upload from Device</span>
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
            </div>

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
