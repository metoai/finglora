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
  Heart,
  Gem,
  CheckCircle2,
} from 'lucide-react';
import { Finger, NailDesign } from '@/types/nail';
import { FINGER_KEYS, FINGER_LABELS } from '@/constants/nail-data';

const GIRLY_ANALYSIS_STEPS = [
  { step: 1, icon: '🌸', tag: 'Inspo', text: 'Ingesting your manicure photo & balancing soft rose lighting...' },
  { step: 1, icon: '✨', tag: 'Colors', text: 'Detecting nude base undertones and delicate pastel pinks...' },
  { step: 2, icon: '💅', tag: 'Nail Beds', text: 'Scanning 5 discrete nail bed shapes & apex smile lines...' },
  { step: 2, icon: '📐', tag: 'Silhouette', text: 'Analyzing length and tapered coffin/almond contours...' },
  { step: 3, icon: '💖', tag: 'Artistry', text: 'Decomposing delicate heart outlines, French tips & swoopy arches...' },
  { step: 3, icon: '💎', tag: 'Gems', text: 'Mapping sparkling crystal rhinestone clusters near cuticles...' },
  { step: 4, icon: '✨', tag: 'Salon Recipe', text: 'Formulating professional layering: prep, rubber base & apex gel...' },
  { step: 4, icon: '🌸', tag: 'Finish', text: 'Synthesizing ultra-glossy glass reflection topcoat...' },
  { step: 5, icon: '💖', tag: 'Ready', text: '✨ Bespoke 5-finger manicure perfected! Ready for virtual try-on.' },
];

