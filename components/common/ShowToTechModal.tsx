'use client';

import React, { useState } from 'react';
import { X, Check, Copy, Share2, Maximize2 } from 'lucide-react';
import { SimpleTechSummary } from '@/lib/services/share-look';

export interface ShowToTechModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  inspoImageUrl?: string | null;
  summary: SimpleTechSummary;
  onShareClick?: () => void;
}

export function ShowToTechModal({
  isOpen,
  onClose,
  imageUrl,
  inspoImageUrl,
  summary,
  onShareClick,
}: ShowToTechModalProps) {
  const [copied, setCopied] = useState(false);
  const [containFit, setContainFit] = useState(false);

  if (!isOpen || !imageUrl) return null;

  const techNoteText = [
    `Look: ${summary.title}`,
    `• Shape: ${summary.shape} (${summary.length} length)`,
    `• Finish: ${summary.finish}`,
    `• Technique: ${summary.technique}`,
  ].join('\n');

  const handleCopyTechNotes = async () => {
    try {
      await navigator.clipboard.writeText(techNoteText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // ignore clipboard errors
    }
  };

  const showMiniInspo = Boolean(inspoImageUrl && inspoImageUrl !== imageUrl);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Show to Nail Technician Card"
      className="fixed inset-0 z-[10000] bg-[#FAF7F2] text-[#1F1A1C] overflow-y-auto animate-in fade-in duration-150 select-none"
    >
      <div className="min-h-screen w-full max-w-lg mx-auto px-4 py-4 sm:py-6 flex flex-col justify-between gap-4">
        {/* Top Salon Header */}
        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E0246A] font-semibold block">
              Show to Nail Tech
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-stone-900 truncate">
              {summary.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onShareClick && (
              <button
                type="button"
                onClick={onShareClick}
                className="w-9 h-9 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 flex items-center justify-center shadow-2xs transition cursor-pointer active:scale-95"
                title="Share Look"
                aria-label="Share Look"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center shadow-xs transition cursor-pointer active:scale-95"
              title="Close"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Big Manicured Hand Viewport */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="relative w-full aspect-[3/4] max-h-[52vh] bg-stone-950/5 overflow-hidden">
            <img
              src={imageUrl}
              alt={summary.title}
              onClick={() => setContainFit((v) => !v)}
              className={`w-full h-full cursor-pointer transition-all duration-200 ${
                containFit ? 'object-contain bg-stone-950' : 'object-cover'
              }`}
              title="Tap to toggle full framing"
            />

            {/* Optional Reference Inspo Inset Thumbnail */}
            {showMiniInspo && inspoImageUrl && (
              <div className="absolute bottom-3 left-3 w-14 h-16 rounded-xl overflow-hidden border-2 border-white shadow-lg bg-white">
                <img
                  src={inspoImageUrl}
                  alt="Reference inspiration"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] text-white text-center py-0.5 font-medium">
                  Inspo
                </span>
              </div>
            )}

            {/* Toggle Full Frame Hint */}
            <button
              type="button"
              onClick={() => setContainFit((v) => !v)}
              className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/75 backdrop-blur-md text-white text-[10px] font-medium inline-flex items-center gap-1 transition cursor-pointer"
            >
              <Maximize2 className="w-3 h-3" />
              <span>{containFit ? 'Fill Frame' : 'Fit Full Hand'}</span>
            </button>
          </div>

          {/* 3 Concise Salon Spec Bullets */}
          <div className="p-4 sm:p-5 space-y-3 bg-white">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-stone-200/80">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 block">
                  1 · Shape
                </span>
                <p className="text-sm sm:text-base font-semibold text-stone-900 mt-0.5 capitalize">
                  {summary.shape}
                </p>
                <span className="text-[11px] text-stone-500 capitalize">
                  {summary.length} length
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-stone-200/80">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 block">
                  2 · Finish
                </span>
                <p className="text-sm sm:text-base font-semibold text-stone-900 mt-0.5">
                  {summary.finish}
                </p>
                <span className="text-[11px] text-stone-500">Top coat seal</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-stone-200/80 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 block">
                3 · Technique
              </span>
              <p className="text-xs sm:text-sm font-medium text-stone-900 leading-relaxed">
                {summary.technique}
              </p>

              {summary.colors.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {summary.colors.map((hex) => (
                    <span
                      key={hex}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white border border-stone-200/80 text-[10px] font-mono text-stone-700"
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/15 shrink-0"
                        style={{ backgroundColor: hex }}
                      />
                      <span>{hex}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom High-Contrast Actions */}
        <footer className="grid grid-cols-2 gap-2.5 pb-2">
          <button
            type="button"
            onClick={handleCopyTechNotes}
            className="h-11 rounded-2xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-900 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Notes Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#E0246A]" />
                <span>Copy Tech Notes</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold flex items-center justify-center transition cursor-pointer active:scale-95 shadow-xs"
          >
            Done
          </button>
        </footer>
      </div>
    </div>
  );
}
