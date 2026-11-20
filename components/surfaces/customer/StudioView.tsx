'use client';

import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Undo2,
  Pipette,
  Check,
  ChevronRight,
  Camera,
  Share2,
} from 'lucide-react';
import { ExploreDesignSet, Finger, NailDesign, NailFinish, NailLength, NailPattern, NailShape } from '@/types/nail';
import {
  COLOR_PALETTE,
  FINGER_LABELS,
  NAIL_FINISHES,
  NAIL_LENGTHS,
  NAIL_PATTERNS,
} from '@/constants/nail-data';
import { InspirationPhotoCard } from '@/components/visuals/InspirationPhotoCard';
import { NailCanvasPreview } from '@/components/visuals/NailCanvasPreview';

const STUDIO_COLORS = [
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Glazed Pearl', hex: '#F5EFEB' },
  { name: 'Sheer Rose', hex: '#F9D8E0' },
  { name: 'Bordeaux Lacquer', hex: '#E0246A' },
  { name: 'Deep Burgundy', hex: '#5A1226' },
  { name: 'Smoked Espresso', hex: '#2E1E1F' },
  { name: 'Champagne Foil', hex: '#D4AF37' },
  { name: 'Soft Lavender', hex: '#C9A0DC' },
  { name: 'Sage Mist', hex: '#8FA893' },
  { name: 'Noir Lacquer', hex: '#18181B' },
];

