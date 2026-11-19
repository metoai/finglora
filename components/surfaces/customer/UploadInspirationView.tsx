'use client';

import React, { useEffect } from 'react';
import {
  ImagePlus,
  UploadCloud,
  Paintbrush,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles,
  Terminal,
  CheckCircle2,
} from 'lucide-react';
import { Finger, NailDesign } from '@/types/nail';
import { FINGER_KEYS, FINGER_LABELS } from '@/constants/nail-data';

const ANALYSIS_LOGS = [
  { step: 1, time: '00:00.12', tag: 'INPUT', text: 'Inspiration photograph received. Calibrating RGB color gamut & lighting...' },
  { step: 1, time: '00:00.38', tag: 'MODEL', text: 'Connecting to Free.ai Vision API (model: qwen7b)...' },
  { step: 2, time: '00:00.75', tag: 'VISION', text: 'Scanning 5 discrete nail bed zones & apex boundary contours...' },
  { step: 2, time: '00:01.10', tag: 'PALETTE', text: 'Analyzing base lacquer, undertones, and apex curvature...' },
  { step: 3, time: '00:01.52', tag: 'ARTISTRY', text: 'Decomposing artistry patterns (French tips, chrome swirls, aura, florals)...' },
  { step: 3, time: '00:01.90', tag: 'FINGERS', text: 'Decomposing into 5 standalone finger designs (Thumb, Index, Middle, Ring, Pinky)...' },
  { step: 4, time: '00:02.25', tag: 'RECIPE', text: 'Formulating salon technician application layers & LED cure times...' },
  { step: 4, time: '00:02.60', tag: 'FINISH', text: 'Synthesizing surface finish (glossy apex / velvet matte / chrome sheen)...' },
  { step: 5, time: '00:02.95', tag: 'SUCCESS', text: '✓ 5-finger manicure calibrated and mapped for virtual try-on!' },
];

