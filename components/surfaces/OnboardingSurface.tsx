'use client';

import React, { useState, useRef } from 'react';
import {
  ArrowRight,
  Check,
  Upload,
  Sparkles,
  Layers,
} from 'lucide-react';
import { ExploreDesignSet, Finger, NailDesign, NailShape, NailLength } from '@/types/nail';
import { FINGER_KEYS, FINGER_LABELS } from '@/constants/nail-data';
import { BrandLogo } from '@/components/common/BrandLogo';
import { NailCanvasPreview } from '@/components/visuals/NailCanvasPreview';
import { ShimmerButton } from '@/components/magicui/shimmer-button';

export function OnboardingSurface({
  userName,
  preferredShape,
  setPreferredShape,
  exploreDesigns,
  mobilePreview,
  onSelectInspoSet,
  onSkipToAtelier,
  onContinueToStudio,
  onBrandClick,
}: {
  userName: string;
  preferredShape?: NailShape;
  setPreferredShape?: (shape: NailShape) => void;
  exploreDesigns: ExploreDesignSet[];
  mobilePreview: boolean;
  onSelectInspoSet: (setId: string, customUrl?: string) => void;
  onSkipToAtelier: () => void;
  onContinueToStudio?: () => void;
  onBrandClick?: () => void;
}) {
  const [selectedSetId, setSelectedSetId] = useState<string>(exploreDesigns[0]?.id || 'set-rose-water');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSet =
    exploreDesigns.find((d) => d.id === selectedSetId) || exploreDesigns[0];

  const previewNails = React.useMemo(() => {
    return JSON.parse(JSON.stringify(activeSet.nails)) as Record<Finger, NailDesign>;
  }, [activeSet]);

  const handlePickSet = (id: string) => {
    setSelectedSetId(id);
    setUploadedPhotoUrl(null);
    onSelectInspoSet(id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedPhotoUrl(url);
      setSelectedSetId(exploreDesigns[0]?.id || 'set-rose-water');
      onSelectInspoSet(exploreDesigns[0]?.id || 'set-rose-water', url);
      handleFinish();
    }
  };

  const handleFinish = () => {
    if (onContinueToStudio) {
      onContinueToStudio();
    } else {
      onSkipToAtelier();
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f8] text-stone-900 flex flex-col justify-between py-6 sm:py-8 px-4 sm:px-8 select-none relative overflow-x-hidden font-sans">
      {/* Subtle ambient lighting */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#E0246A]/5 blur-3xl pointer-events-none -top-20 -right-20" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-[#FDF2F8] blur-3xl pointer-events-none -bottom-20 -left-20" />

      {/* Main Responsive Canvas */}
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-between relative z-10 space-y-6">
        {/* Minimalist Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200/60">
          <button
            type="button"
            onClick={onBrandClick || handleFinish}
            className="text-left focus:outline-none cursor-pointer flex items-center gap-2"
          >
            <BrandLogo size="sm" />
          </button>

          <button
            type="button"
            onClick={handleFinish}
            className="font-sans text-xs font-medium text-stone-500 hover:text-[#E0246A] transition cursor-pointer flex items-center gap-1"
          >
            <span>Skip to Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content Box */}
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Title */}
          <div className="text-center max-w-lg mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF2F8] border border-[#FCE7F3] text-[11px] font-semibold text-[#E0246A] mb-2 shadow-2xs">
              <Sparkles className="w-3 h-3 text-[#E0246A]" />
              Finglora AI Manicure Atelier
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 tracking-tight">
              Select or Upload Your Look
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Upload any Pinterest or Instagram nail inspiration photo — our AI extracts each finger design directly.
            </p>
          </div>

          {/* Section: Pick Aesthetic or Upload Inspiration */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Upload Dropzone Card */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white border-2 border-dashed border-[#FCE7F3] hover:border-[#E0246A] hover:bg-[#FDF2F8]/30 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 group shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FDF2F8] text-[#E0246A] flex items-center justify-center group-hover:bg-[#E0246A] group-hover:text-white transition-colors">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="font-serif text-xs font-semibold text-stone-900">
                  Upload Inspo
                </span>
                <span className="text-[10px] text-stone-500">
                  AI extracts 5 nails
                </span>
              </div>

              {/* 4 Curated Looks */}
              {exploreDesigns.slice(0, 4).map((d) => {
                const isSelected = selectedSetId === d.id && !uploadedPhotoUrl;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handlePickSet(d.id)}
                    className={`relative rounded-2xl overflow-hidden border transition-all text-left cursor-pointer active:scale-[0.98] h-32 sm:h-36 group ${
                      isSelected
                        ? 'border-[#E0246A] ring-2 ring-[#E0246A]/20 shadow-xs'
                        : 'border-stone-200/80 hover:border-[#FCE7F3]'
                    }`}
                  >
                    <img
                      src={d.photoUrl}
                      alt={d.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="text-white text-xs font-serif font-medium leading-tight block truncate">
                        {d.title}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#E0246A] text-white flex items-center justify-center shadow-xs">
                        <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: 5-Finger Live Preview */}
          <div className="bg-white/90 backdrop-blur-xs rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#E0246A]" />
                Live 5-Finger Manicure Designs
              </span>
              <span className="text-xs font-serif font-medium text-stone-800">
                {activeSet.title}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 sm:gap-4 bg-[#FDF2F8]/40 p-3 sm:p-4 rounded-2xl border border-[#FCE7F3]">
              {FINGER_KEYS.map((fk) => (
                <div
                  key={fk}
                  className="flex flex-col items-center justify-between py-1 space-y-1.5"
                >
                  <NailCanvasPreview
                    nail={previewNails[fk]}
                    width={36}
                    height={56}
                    showCuticle={false}
                  />
                  <span className="text-[10px] sm:text-[11px] font-medium text-stone-700 capitalize">
                    {FINGER_LABELS[fk]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Sticky Action Bar */}
        <div className="pt-4 pb-2 border-t border-stone-200/60 flex items-center justify-center gap-3">
          <ShimmerButton
            onClick={handleFinish}
            shimmerColor="#FDF2F8"
            background="#E0246A"
            borderRadius="9999px"
            className="h-12 px-10 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-md shadow-[#E0246A]/20 cursor-pointer active:scale-[0.98]"
          >
            <span>Enter Studio & Try On</span>
            <ArrowRight className="w-4 h-4 text-white" strokeWidth={2} />
          </ShimmerButton>
        </div>
      </div>
    </div>
  );
}
