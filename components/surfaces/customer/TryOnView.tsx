'use client';

import React, { useState, useEffect } from 'react';
import {
  Camera,
  ImagePlus,
  RotateCcw,
  Video,
  ArrowLeft,
  Share2,
  Bookmark,
  Sliders,
  Check,
  Paintbrush,
  Wand2,
  X,
  SlidersHorizontal,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { ExploreDesignSet, Finger, NailDesign, NailFinish, NailPattern, SkinTonePreset } from '@/types/nail';
import { FINGER_KEYS, FINGER_LABELS } from '@/constants/nail-data';
import { NailCanvasPreview } from '@/components/visuals/NailCanvasPreview';
import { EditorialHandVisual } from '@/components/visuals/EditorialHandVisual';
import { getVideoHandLandmarker, extractFingertipAnchors, detectHandInImage, FingertipAnchor } from '@/lib/vision/hand-tracker';
import { downscaleImageForVision } from '@/lib/services/storage';

const AI_PRESET_MODIFIERS: {
  label: string;
  pattern: NailPattern;
  finish: NailFinish;
  color: string;
}[] = [
  { label: 'Glazed Chrome', pattern: 'chrome-swirl', finish: 'chrome', color: '#FDFCF7' },
  { label: 'Micro French Tip', pattern: 'classic-french', finish: 'glossy', color: '#FFFFFF' },
  { label: 'Velvet Bordeaux', pattern: 'solid', finish: 'matte', color: '#801A35' },
  { label: 'Botanical Floral', pattern: 'floral', finish: 'glossy', color: '#E8A598' },
  { label: 'Fine Shimmer Dust', pattern: 'glitter-ombre', finish: 'glitter', color: '#C59B27' },
  { label: 'Twilight Aura', pattern: 'aura', finish: 'glossy', color: '#E0246A' },
];

const DEFAULT_PHOTO_ANCHORS: Record<Finger, FingertipAnchor> = {
  thumb: { finger: 'thumb', tipX: 0.22, tipY: 0.60, dipX: 0.26, dipY: 0.70, angleDeg: -28, scale: 0.95, confidence: 0.7 },
  index: { finger: 'index', tipX: 0.36, tipY: 0.30, dipX: 0.38, dipY: 0.44, angleDeg: -10, scale: 1.0, confidence: 0.7 },
  middle: { finger: 'middle', tipX: 0.50, tipY: 0.23, dipX: 0.50, dipY: 0.38, angleDeg: 0, scale: 1.05, confidence: 0.7 },
  ring: { finger: 'ring', tipX: 0.64, tipY: 0.29, dipX: 0.62, dipY: 0.43, angleDeg: 10, scale: 1.0, confidence: 0.7 },
  pinky: { finger: 'pinky', tipX: 0.78, tipY: 0.44, dipX: 0.74, dipY: 0.56, angleDeg: 22, scale: 0.88, confidence: 0.7 },
};

export function TryOnView({
  tryOnMode,
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
}: {
  tryOnMode: 'camera' | 'upload' | 'sample';
  setTryOnMode: (mode: 'camera' | 'upload' | 'sample') => void;
  cameraStatus: 'idle' | 'starting' | 'live' | 'simulated' | 'captured';
  cameraErrorNote: string;
  capturedFrameUrl: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onStartLiveCamera: () => void;
  onCaptureCameraFrame: () => void;
  onCancelCamera: () => void;
  tryOnView: 'after' | 'before';
  setTryOnView: (view: 'after' | 'before') => void;
  synthesizedHandUrl?: string | null;
  setSynthesizedHandUrl?: (url: string | null) => void;
  handOrientation: 'left' | 'right';
  setHandOrientation: React.Dispatch<React.SetStateAction<'left' | 'right'>>;
  customTryOnHandUrl: string | null;
  setCustomTryOnHandUrl: (url: string | null) => void;
  overlayScale: number;
  setOverlayScale: (scale: number) => void;
  overlayOffsetY: number;
  setOverlayOffsetY: (offset: number) => void;
  tryOnZoom?: boolean;
  setTryOnZoom?: React.Dispatch<React.SetStateAction<boolean>>;
  skinToneId?: string;
  setSkinToneId?: (id: string) => void;
  activeSkinTone: SkinTonePreset;
  orderedFingers: Finger[];
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
}) {
  const [showAdjustSliders, setShowAdjustSliders] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [sharedToast, setSharedToast] = useState(false);

  // Real-Time MediaPipe Hand Landmark Tracking
  const [liveAnchors, setLiveAnchors] = useState<Record<Finger, FingertipAnchor> | null>(null);
  const [isTrackingHand, setIsTrackingHand] = useState(false);

  useEffect(() => {
    if (cameraStatus !== 'live' || !videoRef.current) {
      setLiveAnchors(null);
      setIsTrackingHand(false);
      return;
    }

    let isCancelled = false;
    let animId: number;
    let lastTime = -1;

    async function runLiveDetection() {
      const landmarker = await getVideoHandLandmarker();
      if (isCancelled || !landmarker) return;
      const activeLandmarker = landmarker;

      function detectFrame() {
        if (isCancelled) return;
        const video = videoRef.current;
        if (video && video.readyState >= 2 && video.currentTime !== lastTime) {
          lastTime = video.currentTime;
          try {
            const result = activeLandmarker.detectForVideo(video, performance.now());
            const anchors = extractFingertipAnchors(result);
            if (anchors) {
              setLiveAnchors(anchors);
              setIsTrackingHand(true);
            } else {
              setLiveAnchors(null);
              setIsTrackingHand(false);
            }
          } catch {
            // Frame skip
          }
        }
        animId = requestAnimationFrame(detectFrame);
      }

      detectFrame();
    }

    runLiveDetection();

    return () => {
      isCancelled = true;
      if (animId) cancelAnimationFrame(animId);
    };
  }, [cameraStatus, videoRef]);

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

  const handleSynthesizeHand = async () => {
    const sourceHand = customTryOnHandUrl || capturedFrameUrl;
    if (!sourceHand) return;
    setIsSynthesizingHand(true);
    setSynthesisError(null);

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
        setSynthesisError('Vertex AI image generation quota is cooling down (429). Please wait a moment and tap Retry.');
      } else {
        setSynthesisError(errJson?.error || 'AI hand synthesis could not be completed. Please tap Retry.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Synthesis error';
      setSynthesisError(`${msg}. Please tap Retry.`);
    } finally {
      setIsSynthesizingHand(false);
    }
  };

  // Screen 7 is active when a frame has been captured or a personal photo is uploaded
  const isShowingResult = cameraStatus === 'captured' || Boolean(customTryOnHandUrl);

  // The base image is ALWAYS the user's authentic uploaded hand (NEVER swapped with stock photos)
  const resultImageUrl =
    customTryOnHandUrl ||
    capturedFrameUrl ||
    (tryOnView === 'before' && activeSample?.id === 'set-berry-aura' ? '/assets/editorial_nail_hero.jpg' : activeSample?.photoUrl) ||
    '/assets/editorial_nail_hero.jpg';

  // Real-Time Static Photo MediaPipe Hand Landmark Fitting
  const [photoAnchors, setPhotoAnchors] = useState<Record<Finger, FingertipAnchor> | null>(null);
  const [isDetectingPhotoHand, setIsDetectingPhotoHand] = useState(false);

  useEffect(() => {
    if (!resultImageUrl || resultImageUrl === '/assets/editorial_nail_hero.jpg') {
      setPhotoAnchors(null);
      return;
    }

    let isMounted = true;
    setIsDetectingPhotoHand(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = resultImageUrl;
    img.onload = async () => {
      try {
        const anchors = await detectHandInImage(img);
        if (isMounted) {
          setPhotoAnchors(anchors);
        }
      } catch {
        if (isMounted) setPhotoAnchors(null);
      } finally {
        if (isMounted) setIsDetectingPhotoHand(false);
      }
    };
    img.onerror = () => {
      if (isMounted) {
        setPhotoAnchors(null);
        setIsDetectingPhotoHand(false);
      }
    };

    return () => {
      isMounted = false;
    };
  }, [resultImageUrl]);

  const handleSaveLook = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2200);
  };

  const handleRetake = () => {
    if (customTryOnHandUrl) {
      setCustomTryOnHandUrl(null);
    }
    onStartLiveCamera();
  };

  const handleApplyAi = (presetModifier?: typeof AI_PRESET_MODIFIERS[number]) => {
    setIsApplyingAi(true);

    setTimeout(() => {
      if (setNails) {
        setNails((prev) => {
          const next = { ...prev };
          const p = presetModifier;
          const text = aiCustomPrompt.toLowerCase();

          const newPattern: NailPattern | undefined =
            p?.pattern ||
            (text.includes('french')
              ? 'classic-french'
              : text.includes('floral')
              ? 'floral'
              : text.includes('swirl') || text.includes('chrome')
              ? 'chrome-swirl'
              : text.includes('aura')
              ? 'aura'
              : undefined);
          const newFinish: NailFinish | undefined =
            p?.finish ||
            (text.includes('matte')
              ? 'matte'
              : text.includes('chrome')
              ? 'chrome'
              : text.includes('glitter')
              ? 'glitter'
              : undefined);
          const newColor =
            p?.color ||
            (text.includes('bordeaux') || text.includes('burgundy')
              ? '#801A35'
              : text.includes('pearl') || text.includes('white')
              ? '#FDFCF7'
              : text.includes('gold')
              ? '#C59B27'
              : undefined);

          if (customizerScope === 'all') {
            FINGER_KEYS.forEach((fk) => {
              next[fk] = {
                ...next[fk],
                pattern: newPattern || next[fk].pattern,
                finish: newFinish || next[fk].finish,
                baseColor: newColor || next[fk].baseColor,
                status: 'edited',
              };
            });
          } else {
            next[targetFinger] = {
              ...next[targetFinger],
              pattern: newPattern || next[targetFinger].pattern,
              finish: newFinish || next[targetFinger].finish,
              baseColor: newColor || next[targetFinger].baseColor,
              status: 'edited',
            };
          }
          return next;
        });
      }

      setIsApplyingAi(false);
      setShowAiCustomizer(false);
      setAiCustomPrompt('');
      setCustomizedToast(true);
      setTimeout(() => setCustomizedToast(false), 2400);
    }, 600);
  };

  return (
    <div className="max-w-md mx-auto w-full px-2 sm:px-0">
      {/* Toast Notification */}
      {customizedToast && (
        <div className="fixed top-5 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
          <div className="bg-stone-900 text-white text-xs font-medium px-4 py-2 rounded-full shadow-xl border border-white/10 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Paintbrush className="w-3.5 h-3.5 text-[#E0246A]" />
            <span>AI customization applied to your manicure!</span>
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
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200/80 flex items-center justify-center text-stone-700 transition-all cursor-pointer active:scale-95"
              title="Retake or change photo"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
            </button>

            <div className="text-center">
              <h1 className="font-serif text-xl sm:text-2xl font-normal text-[#18181B] tracking-tight">
                Your Try-On Result
              </h1>
            </div>

            <div className="w-9 h-9" />
          </div>

          {/* Pill Toggle: [Natural Hand] [AI Manicure] */}
          {synthesizedHandUrl && (
            <div className="flex justify-center">
              <div className="inline-flex rounded-full bg-stone-100 p-1 border border-stone-200/80">
                <button
                  type="button"
                  onClick={() => setTryOnView('before')}
                  className={`px-5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                    tryOnView === 'before'
                      ? 'bg-[#18181B] text-white shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900 font-medium'
                  }`}
                >
                  Natural Hand
                </button>
                <button
                  type="button"
                  onClick={() => setTryOnView('after')}
                  className={`px-5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                    tryOnView === 'after'
                      ? 'bg-[#18181B] text-white shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900 font-medium'
                  }`}
                >
                  AI Manicure
                </button>
              </div>
            </div>
          )}

          {/* Hand Result Photo Viewport - Pure Photographic Studio Quality */}
          <div className="relative aspect-[3/4] max-h-[380px] sm:max-h-[420px] w-full rounded-3xl overflow-hidden bg-stone-900 shadow-md border border-stone-200/80 flex items-center justify-center mx-auto">
            {capturedFrameUrl || customTryOnHandUrl ? (
              <img
                src={
                  (tryOnView === 'after' && synthesizedHandUrl)
                    ? synthesizedHandUrl
                    : (resultImageUrl || '/assets/editorial_nail_hero.jpg')
                }
                alt="Try-On Hand"
                className="w-full h-full object-cover transition-all duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-stone-900">
                <EditorialHandVisual
                  nails={nails}
                  skinTone={activeSkinTone}
                  width={300}
                  height={350}
                  isRight={handOrientation === 'right'}
                  naturalOnly={tryOnView === 'before'}
                />
              </div>
            )}

            {/* AI Synthesizing Spinner Overlay */}
            {isSynthesizingHand && (
              <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2.5 text-white p-4 text-center">
                <div className="w-10 h-10 rounded-full border-2 border-pink-200 border-t-[#E0246A] animate-spin" />
                <span className="text-xs font-medium">Vertex AI synthesizing manicure on your hand...</span>
              </div>
            )}

            {/* Subtle before/after indicator pill */}
            <div className="absolute top-3 left-3 z-20">
              <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium tracking-wide">
                {synthesizedHandUrl && tryOnView === 'after' ? 'AI Manicure' : 'Natural Hand'}
              </span>
            </div>
          </div>

          {/* Error / Rate Limit Notification Banner */}
          {synthesisError && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs space-y-2 animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-left">
                  <span className="font-semibold block">Generation Notification</span>
                  <p className="text-amber-800 leading-relaxed">{synthesisError}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={isSynthesizingHand}
                  onClick={handleSynthesizeHand}
                  className="px-4 py-1.5 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white font-semibold transition cursor-pointer shadow-xs active:scale-95 disabled:opacity-60"
                >
                  Retry Generation
                </button>
                <button
                  type="button"
                  onClick={() => setSynthesisError(null)}
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-amber-100/50 border border-amber-200 text-amber-900 font-medium transition cursor-pointer active:scale-95"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* AI Generation State or CTA */}
          {!synthesizedHandUrl ? (
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 text-center space-y-3">
              <div className="space-y-1">
                <h3 className="font-serif text-base font-medium text-stone-900">
                  Ready to Generate Your Manicure
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                  Apply the reference design directly onto your hand photo using Vertex AI image-to-image.
                </p>
              </div>

              <button
                type="button"
                disabled={isSynthesizingHand}
                onClick={handleSynthesizeHand}
                className="w-full h-11 rounded-2xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#E0246A]/25 transition-all inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-75"
              >
                {isSynthesizingHand ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    <span>Synthesizing Hand with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Generate Manicure on My Hand with AI</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <span className="text-[11px] text-stone-500 font-medium">
                AI Manicure synthesized onto your hand
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSynthesizingHand}
                  onClick={handleSynthesizeHand}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-60"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>{isSynthesizingHand ? 'Synthesizing...' : 'Regenerate Hand with AI'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAiCustomizer(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#FDF2F8] border border-stone-200 hover:border-[#E0246A]/40 text-stone-800 hover:text-[#E0246A] text-xs font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer"
                >
                  <Paintbrush className="w-3.5 h-3.5 text-[#E0246A]" />
                  <span>Customize Colors</span>
                </button>
              </div>
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1 w-full">
            <button
              type="button"
              onClick={handleSaveLook}
              className="w-full h-11 sm:h-12 px-3 rounded-2xl bg-white border border-stone-200 text-stone-800 text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-2xs hover:bg-stone-50 transition-all cursor-pointer active:scale-95 min-w-0"
            >
              {savedToast ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-emerald-700 truncate">Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-stone-600 shrink-0" />
                  <span className="truncate">Save</span>
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
              className="w-full h-11 sm:h-12 px-3 rounded-2xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95 min-w-0"
            >
              {sharedToast ? (
                <>
                  <Check className="w-4 h-4 text-white shrink-0" strokeWidth={2} />
                  <span className="truncate">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 shrink-0" />
                  <span className="truncate">Share Look</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* SCREEN 6: VIRTUAL TRY-ON (CAPTURE / UPLOAD)                    */
        /* ============================================================== */
        <div className="space-y-3">
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
                Virtual Try-On
              </h1>
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

          {/* Pill Mode Toggle: [Camera] [Photo] */}
          <div className="flex justify-center">
            <div className="inline-flex rounded-full bg-stone-100 p-1 border border-stone-200/80">
              <button
                type="button"
                onClick={() => setTryOnMode('camera')}
                className={`px-6 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                  tryOnMode === 'camera' || tryOnMode === 'sample'
                    ? 'bg-[#18181B] text-white shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900 font-medium'
                }`}
              >
                Camera
              </button>
              <button
                type="button"
                onClick={() => setTryOnMode('upload')}
                className={`px-6 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                  tryOnMode === 'upload'
                    ? 'bg-[#18181B] text-white shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900 font-medium'
                }`}
              >
                Photo
              </button>
            </div>
          </div>

          {/* Camera Viewfinder - Sized properly to fit in 1 view */}
          {(tryOnMode === 'camera' || tryOnMode === 'sample') && (
            <div className="relative aspect-[3/4] max-h-[380px] sm:max-h-[420px] w-full rounded-3xl overflow-hidden bg-stone-950 shadow-md border border-stone-200/80 flex items-center justify-center mx-auto">
              {/* Idle or Starting state */}
              {cameraStatus === 'idle' || cameraStatus === 'starting' ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-gradient-to-b from-stone-900 to-black">
                  {/* Subtle Corner Focus Guides - Symmetrical 4 corners */}
                  <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-white/60 rounded-tl-xl pointer-events-none" />
                  <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-white/60 rounded-tr-xl pointer-events-none" />
                  <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-white/60 rounded-bl-xl pointer-events-none" />
                  <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-white/60 rounded-br-xl pointer-events-none" />

                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg">
                    <Camera className="w-7 h-7" strokeWidth={1.5} />
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white tracking-wide">
                      Position your hand in the frame
                    </p>
                    <p className="text-xs text-stone-400 max-w-xs">
                      Hold your hand flat in natural light facing the camera lens
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={onStartLiveCamera}
                      disabled={cameraStatus === 'starting'}
                      className="h-11 px-6 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
                    >
                      <Video className="w-4 h-4" />
                      <span>{cameraStatus === 'starting' ? 'Starting Camera...' : 'Open Live Camera'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTryOnMode('upload')}
                      className="text-xs text-stone-400 hover:text-stone-200 transition-colors cursor-pointer py-1"
                    >
                      or choose a photo from library
                    </button>
                  </div>
                </div>
              ) : (
                /* Live WebRTC Stream */
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Real-Time MediaPipe AR Fingertip Anchors */}
                  {liveAnchors && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                      {orderedFingers.map((fk) => {
                        const anchor = liveAnchors[fk];
                        if (!anchor) return null;
                        return (
                          <div
                            key={fk}
                            className="absolute transition-transform duration-75"
                            style={{
                              left: `${anchor.tipX * 100}%`,
                              top: `${anchor.tipY * 100}%`,
                              transform: `translate(-50%, -75%) rotate(${anchor.angleDeg}deg) scale(${anchor.scale * (overlayScale / 100)})`,
                            }}
                          >
                            <NailCanvasPreview
                              nail={nails[fk]}
                              width={50}
                              height={75}
                              showCuticle={false}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Corner Registration Frame - Hand Placement Target Area */}
                  <div
                    className={`absolute top-12 bottom-24 inset-x-6 pointer-events-none rounded-2xl border transition-opacity duration-300 ${
                      isTrackingHand ? 'border-white/10 opacity-30' : 'border-white/25 opacity-100'
                    }`}
                  >
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-lg" />
                  </div>

                  {/* Top Guide Text / Live AR Status Indicator */}
                  <div className="absolute top-4 inset-x-0 flex justify-center pointer-events-none z-20">
                    <span
                      className={`px-3.5 py-1 rounded-full backdrop-blur-md text-white text-[11px] font-medium tracking-wide flex items-center gap-1.5 transition-all ${
                        isTrackingHand
                          ? 'bg-[#E0246A]/90 shadow-md border border-white/20'
                          : 'bg-black/60'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isTrackingHand ? 'bg-white animate-pulse' : 'bg-amber-400'
                        }`}
                      />
                      <span>
                        {isTrackingHand
                          ? 'Live AR: 5 Fingertips Locked'
                          : 'Position your hand in the frame'}
                      </span>
                    </span>
                  </div>

                  {/* Bottom Controls Bar with subtle vignette */}
                  <div className="absolute bottom-0 inset-x-0 pt-6 pb-4 px-6 flex items-center justify-between z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    {/* Gallery / Photo Upload Icon */}
                    <button
                      type="button"
                      onClick={() => setTryOnMode('upload')}
                      className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all cursor-pointer active:scale-95"
                      title="Upload hand photo"
                    >
                      <ImagePlus className="w-5 h-5" strokeWidth={1.5} />
                    </button>

                    {/* Shutter Button */}
                    <button
                      type="button"
                      onClick={onCaptureCameraFrame}
                      className="w-15 h-15 rounded-full border-4 border-white bg-white/20 backdrop-blur-xs p-1 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl cursor-pointer"
                      title="Capture photo"
                    >
                      <span className="w-full h-full rounded-full bg-white flex items-center justify-center" />
                    </button>

                    {/* Switch Hand Orientation */}
                    <button
                      type="button"
                      onClick={() => setHandOrientation((h) => (h === 'right' ? 'left' : 'right'))}
                      className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all cursor-pointer active:scale-95 text-[11px] font-semibold"
                      title="Toggle Left/Right Hand"
                    >
                      {handOrientation === 'right' ? 'R' : 'L'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Photo Upload Viewfinder - Sized properly to fit in 1 view */}
          {tryOnMode === 'upload' && (
            <div className="relative aspect-[3/4] max-h-[380px] sm:max-h-[420px] w-full rounded-3xl overflow-hidden bg-stone-50 border-2 border-dashed border-stone-200 flex flex-col items-center justify-center p-6 text-center space-y-4 mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#FDF2F8] border border-[#E0246A]/20 text-[#E0246A] flex items-center justify-center shadow-xs">
                <ImagePlus className="w-7 h-7" strokeWidth={1.5} />
              </div>

              <div className="space-y-1 max-w-xs">
                <h3 className="font-serif text-xl font-normal text-stone-900">
                  Upload hand photo
                </h3>
                <p className="text-xs text-stone-500">
                  Select a clean top-down photograph of your bare fingers to try on this manicure.
                </p>
              </div>

              <label className="cursor-pointer h-11 px-6 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-md transition-all active:scale-95">
                <ImagePlus className="w-4 h-4" />
                <span>Select Hand Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const dataUrl = await downscaleImageForVision(f, 1000, 0.85);
                      setCustomTryOnHandUrl(dataUrl || URL.createObjectURL(f));
                    }
                  }}
                />
              </label>
            </div>
          )}

          {/* AI Customization Pill */}
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => setShowAiCustomizer(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-[#FDF2F8] border border-stone-200 hover:border-[#E0246A]/40 text-stone-700 hover:text-[#E0246A] text-xs font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <Paintbrush className="w-3.5 h-3.5 text-[#E0246A]" />
              <span>Customize Nails with AI</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* AI CUSTOMIZER MODAL (ALL-IN-ALL OR PER-FINGER)                 */}
      {/* ============================================================== */}
      {showAiCustomizer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FDF2F8] border border-[#E0246A]/20 flex items-center justify-center text-[#E0246A]">
                  <Paintbrush className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-stone-900 leading-tight">
                    Customize with AI
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Transform all nails together or customize specific fingers
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAiCustomizer(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scope Selection: All Fingers vs Specific Finger */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500">
                Customization Scope
              </span>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setCustomizerScope('all')}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    customizerScope === 'all'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  All Fingers Together
                </button>
                <button
                  type="button"
                  onClick={() => setCustomizerScope('single')}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    customizerScope === 'single'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Specific Finger
                </button>
              </div>
            </div>

            {/* If Specific Finger: Finger Selector */}
            {customizerScope === 'single' && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500">
                  Select Target Finger
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {FINGER_KEYS.map((fk) => {
                    const isSelected = targetFinger === fk;
                    return (
                      <button
                        key={fk}
                        type="button"
                        onClick={() => setTargetFinger(fk)}
                        className={`p-2 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-[#FDF2F8] border-[#E0246A] ring-2 ring-[#E0246A]/20'
                            : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        <NailCanvasPreview
                          nail={nails[fk]}
                          width={20}
                          height={30}
                          showCuticle={false}
                        />
                        <span className="text-[9.5px] font-semibold text-stone-800 capitalize truncate">
                          {FINGER_LABELS[fk]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick AI Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500">
                Quick AI Styles
              </span>
              <div className="flex flex-wrap gap-1.5">
                {AI_PRESET_MODIFIERS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleApplyAi(preset)}
                    className="px-2.5 py-1 rounded-full bg-stone-50 hover:bg-[#FDF2F8] hover:text-[#E0246A] border border-stone-200/80 text-[11px] font-medium text-stone-700 transition cursor-pointer active:scale-95"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Prompt Input */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500">
                Custom AI Prompt
              </span>
              <textarea
                value={aiCustomPrompt}
                onChange={(e) => setAiCustomPrompt(e.target.value)}
                placeholder="e.g. Add subtle chrome swirls, make ring finger a floral accent, switch to glossy almond..."
                rows={2}
                className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#E0246A]/20 focus:border-[#E0246A] resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowAiCustomizer(false)}
                className="flex-1 h-11 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleApplyAi()}
                disabled={isApplyingAi || !aiCustomPrompt.trim()}
                className="flex-2 h-11 rounded-2xl bg-[#E0246A] hover:bg-[#BE185D] disabled:opacity-40 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer active:scale-95"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{isApplyingAi ? 'Applying AI...' : 'Apply with AI'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
