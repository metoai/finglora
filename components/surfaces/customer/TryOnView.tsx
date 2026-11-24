import React, { useState, useEffect, useRef } from 'react';
import {
  ImagePlus,
  RotateCcw,
  ArrowLeft,
  Share2,
  Heart,
  Check,
  RefreshCw,
  Sliders,
  Hand,
  Camera,
  UploadCloud,
  Download,
  Loader2,
  Maximize2,
  X,
  Compass,
  Shuffle,
  ArrowRight,
} from 'lucide-react';
import { ExploreDesignSet, Finger, NailDesign, SkinTonePreset } from '@/types/nail';
import { CURATED_EDITORIAL_DESIGNS } from '@/constants/nail-data';
import { downscaleImageForVision, uploadAppliedTryOnResult } from '@/lib/services/storage';
import { HandCameraCaptureModal } from '@/components/common/HandCameraCaptureModal';
import { SocialShareModal } from '@/components/common/SocialShareModal';
import { downloadEditorialImage, shareToStoryOrSocial } from '@/lib/services/editorial-export';

// Nails fill in one by one while the manicure is being generated (thumb -> pinky).
// A stylized hand is used because we do not know where the nails are in the user's photo.
const CURING_NAIL_DELAYS = [0.9, 2.1, 3.3, 4.5, 5.7];

function CuringMiniHand() {
  return (
    <svg viewBox="0 0 250 300" className="w-[64px] h-[76px]" aria-hidden="true">
      <g fill="#6a5a62">
        <rect x="58" y="140" width="116" height="140" rx="48" />
        <rect x="58" y="96" width="24" height="120" rx="12" />
        <rect x="84" y="58" width="26" height="150" rx="13" />
        <rect x="112" y="44" width="26" height="160" rx="13" />
        <rect x="142" y="64" width="26" height="140" rx="13" />
        <rect x="156" y="160" width="28" height="96" rx="14" transform="rotate(40 170 250)" />
      </g>
      <rect className="tryon-nail" style={{ animationDelay: `${CURING_NAIL_DELAYS[0]}s` }} x="161" y="162" width="18" height="26" rx="8" transform="rotate(40 170 250)" />
      <rect className="tryon-nail" style={{ animationDelay: `${CURING_NAIL_DELAYS[1]}s` }} x="146" y="68" width="18" height="26" rx="8" />
      <rect className="tryon-nail" style={{ animationDelay: `${CURING_NAIL_DELAYS[2]}s` }} x="116" y="48" width="18" height="26" rx="8" />
      <rect className="tryon-nail" style={{ animationDelay: `${CURING_NAIL_DELAYS[3]}s` }} x="88" y="62" width="18" height="26" rx="8" />
      <rect className="tryon-nail" style={{ animationDelay: `${CURING_NAIL_DELAYS[4]}s` }} x="61" y="100" width="18" height="24" rx="8" />
    </svg>
  );
}

