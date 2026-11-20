'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  UploadCloud,
  ArrowRight,
  Sparkles,
  Check,
  Hand,
  ImagePlus,
  RefreshCw,
  Camera,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Finger, NailDesign } from '@/types/nail';
import { downscaleImageForVision } from '@/lib/services/storage';

export function UploadInspirationView({
  isAnalyzing,
  analysisStep,
  nails,
  activePhotoUrl,
  customTryOnHandUrl,
  onImageSelected,
  onUploadHandPhoto,
  onSampleDemoClick,
  onCancel,
  onComplete,
}: {
  isAnalyzing: boolean;
  analysisStep: number;
  nails: Record<Finger, NailDesign>;
  activePhotoUrl?: string;
  customTryOnHandUrl?: string | null;
  onImageSelected: (file: File) => void;
  onUploadHandPhoto?: (file: File) => void;
  onSampleDemoClick: () => void;
  onCancel?: () => void;
  onComplete?: (synthesizedUrl?: string) => void;
}) {
  const inspoFileInputRef = useRef<HTMLInputElement>(null);
  const handFileInputRef = useRef<HTMLInputElement>(null);

  const [isGeneratingTryOn, setIsGeneratingTryOn] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Retrieve user hand from storage if not provided in props
  const [localHandPhoto, setLocalHandPhoto] = useState<string | null>(() => {
    if (customTryOnHandUrl) return customTryOnHandUrl;
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('finglora_custom_hand_photo') ||
        localStorage.getItem('finglora_user_hand_photo') ||
        null
      );
    }
    return null;
  });

  useEffect(() => {
    if (customTryOnHandUrl) {
      setLocalHandPhoto(customTryOnHandUrl);
    }
  }, [customTryOnHandUrl]);

  // Handle Inspiration File Upload
  const handleInspoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGenerationError(null);
      onImageSelected(file);
    }
  };

  // Handle Hand Photo File Upload
  const handleHandFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGenerationError(null);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setLocalHandPhoto(dataUrl);
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('finglora_custom_hand_photo', dataUrl);
            localStorage.setItem('finglora_user_hand_photo', dataUrl);
          }
        } catch {
          // ignore
        }
      };
      reader.readAsDataURL(file);
      onUploadHandPhoto?.(file);
    }
  };

  // Generate Manicure on Hand in Image-to-Image Diffusion Model
  const handleSeeOnMyHand = async () => {
    if (!activePhotoUrl) {
      inspoFileInputRef.current?.click();
      return;
    }

    setGenerationError(null);
    setIsGeneratingTryOn(true);

    try {
      // Convert reference image to Base64
      let refBase64 = '';
      if (activePhotoUrl.startsWith('data:image/')) {
        refBase64 = activePhotoUrl;
      } else {
        refBase64 = await downscaleImageForVision(activePhotoUrl, 1024, 0.88);
      }

      // Convert target hand to Base64
      const targetHand = localHandPhoto || '/assets/editorial_nail_hero.jpg';
      let handBase64 = '';
      if (targetHand.startsWith('data:image/')) {
        handBase64 = targetHand;
      } else {
        handBase64 = await downscaleImageForVision(targetHand, 1024, 0.88);
      }

      const res = await fetch('/api/generate-nail-art', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'hand-tryon',
          referenceImageBase64: refBase64 || undefined,
          handImageBase64: handBase64 || undefined,
          referenceImageUrl: !refBase64 && activePhotoUrl.startsWith('http') && !activePhotoUrl.startsWith('blob:') ? activePhotoUrl : undefined,
          handImageUrl: !handBase64 && (targetHand.startsWith('http') || targetHand.startsWith('/')) ? targetHand : undefined,
          prompt: 'Apply the reference manicure design from Image 1 onto the fingers and fingernails of the human hand in Image 2.',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.imageUrl) {
          onComplete?.(data.imageUrl);
          return;
        }
      }

      const errJson = await res.json().catch(() => ({}));
      const is429 = res.status === 429 || errJson?.isRateLimit || errJson?.error?.includes('RESOURCE_EXHAUSTED') || errJson?.error?.includes('Resource exhausted');
      if (is429) {
        setGenerationError('Vertex AI image generation quota is cooling down (429). Please wait a few moments and tap Retry.');
      } else {
        setGenerationError(errJson?.error || 'AI image synthesis could not be completed. Please tap Retry.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection error';
      setGenerationError(`${msg}. Please tap Retry.`);
    } finally {
      setIsGeneratingTryOn(false);
    }
  };

  // State A: Generating / Analyzing State (Zero Fake Pills, Pure Photographic Visuals)
  if (isAnalyzing || isGeneratingTryOn) {
    return (
      <div className="w-full max-w-xl mx-auto py-12 px-4 text-center space-y-8 animate-in fade-in duration-300">
        {/* Dynamic Reference + Hand Composition Preview */}
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          {/* Reference Inspo Photo */}
          <div className="relative w-28 h-36 sm:w-32 sm:h-40 rounded-2xl overflow-hidden bg-stone-900 border-2 border-white shadow-lg">
            {activePhotoUrl ? (
              <img
                src={activePhotoUrl}
                alt="Reference design"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl text-stone-300">
                💅
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs py-1 text-[10px] text-white font-medium">
              Reference
            </div>
          </div>

          {/* Animated Connecting Pulse */}
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-[#E0246A] text-white flex items-center justify-center shadow-md animate-pulse">
              <Sparkles className="w-5 h-5 animate-spin [animation-duration:6s]" />
            </div>
            <span className="text-[10px] font-mono text-[#E0246A] uppercase tracking-wider font-semibold">
              Image-to-Image
            </span>
          </div>

          {/* User's Hand Photo */}
          <div className="relative w-28 h-36 sm:w-32 sm:h-40 rounded-2xl overflow-hidden bg-stone-900 border-2 border-white shadow-lg">
            {localHandPhoto ? (
              <img
                src={localHandPhoto}
                alt="My Hand"
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src="/assets/editorial_nail_hero.jpg"
                alt="Studio Hand"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs py-1 text-[10px] text-white font-medium">
              Your Hand
            </div>
          </div>
        </div>

        {/* Minimal Editorial Copy */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold tracking-widest text-[#E0246A] uppercase flex items-center justify-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E0246A]" />
            <span>Vertex AI Image-to-Image Model</span>
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900 tracking-tight">
            Generating Reference Design On Your Hand
          </h2>
          <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
            Synthesizing the reference manicure colors, patterns, and shape seamlessly onto your hand in a photorealistic studio finish.
          </p>
        </div>

        {onCancel && (
          <div className="pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }

  // State B: Simple 2-Card Inspo + Hand Studio
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 py-4 px-2">
      {/* Hidden File Inputs */}
      <input
        ref={inspoFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInspoFileChange}
        className="hidden"
      />
      <input
        ref={handFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleHandFileChange}
        className="hidden"
      />

      {/* Header */}
      <div className="text-center space-y-1.5">
        <span className="text-[11px] font-semibold tracking-widest text-[#E0246A] uppercase">
          Virtual Atelier Try-On
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-stone-900 tracking-tight">
          Try Any Nail Design On Your Hand
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
          Provide your reference nail picture from Pinterest or Instagram, and see it fitted directly on your hand.
        </p>
      </div>

      {/* 2 Simple Cards: [1] Reference Nail Design + [2] My Hand */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Reference Nail Design Picture */}
        <div
          onClick={() => inspoFileInputRef.current?.click()}
          className="group relative rounded-3xl border-2 border-dashed border-stone-200 hover:border-[#E0246A] bg-white p-5 sm:p-6 text-center transition-all cursor-pointer shadow-2xs hover:shadow-md flex flex-col justify-between min-h-[260px]"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#E0246A] font-semibold">
                1. Reference Picture
              </span>
              {activePhotoUrl && (
                <span className="text-[10px] bg-pink-100 text-[#E0246A] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Ready</span>
                </span>
              )}
            </div>

            {activePhotoUrl ? (
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-xs">
                <img
                  src={activePhotoUrl}
                  alt="Reference nail design"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                  Tap to change reference
                </div>
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center space-y-2.5">
                <div className="w-14 h-14 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-[#E0246A] group-hover:scale-105 transition-transform shadow-inner">
                  <ImagePlus className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-stone-800">
                    Upload Reference Design
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    Pinterest, Instagram, or Camera
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="w-full h-10 mt-3 rounded-xl bg-stone-100 group-hover:bg-[#E0246A] text-stone-800 group-hover:text-white text-xs font-medium transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{activePhotoUrl ? 'Change Reference Photo' : 'Choose Reference Photo'}</span>
          </button>
        </div>

        {/* Card 2: Your Hand Photo */}
        <div
          onClick={() => handFileInputRef.current?.click()}
          className="group relative rounded-3xl border-2 border-dashed border-stone-200 hover:border-[#E0246A] bg-white p-5 sm:p-6 text-center transition-all cursor-pointer shadow-2xs hover:shadow-md flex flex-col justify-between min-h-[260px]"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#E0246A] font-semibold">
                2. Your Hand
              </span>
              {localHandPhoto && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>My Hand Saved</span>
                </span>
              )}
            </div>

            {localHandPhoto ? (
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-xs">
                <img
                  src={localHandPhoto}
                  alt="My Hand"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                  Tap to change hand photo
                </div>
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center space-y-2.5">
                <div className="w-14 h-14 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center text-[#E0246A] group-hover:scale-105 transition-transform shadow-inner">
                  <Hand className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-stone-800">
                    Upload Your Hand Photo
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    Or use our studio hand model
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="w-full h-10 mt-3 rounded-xl bg-stone-100 group-hover:bg-[#E0246A] text-stone-800 group-hover:text-white text-xs font-medium transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{localHandPhoto ? 'Change Hand Photo' : 'Upload Hand Photo'}</span>
          </button>
        </div>
      </div>

      {/* Error / Rate Limit Notification Banner */}
      {generationError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-left">
              <span className="font-semibold block">Generation Notification</span>
              <p className="text-amber-800 leading-relaxed">{generationError}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSeeOnMyHand}
              className="px-4 py-1.5 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white font-semibold transition cursor-pointer shadow-xs active:scale-95"
            >
              Retry Generation
            </button>
            <button
              type="button"
              onClick={() => setGenerationError(null)}
              className="px-3 py-1.5 rounded-full bg-white hover:bg-amber-100/50 border border-amber-200 text-amber-900 font-medium transition cursor-pointer active:scale-95"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Primary Action Button: "See Reference Design on My Hand" */}
      <div className="pt-2 text-center space-y-2">
        <button
          type="button"
          disabled={isGeneratingTryOn}
          onClick={handleSeeOnMyHand}
          className="w-full h-12 rounded-2xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-sm font-semibold shadow-md shadow-[#E0246A]/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-75"
        >
          {isGeneratingTryOn ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Generating with Vertex AI Image-to-Image...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-white" />
              <span>{activePhotoUrl ? 'See Reference Design on My Hand' : 'Choose Reference Photo & Try On'}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </>
          )}
        </button>

        {/* Quick Sample Demo Link */}
        <div>
          <button
            type="button"
            onClick={onSampleDemoClick}
            className="text-xs font-medium text-stone-500 hover:text-[#E0246A] transition-colors inline-flex items-center gap-1.5 underline decoration-stone-300 underline-offset-4 hover:decoration-[#E0246A] cursor-pointer"
          >
            <span>Or test with trending sample reference design</span>
          </button>
        </div>
      </div>
    </div>
  );
}
