'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  UploadCloud,
  Camera,
  ImagePlus,
  Hand,
  ArrowRight,
  Check,
  Loader2,
  X,
} from 'lucide-react';
import { Finger, NailDesign } from '@/types/nail';
import { FINGER_KEYS, FINGER_LABELS } from '@/constants/nail-data';
import { NailCanvasPreview } from '@/components/visuals/NailCanvasPreview';
import { HandCameraCaptureModal } from '@/components/common/HandCameraCaptureModal';

const ANALYSIS_STEPS = [
  {
    step: 1,
    title: 'Ingesting Reference Photo',
    detail: 'Calibrating lighting, perspective, and optical clarity',
  },
  {
    step: 2,
    title: 'Detecting Hand Geometry',
    detail: 'Locating nail beds and natural cuticle contours',
  },
  {
    step: 3,
    title: 'Isolating Five-Finger Architecture',
    detail: 'Mapping distinct shapes and length across all five digits',
  },
  {
    step: 4,
    title: 'Formulating Pigments & Finish',
    detail: 'Extracting lacquer shade, chrome sheen, and motif details',
  },
  {
    step: 5,
    title: 'Manicure Calibration Complete',
    detail: 'Five bespoke finger designs ready for virtual try-on',
  },
];

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  // Safe index within 1..5 range
  const currentStepIndex = Math.max(0, Math.min(ANALYSIS_STEPS.length - 1, (analysisStep || 1) - 1));
  const currentStep = ANALYSIS_STEPS[currentStepIndex];

  // Handle File Input Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelected(file);
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onImageSelected(file);
    }
  };

  // Convert Camera Capture Data URL to File & Trigger Inspo Analysis
  const handleCameraCapture = async (dataUrl: string) => {
    setIsCameraModalOpen(false);
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'camera-inspo.jpg', { type: 'image/jpeg' });
      onImageSelected(file);
    } catch (err) {
      console.error('Failed to convert captured photo to file:', err);
    }
  };

  // -------------------------------------------------------------------------
  // STATE A: ANALYSIS SEQUENCE (CLEAN 5-STEP PROGRESS WITHOUT TACKY BUZZWORDS)
  // -------------------------------------------------------------------------
  if (isAnalyzing) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8 sm:py-12 px-4 space-y-8 sm:space-y-10 animate-in fade-in duration-300">
        {/* Reference Image Thumbnail & Header */}
        <div className="text-center space-y-4">
          {activePhotoUrl && (
            <div className="relative w-24 h-32 sm:w-28 sm:h-36 mx-auto rounded-2xl overflow-hidden shadow-md border border-stone-200/80 bg-stone-100">
              <img
                src={activePhotoUrl}
                alt="Reference Inspo"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-stone-900/10" />
            </div>
          )}

          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold tracking-widest text-[#E0246A] uppercase">
              Extraction Step {analysisStep} of 5
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-stone-900 tracking-tight">
              {currentStep.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
              {currentStep.detail}
            </p>
          </div>
        </div>

        {/* 5-Step Progress Indicators */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3 max-w-md mx-auto w-full">
          {ANALYSIS_STEPS.map((s) => {
            const isCompleted = analysisStep > s.step;
            const isCurrent = analysisStep === s.step;
            return (
              <div key={s.step} className="space-y-1.5 text-center">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    isCompleted
                      ? 'bg-[#E0246A]'
                      : isCurrent
                      ? 'bg-[#E0246A] animate-pulse'
                      : 'bg-stone-200'
                  }`}
                />
                <span
                  className={`text-[10px] font-mono block ${
                    isCurrent
                      ? 'text-stone-900 font-semibold'
                      : isCompleted
                      ? 'text-[#E0246A] font-medium'
                      : 'text-stone-400'
                  }`}
                >
                  0{s.step}
                </span>
              </div>
            );
          })}
        </div>

        {/* Extraction Results: 5 Standalone Finger Nail Preview Cards */}
        <div className="space-y-3 pt-2">
          <div className="text-center">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Decomposed 5-Finger Architecture
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-4xl mx-auto w-full">
            {FINGER_KEYS.map((fk, idx) => {
              const nail = nails[fk];
              const isFingerReady = analysisStep >= 3;

              return (
                <div
                  key={fk}
                  className="bg-white rounded-2xl p-3 border border-stone-200/80 shadow-2xs transition-all flex flex-col items-center text-center space-y-2"
                >
                  <div className="w-full flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-stone-700 uppercase tracking-wider text-[10px]">
                      {FINGER_LABELS[fk]}
                    </span>
                    {isFingerReady ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-[10px] font-semibold">
                        ✓
                      </span>
                    ) : (
                      <Loader2 className="w-3 h-3 text-[#E0246A] animate-spin" />
                    )}
                  </div>

                  <div className="w-full aspect-[3/4] max-h-32 bg-stone-50 rounded-xl flex items-center justify-center overflow-hidden border border-stone-100 p-2 relative">
                    {nail?.artImageUrl ? (
                      <img
                        src={nail.artImageUrl}
                        alt={nail.title || FINGER_LABELS[fk]}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <NailCanvasPreview
                        nail={nail}
                        width={42}
                        height={68}
                        showCuticle={false}
                        interactive={false}
                      />
                    )}
                  </div>

                  <div className="w-full space-y-0.5 text-center">
                    <p className="text-xs font-medium text-stone-900 truncate">
                      {nail?.title || 'Calibrating'}
                    </p>
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-500 capitalize">
                      <span
                        className="w-2 h-2 rounded-full border border-stone-300 shrink-0"
                        style={{ backgroundColor: nail?.baseColor || '#FAF0EA' }}
                      />
                      <span className="truncate">{nail?.shape || 'almond'}</span>
                      <span>•</span>
                      <span className="truncate">{nail?.finish || 'glossy'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Primary CTA: "Try On on My Hand" */}
        <div className="pt-2 max-w-sm sm:max-w-md mx-auto w-full space-y-2">
          <button
            type="button"
            onClick={() => onComplete?.()}
            className="w-full h-12 sm:h-13 rounded-2xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-sm sm:text-base font-semibold shadow-lg shadow-[#E0246A]/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Hand className="w-4 h-4" />
            <span>Try On on My Hand</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {onCancel && (
            <div className="text-center">
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-stone-400 hover:text-stone-700 transition-colors cursor-pointer py-1"
              >
                Cancel and return
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // STATE B: HERO DROPZONE & SYMMETRICAL ACTION BUTTONS
  // -------------------------------------------------------------------------
  return (
    <div className="w-full max-w-3xl lg:max-w-4xl mx-auto space-y-8 py-6 sm:py-10 px-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Editorial Header */}
      <div className="text-center space-y-2">
        <span className="text-[11px] font-semibold tracking-widest text-[#E0246A] uppercase">
          Inspiration Atelier
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-stone-900 tracking-tight">
          Upload Inspiration
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
          Upload any reference manicure to analyze its colors, finish, and architecture for your virtual try-on.
        </p>
      </div>

      {/* Hero Dropzone: Clean, Quiet Luxury Card with Dashed Border & Drag-and-Drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative rounded-3xl border-2 border-dashed transition-all cursor-pointer p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 ${
          isDragging
            ? 'border-[#E0246A] bg-[#FFF5F8]'
            : 'border-stone-300 hover:border-stone-400 bg-white/70 hover:bg-stone-50/70 shadow-2xs hover:shadow-xs'
        }`}
      >
        {/* Elegant Icon Box */}
        <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200/80 flex items-center justify-center text-stone-700 group-hover:scale-105 transition-transform shadow-2xs">
          <ImagePlus
            className="w-7 h-7 text-stone-600 group-hover:text-stone-900 transition-colors"
            strokeWidth={1.5}
          />
        </div>

        <div className="space-y-1">
          <p className="text-sm sm:text-base font-medium text-stone-900">
            Drop your reference manicure photo here
          </p>
          <p className="text-xs text-stone-400">
            Supports PNG, JPG, HEIC, or WEBP up to 20MB
          </p>
        </div>

        <div className="pt-1 text-xs text-stone-400 font-mono tracking-wide uppercase">
          Drag & Drop or choose below
        </div>
      </div>

      {/* Symmetrical 2-Column Action Buttons: Option 1 = Upload Photo (#E0246A), Option 2 = Camera (outline) */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 max-w-sm sm:max-w-md mx-auto w-full">
          {/* Option 1: Upload Photo (#E0246A) */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-11 px-4 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Photo</span>
          </button>

          {/* Option 2: Camera (outline) */}
          <button
            type="button"
            onClick={() => setIsCameraModalOpen(true)}
            className="h-11 px-4 rounded-xl border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-2xs"
          >
            <Camera className="w-4 h-4 text-stone-700" />
            <span>Camera</span>
          </button>
        </div>

        {/* Quick Sample Demo Link */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={onSampleDemoClick}
            className="text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors inline-flex items-center gap-1.5 underline decoration-stone-300 underline-offset-4 hover:decoration-stone-700 cursor-pointer"
          >
            <span>Or test with a sample manicure design</span>
          </button>
        </div>
      </div>

      {/* Extraction Results if a Photo is Loaded: 5 Standalone Finger Preview Cards + Primary CTA */}
      {activePhotoUrl && (
        <div className="pt-6 border-t border-stone-200/60 space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-serif text-lg font-medium text-stone-900">
                Extracted Manicure Architecture
              </h3>
              <p className="text-xs text-stone-500">
                Five calibrated designs formulated from your reference photo
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 self-start sm:self-auto">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ready for Try-On</span>
            </div>
          </div>

          {/* 5 Standalone Finger Nail Preview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {FINGER_KEYS.map((fk) => {
              const nail = nails[fk];
              return (
                <div
                  key={fk}
                  className="bg-white rounded-2xl p-3 border border-stone-200/80 shadow-2xs transition-all flex flex-col items-center text-center space-y-2"
                >
                  <span className="font-semibold text-stone-700 uppercase tracking-wider text-[10px]">
                    {FINGER_LABELS[fk]}
                  </span>

                  <div className="w-full aspect-[3/4] max-h-32 bg-stone-50 rounded-xl flex items-center justify-center overflow-hidden border border-stone-100 p-2 relative">
                    {nail?.artImageUrl ? (
                      <img
                        src={nail.artImageUrl}
                        alt={nail.title || FINGER_LABELS[fk]}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <NailCanvasPreview
                        nail={nail}
                        width={42}
                        height={68}
                        showCuticle={false}
                        interactive={false}
                      />
                    )}
                  </div>

                  <div className="w-full space-y-0.5 text-center">
                    <p className="text-xs font-medium text-stone-900 truncate">
                      {nail?.title || 'Natural'}
                    </p>
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-500 capitalize">
                      <span
                        className="w-2 h-2 rounded-full border border-stone-300 shrink-0"
                        style={{ backgroundColor: nail?.baseColor || '#FAF0EA' }}
                      />
                      <span className="truncate">{nail?.shape || 'almond'}</span>
                      <span>•</span>
                      <span className="truncate">{nail?.finish || 'glossy'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Primary CTA: "Try On on My Hand" */}
          <div className="pt-2 max-w-sm sm:max-w-md mx-auto w-full">
            <button
              type="button"
              onClick={() => onComplete?.()}
              className="w-full h-12 sm:h-13 rounded-2xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-sm sm:text-base font-semibold shadow-lg shadow-[#E0246A]/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Hand className="w-4 h-4" />
              <span>Try On on My Hand</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Live Hand Camera Capture Modal */}
      <HandCameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCaptureHand={handleCameraCapture}
        onUploadFileFallback={(file) => {
          setIsCameraModalOpen(false);
          onImageSelected(file);
        }}
      />
    </div>
  );
}
