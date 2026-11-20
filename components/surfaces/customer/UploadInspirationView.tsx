'use client';

import React from 'react';
import {
  UploadCloud,
  ArrowRight,
  Sparkles,
  Check,
} from 'lucide-react';
import { Finger, NailDesign } from '@/types/nail';
import { FINGER_KEYS, FINGER_LABELS } from '@/constants/nail-data';

const EDITORIAL_PHASES = [
  'Decomposing 5-finger silhouette & apex curvature',
  'Formulating lacquer pigments & metallic accents',
  'Preparing bespoke virtual try-on',
];

export function UploadInspirationView({
  isAnalyzing,
  analysisStep,
  nails,
  activePhotoUrl,
  isCached,
  onImageSelected,
  onSampleDemoClick,
  onCancel,
  onComplete,
}: {
  isAnalyzing: boolean;
  analysisStep: number;
  nails: Record<Finger, NailDesign>;
  activePhotoUrl?: string;
  isCached?: boolean;
  onImageSelected: (file: File) => void;
  onSampleDemoClick: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Safety fallback & auto-advancing progress so user is never frozen
  const [visualPhase, setVisualPhase] = React.useState(0);

  React.useEffect(() => {
    if (!isAnalyzing) {
      setVisualPhase(0);
      return;
    }

    const interval = setInterval(() => {
      setVisualPhase((prev) => Math.min(EDITORIAL_PHASES.length - 1, prev + 1));
    }, 2200);

    // Hard safety timeout: never stack longer than 9.5 seconds
    const safetyTimer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 9500);

    return () => {
      clearInterval(interval);
      clearTimeout(safetyTimer);
    };
  }, [isAnalyzing, onComplete]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelected(file);
    }
  };

  // State A: Analyzing Inspo Photo (Minimal, Non-AI-Slop, High Fashion)
  if (isAnalyzing) {
    const currentPhaseIndex = Math.max(
      visualPhase,
      Math.min(
        EDITORIAL_PHASES.length - 1,
        Math.floor((analysisStep - 1) / 1.5)
      )
    );

    return (
      <div className="w-full max-w-xl mx-auto py-10 px-4 text-center space-y-8 animate-in fade-in duration-300">
        {/* Subtle Luxury Circular Inspo Preview */}
        <div className="relative w-36 h-36 mx-auto rounded-full p-1 bg-gradient-to-tr from-[#E0246A]/20 via-pink-100 to-rose-200 shadow-xl">
          <div className="relative w-full h-full rounded-full overflow-hidden bg-stone-900 border-2 border-white shadow-inner flex items-center justify-center">
            {activePhotoUrl ? (
              <img
                src={activePhotoUrl}
                alt="Inspiration reference"
                className="w-full h-full object-cover scale-105 filter contrast-105"
              />
            ) : (
              <div className="text-3xl text-pink-300">💅</div>
            )}
            <div className="absolute inset-0 bg-[#E0246A]/10 mix-blend-overlay animate-pulse" />
          </div>
          {/* Subtle spinning ring */}
          <div className="absolute -inset-1.5 rounded-full border border-[#E0246A]/30 border-t-[#E0246A] animate-spin [animation-duration:3s]" />
        </div>

        {/* Minimal Editorial Copy */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold tracking-widest text-[#E0246A] uppercase">
            Gemini Vision Analysis
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900 tracking-tight">
            Decomposing Manicure Architecture
          </h2>
          <p className="text-xs text-stone-500 max-w-xs mx-auto transition-all duration-300">
            {EDITORIAL_PHASES[currentPhaseIndex]}
          </p>
        </div>

        {/* 3 Quiet Progress Dots */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {EDITORIAL_PHASES.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === currentPhaseIndex
                  ? 'w-8 bg-[#E0246A]'
                  : idx < currentPhaseIndex
                  ? 'w-2 bg-pink-300'
                  : 'w-2 bg-stone-200'
              }`}
            />
          ))}
        </div>

        {/* Cancel Button */}
        {onCancel && (
          <div className="pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
            >
              Cancel analysis
            </button>
          </div>
        )}
      </div>
    );
  }

  // State B: Upload Dropzone & Sample Selector
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 py-4 px-2">
      {/* Editorial Header */}
      <div className="text-center space-y-2">
        <span className="text-[11px] font-semibold tracking-widest text-[#E0246A] uppercase">
          Inspiration Extraction
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-stone-900 tracking-tight">
          Upload Any Manicure Photo
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
          Drop any photo from Pinterest or Instagram. Gemini will analyze the design across all five fingers for your virtual try-on.
        </p>
      </div>

      {/* Main Upload Dropzone */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        className="group relative rounded-3xl border-2 border-dashed border-pink-200 hover:border-[#E0246A] bg-white/70 hover:bg-[#FFF5F8] p-8 sm:p-12 text-center transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col items-center justify-center space-y-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-[#E0246A] group-hover:scale-105 transition-transform shadow-inner">
          <UploadCloud className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <div className="text-sm font-semibold text-stone-800">
            Choose a photo from your gallery
          </div>
          <div className="text-xs text-stone-400">
            PNG, JPG, HEIC, or WEBP up to 20MB
          </div>
        </div>

        <button
          type="button"
          className="h-10 px-5 rounded-xl bg-[#E0246A] text-white text-xs font-medium shadow-xs group-hover:bg-[#BE185D] transition-colors inline-flex items-center gap-1.5"
        >
          <span>Select Photo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Try Sample Demo */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onSampleDemoClick}
          className="text-xs font-medium text-stone-500 hover:text-[#E0246A] transition-colors inline-flex items-center gap-1.5 underline decoration-stone-300 underline-offset-4 hover:decoration-[#E0246A]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E0246A]" />
          <span>Or test with trending sample design</span>
        </button>
      </div>
    </div>
  );
}
