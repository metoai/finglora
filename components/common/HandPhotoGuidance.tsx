'use client';

import React from 'react';
import { Sun, Hand, Camera } from 'lucide-react';

interface HandPhotoGuidanceProps {
  variant?: 'light' | 'dark' | 'compact';
  className?: string;
}

const GUIDANCE_ITEMS = [
  {
    id: 'light',
    Icon: Sun,
    title: 'Natural light',
    hint: 'Avoid harsh shadows',
  },
  {
    id: 'pose',
    Icon: Hand,
    title: 'Fingers relaxed',
    hint: 'Slightly spread apart',
  },
  {
    id: 'angle',
    Icon: Camera,
    title: 'Flat top angle',
    hint: 'Keep all 5 nails visible',
  },
] as const;

/**
 * Compact 3-point visual quality guide so user hand uploads render cleanly without warping.
 */
export function HandPhotoGuidance({
  variant = 'light',
  className = '',
}: HandPhotoGuidanceProps) {
  if (variant === 'dark') {
    return (
      <div
        className={`flex flex-wrap items-center justify-center gap-1.5 text-[10px] text-white/85 ${className}`}
      >
        {GUIDANCE_ITEMS.map(({ id, Icon, title }) => (
          <span
            key={id}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-md border border-white/15"
          >
            <Icon className="w-3 h-3 text-pink-300 shrink-0" />
            <span>{title}</span>
          </span>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`flex flex-wrap items-center justify-center gap-1.5 text-[10px] text-stone-600 ${className}`}
      >
        {GUIDANCE_ITEMS.map(({ id, Icon, title }) => (
          <span
            key={id}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-stone-200/80 font-medium"
          >
            <Icon className="w-3 h-3 text-[#E0246A] shrink-0" />
            <span>{title}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl bg-[#FAF7F2] border border-stone-200/80 p-3 space-y-2 ${className}`}
    >
      <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold block">
        For sharpest nail realism
      </span>
      <div className="grid grid-cols-3 gap-2">
        {GUIDANCE_ITEMS.map(({ id, Icon, title, hint }) => (
          <div
            key={id}
            className="rounded-xl bg-white border border-stone-200/70 p-2 text-center space-y-1"
          >
            <div className="w-6 h-6 rounded-lg bg-rose-50 text-[#E0246A] flex items-center justify-center mx-auto">
              <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
            </div>
            <p className="text-[10.5px] font-semibold text-stone-900 leading-tight">
              {title}
            </p>
            <p className="text-[9.5px] text-stone-500 leading-tight">{hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Validates that an uploaded hand file is a readable image of sufficient resolution.
 */
export async function validateHandImageFile(
  file: File
): Promise<{ valid: true } | { valid: false; reason: string }> {
  if (!file.type.startsWith('image/')) {
    return { valid: false, reason: 'Please select a valid photo (JPG, PNG, or WebP).' };
  }
  if (file.size > 20 * 1024 * 1024) {
    return { valid: false, reason: 'Photo is too large (max 20MB). Please choose a smaller photo.' };
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    const timer = setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
      resolve({ valid: true });
    }, 3000);

    img.onload = () => {
      clearTimeout(timer);
      URL.revokeObjectURL(objectUrl);
      if (img.naturalWidth < 240 || img.naturalHeight < 240) {
        resolve({
          valid: false,
          reason: 'Photo resolution is too low for crisp nails. Please upload a clearer hand photo.',
        });
      } else {
        resolve({ valid: true });
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      URL.revokeObjectURL(objectUrl);
      resolve({ valid: false, reason: 'Could not read image file. Please try another photo.' });
    };

    img.src = objectUrl;
  });
}
