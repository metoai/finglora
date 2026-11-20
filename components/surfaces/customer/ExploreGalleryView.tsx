'use client';

import React from 'react';
import { Heart, Search, Upload, Hand, X } from 'lucide-react';
import { ExploreDesignSet } from '@/types/nail';
import { toggleSetFavorite } from '@/lib/services/favorites';
import { getCurrentUser } from '@/lib/services/auth';

const CATEGORY_TABS = ['All', 'French', 'Glazed', 'Aura', 'Minimal'] as const;

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
  onTryOnClick?: (designId?: string) => void;
}) {
  const filteredDesigns = exploreDesigns.filter((d) => {
    const catOk = exploreCategory === 'All' || d.category === exploreCategory;
    const q = exploreSearch.trim().toLowerCase();
    const searchOk =
      !q ||
      d.title.toLowerCase().includes(q) ||
      (d.subtitle && d.subtitle.toLowerCase().includes(q)) ||
      d.category.toLowerCase().includes(q);
    return catOk && searchOk;
  });

  return (
    <div className="space-y-6 w-full max-w-[1400px] mx-auto pb-12">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-stone-200/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-stone-900 tracking-tight">
              Explore Manicures
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200/60">
              {filteredDesigns.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 font-normal">
            Curated high-fashion manicures ready for instant virtual try-on.
          </p>
        </div>

        <button
          type="button"
          onClick={onUploadClick}
          className="h-9.5 px-4 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <Upload className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span>Upload Inspo Photo</span>
        </button>
      </div>

      {/* Search Bar & Category Filter Pills */}
      <div className="space-y-3.5">
        {/* Sleek container with nested radii (rounded-2xl container, rounded-xl input) */}
        <div className="p-1 rounded-2xl bg-stone-100/80 border border-stone-200/60 shadow-2xs">
          <div className="relative">
            <Search
              className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              strokeWidth={1.75}
            />
            <input
              type="text"
              value={exploreSearch}
              onChange={(e) => setExploreSearch(e.target.value)}
              placeholder="Search manicures by style, color, or shape..."
              className="w-full pl-9.5 pr-9 h-10 rounded-xl bg-white border border-stone-200/60 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400/20 transition-all shadow-2xs"
            />
            {exploreSearch && (
              <button
                type="button"
                onClick={() => setExploreSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills: ['All', 'French', 'Glazed', 'Aura', 'Minimal'] with active black pill */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_TABS.map((cat) => {
            const isActive = exploreCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setExploreCategory(cat)}
                className={`h-8 px-3.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs font-semibold'
                    : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80 hover:bg-stone-50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Discovery Grid or Symmetrical Empty State */}
      {filteredDesigns.length === 0 ? (
        <div className="py-16 px-6 max-w-md mx-auto text-center space-y-4 bg-white/80 rounded-3xl border border-stone-200/80 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-700 mx-auto flex items-center justify-center border border-stone-200/60">
            <Search className="w-5 h-5 text-stone-500" strokeWidth={1.75} />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-medium text-stone-900">
              No Matching Manicures
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
              We couldn&apos;t find any designs matching &ldquo;{exploreSearch}&rdquo; in {exploreCategory === 'All' ? 'our catalog' : exploreCategory}.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            {exploreSearch && (
              <button
                type="button"
                onClick={() => setExploreSearch('')}
                className="h-8.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                Clear Search
              </button>
            )}
            {exploreCategory !== 'All' && (
              <button
                type="button"
                onClick={() => setExploreCategory('All')}
                className="h-8.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition cursor-pointer"
              >
                View All Designs
              </button>
            )}
            <button
              type="button"
              onClick={onUploadClick}
              className="h-8.5 px-4 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              Upload Inspo
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`grid ${
            mobilePreview
              ? 'grid-cols-2 gap-3'
              : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4'
          }`}
        >
          {filteredDesigns.map((item) => {
            const primaryFinger = item.nails?.middle || item.nails?.index;
            const shapeLabel = primaryFinger?.shape || item.category || 'Almond';

            return (
              <div
                key={item.id}
                onClick={() => {
                  onSelectDesign(item.id);
                  onTryOnClick?.(item.id);
                }}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/70 shadow-2xs hover:shadow-md transition-all duration-300 text-left cursor-pointer active:scale-[0.98]"
              >
                {/* 3:4 Portrait Image Container */}
                <img
                  src={item.photoUrl || '/assets/editorial_nail_hero.jpg'}
                  alt={item.title || 'Manicure Design'}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Subtle scrim gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Subtle shape pill on top-left */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/45 text-white text-[10px] font-medium backdrop-blur-xs capitalize tracking-wide">
                    {shapeLabel}
                  </span>
                </div>

                {/* Subtle Heart save button at top-right */}
                <button
                  type="button"
                  title="Save design"
                  onClick={async (e) => {
                    e.stopPropagation();
                    const nextState = !item.isSaved;
                    setExploreDesigns((prev) =>
                      prev.map((x) => (x.id === item.id ? { ...x, isSaved: nextState } : x))
                    );
                    try {
                      const user = await getCurrentUser();
                      if (user?.id) {
                        await toggleSetFavorite(user.id, item.id, nextState);
                      }
                    } catch (err) {
                      console.warn('Favorite sync skipped:', err);
                    }
                  }}
                  className={`absolute top-2.5 right-2.5 w-7.5 h-7.5 rounded-full bg-white/85 hover:bg-white backdrop-blur-md flex items-center justify-center shadow-2xs transition-all z-10 cursor-pointer ${
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

                {/* Clean title with drop-shadow & 1-tap Try On button */}
                <div className="absolute inset-x-2.5 bottom-2.5 space-y-1.5 sm:space-y-2 z-10">
                  <div className="text-white text-xs sm:text-sm font-medium leading-tight truncate drop-shadow-xs">
                    {item.title}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDesign(item.id);
                      onTryOnClick?.(item.id);
                    }}
                    className="w-full h-8.5 rounded-xl bg-white/95 hover:bg-white text-stone-900 font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <Hand className="w-3.5 h-3.5 text-[#E0246A]" strokeWidth={2} />
                    <span>Try On</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