export function StudioView({
  activeSample,
  activePhotoUrl,
  activeSetName,
  setActiveSetName,
  handOrientation,
  setHandOrientation,
  swapMode,
  setSwapMode,
  swapFirstFinger,
  orderedFingers,
  selectedFinger,
  nails,
  mobilePreview,
  onSelectFinger,
  onUndoFingerEdit,
  onUpdateActiveFinger,
  onOpenApplyAllModal,
  onTryOnClick,
  onPassportClick,
  exploreDesigns,
  onSelectExploreDesign,
}: {
  activeSample: ExploreDesignSet;
  activePhotoUrl: string;
  activeSetName: string;
  setActiveSetName: (name: string) => void;
  handOrientation: 'left' | 'right';
  setHandOrientation: (orientation: 'left' | 'right') => void;
  swapMode: boolean;
  setSwapMode: React.Dispatch<React.SetStateAction<boolean>>;
  swapFirstFinger: Finger | null;
  orderedFingers: Finger[];
  selectedFinger: Finger;
  nails: Record<Finger, NailDesign>;
  mobilePreview: boolean;
  onSelectFinger: (fk: Finger) => void;
  onUndoFingerEdit: () => void;
  onUpdateActiveFinger: (patch: Partial<NailDesign>) => void;
  onOpenApplyAllModal: () => void;
  onTryOnClick: () => void;
  onPassportClick: () => void;
  exploreDesigns?: ExploreDesignSet[];
  onSelectExploreDesign?: (id: string) => void;
}) {
  const activeNail = nails[selectedFinger];
  const [customBaseHex, setCustomBaseHex] = useState(activeNail.baseColor);
  const [customAccentHex, setCustomAccentHex] = useState(activeNail.accentColor);

  return (
    <div className="space-y-6 w-full max-w-[1400px]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[rgba(31,26,28,0.06)]">
        <div>
          <span className="text-[11px] font-mono tracking-wider uppercase text-[#E0246A] block mb-1">
            Individual Nail Sculptor • 5 Discrete Beds
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#18181B] tracking-tight">
            5-Finger Studio
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTryOnClick}
            className="h-9 px-3.5 rounded-xl bg-[#FFFFFF] border border-[rgba(31,26,28,0.12)] hover:bg-[#F4F4F5] text-xs font-medium text-[#18181B] transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
          >
            <Camera className="w-3.5 h-3.5 text-[#E0246A]" strokeWidth={1.5} />
            <span>Virtual Try-On</span>
          </button>
          <button
            type="button"
            onClick={onPassportClick}
            className="h-9 px-4 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-medium transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Design Passport</span>
          </button>
        </div>
      </div>

      {/* Workbench Toolbar Controls (btns) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          {/* Hand Selector */}
          <div className="inline-flex rounded-xl bg-[#FAFAFA] p-0.5 border border-[rgba(31,26,28,0.08)]">
            {(['left', 'right'] as const).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHandOrientation(h)}
                className={`h-8 px-2.5 sm:px-3 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                  handOrientation === h
                    ? 'bg-[#FFFFFF] text-[#18181B] shadow-2xs font-semibold'
                    : 'text-[#61565A] hover:text-[#18181B]'
                }`}
              >
                {h} Hand
              </button>
            ))}
          </div>

          {/* Swap Mode Toggle */}
          <button
            type="button"
            onClick={() => setSwapMode((v) => !v)}
            className={`h-8 px-3 rounded-xl text-xs font-medium border transition-all inline-flex items-center gap-1.5 cursor-pointer ${
              swapMode
                ? 'bg-[#E0246A] text-white border-[#E0246A] shadow-xs'
                : 'bg-[#FFFFFF] text-[#18181B] border-[rgba(31,26,28,0.12)] hover:bg-[#F4F4F5]'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{swapMode ? 'Exit Swap' : 'Swap'}</span>
          </button>
        </div>

        {/* Primary View Link */}
        <button
          type="button"
          onClick={onTryOnClick}
          className="h-8 px-3.5 rounded-xl bg-[#E0246A] hover:bg-[#66152A] text-white text-xs font-medium transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
        >
          <Camera className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Try On Hand</span>
        </button>
      </div>

      {/* Explore Slidable - Right After Buttons */}
      {exploreDesigns && exploreDesigns.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C8085]">
              Curated Looks
            </span>
            <span className="text-[10px] text-[#8C8085]">
              Tap to load look into studio
            </span>
          </div>
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-none -mx-1 px-1">
            {exploreDesigns.map((design) => {
              const isActive = design.id === activeSample.id;
              return (
                <button
                  key={design.id}
                  type="button"
                  onClick={() => onSelectExploreDesign?.(design.id)}
                  className={`group relative rounded-xl overflow-hidden border transition-all text-left shrink-0 cursor-pointer active:scale-95 ${
                    isActive
                      ? 'border-[#E0246A] ring-1.5 ring-[#E0246A] shadow-xs'
                      : 'border-[rgba(31,26,28,0.08)] hover:border-[#E0246A]/50 bg-white opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="h-16 w-24 sm:h-20 sm:w-28 relative overflow-hidden bg-black/5">
                    <img
                      src={design.photoUrl || '/assets/editorial_nail_hero.jpg'}
                      alt={design.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-1 inset-x-1.5">
                      <span className="text-[10px] text-white font-medium block truncate drop-shadow-xs">
                        {design.title.split('&')[0].trim()}
                      </span>
                    </div>
                    {isActive && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E0246A] shadow-xs" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Swap Mode Guidance Banner */}
      {swapMode && (
        <div className="rounded-2xl bg-[#FDFCF9] border border-[#D4AF37]/50 p-3.5 flex items-center justify-between gap-3 text-xs text-[#18181B]">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="font-medium">
              {swapFirstFinger
                ? `Swap active: Select the target finger to exchange with ${FINGER_LABELS[swapFirstFinger]}`
                : 'Tap any nail card below to designate the first finger to swap'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSwapMode(false)}
            className="text-[11px] font-medium text-[#E0246A] hover:underline"
          >
            Cancel
          </button>
        </div>
      )}

      {/* 5 Standalone Nail Cards */}
      <div
        className={`grid ${
          mobilePreview ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
        } gap-3`}
      >
        {orderedFingers.map((fk) => {
          const nail = nails[fk];
          const isSelected = selectedFinger === fk && !swapMode;
          const isSwapFirst = swapFirstFinger === fk;

          return (
            <div
              key={fk}
              onClick={() => onSelectFinger(fk)}
              className={`group cursor-pointer rounded-2xl p-3.5 bg-[#FFFFFF] border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-[#E0246A] ring-1 ring-[#E0246A] shadow-sm'
                  : isSwapFirst
                  ? 'border-[#D4AF37] bg-[#FAFAFA] ring-2 ring-[#D4AF37]/40 shadow-sm'
                  : 'border-[rgba(31,26,28,0.08)] hover:border-[rgba(31,26,28,0.2)] hover:shadow-2xs'
              }`}
            >
              <div>
                {/* Card Header: Finger Label & Status */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-medium ${
                      isSelected ? 'text-[#E0246A]' : 'text-[#18181B]'
                    }`}
                  >
                    {FINGER_LABELS[fk]}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono text-[#8C8085] bg-[#FAFAFA] border border-[rgba(31,26,28,0.06)]">
                    {nail.status === 'edited' ? 'Modified' : 'Extracted'}
                  </span>
                </div>

                {/* Nail Canvas Container */}
                <div className="bg-[#FAFAFA] rounded-xl py-3 flex items-center justify-center border border-[rgba(31,26,28,0.06)] my-1.5 group-hover:bg-[#F4F4F5] transition-colors">
                  <NailCanvasPreview nail={nail} width={52} height={80} interactive={true} />
                </div>

                {/* Nail Metadata */}
                <p className="font-medium text-xs text-[#18181B] truncate mt-2">{nail.title}</p>
                <p className="text-[11px] text-[#8C8085] capitalize truncate mt-0.5">
                  {nail.shape} • {nail.length} • {nail.finish}
                </p>
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-3 pt-2.5 border-t border-[rgba(31,26,28,0.06)] flex items-center justify-between">
                <span
                  className={`text-[11px] font-medium transition-colors ${
                    isSelected ? 'text-[#E0246A]' : 'text-[#8C8085] group-hover:text-[#18181B]'
                  }`}
                >
                  {swapMode
                    ? isSwapFirst
                      ? 'Source'
                      : 'Swap Target'
                    : isSelected
                    ? 'Active Focus'
                    : 'Select'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Flagship Single-Finger Inspector Workbench */}
      <div
        className={`grid grid-cols-1 ${
          mobilePreview ? '' : 'lg:grid-cols-12'
        } gap-6 items-start`}
      >
        {/* Left Column: Isolated Finger Canvas & Actions (5 cols) */}
        <div
          className={`${
            mobilePreview ? '' : 'lg:col-span-5'
          } bg-[#FFFFFF] rounded-2xl p-5 sm:p-6 border border-[rgba(31,26,28,0.08)] shadow-2xs space-y-5`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono tracking-wider uppercase text-[#E0246A] block mb-0.5">
                Isolated Inspector
              </span>
              <h3 className="font-serif text-2xl font-normal text-[#18181B]">
                {FINGER_LABELS[selectedFinger]} Finger
              </h3>
            </div>

            {/* Quick Undo & Single Regenerate */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onUndoFingerEdit}
                title="Undo last edit for this finger"
                className="h-8 w-8 rounded-lg bg-[#FAFAFA] hover:bg-[#F4F4F5] text-[#18181B] border border-[rgba(31,26,28,0.08)] flex items-center justify-center transition-all"
              >
                <Undo2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Large Nail Preview Container */}
          <div className="bg-[#FAFAFA] rounded-2xl py-8 flex flex-col items-center justify-center border border-[rgba(31,26,28,0.06)] relative overflow-hidden">
            <NailCanvasPreview
              nail={activeNail}
              width={124}
              height={184}
              showCuticle={true}
            />
            <div className="mt-4 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[rgba(31,26,28,0.08)] text-xs font-mono text-[#61565A] capitalize shadow-2xs">
              {activeNail.shape} • {activeNail.length} • {activeNail.finish}
            </div>
          </div>

          {/* Single-Finger Technical Notes & Apply All */}
          <div className="space-y-3 pt-2 border-t border-[rgba(31,26,28,0.08)]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8C8085]">Design style:</span>
              <span className="font-mono text-[#18181B]">
                {activeNail.pattern} / {activeNail.finish}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={onOpenApplyAllModal}
                className="text-xs font-medium text-[#E0246A] hover:underline"
              >
                Apply to all 5 fingers...
              </button>

              <button
                type="button"
                onClick={onPassportClick}
                className="h-8 px-3 rounded-lg bg-[#FAFAFA] hover:bg-[#F4F4F5] border border-[rgba(31,26,28,0.08)] text-xs font-medium text-[#18181B] inline-flex items-center gap-1 transition-all"
              >
                <span>View Recipe</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#8C8085]" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Style, Colors, Architecture Controls (7 cols) */}
        <div
          className={`${
            mobilePreview ? '' : 'lg:col-span-7'
          } bg-[#FFFFFF] rounded-2xl p-5 sm:p-6 border border-[rgba(31,26,28,0.08)] shadow-2xs space-y-6`}
        >
          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-[rgba(31,26,28,0.06)] pb-3">
            <div>
              <h4 className="font-serif text-lg font-normal text-[#18181B]">
                Color & Style
              </h4>
              <p className="text-xs text-[#8C8085]">
                Customizing {FINGER_LABELS[selectedFinger]}.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#F4F4F5] text-[#E0246A]">
              Active Slot
            </span>
          </div>

          {/* 1. Design Style / Patterns */}
          <div>
            <label className="block text-xs font-medium text-[#18181B] mb-2">
              Design Motif
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {NAIL_PATTERNS.map((p) => {
                const isActive = activeNail.pattern === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      onUpdateActiveFinger({
                        pattern: p.id,
                        title: `${FINGER_LABELS[selectedFinger]} ${p.label}`,
                      })
                    }
                    className={`h-9 px-3 rounded-xl text-xs font-medium border text-left transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-[#FAFAFA] border-[#E0246A] text-[#E0246A] shadow-2xs font-semibold'
                        : 'bg-[#FFFFFF] border-[rgba(31,26,28,0.08)] text-[#61565A] hover:text-[#18181B] hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <span className="truncate">{p.label}</span>
                    {isActive && <Check className="w-3.5 h-3.5 shrink-0 ml-1 text-[#E0246A]" strokeWidth={2} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Color Swatches: Base & Accent with Custom Hex */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
            {/* Base Color */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#18181B]">
                  Base Lacquer
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-[#8C8085]">
                    {activeNail.baseColor.toUpperCase()}
                  </span>
                  <label className="cursor-pointer relative flex items-center">
                    <input
                      type="color"
                      value={activeNail.baseColor}
                      onChange={(e) => onUpdateActiveFinger({ baseColor: e.target.value })}
                      className="sr-only"
                    />
                    <span className="w-4 h-4 rounded-full border border-[rgba(31,26,28,0.2)] flex items-center justify-center bg-[#FAFAFA] text-[#61565A] hover:text-[#18181B]">
                      <Pipette className="w-2.5 h-2.5" strokeWidth={1.5} />
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {STUDIO_COLORS.map((c) => {
                  const isSelected =
                    activeNail.baseColor.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.name}
                      type="button"
                      title={c.name}
                      onClick={() => onUpdateActiveFinger({ baseColor: c.hex })}
                      className={`w-7 h-7 rounded-full border transition-all relative ${
                        isSelected
                          ? 'ring-2 ring-[#E0246A] ring-offset-2 scale-105 border-white'
                          : 'border-[rgba(31,26,28,0.14)] hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {isSelected && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Check
                            className={`w-3 h-3 ${
                              c.hex === '#FFFFFF' || c.hex === '#F5EFEB'
                                ? 'text-[#18181B]'
                                : 'text-white'
                            }`}
                            strokeWidth={2.5}
                          />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accent Color */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#18181B]">
                  Accent Art Tone
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-[#8C8085]">
                    {activeNail.accentColor.toUpperCase()}
                  </span>
                  <label className="cursor-pointer relative flex items-center">
                    <input
                      type="color"
                      value={activeNail.accentColor}
                      onChange={(e) => onUpdateActiveFinger({ accentColor: e.target.value })}
                      className="sr-only"
                    />
                    <span className="w-4 h-4 rounded-full border border-[rgba(31,26,28,0.2)] flex items-center justify-center bg-[#FAFAFA] text-[#61565A] hover:text-[#18181B]">
                      <Pipette className="w-2.5 h-2.5" strokeWidth={1.5} />
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {STUDIO_COLORS.map((c) => {
                  const isSelected =
                    activeNail.accentColor.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.name}
                      type="button"
                      title={c.name}
                      onClick={() => onUpdateActiveFinger({ accentColor: c.hex })}
                      className={`w-7 h-7 rounded-full border transition-all relative ${
                        isSelected
                          ? 'ring-2 ring-[#E0246A] ring-offset-2 scale-105 border-white'
                          : 'border-[rgba(31,26,28,0.14)] hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {isSelected && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Check
                            className={`w-3 h-3 ${
                              c.hex === '#FFFFFF' || c.hex === '#F5EFEB'
                                ? 'text-[#18181B]'
                                : 'text-white'
                            }`}
                            strokeWidth={2.5}
                          />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Nail Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[rgba(31,26,28,0.06)]">
            {/* Length */}
            <div>
              <label className="block text-xs font-medium text-[#18181B] mb-2">
                Length
              </label>
              <div className="flex gap-1.5">
                {NAIL_LENGTHS.map((l) => {
                  const isActive = activeNail.length === l.id;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => onUpdateActiveFinger({ length: l.id })}
                      className={`flex-1 h-8 rounded-lg text-xs font-medium border transition-all ${
                        isActive
                          ? 'bg-[#E0246A] text-white border-[#E0246A] shadow-xs'
                          : 'bg-[#FFFFFF] text-[#61565A] border-[rgba(31,26,28,0.08)] hover:bg-[#FAFAFA]'
                      }`}
                    >
                      {l.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Finish */}
            <div>
              <label className="block text-xs font-medium text-[#18181B] mb-2">
                Topcoat Finish
              </label>
              <div className="flex flex-wrap gap-1.5">
                {NAIL_FINISHES.map((f) => {
                  const isActive = activeNail.finish === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => onUpdateActiveFinger({ finish: f.id })}
                      className={`h-8 px-2.5 rounded-lg text-xs font-medium border transition-all ${
                        isActive
                          ? 'bg-[#E0246A] text-white border-[#E0246A] shadow-xs'
                          : 'bg-[#FFFFFF] text-[#61565A] border-[rgba(31,26,28,0.08)] hover:bg-[#FAFAFA]'
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
