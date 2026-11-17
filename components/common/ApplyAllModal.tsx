'use client';

import React from 'react';

export function ApplyAllModal({
  fingerLabel,
  onCancel,
  onConfirm,
}: {
  fingerLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-[#18181B]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] rounded-2xl max-w-md w-full p-6 border border-[rgba(31,26,28,0.12)] shadow-xl space-y-4">
        <div>
          <span className="text-[10px] font-mono tracking-wider uppercase text-[#E0246A] block mb-1">
            Global Suite Calibration
          </span>
          <h3 className="font-serif text-xl font-normal text-[#18181B]">
            Apply {fingerLabel} design to all 5 fingers?
          </h3>
          <p className="text-xs sm:text-sm text-[#61565A] mt-2 leading-relaxed">
            This action harmonizes Thumb, Index, Middle, Ring, and Pinky to match {fingerLabel}&apos;s pattern, base lacquer, accent art, and finish specs.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[rgba(31,26,28,0.06)]">
          <button
            type="button"
            onClick={onCancel}
            className="h-9 px-4 rounded-xl text-xs font-medium text-[#61565A] hover:text-[#18181B] hover:bg-[#FAFAFA] transition-all"
          >
            Keep Discrete Designs
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-9 px-4 rounded-xl text-xs font-medium bg-[#E0246A] hover:bg-[#66152A] text-white shadow-xs transition-all"
          >
            Apply to All 5 Fingers
          </button>
        </div>
      </div>
    </div>
  );
}