function RevealSparkle({ left, top, delay }: { left: string; top: string; delay: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="tryon-spark absolute w-5 h-5 pointer-events-none"
      style={{ left, top, animationDelay: delay }}
      aria-hidden="true"
    >
      <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="#ffffff" />
    </svg>
  );
}

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
  exploreDesigns = [],
  activeSample,
  activePhotoUrl,
  onCustomizeWithAi,
  onSelectExploreDesign,
  onResetInspo,
  onExploreClick,
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
  onResetInspo?: () => void;
  onExploreClick?: () => void;
}) {
  const [savedToast, setSavedToast] = useState(false);
  const [exportToast, setExportToast] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [isSavedFavorite, setIsSavedFavorite] = useState<boolean>(activeSample?.isSaved || false);

  const changeHandInputRef = useRef<HTMLInputElement>(null);
  const changeRefInspoInputRef = useRef<HTMLInputElement>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isHandSourceModalOpen, setIsHandSourceModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [internalSynthesizedHandUrl, setInternalSynthesizedHandUrl] = useState<string | null>(null);
  const synthesizedHandUrl = propSynthesizedHandUrl !== undefined ? propSynthesizedHandUrl : internalSynthesizedHandUrl;
  const setSynthesizedHandUrl = (url: string | null) => {
    setInternalSynthesizedHandUrl(url);
    propSetSynthesizedHandUrl?.(url);
  };

  const [isSynthesizingHand, setIsSynthesizingHand] = useState(false);
  const [synthesisPhase, setSynthesisPhase] = useState<number>(0);
  const [synthesisError, setSynthesisError] = useState<string | null>(null);
  const [isLocallyCleared, setIsLocallyCleared] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [curePct, setCurePct] = useState(0);

  // Smooth, never-frozen percentage: eases toward 99 and only the real result ends the wait
  useEffect(() => {
    if (!isSynthesizingHand) {
      setCurePct(0);
      return;
    }
    const id = setInterval(() => {
      setCurePct((p) => Math.min(99, p + (99 - p) * 0.035 + 0.05));
    }, 120);
    return () => clearInterval(id);
  }, [isSynthesizingHand]);

  // Before/after wipe plays once when a new result lands, then settles
  useEffect(() => {
    if (!isRevealing) return;
    const t = setTimeout(() => setIsRevealing(false), 2800);
    return () => clearTimeout(t);
  }, [isRevealing]);

  // Psychological salon phase sequencer while applying
  useEffect(() => {
    if (!isSynthesizingHand) {
      setSynthesisPhase(0);
      return;
    }

    setSynthesisPhase(1);
    const t1 = setTimeout(() => setSynthesisPhase(2), 1800);
    const t2 = setTimeout(() => setSynthesisPhase(3), 3600);
    const t3 = setTimeout(() => setSynthesisPhase(4), 5400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isSynthesizingHand]);

  // Derived effective inspiration details
  const effectiveInspoUrl = !isLocallyCleared ? (activePhotoUrl || activeSample?.photoUrl || '') : '';
  const effectiveInspoTitle = !isLocallyCleared ? (activeSample?.title || (activePhotoUrl ? 'Custom Inspo Look' : '')) : '';
  const effectiveInspoCategory = !isLocallyCleared ? (activeSample?.category || 'Manicure') : '';
  const hasActiveInspo = Boolean(effectiveInspoUrl);

  // Whenever a new inspiration look is provided from props, re-enable inspo display
  useEffect(() => {
    if (activePhotoUrl || activeSample?.id) {
      setIsLocallyCleared(false);
    }
  }, [activePhotoUrl, activeSample?.id]);

  const handleResetInspoClick = () => {
    setIsLocallyCleared(true);
    setInternalSynthesizedHandUrl(null);
    propSetSynthesizedHandUrl?.(null);
    setTryOnView('before');
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('finglora_synthesized_hand_url');
      } catch {}
    }
    onResetInspo?.();
  };

  const handleAutoPickNextInspo = () => {
    const pool = exploreDesigns && exploreDesigns.length > 0 ? exploreDesigns : CURATED_EDITORIAL_DESIGNS;
    const candidates = pool.filter((d) => d.id !== activeSample?.id && d.photoUrl !== effectiveInspoUrl);
    const chosen = candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : pool[0];

    if (chosen) {
      setIsLocallyCleared(false);
      setInternalSynthesizedHandUrl(null);
      propSetSynthesizedHandUrl?.(null);
      setTryOnView('before');
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('finglora_synthesized_hand_url');
        } catch {}
      }
      onSelectExploreDesign?.(chosen.id);
      setExportToast(`Switched to ${chosen.title}`);
      setTimeout(() => setExportToast(null), 2000);
    }
  };

  // Synchronize favorite status
  useEffect(() => {
    if (activeSample) {
      setIsSavedFavorite(activeSample.isSaved || false);
    }
  }, [activeSample]);

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
    } else {
      setIsRevealing(false);
    }
  }, [synthesizedHandUrl, setTryOnView]);

  const handleSynthesizeHand = async () => {
    const sourceHand = customTryOnHandUrl || capturedFrameUrl || 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_pearl_almond_01.jpg';
    if (!sourceHand) return;
    setIsSynthesizingHand(true);
    setSynthesisError(null);
    setInternalSynthesizedHandUrl(null);
    propSetSynthesizedHandUrl?.(null);

    try {
      let handBase64 = '';
      if (sourceHand.startsWith('data:image/')) {
        handBase64 = sourceHand;
      } else {
        handBase64 = await downscaleImageForVision(sourceHand, 768, 0.72);
      }

      let refBase64: string | undefined = undefined;
      const refSource = effectiveInspoUrl;
      if (refSource) {
        if (refSource.startsWith('data:image/')) {
          refBase64 = refSource;
        } else {
          refBase64 = await downscaleImageForVision(refSource, 768, 0.72);
        }
      }

      const prompt = `Complete manicure with ${nails.middle.shape} shape: Thumb has ${nails.thumb.title}, Index has ${nails.index.title}, Middle has ${nails.middle.title}, Ring has ${nails.ring.title}, Pinky has ${nails.pinky.title}. Clean, natural, dry skin under and around all nails with no vaseline, petroleum jelly, or greasy residue. Nail design only, do not include any rings, jewelry, or external objects from the reference inspo.`;

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
          setIsRevealing(true);

          // Asynchronously persist to Supabase Storage & try_on_history table
          uploadAppliedTryOnResult({
            imageDataUrl: data.imageUrl,
            setId: activeSample?.id,
            skinToneId: activeSkinTone?.id || 'warm-ivory',
            mode: 'ai-synthesis',
          }).catch((err) => console.warn('Background try-on upload notice:', err));

          try {
            navigator.vibrate?.(30);
          } catch {}
          return;
        }
      }

      const errJson = await res.json().catch(() => ({}));
      const is429 = res.status === 429 || errJson?.isRateLimit || errJson?.error?.includes('RESOURCE_EXHAUSTED');
      if (is429) {
        setSynthesisError('Service is experiencing high demand. Please try again in a moment.');
      } else {
        setSynthesisError(errJson?.error || 'Could not generate manicure. Please try again.');
      }
    } catch {
      setSynthesisError('Connection error while generating manicure.');
    } finally {
      setIsSynthesizingHand(false);
    }
  };

  // Whenever exiting Try-On, reset all generated state so user always starts fresh next time
  useEffect(() => {
    return () => {
      setInternalSynthesizedHandUrl(null);
      propSetSynthesizedHandUrl?.(null);
      setIsSynthesizingHand(false);
      setSynthesisError(null);
      setIsZoomOpen(false);
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('finglora_synthesized_hand_url');
        } catch {}
      }
    };
  }, []);

  // Hand source image fallback
  const handSourceImageUrl =
    customTryOnHandUrl ||
    capturedFrameUrl ||
    'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_pearl_almond_01.jpg';

  const displayedHandImage =
    tryOnView === 'after' && synthesizedHandUrl
      ? synthesizedHandUrl
      : handSourceImageUrl;

  const handleRetake = () => {
    setCustomTryOnHandUrl(null);
    setInternalSynthesizedHandUrl(null);
    propSetSynthesizedHandUrl?.(null);
    try {
      localStorage.removeItem('finglora_custom_hand_photo');
      localStorage.removeItem('finglora_user_hand_photo');
    } catch {}
  };

  const handleDownloadBrandedLook = async () => {
    setIsExporting(true);
    try {
      await downloadEditorialImage(displayedHandImage, {
        designTitle: activeSample?.title || 'Finglora Manicure',
        category: activeSample?.category || 'Manicure',
        filename: `finglora-${(activeSample?.title || 'manicure').toLowerCase().replace(/\s+/g, '-')}.jpg`,
      });
      setExportToast('High-resolution manicure photo saved with Finglora brand');
      setTimeout(() => setExportToast(null), 3000);
    } catch {
      setExportToast('Could not download image. Please try again.');
      setTimeout(() => setExportToast(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareToStory = async () => {
    setIsExporting(true);
    try {
      const res = await shareToStoryOrSocial(displayedHandImage, {
        designTitle: activeSample?.title || 'Finglora Manicure',
        category: activeSample?.category || 'Manicure',
        filename: `finglora-story-${(activeSample?.title || 'look').toLowerCase().replace(/\s+/g, '-')}.jpg`,
        storyAspect: true,
      });
      if (res.mode === 'shared') {
        setExportToast('Opening share options...');
        setTimeout(() => setExportToast(null), 2500);
      } else if (res.mode === 'dialog') {
        setIsShareModalOpen(true);
      }
    } catch {
      setExportToast('Could not open share options.');
      setTimeout(() => setExportToast(null), 2500);
    } finally {
      setIsExporting(false);
    }
  };

  const handleToggleFavorite = () => {
    const next = !isSavedFavorite;
    setIsSavedFavorite(next);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2400);
  };

  // Filtered reference designs
  const filteredQuickDesigns = CURATED_EDITORIAL_DESIGNS.filter((design) => {
    if (activeCategoryFilter === 'All') return true;
    return design.category.toLowerCase().includes(activeCategoryFilter.toLowerCase());
  });

  return (
    <div className="w-full max-w-[1700px] mx-auto space-y-4 sm:space-y-6 select-none animate-in fade-in duration-200">
      <style>{`
        @keyframes tryonNailFill { from { fill: #E9CDBE; } to { fill: #E0246A; } }
        @keyframes tryonWipe { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
        @keyframes tryonLine { 0% { left: 0%; opacity: 1; } 88% { opacity: 1; } 100% { left: 100%; opacity: 0; } }
        @keyframes tryonSpark { 0% { opacity: 0; transform: scale(.3) rotate(0deg); } 50% { opacity: 1; transform: scale(1) rotate(30deg); } 100% { opacity: 0; transform: scale(.6) rotate(60deg); } }
        @keyframes tryonChip { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
        .tryon-nail { fill: #E9CDBE; animation: tryonNailFill .6s ease-out forwards; }
        .tryon-wipe { animation: tryonWipe 1.6s cubic-bezier(.65,0,.35,1) forwards; }
        .tryon-line { animation: tryonLine 1.6s cubic-bezier(.65,0,.35,1) forwards; }
        .tryon-spark { opacity: 0; animation: tryonSpark 1.4s ease-in-out forwards; }
        .tryon-chip { opacity: 0; animation: tryonChip .4s ease-out 1.5s forwards; }
        @media (prefers-reduced-motion: reduce) {
          .tryon-nail, .tryon-wipe, .tryon-line, .tryon-spark, .tryon-chip { animation-duration: .01s !important; animation-delay: 0s !important; }
        }
      `}</style>

      {/* Toast Notifications */}
      {savedToast && (
        <div className="fixed top-5 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
          <div className="bg-[#181416] text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-xl border border-white/10 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Heart className={`w-3.5 h-3.5 ${isSavedFavorite ? 'fill-[#E0246A] text-[#E0246A]' : 'text-stone-400'}`} />
            <span>{isSavedFavorite ? 'Added to Saved Looks' : 'Removed from Saved Looks'}</span>
          </div>
        </div>
      )}

      {exportToast && (
        <div className="fixed top-5 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
          <div className="bg-[#181416] text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-xl border border-white/10 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Check className="w-3.5 h-3.5 text-[#E0246A]" />
            <span>{exportToast}</span>
          </div>
        </div>
      )}

      {/* Full-Space Atelier 2-Column Responsive Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 items-start">
        {/* ============================================================== */}
        {/* LEFT COLUMN: THE MASTER PHOTOREALISTIC HAND VIEWPORT (7 Cols)  */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 space-y-3 sm:space-y-4">
          <div className="bg-white rounded-3xl p-3 sm:p-5 border border-stone-200/90 shadow-sm space-y-3.5">
            {/* Viewport Top Toolbar */}
            <div className={`flex items-center ${hasActiveInspo && !synthesizedHandUrl ? 'justify-end' : 'justify-between'} gap-2`}>
              {hasActiveInspo && !synthesizedHandUrl ? null : (
                /* Natural vs Manicure Pill Toggle */
                <div className="inline-flex rounded-full bg-stone-100 p-0.5 border border-stone-200/80 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setTryOnView('before')}
                    className={`px-3.5 py-1.5 rounded-full text-xs transition cursor-pointer ${
                      tryOnView === 'before'
                        ? 'bg-stone-900 text-white font-semibold shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 font-medium'
                    }`}
                  >
                    Bare Hand
                  </button>
                  <button
                    type="button"
                    onClick={() => setTryOnView('after')}
                    className={`px-3.5 py-1.5 rounded-full text-xs transition cursor-pointer ${
                      tryOnView === 'after'
                        ? 'bg-[#E0246A] text-white font-semibold shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 font-medium'
                    }`}
                  >
                    With Manicure
                  </button>
                </div>
              )}

              {/* Action Icons */}
              <div className="flex items-center gap-1.5">
                {synthesizedHandUrl && (
                  <>
                    <button
                      type="button"
                      onClick={handleDownloadBrandedLook}
                      disabled={isExporting}
                      className="w-8 h-8 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 shadow-2xs flex items-center justify-center cursor-pointer transition active:scale-95 disabled:opacity-50"
                      title="Download HD Photo"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleShareToStory}
                      disabled={isExporting}
                      className="w-8 h-8 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white shadow-2xs flex items-center justify-center cursor-pointer transition active:scale-95 disabled:opacity-50"
                      title="Share to Story"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(true)}
                  className="w-8 h-8 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 shadow-2xs flex items-center justify-center cursor-pointer transition active:scale-95"
                  title="Inspect Fullscreen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-stone-200/90 flex items-center justify-center mx-auto shadow-inner group transition-all duration-300 ${
              hasActiveInspo && !synthesizedHandUrl
                ? 'bg-white p-1.5 sm:p-2.5 h-[340px] xs:h-[380px] sm:h-[450px] md:h-[500px] lg:h-[540px]'
                : 'bg-stone-100 aspect-[3/4] max-h-[560px] lg:max-h-[620px]'
            }`}>

              {/* Viewport Content: When applying, focus strictly on user's single hand. Otherwise show side-by-side if inspo staged */}
              {hasActiveInspo && !synthesizedHandUrl && !isSynthesizingHand ? (
                <div className="relative w-full h-full grid grid-cols-2 gap-1.5 sm:gap-2.5">
                  {/* Left Side: Your Hand */}
                  <div className="relative h-full rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-stone-200/80 shadow-2xs flex items-center justify-center group/hand">
                    <img
                      src={handSourceImageUrl}
                      alt="Your Hand"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/hand:scale-102"
                    />

                    {/* Top Badge: Your Hand */}
                    <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10">
                      <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-white/95 backdrop-blur-md text-stone-800 text-[9px] sm:text-[11px] font-semibold tracking-wide flex items-center gap-1 sm:gap-1.5 border border-stone-200/90 shadow-xs">
                        <Hand className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#E0246A]" />
                        <span>{customTryOnHandUrl ? 'Your Hand' : 'Studio Hand'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Right Side: Picked Inspo */}
                  <div className="relative h-full rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-stone-200/80 shadow-2xs flex items-center justify-center group/inspo">
                    <img
                      src={effectiveInspoUrl}
                      alt={effectiveInspoTitle || 'Selected Inspo'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/inspo:scale-103"
                    />
                    <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10">
                      <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-[#E0246A] text-white text-[9px] sm:text-[11px] font-semibold tracking-wide flex items-center shadow-xs">
                        <span>Picked Inspo</span>
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5 z-10 hidden sm:block">
                      <span className="px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-stone-800 text-[10px] font-medium border border-stone-200/90 shadow-xs capitalize">
                        {nails.middle.shape}
                      </span>
                    </div>

                    {/* Change Inspo (Shuffle) Button */}
                    <div className="absolute bottom-2 inset-x-2 sm:bottom-2.5 sm:inset-x-2.5 flex items-center justify-center z-10">
                      <button
                        type="button"
                        onClick={handleAutoPickNextInspo}
                        className="px-2.5 sm:px-3 py-1 sm:py-1 rounded-full bg-white/95 hover:bg-white text-stone-700 hover:text-stone-900 backdrop-blur-md text-[9px] sm:text-[10px] font-medium border border-stone-200/90 transition cursor-pointer active:scale-95 flex items-center gap-1 shadow-xs"
                        title="Shuffle next inspiration"
                      >
                        <Shuffle className="w-2.5 h-2.5 text-[#E0246A]" />
                        <span>Change Inspo</span>
                      </button>
                    </div>
                  </div>

                  {/* Center Floating "Apply" Badge / Action Button */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <button
                      type="button"
                      onClick={handleSynthesizeHand}
                      className="group pointer-events-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#E0246A] hover:bg-[#CE1B5D] text-white ring-4 ring-white shadow-[0_4px_20px_rgba(224,36,106,0.4)] text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5 hover:scale-105"
                      title="Apply manicure inspiration to your hand"
                    >
                      <span>Apply</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Single hand image. After a result lands, play a one-time bare -> manicure wipe. */}
                  {isRevealing && synthesizedHandUrl ? (
                    <div className="absolute inset-0 overflow-hidden">
                      <img
                        src={handSourceImageUrl}
                        alt="Bare hand"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <img
                        src={synthesizedHandUrl}
                        alt="Virtual Try-On Viewport"
                        onClick={() => setIsZoomOpen(true)}
                        className="tryon-wipe absolute inset-0 w-full h-full object-cover cursor-pointer"
                      />
                      <div className="tryon-line absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                          <ArrowRight className="w-4 h-4 text-stone-900" strokeWidth={2.5} />
                        </div>
                      </div>
                      <RevealSparkle left="58%" top="26%" delay="1.1s" />
                      <RevealSparkle left="36%" top="18%" delay="1.5s" />
                      <RevealSparkle left="72%" top="44%" delay="1.9s" />
                      <div className="absolute top-4 inset-x-0 flex justify-center pointer-events-none">
                        <span className="tryon-chip px-3.5 py-1.5 rounded-full bg-[#E0246A] text-white text-xs font-semibold shadow-lg">
                          Your set is ready
                        </span>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={isSynthesizingHand ? handSourceImageUrl : displayedHandImage}
                      alt="Virtual Try-On Viewport"
                      onClick={() => setIsZoomOpen(true)}
                      className="w-full h-full object-cover transition-transform duration-500 cursor-pointer"
                      title="Click to zoom in"
                    />
                  )}

                  {/* Curing overlay: stage pill, nail-progress hand, big counter, segmented stages */}
                  {isSynthesizingHand && (
                    <div className="absolute inset-0 z-30 pointer-events-none select-none animate-in fade-in duration-300">
                      {/* Edge vignette only, so the hand stays clear */}
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />

                      {/* LED beam sweeping over the hand */}
                      <div className="absolute inset-x-0 h-28 bg-gradient-to-b from-transparent via-[#E0246A]/25 to-transparent animate-cure-beam" />

                      {/* Top: stage pill */}
                      <div className="absolute top-4 inset-x-0 flex justify-center">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900/80 text-white backdrop-blur-md border border-white/10 text-xs font-medium">
                          <span className="relative flex w-2 h-2">
                            <span className="absolute inline-flex w-full h-full rounded-full bg-[#E0246A] animate-ping" />
                            <span className="relative inline-flex w-2 h-2 rounded-full bg-[#E0246A]" />
                          </span>
                          <span key={synthesisPhase} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                            {synthesisPhase <= 1 && 'Calibrating skin tone & cuticles'}
                            {synthesisPhase === 2 && `Sculpting ${nails.middle.shape} silhouette`}
                            {synthesisPhase === 3 && 'Infusing lacquer pigment'}
                            {synthesisPhase >= 4 && 'LED gel clearcoat curing'}
                          </span>
                        </div>
                      </div>

                      {/* Top right: ghost hand whose nails fill in one by one */}
                      <div className="absolute top-14 right-3 sm:right-4 w-[84px] rounded-2xl bg-black/35 backdrop-blur-md border border-white/20 p-2 flex flex-col items-center gap-1">
                        <CuringMiniHand />
                        <span className="w-full text-center text-[10px] font-semibold text-white/90 truncate">
                          {effectiveInspoTitle || 'Your look'}
                        </span>
                      </div>

                      {/* Bottom: big counter + segmented stage bar */}
                      <div className="absolute bottom-0 inset-x-0 px-5 sm:px-6 pt-10 pb-5 bg-gradient-to-t from-black/75 to-transparent">
                        <div className="flex items-end justify-between gap-4">
                          <div className="flex items-baseline gap-1 text-white">
                            <span className="font-serif font-light text-6xl leading-none tabular-nums">{Math.floor(curePct)}</span>
                            <span className="font-serif text-2xl text-pink-300">%</span>
                          </div>
                          <div className="text-right pb-1.5 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{effectiveInspoTitle || 'Custom Look'}</p>
                            <p className="text-xs text-white/75">Painting finger by finger</p>
                          </div>
                        </div>
                        <div className="flex gap-1.5 mt-4">
                          {[1, 2, 3, 4].map((step) => (
                            <div key={step} className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden">
                              <div
                                className="h-full origin-left bg-gradient-to-r from-[#E0246A] to-pink-300"
                                style={{
                                  transform: `scaleX(${synthesisPhase >= step ? 1 : 0})`,
                                  transition: 'transform 1800ms linear',
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Floating Top Badge - Strictly hidden while applying or revealing */}
                  {!isSynthesizingHand && !isRevealing && (
                    <div className="absolute top-3.5 left-3.5 z-20">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium tracking-wide flex items-center gap-1.5 border border-white/10">
                        <span className={`w-1.5 h-1.5 rounded-full ${synthesizedHandUrl ? 'bg-emerald-400 animate-pulse' : 'bg-pink-400'}`} />
                        <span>
                          {synthesizedHandUrl && tryOnView === 'after'
                            ? (effectiveInspoTitle || 'Applied Look')
                            : customTryOnHandUrl
                            ? 'Your Hand · Ready for Inspo'
                            : 'Studio Hand · Ready'}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Floating Compare Button on bottom - only when a manicure is synthesized */}
                  {synthesizedHandUrl && !isSynthesizingHand && (
                    <div className="absolute bottom-3.5 inset-x-0 flex justify-center z-20 pointer-events-none">
                      <button
                        type="button"
                        onClick={() => setTryOnView(tryOnView === 'after' ? 'before' : 'after')}
                        className="pointer-events-auto px-4 py-1.5 rounded-full bg-white/95 hover:bg-white text-stone-900 text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer transition active:scale-95 border border-stone-200/60"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#E0246A]" />
                        <span>{tryOnView === 'after' ? 'See Bare Hand' : 'View Manicure'}</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Error Message if synthesis failed */}
            {synthesisError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2">
                <span>{synthesisError}</span>
                <button
                  type="button"
                  onClick={handleSynthesizeHand}
                  className="font-semibold underline hover:no-underline text-[#E0246A] shrink-0"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Primary Action Dock */}
            {synthesizedHandUrl ? (
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (onCustomizeWithAi) {
                      onCustomizeWithAi(displayedHandImage);
                    }
                  }}
                  className="w-full h-11 sm:h-12 rounded-xl sm:rounded-2xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <span>Customize in AI Studio →</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => changeRefInspoInputRef.current?.click()}
                    className="h-10 px-3 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer hover:border-[#E0246A]/40"
                  >
                    <ImagePlus className="w-3.5 h-3.5 text-[#E0246A]" />
                    <span>Upload Inspo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAutoPickNextInspo}
                    className="h-10 px-3 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 text-xs font-medium inline-flex items-center justify-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-[#E0246A]" />
                    <span>Change Inspo</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setIsHandSourceModalOpen(true)}
                  className="h-10 sm:h-11 px-3 sm:px-4 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
                  title="Change Hand Photo"
                >
                  <UploadCloud className="w-4 h-4 shrink-0" />
                  <span className="truncate">Change Hand</span>
                </button>

                <button
                  type="button"
                  onClick={() => changeRefInspoInputRef.current?.click()}
                  className="h-10 sm:h-11 px-3 sm:px-4 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-2xs transition active:scale-95 cursor-pointer hover:border-[#E0246A]/40"
                  title="Upload Inspiration Photo"
                >
                  <ImagePlus className="w-4 h-4 text-[#E0246A] shrink-0" />
                  <span className="truncate text-[#E0246A]">Upload Inspo</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: ATELIER CONTROL & DESIGN STATION (Hidden on mobile) */}
        {/* ============================================================== */}
        <div className="hidden lg:block lg:col-span-5 space-y-4 sm:space-y-5">
          {/* Station Card 1: Dynamic Inspo Selection / Active Inspo */}
          {!hasActiveInspo ? (
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold block">
                  Step 2 · Inspiration
                </span>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {customTryOnHandUrl ? 'Hand Ready' : 'Studio Hand'}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-base sm:text-lg font-medium text-stone-900 tracking-tight">
                  Choose Your Inspiration
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Your hand photo is saved and ready. Pick a trending aesthetic below, browse all styles, or upload your own photo.
                </p>
              </div>

              {/* Dual Action Buttons: Upload Inspo or Explore Styles */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => changeRefInspoInputRef.current?.click()}
                  className="w-full h-11 sm:h-12 rounded-2xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <ImagePlus className="w-4 h-4 shrink-0" />
                  <span>Upload Photo Inspo</span>
                </button>

                {onExploreClick && (
                  <button
                    type="button"
                    onClick={onExploreClick}
                    className="w-full h-10 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-2xs"
                  >
                    <Compass className="w-4 h-4 text-[#E0246A] shrink-0" />
                    <span>Browse All Styles</span>
                  </button>
                )}
              </div>
            </div>
          ) : !synthesizedHandUrl ? (
            /* STAGED INSPIRATION STATE: PREVIEW SIDE-BY-SIDE & WAITING FOR USER TO HIT APPLY */
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold block">
                  Step 2 · Staged Look
                </span>
                <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-rose-50 text-[#E0246A] border border-rose-100 capitalize">
                  {effectiveInspoCategory || 'Couture Gel'}
                </span>
              </div>

              {/* Inspo Preview Box */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50/80 border border-stone-200/70">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-200 border border-stone-300 shrink-0 shadow-2xs">
                  <img
                    src={effectiveInspoUrl}
                    alt={effectiveInspoTitle || 'Reference Look'}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-xs sm:text-sm text-stone-900 truncate">
                    {effectiveInspoTitle || 'Custom Inspo Look'}
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                    {nails.middle.shape} · {nails.middle.finish} finish
                  </p>
                </div>

                {/* Heart Toggle */}
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className="w-9 h-9 rounded-full bg-white hover:bg-stone-100 border border-stone-200 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs shrink-0"
                  title={isSavedFavorite ? 'Remove from favorites' : 'Save to favorites'}
                >
                  <Heart
                    className={`w-4 h-4 ${isSavedFavorite ? 'fill-[#E0246A] text-[#E0246A]' : 'text-stone-400'}`}
                  />
                </button>
              </div>

              {/* Staged Actions: Primary = Apply Manicure to My Hand */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleSynthesizeHand}
                  disabled={isSynthesizingHand}
                  className="w-full h-12 sm:h-13 rounded-2xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <span>Apply Manicure to My Hand</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleAutoPickNextInspo}
                    className="h-10 px-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
                    title="Auto-pick another inspiration style"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-[#E0246A]" />
                    <span>Change Inspo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => changeRefInspoInputRef.current?.click()}
                    className="h-10 px-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-medium flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
                    title="Upload your own photo inspiration"
                  >
                    <ImagePlus className="w-3.5 h-3.5 text-stone-500" />
                    <span>Upload Photo</span>
                  </button>
                </div>

                {onExploreClick && (
                  <button
                    type="button"
                    onClick={onExploreClick}
                    className="w-full h-7 rounded-lg text-stone-500 hover:text-stone-800 text-[11px] font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Compass className="w-3 h-3 text-stone-400" />
                    <span>Or browse all styles in gallery →</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* SYNTHESIZED STATE: MANICURE APPLIED TO HAND */
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold block">
                  Applied Manicure
                </span>
                <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-rose-50 text-[#E0246A] border border-rose-100 capitalize">
                  {effectiveInspoCategory || 'Couture Gel'}
                </span>
              </div>

              {/* Inspo Preview Box */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50/80 border border-stone-200/70">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-200 border border-stone-300 shrink-0 shadow-2xs">
                  <img
                    src={effectiveInspoUrl}
                    alt={effectiveInspoTitle || 'Reference Look'}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-xs sm:text-sm text-stone-900 truncate">
                    {effectiveInspoTitle || 'Custom Inspo Look'}
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                    {nails.middle.shape} · {nails.middle.finish} finish
                  </p>
                </div>

                {/* Heart Toggle */}
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className="w-9 h-9 rounded-full bg-white hover:bg-stone-100 border border-stone-200 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs shrink-0"
                  title={isSavedFavorite ? 'Remove from favorites' : 'Save to favorites'}
                >
                  <Heart
                    className={`w-4 h-4 ${isSavedFavorite ? 'fill-[#E0246A] text-[#E0246A]' : 'text-stone-400'}`}
                  />
                </button>
              </div>

              {/* Primary Actions */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (onCustomizeWithAi) {
                      onCustomizeWithAi(displayedHandImage);
                    }
                  }}
                  className="w-full h-11 sm:h-12 rounded-2xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <span>Customize Look →</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleAutoPickNextInspo}
                    className="h-9 px-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                    title="Auto-pick another inspiration style"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-[#E0246A]" />
                    <span>Change Inspo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSynthesizeHand}
                    disabled={isSynthesizingHand}
                    className="h-9 px-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-stone-500 ${isSynthesizingHand ? 'animate-spin' : ''}`} />
                    <span>Re-apply Set</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Station Card 2: Quick Reference Inspo Switcher */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold block">
                  {hasActiveInspo ? 'Trending Looks' : 'Instant Apply'}
                </span>
                <h3 className="text-xs sm:text-sm font-semibold text-stone-900">
                  {hasActiveInspo ? 'Switch Inspo Look' : '1-Tap Quick Apply'}
                </h3>
              </div>
              <span className="text-[10px] text-stone-400 font-mono">1-Tap Apply</span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 select-none">
              {['All', 'French', 'Glazed', 'Chrome', 'Minimal'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`h-7 px-2.5 rounded-xl text-[11px] font-semibold transition cursor-pointer active:scale-95 shrink-0 border ${
                    activeCategoryFilter === cat
                      ? 'bg-[#E0246A] text-white border-[#E0246A] shadow-2xs'
                      : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Quick Inspo Cards Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {filteredQuickDesigns.slice(0, 4).map((design) => {
                const isSelected = effectiveInspoUrl === design.photoUrl;
                return (
                  <button
                    key={design.id}
                    type="button"
                    onClick={() => {
                      setIsLocallyCleared(false);
                      setInternalSynthesizedHandUrl(null);
                      propSetSynthesizedHandUrl?.(null);
                      setTryOnView('before');
                      onSelectExploreDesign?.(design.id);
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer group active:scale-95 ${
                      isSelected
                        ? 'bg-rose-50/70 border-[#E0246A]/50 ring-1 ring-[#E0246A]/20'
                        : 'bg-stone-50/70 hover:bg-stone-100/80 border-stone-200/70'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-200 shrink-0">
                      <img src={design.photoUrl} alt={design.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-semibold text-stone-800 truncate block group-hover:text-[#E0246A] transition-colors leading-tight">
                        {design.title}
                      </span>
                      <span className="text-[9.5px] text-stone-400 capitalize block mt-0.5">
                        {design.category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Upload Custom Inspo Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => changeRefInspoInputRef.current?.click()}
                className="w-full h-10 rounded-xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200/80 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 shadow-2xs"
              >
                <ImagePlus className="w-4 h-4 text-stone-600" />
                <span>Upload Photo Inspo</span>
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
            setInternalSynthesizedHandUrl(null);
            propSetSynthesizedHandUrl?.(null);
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
            setIsLocallyCleared(false);
            setInternalSynthesizedHandUrl(null);
            propSetSynthesizedHandUrl?.(null);
            onSelectExploreDesign?.(finalUrl);
          }
        }}
      />

      {/* Hand Source Selection Modal (Camera vs Choose from Photos) */}
      {isHandSourceModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setIsHandSourceModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white border border-stone-200/90 shadow-2xl p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base sm:text-lg font-medium text-stone-900 tracking-tight">
                  Change Hand Photo
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Select how you would like to provide your hand photo
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsHandSourceModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Option 1: Live Camera Capture */}
              <button
                type="button"
                onClick={() => {
                  setIsHandSourceModalOpen(false);
                  setIsCameraModalOpen(true);
                }}
                className="w-full p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F4EFEB] border border-stone-200/80 text-left transition active:scale-98 cursor-pointer flex items-center gap-3.5 group shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-[#E0246A] shadow-2xs group-hover:scale-105 transition shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs sm:text-sm font-semibold text-stone-900 block">
                    Capture with Camera
                  </span>
                  <span className="text-[11px] text-stone-500 block truncate">
                    Take a live photo using your phone or webcam
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 group-hover:translate-x-0.5 transition" />
              </button>

              {/* Option 2: Choose from Photos / Files */}
              <button
                type="button"
                onClick={() => {
                  setIsHandSourceModalOpen(false);
                  changeHandInputRef.current?.click();
                }}
                className="w-full p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F4EFEB] border border-stone-200/80 text-left transition active:scale-98 cursor-pointer flex items-center gap-3.5 group shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E0246A] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition shrink-0">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs sm:text-sm font-semibold text-stone-900 block">
                    Choose from Photos
                  </span>
                  <span className="text-[11px] text-stone-500 block truncate">
                    Browse camera roll, photo library, or files
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live WebRTC Camera Capture Modal */}
      <HandCameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCaptureHand={(dataUrl: string) => {
          setCustomTryOnHandUrl(dataUrl);
          setInternalSynthesizedHandUrl(null);
          propSetSynthesizedHandUrl?.(null);
          setIsCameraModalOpen(false);
        }}
      />

      {/* Fullscreen Inspector Modal */}
      {isZoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="flex items-center justify-between text-white pb-3 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs font-semibold tracking-wide text-white/90">
              {hasActiveInspo && !synthesizedHandUrl ? 'Side-by-Side Inspo Inspector' : 'Hand Manicure Inspector'}
            </span>

            <div className="flex items-center gap-2">
              {synthesizedHandUrl && (
                <>
                  <button
                    type="button"
                    onClick={() => setTryOnView(tryOnView === 'after' ? 'before' : 'after')}
                    className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition cursor-pointer"
                  >
                    {tryOnView === 'after' ? 'Natural Hand' : 'Manicure'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadBrandedLook}
                    disabled={isExporting}
                    className="px-3 py-1 rounded-full bg-white text-stone-900 hover:bg-stone-100 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5 text-stone-900" />
                    <span className="hidden sm:inline">Download HD</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShareToStory}
                    disabled={isExporting}
                    className="px-3 py-1 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <Share2 className="w-3.5 h-3.5 text-white" />
                    <span className="hidden sm:inline">Share Story</span>
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            className="flex-1 flex items-center justify-center min-h-0 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {hasActiveInspo && !synthesizedHandUrl ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[82vh] max-w-4xl w-full h-full p-2">
                <div className="relative rounded-2xl overflow-hidden bg-white border border-stone-200 shadow-xl flex items-center justify-center h-full">
                  <img
                    src={handSourceImageUrl}
                    alt="Your Hand"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full bg-white/95 text-stone-800 text-xs font-semibold border border-stone-200/90 shadow-xs flex items-center gap-1.5">
                      <Hand className="w-3.5 h-3.5 text-[#E0246A]" />
                      <span>{customTryOnHandUrl ? 'Your Hand' : 'Studio Hand'}</span>
                    </span>
                  </div>
                </div>
                <div className="relative rounded-2xl overflow-hidden bg-white border border-stone-200 shadow-xl flex items-center justify-center h-full">
                  <img
                    src={effectiveInspoUrl}
                    alt={effectiveInspoTitle || 'Selected Inspo'}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full bg-[#E0246A] text-white text-xs font-semibold shadow-xs flex items-center">
                      <span>{effectiveInspoTitle || 'Picked Inspo'}</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <img
                src={displayedHandImage}
                alt="High-Resolution Hand Manicure"
                className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-2xl"
              />
            )}
          </div>
        </div>
      )}

      {/* Social Share Options Modal */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        imageUrl={displayedHandImage}
        designTitle={activeSample?.title || 'Finglora Manicure'}
        onDownloadFallback={handleDownloadBrandedLook}
      />
    </div>
  );
}
