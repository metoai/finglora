'use client';

import React from 'react';
import { Heart, Search, Upload, ArrowRight, Hand } from 'lucide-react';
import { ExploreDesignSet } from '@/types/nail';
import { InspirationPhotoCard } from '@/components/visuals/InspirationPhotoCard';

export function ExploreGalleryView({
  exploreDesigns,
  setExploreDesigns,
  exploreCategory,
  setExploreCategory,
  exploreSearch,
  setExploreSearch,
  mobilePreview,
  onUploadClick,
  onSelectDesign,
  onTryOnClick,
}: {
  exploreDesigns: ExploreDesignSet[];
  setExploreDesigns: React.Dispatch<React.SetStateAction<ExploreDesignSet[]>>;
  exploreCategory: string;
  setExploreCategory: (category: string) => void;
  exploreSearch: string;
  setExploreSearch: (search: string) => void;
  mobilePreview: boolean;
  onUploadClick: () => void;
  onSelectDesign: (id: string) => void;
  onTryOnClick?: () => void;
}) {
  const filteredDesigns = exploreDesigns.filter((d) => {
    const catOk = exploreCategory === 'All' || d.category === exploreCategory;
    const q = exploreSearch.trim().toLowerCase();
    const searchOk =
      !q || d.title.toLowerCase().includes(q) || d.subtitle.toLowerCase().includes(q);
    return catOk && searchOk;
  });

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900 tracking-tight">
          Explore Designs
        </h1>

        <button
          type="button"
          onClick={onUploadClick}
          className="h-9 px-3.5 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
        >
          <Upload className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span>Upload Photo</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
          <input
            type="text"
            value={exploreSearch}
            onChange={(e) => setExploreSearch(e.target.value)}
            placeholder="Search designs by style or color..."
            className="w-full pl-9 pr-4 h-9 sm:h-10 rounded-xl bg-white border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#E0246A] focus:ring-2 focus:ring-[#E0246A]/15 transition-all shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['All', 'Floral', 'Chrome', 'French', 'Minimal', 'Bold'].map((cat) => {
            const isActive = exploreCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setExploreCategory(cat)}
                className={`h-7 sm:h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-[#E0246A] text-white shadow-xs font-semibold'
                    : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80 hover:bg-stone-50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pinterest-Style Lookbook Grid: 2 columns on mobile, 3 on tablet, 4 on desktop */}
      <div className={`grid grid-cols-2 ${mobilePreview ? '' : 'sm:grid-cols-3 lg:grid-cols-4'} gap-3 sm:gap-4.5`}>
        {filteredDesigns.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              onSelectDesign(item.id);
            }}
            className="group relative flex flex-col cursor-pointer"
          >
            {/* Pinterest Card Image Container */}
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-stone-100 shadow-2xs border border-stone-200/70">
              <img
                src={item.photoUrl}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />

              {/* Gentle non-intrusive gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

              {/* Category Pill at Top Left */}
              <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs z-10">
                {item.category}
              </span>

              {/* Subtle Heart Save Button at Top Right */}
              <button
                type="button"
                title="Save design"
                onClick={(e) => {
                  e.stopPropagation();
                  setExploreDesigns((prev) =>
                    prev.map((x) => (x.id === item.id ? { ...x, isSaved: !x.isSaved } : x))
                  );
                }}
                className={`absolute top-2 right-2 w-7 h-7 rounded-full bg-white/85 hover:bg-white backdrop-blur-md flex items-center justify-center shadow-2xs transition-all z-10 cursor-pointer ${
                  item.isSaved
                    ? 'text-[#E0246A]'
                    : 'text-stone-600 hover:text-stone-900 sm:opacity-0 sm:group-hover:opacity-100'
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${item.isSaved ? 'fill-current' : ''}`}
                  strokeWidth={1.75}
                />
              </button>

              {/* Try On Button matching Favorite and Home */}
              <div className="absolute inset-x-2.5 bottom-2.5 z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDesign(item.id);
                    onTryOnClick?.();
                  }}
                  className="w-full h-8 rounded-xl bg-white/95 hover:bg-white text-[#281720] text-xs font-semibold shadow-md backdrop-blur-sm flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Hand className="w-3.5 h-3.5 text-[#E0246A]" strokeWidth={1.75} />
                  <span>Try On</span>
                </button>
              </div>
            </div>

            {/* Less Text: Single clean title below photo */}
            <div className="pt-1.5 px-0.5">
              <p className="text-xs font-medium text-stone-800 truncate">
                {item.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
