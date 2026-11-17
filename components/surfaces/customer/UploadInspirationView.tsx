'use client';

import React, { useEffect } from 'react';
import { ImagePlus, UploadCloud, Paintbrush, Check, Loader2, ArrowLeft } from 'lucide-react';
import { Finger, NailDesign } from '@/types/nail';
import { FINGER_KEYS, FINGER_LABELS } from '@/constants/nail-data';
import { NailCanvasPreview } from '@/components/visuals/NailCanvasPreview';

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
  const percentComplete = Math.min(100, Math.max(10, analysisStep * 20));

  // Automatically redirect to Try-On once analysis reaches 100%
  useEffect(() => {
    if (isAnalyzing && percentComplete >= 100 && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAnalyzing, percentComplete, onComplete]);

  return (
    <div className="min-h-[calc(100vh-160px)] flex flex-col justify-center items-center py-6 sm:py-10 w-full">
      <div className="max-w-md lg:max-w-4xl w-full px-2 sm:px-4 space-y-5">
      {isAnalyzing ? (
        /* ============================================================== */
        /* SCREEN 3: AI FINGER DETECTION & ANALYSING                      */
        /* ============================================================== */
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between pb-1">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200/80 flex items-center justify-center text-stone-700 transition-all cursor-pointer active:scale-95"
                title="Cancel Analysis"
              >
                <ArrowLeft className="w-4.5 h-4.5" />
              </button>
            )}

            <div className="text-center flex-1 px-2">
              <h1 className="font-serif text-xl sm:text-2xl font-normal text-[#18181B] tracking-tight">
                AI is detecting your nails...
              </h1>
            </div>

            <div className="w-9 h-9 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-[#E0246A] animate-spin" />
            </div>
          </div>

          {/* Desktop 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8 items-start gap-4">
            {/* Left Column (lg:col-span-7): Hand Detection Visual */}
            <div className="lg:col-span-7 space-y-3">
              <div className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden bg-stone-950 border border-stone-200/80 shadow-md flex items-center justify-center">
                {/* Background Hand Image */}
                <img
                  src={activePhotoUrl || '/images/ar-nail-hero.jpg'}
                  alt="Analyzing Hand"
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

                {/* Simulated Finger Detection Pins */}
                <div
                  className={`absolute bottom-28 left-8 transition-all duration-300 ${
                    analysisStep >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                  }`}
                >
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-stone-200/80 text-[10px] font-semibold text-stone-900">
                    <span className="w-2 h-2 rounded-full bg-[#E0246A]" />
                    <span>Thumb Detected ✓</span>
                  </div>
                </div>

                <div
                  className={`absolute top-24 left-14 transition-all duration-300 ${
                    analysisStep >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                  }`}
                >
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-stone-200/80 text-[10px] font-semibold text-stone-900">
                    <span className="w-2 h-2 rounded-full bg-[#E0246A]" />
                    <span>Index Detected ✓</span>
                  </div>
                </div>

                <div
                  className={`absolute top-16 left-1/2 -translate-x-1/2 transition-all duration-300 ${
                    analysisStep >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                  }`}
                >
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-stone-200/80 text-[10px] font-semibold text-stone-900">
                    <span className="w-2 h-2 rounded-full bg-[#E0246A]" />
                    <span>Middle Detected ✓</span>
                  </div>
                </div>

                <div
                  className={`absolute top-24 right-14 transition-all duration-300 ${
                    analysisStep >= 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                  }`}
                >
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-stone-200/80 text-[10px] font-semibold text-stone-900">
                    <span className="w-2 h-2 rounded-full bg-[#E0246A]" />
                    <span>Ring Detected ✓</span>
                  </div>
                </div>

                <div
                  className={`absolute bottom-36 right-8 transition-all duration-300 ${
                    analysisStep >= 5 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                  }`}
                >
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-stone-200/80 text-[10px] font-semibold text-stone-900">
                    <span className="w-2 h-2 rounded-full bg-[#E0246A]" />
                    <span>Pinky Detected ✓</span>
                  </div>
                </div>

                {/* Bottom Progress Label Overlay */}
                <div className="absolute bottom-5 inset-x-5 space-y-2 z-10">
                  <div className="flex items-center justify-between text-white text-xs font-medium">
                    <span className="drop-shadow-xs">Extracting manicures...</span>
                    <span className="font-mono text-[#E0246A] bg-white px-2 py-0.5 rounded-full text-[11px] font-bold">
                      {percentComplete}%
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-white/20 backdrop-blur-sm overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E0246A] rounded-full transition-all duration-300"
                      style={{ width: `${percentComplete}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (lg:col-span-5): 5-Finger Breakdown Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-stone-900">Extracted Fingers</h3>
                  <span className="text-[10px] font-mono text-[#E0246A] font-semibold">
                    {analysisStep}/5 Complete
                  </span>
                </div>

                <div className="grid grid-cols-5 lg:grid-cols-1 gap-1.5">
                  {FINGER_KEYS.map((fk, idx) => {
                    const done = analysisStep > idx;
                    return (
                      <div
                        key={fk}
                        className={`p-2 rounded-2xl transition-all flex flex-col lg:flex-row items-center lg:justify-between gap-2 ${
                          done
                            ? 'bg-[#FDF2F8]/70 border border-[#E0246A]/25 shadow-2xs'
                            : 'bg-stone-50 border border-stone-100 opacity-40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-9 flex items-center justify-center shrink-0">
                            {done ? (
                              <NailCanvasPreview
                                nail={nails[fk]}
                                width={22}
                                height={34}
                                showCuticle={false}
                              />
                            ) : (
                              <span className="text-[10px] font-mono text-stone-400">
                                #{idx + 1}
                              </span>
                            )}
                          </div>
                          <div className="hidden lg:block text-left">
                            <span className="text-xs font-semibold text-stone-900 capitalize block leading-tight">
                              {FINGER_LABELS[fk]}
                            </span>
                            <span className="text-[10px] text-stone-500">
                              {done ? nails[fk].title : 'Pending analysis'}
                            </span>
                          </div>
                        </div>

                        <div className="hidden lg:flex items-center gap-1.5">
                          {done ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✓ Ready
                            </span>
                          ) : (
                            <span className="text-[10px] text-stone-400">Scanning...</span>
                          )}
                        </div>

                        <span className="lg:hidden text-[9px] font-medium text-stone-700 block truncate">
                          {FINGER_LABELS[fk]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="hidden lg:block bg-[#FAF7F2] rounded-3xl p-4 border border-stone-200/70 text-xs text-stone-600 space-y-1">
                <p className="font-semibold text-stone-900">Virtual Try-On Automatic Sync</p>
                <p className="text-[11px]">
                  Each finger is individually calibrated for length, curvature, and finish before entering the try-on studio.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* SCREEN 2: UPLOAD INSPIRATION DROPZONE                          */
        /* ============================================================== */
        <div className="space-y-5">
          <div className="text-center space-y-1">
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#18181B] tracking-tight">
              Upload Inspiration
            </h1>
            <p className="text-xs text-stone-500">
              Upload any Pinterest photo, Instagram screenshot, or editorial manicure
            </p>
          </div>

          {/* Dropzone Card */}
          <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full rounded-3xl bg-stone-50 border-2 border-dashed border-stone-200 hover:border-[#E0246A]/40 transition-colors flex flex-col items-center justify-center p-8 text-center space-y-3.5">
            <div className="w-16 h-16 rounded-2xl bg-[#FDF2F8] border border-[#E0246A]/20 text-[#E0246A] flex items-center justify-center shadow-xs">
              <ImagePlus className="w-8 h-8" strokeWidth={1.5} />
            </div>

            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-stone-900">Drop your manicure photo here</p>
              <p className="text-xs text-stone-500">PNG, JPG, or HEIC up to 15MB</p>
            </div>

            <label className="cursor-pointer h-11 px-6 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-xs transition-all active:scale-95">
              <UploadCloud className="w-4 h-4" />
              <span>Select Photo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onImageSelected(file);
                  }
                }}
              />
            </label>
          </div>

          {/* Test Sample Demo Button */}
          <button
            type="button"
            onClick={onSampleDemoClick}
            className="w-full h-12 rounded-2xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-800 text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <Paintbrush className="w-3.5 h-3.5 text-[#E0246A]" />
            <span>Try with Sample Inspiration</span>
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