const STEP_TITLES: Record<number, string> = {
  1: '🌸 Reading your manicure inspiration...',
  2: '💅 Scanning nail beds & shape contours...',
  3: '💖 Extracting heart French tips & gem art...',
  4: '💎 Formulating salon pigments & crystal details...',
  5: '✨ Your bespoke 5-finger manicure is ready!',
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
  const percentComplete = Math.min(100, Math.max(15, analysisStep * 20));

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
        /* CHIC, GIRLY & BEAUTY ATELIER AI NAIL ART ANALYSIS SCREEN       */
        /* ============================================================== */
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Top Header */}
          <div className="flex items-center justify-between pb-1">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-10 h-10 rounded-full bg-pink-50 hover:bg-pink-100 flex items-center justify-center text-pink-700 transition-all cursor-pointer active:scale-95 shadow-2xs"
                title="Cancel Analysis"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            <div className="text-center flex-1 px-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-[#E0246A] border border-pink-200/80 text-[11px] font-semibold mb-1 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#E0246A]" />
                <span>AI Atelier Vision</span>
                <Heart className="w-3 h-3 text-[#E0246A] fill-[#E0246A]" />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900 tracking-tight">
                Analyzing Your Manicure
              </h1>
              <p className="text-xs text-stone-600 mt-0.5">
                {STEP_TITLES[analysisStep] || 'Creating your bespoke 5-finger nail design...'}
              </p>
            </div>

            <div className="w-10 h-10 flex items-center justify-center">
              {percentComplete >= 100 ? (
                <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-[#E0246A] animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Pretty Progress Card */}
          <div className="bg-gradient-to-r from-[#FFF5F8] via-[#FFFFFF] to-[#FDF2F8] rounded-3xl p-4 sm:p-5 border border-pink-200/70 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-stone-700">
                <span className="w-2 h-2 rounded-full bg-[#E0246A] animate-ping" />
                <span className="font-semibold text-stone-800">Extracting Artistry & Colors</span>
              </span>
              <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-white text-[#E0246A] border border-pink-200 shadow-2xs">
                {percentComplete}% Complete
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-pink-100/70 overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#FFB6C1] via-[#E0246A] to-[#D4AF37] rounded-full transition-all duration-400 shadow-xs"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          {/* Soft Girly Live Beauty Notes Card */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-pink-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-pink-50">
              <h3 className="text-xs font-bold text-stone-900 flex items-center gap-2">
                <span className="text-base">💅</span>
                <span>Live Studio Notes</span>
              </h3>
              <span className="text-[10px] font-semibold text-[#E0246A] bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                {percentComplete >= 100 ? 'All Steps Finished ✨' : 'Live Analysis...'}
              </span>
            </div>

            <div className="space-y-2 min-h-[140px] max-h-[200px] overflow-y-auto pr-1">
              {GIRLY_ANALYSIS_STEPS.filter((l) => l.step <= analysisStep).map((log, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-2 rounded-xl bg-[#FFF8FA] border border-pink-100/80 animate-in fade-in slide-in-from-bottom-1 duration-200"
                >
                  <span className="text-base select-none shrink-0">{log.icon}</span>
                  <div className="flex-1 text-xs text-stone-700 leading-snug">
                    <span className="font-semibold text-[#E0246A] mr-1.5">[{log.tag}]</span>
                    <span>{log.text}</span>
                  </div>
                </div>
              ))}
              {percentComplete < 100 && (
                <div className="flex items-center gap-2 px-2 py-1 text-xs text-stone-400 italic">
                  <Loader2 className="w-3.5 h-3.5 text-[#E0246A] animate-spin" />
                  <span>Perfecting nail architecture...</span>
                </div>
              )}
            </div>
          </div>

          {/* Extracted 5-Finger Nail Design Cards (Chic Beauty Cards) */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-pink-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-pink-50">
              <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E0246A]" />
                <span>Extracted 5-Finger Designs</span>
              </h3>
              <span className="text-[10px] font-mono font-semibold text-[#E0246A] bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
                {Math.min(5, analysisStep)}/5 Ready
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
                        ? 'bg-gradient-to-b from-[#FFF5F8] to-[#FFFFFF] border-pink-200/90 shadow-2xs'
                        : 'bg-stone-50 border-stone-100 opacity-50'
                    }`}
                  >
                    {/* Finger Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900 capitalize flex items-center gap-1">
                        <span>{FINGER_LABELS[fk]}</span>
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          done
                            ? 'bg-pink-100 text-[#E0246A] border border-pink-200'
                            : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        {done ? 'Ready ✨' : 'Scanning'}
                      </span>
                    </div>

                    {/* Design Title */}
                    <p className="text-[11px] font-medium text-stone-800 line-clamp-1">
                      {done ? nail.title : 'Analyzing...'}
                    </p>

                    {/* Color Swatches */}
                    <div className="space-y-1 text-[10px] bg-white/80 p-2 rounded-xl border border-pink-100">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500 font-medium">Base:</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-3 h-3 rounded-full border border-black/15 shadow-2xs inline-block"
                            style={{ backgroundColor: nail.baseColor }}
                          />
                          <span className="font-mono text-stone-700 text-[10px]">{nail.baseColor}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500 font-medium">Accent:</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-3 h-3 rounded-full border border-black/15 shadow-2xs inline-block"
                            style={{ backgroundColor: nail.accentColor }}
                          />
                          <span className="font-mono text-stone-700 text-[10px]">{nail.accentColor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pattern & Finish Badges */}
                    <div className="pt-0.5 flex flex-wrap gap-1">
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-pink-50 text-[#E0246A] border border-pink-200 capitalize">
                        {nail.pattern.replace('-', ' ')}
                      </span>
                      <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-stone-50 border border-stone-200 text-stone-600 capitalize">
                        {nail.finish}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Continue to Virtual Try-On Button */}
          {percentComplete >= 100 && onComplete && (
            <button
              type="button"
              onClick={onComplete}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#E0246A] to-[#BE185D] hover:from-[#BE185D] hover:to-[#9E1447] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95 animate-in fade-in"
            >
              <span>Continue to Virtual Try-On</span>
              <Heart className="w-4 h-4 fill-white" />
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
