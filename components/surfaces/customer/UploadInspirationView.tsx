'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  UploadCloud,
  ArrowRight,
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
import { HandCameraCaptureModal } from '@/components/common/HandCameraCaptureModal';

export function UploadInspirationView({
  isAnalyzing,
  analysisStep,
  nails,
  activePhotoUrl,
  customTryOnHandUrl,
  onImageSelected,
  onUploadHandPhoto,
  onSelectHandDataUrl,
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
  onSelectHandDataUrl?: (dataUrl: string) => void;
  onSampleDemoClick: () => void;
  onCancel?: () => void;
  onComplete?: (synthesizedUrl?: string) => void;
}) {
  const inspoFileInputRef = useRef<HTMLInputElement>(null);
  const handFileInputRef = useRef<HTMLInputElement>(null);

  const [isGeneratingTryOn, setIsGeneratingTryOn] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

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
        setGenerationError('Service is currently experiencing high demand. Please try again in a moment.');
      } else {
        setGenerationError(errJson?.error || 'Could not generate manicure. Please try again.');
      }
    } catch (err: unknown) {
      setGenerationError('Connection error. Please try again.');
    } finally {
      setIsGeneratingTryOn(false);
    }
  };

  // State A: Generating / Analyzing State (Zero Fake Pills, Pure Photographic Visuals)
  if (isAnalyzing || isGeneratingTryOn) {
    return (
      <div className="w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto py-12 lg:py-16 px-4 text-center space-y-10 lg:space-y-12 animate-in fade-in duration-300">
        {/* Dynamic Reference + Hand Composition Preview - Large on Desktop */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 lg:gap-14">
          {/* Reference Inspo Photo */}
          <div className="relative w-36 h-48 sm:w-52 sm:h-70 md:w-64 md:h-84 lg:w-80 lg:h-[420px] xl:w-96 xl:h-[460px] rounded-3xl overflow-hidden bg-stone-100 border-2 sm:border-4 border-[#E0246A]/20 shadow-2xl flex items-center justify-center transition-all duration-300">
            {activePhotoUrl ? (
              <img
                src={activePhotoUrl}
                alt="Reference design"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-300">
                <Hand className="w-12 h-12" />
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-[#E0246A]/90 backdrop-blur-xs py-2 sm:py-2.5 text-xs sm:text-sm text-white font-medium tracking-wide">
              Reference Inspo
            </div>
          </div>

          {/* Connecting Arrow */}
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-white text-[#E0246A] flex items-center justify-center border border-stone-200 shadow-xl">
              <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-[#E0246A]" />
            </div>
            <span className="text-[11px] sm:text-xs font-mono text-stone-400 uppercase tracking-widest font-medium">
              Try-On
            </span>
          </div>

          {/* User's Hand Photo */}
          <div className="relative w-36 h-48 sm:w-52 sm:h-70 md:w-64 md:h-84 lg:w-80 lg:h-[420px] xl:w-96 xl:h-[460px] rounded-3xl overflow-hidden bg-stone-100 border-2 sm:border-4 border-[#E0246A]/20 shadow-2xl transition-all duration-300">
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
            <div className="absolute bottom-0 inset-x-0 bg-[#E0246A]/90 backdrop-blur-xs py-2 sm:py-2.5 text-xs sm:text-sm text-white font-medium tracking-wide">
              Your Hand
            </div>
          </div>
        </div>

        {/* Minimal Editorial Copy */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-50 border border-pink-200 text-xs font-semibold text-[#E0246A]">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E0246A]" />
            <span>Processing</span>
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-stone-900 tracking-tight">
            Applying Design to Hand
          </h2>
          <p className="text-sm sm:text-base text-stone-500 max-w-lg mx-auto leading-relaxed">
            Fitting the reference colors, patterns, and shape to your fingernails.
          </p>
        </div>

        {onCancel && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-medium text-stone-400 hover:text-stone-700 transition-colors cursor-pointer py-1.5 px-4 rounded-full hover:bg-stone-100"
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
    <div className="w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto space-y-8 py-6 lg:py-10 px-4">
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
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold tracking-widest text-[#E0246A] uppercase">
          Virtual Try-On
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-stone-900 tracking-tight">
          Try Any Nail Look On Your Hand
        </h1>
        <p className="text-xs sm:text-sm lg:text-base text-stone-500 max-w-lg mx-auto leading-relaxed">
          Upload a reference nail photo to preview it directly on your hand.
        </p>
      </div>

      {/* 2 Simple Cards: [1] Nail Inspo Design + [2] My Hand */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
        {/* Card 1: Nail Inspo Picture */}
        <div
          onClick={() => inspoFileInputRef.current?.click()}
          className="group relative rounded-3xl border-2 border-dashed border-stone-200 hover:border-[#E0246A] bg-white p-6 sm:p-8 text-center transition-all cursor-pointer shadow-2xs hover:shadow-lg flex flex-col justify-between min-h-[300px] sm:min-h-[380px] lg:min-h-[440px]"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#E0246A] font-semibold">
                1. Nail Inspo Picture
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
                  alt="Nail inspo design"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                  Tap to change inspo
                </div>
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center space-y-2.5">
                <div className="w-14 h-14 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-[#E0246A] group-hover:scale-105 transition-transform shadow-inner">
                  <ImagePlus className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-stone-800">
                    Upload Nail Inspo
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    Pinterest, Instagram, or Photos
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
            <span>{activePhotoUrl ? 'Change Inspo Photo' : 'Choose Inspo Photo'}</span>
          </button>
        </div>

        {/* Card 2: Your Hand Photo */}
        <div
          className="group relative rounded-3xl border-2 border-dashed border-stone-200 hover:border-[#E0246A] bg-white p-6 sm:p-8 text-center transition-all shadow-2xs hover:shadow-lg flex flex-col justify-between min-h-[300px] sm:min-h-[380px] lg:min-h-[440px]"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#E0246A] font-semibold">
                2. Your Hand Photo
              </span>
              {localHandPhoto && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
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
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center space-y-2.5">
                <div className="w-14 h-14 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center text-[#E0246A] group-hover:scale-105 transition-transform shadow-inner">
                  <Hand className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-stone-800">
                    Your Hand Photo
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    Capture live with camera or upload from files
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons: Take Photo (Camera) & Upload Photo */}
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            <button
              type="button"
              onClick={() => setIsCameraModalOpen(true)}
              className="h-10 px-3 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-medium transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-xs shadow-[#E0246A]/20"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{localHandPhoto ? 'Retake Photo' : 'Take Photo'}</span>
            </button>

            <button
              type="button"
              onClick={() => handFileInputRef.current?.click()}
              className="h-10 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Photo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error / Rate Limit Notification Banner */}
      {generationError && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2 animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-left">
              <span className="font-medium block">Notice</span>
              <p className="text-amber-800 leading-relaxed">{generationError}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSeeOnMyHand}
              className="px-3.5 py-1 rounded-lg bg-[#E0246A] hover:bg-[#BE185D] text-white font-medium transition cursor-pointer shadow-xs active:scale-95 text-xs"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => setGenerationError(null)}
              className="px-3 py-1 rounded-lg bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-medium transition cursor-pointer active:scale-95 text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Primary Action Button: "Apply Design to Hand" */}
      <div className="pt-2 text-center space-y-2">
        <button
          type="button"
          disabled={isGeneratingTryOn}
          onClick={handleSeeOnMyHand}
          className="w-full h-14 rounded-2xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-base font-semibold transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-75 shadow-lg shadow-[#E0246A]/25"
        >
          {isGeneratingTryOn ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Applying design...</span>
            </>
          ) : (
            <>
              <span>{activePhotoUrl ? 'Apply Design to Hand' : 'Select Photo & Try On'}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </>
          )}
        </button>

        {/* Quick Sample Demo Link */}
        <div>
          <button
            type="button"
            onClick={onSampleDemoClick}
            className="text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors inline-flex items-center gap-1.5 underline decoration-stone-300 underline-offset-4 hover:decoration-stone-700 cursor-pointer"
          >
            <span>Or test with a sample manicure design</span>
          </button>
        </div>
      </div>

      {/* Live Hand Camera Capture Modal */}
      <HandCameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCaptureHand={(dataUrl) => {
          setGenerationError(null);
          setLocalHandPhoto(dataUrl);
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem('finglora_custom_hand_photo', dataUrl);
              localStorage.setItem('finglora_user_hand_photo', dataUrl);
            }
          } catch {}
          onSelectHandDataUrl?.(dataUrl);
        }}
        onUploadFileFallback={(file) => {
          onUploadHandPhoto?.(file);
        }}
      />
    </div>
  );
}