const STEP_DESCRIPTIONS: Record<number, string> = {
  1: 'Phase 1: Ingesting photo & calibrating color spectrum...',
  2: 'Phase 2: Free.ai Vision scanning nail beds & contours...',
  3: 'Phase 3: Decomposing intricate nail artistry & patterns...',
  4: 'Phase 4: Formulating salon pigments & technician recipes...',
  5: 'Phase 5: Synthesis complete • Ready for virtual try-on!',
};

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
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAnalyzing, percentComplete, onComplete]);

  return (
    <div className="min-h-[calc(100vh-160px)] flex flex-col justify-center items-center py-6 sm:py-10 w-full">
      <div className="max-w-md lg:max-w-4xl w-full px-2 sm:px-4 space-y-5">
      {isAnalyzing ? (
        /* ============================================================== */
        /* AI NAIL ART ANALYSIS CONSOLE (TEXT-FOCUSED AI INTELLIGENCE)    */
        /* ============================================================== */
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Top Header */}
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

            <div className="text-center flex-1 px-3">
              <h1 className="font-serif text-xl sm:text-2xl font-normal text-[#18181B] tracking-tight">
                AI Analyzing Nail Designs
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                {STEP_DESCRIPTIONS[analysisStep] || 'Processing inspiration image with Free.ai Vision...'}
              </p>
            </div>

            <div className="w-9 h-9 flex items-center justify-center">
              {percentComplete >= 100 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <Loader2 className="w-4.5 h-4.5 text-[#E0246A] animate-spin" />
              )}
            </div>
          </div>

          {/* Progress Bar & Engine Badge */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Free.ai Vision (qwen7b)
                </span>
                <span className="text-[11px] text-stone-500 hidden sm:inline">
                  Step {analysisStep} of 5
                </span>
              </div>
              <span className="font-mono text-[#E0246A] font-bold text-xs">
                {percentComplete}%
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E0246A] rounded-full transition-all duration-300"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          {/* AI Terminal Log Output */}
          <div className="bg-[#101012] text-stone-300 rounded-3xl p-4 sm:p-5 border border-stone-800 shadow-xl space-y-3 font-mono text-xs">
            {/* Terminal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-stone-800/80 text-[11px] text-stone-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                <span className="ml-2 font-medium text-stone-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-stone-400" />
                  freeai-vision@finglora ~ nail-extractor
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
                {percentComplete >= 100 ? 'Analysis Complete' : 'Live Stream'}
              </span>
            </div>

            {/* Terminal Body */}
            <div className="space-y-1.5 min-h-[140px] max-h-[220px] overflow-y-auto pr-1">
              {ANALYSIS_LOGS.filter((l) => l.step <= analysisStep).map((log, i) => (
                <div key={i} className="flex items-start gap-2 leading-relaxed text-[11px] sm:text-xs">
                  <span className="text-stone-500 shrink-0 select-none">[{log.time}]</span>
                  <span
                    className={`shrink-0 font-bold ${
                      log.tag === 'SUCCESS'
                        ? 'text-emerald-400'
                        : log.tag === 'ARTISTRY' || log.tag === 'FINGERS'
                        ? 'text-[#E0246A]'
                        : log.tag === 'MODEL'
                        ? 'text-amber-400'
                        : 'text-stone-400'
                    }`}
                  >
                    [{log.tag}]
                  </span>
                  <span className={log.tag === 'SUCCESS' ? 'text-emerald-300 font-medium' : 'text-stone-200'}>
                    {log.text}
                  </span>
                </div>
              ))}
              {percentComplete < 100 && (
                <div className="flex items-center gap-1 text-[#E0246A] pt-0.5">
                  <span className="animate-pulse">▶</span>
                  <span className="text-stone-400 text-[11px]">Free.ai analyzing inspiration...</span>
                  <span className="inline-block w-1.5 h-3.5 bg-[#E0246A] animate-pulse" />
                </div>
              )}
            </div>
          </div>

          {/* Extracted 5-Finger Nail Design Specs (Pure Text Analysis) */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-stone-100">
              <h3 className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E0246A]" />
                Extracted Nail Specifications
              </h3>
              <span className="text-[10px] font-mono text-[#E0246A] font-semibold">
                {Math.min(5, analysisStep)}/5 Calibrated
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {FINGER_KEYS.map((fk, idx) => {
                const done = analysisStep >= 3;
                const nail = nails[fk];
                return (
                  <div
                    key={fk}
                    className={`p-3 rounded-2xl border transition-all space-y-2 ${
                      done
                        ? 'bg-[#FDF2F8]/60 border-[#E0246A]/20 shadow-2xs'
                        : 'bg-stone-50 border-stone-100 opacity-50'
                    }`}
                  >
                    {/* Finger Name & Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900 capitalize">
                        {FINGER_LABELS[fk]}
                      </span>
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                          done
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {done ? 'Extracted' : 'Scanning'}
                      </span>
                    </div>

                    {/* Extracted Title */}
                    <p className="text-[11px] font-medium text-stone-800 line-clamp-1">
                      {done ? nail.title : 'Pending detection'}
                    </p>

                    {/* Color Swatches */}
                    <div className="space-y-1 text-[10px]">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Base:</span>
                        <div className="flex items-center gap-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                            style={{ backgroundColor: nail.baseColor }}
                          />
                          <span className="font-mono text-stone-700 text-[10px]">{nail.baseColor}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Accent:</span>
                        <div className="flex items-center gap-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                            style={{ backgroundColor: nail.accentColor }}
                          />
                          <span className="font-mono text-stone-700 text-[10px]">{nail.accentColor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pattern & Finish Badges */}
                    <div className="pt-1 border-t border-stone-200/60 flex flex-wrap gap-1">
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-700 capitalize">
                        {nail.pattern.replace('-', ' ')}
                      </span>
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-white border border-stone-200 text-stone-600 capitalize">
                        {nail.finish}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Manual Continue Button (or auto-proceed) */}
          {percentComplete >= 100 && onComplete && (
            <button
              type="button"
              onClick={onComplete}
              className="w-full h-12 rounded-2xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95 animate-in fade-in"
            >
              <span>Continue to Virtual Try-On</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
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
