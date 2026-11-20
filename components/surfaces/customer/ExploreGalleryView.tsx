'use client';

import React, { useState } from 'react';
import {
  Heart,
  Search,
  Camera,
  X,
  Hand,
  SlidersHorizontal,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react';
import { ExploreDesignSet, NailShape } from '@/types/nail';
import { toggleSetFavorite } from '@/lib/services/favorites';
import { getCurrentUser } from '@/lib/services/auth';

// Pinterest Category Filter Tag with Real Thumbnail Photos
interface FilterTag {
  id: string;
  label: string;
  thumbnailUrl?: string;
  colorHex?: string;
  queryMatch: string;
}

const PINTEREST_FILTER_TAGS: FilterTag[] = [
  {
    id: 'less-ai',
    label: 'Less AI',
    queryMatch: '',
  },
  {
    id: 'short',
    label: 'Short',
    thumbnailUrl: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=120&q=80',
    queryMatch: 'short',
  },
  {
    id: 'simple',
    label: 'Simple',
    thumbnailUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=120&q=80',
    queryMatch: 'simple',
  },
  {
    id: 'easy',
    label: 'Easy',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=120&q=80',
    queryMatch: 'easy',
  },
  {
    id: 'cat-eye',
    label: 'Cat eye',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=120&q=80',
    queryMatch: 'cat eye',
  },
  {
    id: 'ideas',
    label: 'Ideas',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=120&q=80',
    queryMatch: 'ideas',
  },
  {
    id: 'red',
    label: 'Red',
    colorHex: '#801A35',
    thumbnailUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=120&q=80',
    queryMatch: 'red',
  },
  {
    id: 'cute',
    label: 'Cute',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=120&q=80',
    queryMatch: 'cute',
  },
  {
    id: 'pink',
    label: 'Pink',
    colorHex: '#FCE7F3',
    thumbnailUrl: '/assets/pink_heart_tryon_result.jpg',
    queryMatch: 'pink',
  },
  {
    id: 'black',
    label: 'Black',
    colorHex: '#18181B',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583001809873-a128495da465?w=120&q=80',
    queryMatch: 'black',
  },
  {
    id: 'chrome',
    label: 'Chrome',
    thumbnailUrl: '/assets/milky_gold_tryon_result.jpg',
    queryMatch: 'chrome',
  },
  {
    id: 'brown',
    label: 'Brown',
    colorHex: '#4A2E18',
    thumbnailUrl: '/assets/burgundy_gold_virtual_tryon.jpg',
    queryMatch: 'brown',
  },
  {
    id: 'short-square',
    label: 'Short square',
    thumbnailUrl: '/assets/editorial_nail_hero.jpg',
    queryMatch: 'square',
  },
  {
    id: 'gel',
    label: 'Gel',
    thumbnailUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=120&q=80',
    queryMatch: 'gel',
  },
];

// Rich, 100% Unique Authentic Pinterest Nail Pins
interface ManicurePin {
  id: string;
  title: string;
  photoUrl: string;
  aspectClass: string;
  tags: string[];
  shape: NailShape;
}

const PINTEREST_MANICURE_PINS: ManicurePin[] = [
  {
    id: 'pin-french-bow',
    title: 'French Tip Nails Forever 🤍✨ with Coquette Ribbons',
    photoUrl: '/assets/pink_heart_tryon_result.jpg',
    aspectClass: 'aspect-[3/4.3]',
    tags: ['french', 'coquette', 'pink', 'simple', 'cute', 'ideas'],
    shape: 'almond',
  },
  {
    id: 'pin-cherry-mocha',
    title: 'Cherry Mocha French Nails ☕ Deep Glossy Tips',
    photoUrl: '/assets/burgundy_gold_virtual_tryon.jpg',
    aspectClass: 'aspect-[3/4.7]',
    tags: ['french', 'red', 'brown', 'gel', 'ideas'],
    shape: 'coffin',
  },
  {
    id: 'pin-milky-glazed',
    title: 'Milky Glazed Gold Donut Chrome Finish',
    photoUrl: '/assets/milky_gold_tryon_result.jpg',
    aspectClass: 'aspect-[3/4.1]',
    tags: ['chrome', 'simple', 'short', 'gel'],
    shape: 'almond',
  },
  {
    id: 'pin-nude-clean',
    title: 'Simple Yet Beautiful Clean Girl Nude Manicure',
    photoUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=700&q=80',
    aspectClass: 'aspect-[3/4]',
    tags: ['simple', 'short', 'easy', 'gel'],
    shape: 'almond',
  },
  {
    id: 'pin-burgundy-marble',
    title: 'Burgundy Marble Nails with 24K Gold Leaf Details',
    photoUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=700&q=80',
    aspectClass: 'aspect-[3/4.5]',
    tags: ['red', 'brown', 'chrome', 'ideas'],
    shape: 'almond',
  },
  {
    id: 'pin-pink-aura',
    title: 'Rose Quartz & Pearl Glaze with Micro Bows 🎀',
    photoUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=700&q=80',
    aspectClass: 'aspect-[3/4.2]',
    tags: ['pink', 'cute', 'chrome', 'coquette'],
    shape: 'almond',
  },
  {
    id: 'pin-classic-french',
    title: 'Classic Almond French Smile Curve on Sheer Pink',
    photoUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=700&q=80',
    aspectClass: 'aspect-[3/4.4]',
    tags: ['french', 'simple', 'easy', 'gel'],
    shape: 'almond',
  },
  {
    id: 'pin-short-minimal',
    title: 'Clean Minimalist Sheer Lacquer with High Gloss',
    photoUrl: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=700&q=80',
    aspectClass: 'aspect-[3/3.9]',
    tags: ['short', 'simple', 'easy', 'square'],
    shape: 'square',
  },
  {
    id: 'pin-cat-eye-shimmer',
    title: 'Velvet Cat Eye Magnetic Gel Polish with Halo Effect',
    photoUrl: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=700&q=80',
    aspectClass: 'aspect-[3/4.6]',
    tags: ['cat eye', 'chrome', 'gel', 'ideas'],
    shape: 'almond',
  },
  {
    id: 'pin-black-coquette',
    title: 'Black Velvet French with Chrome Butterfly Art 🖤',
    photoUrl: 'https://images.unsplash.com/photo-1583001809873-a128495da465?w=700&q=80',
    aspectClass: 'aspect-[3/4.4]',
    tags: ['black', 'coquette', 'french', 'ideas'],
    shape: 'coffin',
  },
  {
    id: 'pin-red-valentine',
    title: "30 Red Valentine's Day Negative Space Heart Nails 💌",
    photoUrl: '/assets/pink_heart_tryon_result.jpg',
    aspectClass: 'aspect-[3/4.3]',
    tags: ['red', 'pink', 'cute', 'coquette'],
    shape: 'almond',
  },
  {
    id: 'pin-bordeaux-dots',
    title: 'Burgundy French with Micro Polka Dot Accent',
    photoUrl: '/assets/burgundy_gold_virtual_tryon.jpg',
    aspectClass: 'aspect-[3/4.5]',
    tags: ['red', 'french', 'brown', 'ideas'],
    shape: 'almond',
  },
  {
    id: 'pin-french-clean',
    title: 'Clean Aesthetic French Tips on Long Almond',
    photoUrl: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=700&q=80',
    aspectClass: 'aspect-[3/4.2]',
    tags: ['french', 'simple', 'gel'],
    shape: 'almond',
  },
  {
    id: 'pin-mauve-nude',
    title: 'Dusty Rose Petals on Sheer Mauve Almond',
    photoUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=700&q=80',
    aspectClass: 'aspect-[3/4.4]',
    tags: ['pink', 'simple', 'cute'],
    shape: 'almond',
  },
  {
    id: 'pin-champagne-dust',
    title: 'Champagne Gold Fine Shimmer Gel Manicure ✨',
    photoUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=700&q=80',
    aspectClass: 'aspect-[3/4.1]',
    tags: ['chrome', 'cat eye', 'gel'],
    shape: 'almond',
  },
  {
    id: 'pin-atelier-hero',
    title: 'Atelier Nude Minimal Square Daily Silhouette',
    photoUrl: '/assets/editorial_nail_hero.jpg',
    aspectClass: 'aspect-[3/4]',
    tags: ['short', 'simple', 'square', 'easy'],
    shape: 'square',
  },
  {
    id: 'pin-coffin-ribbon',
    title: 'Coffin Dusty Rose with 3D Miniature Bows',
    photoUrl: '/assets/pink_heart_tryon_result.jpg',
    aspectClass: 'aspect-[3/4.6]',
    tags: ['pink', 'coquette', 'cute', 'ideas'],
    shape: 'coffin',
  },
  {
    id: 'pin-espresso-swirl',
    title: 'Smoked Espresso Chrome Swirl Line Art ☕',
    photoUrl: '/assets/burgundy_gold_virtual_tryon.jpg',
    aspectClass: 'aspect-[3/4.5]',
    tags: ['brown', 'black', 'ideas', 'gel'],
    shape: 'almond',
  },
  {
    id: 'pin-pearl-donut',
    title: 'Glazed Donut Pearl Tips with Dewdrop Texture',
    photoUrl: '/assets/milky_gold_tryon_result.jpg',
    aspectClass: 'aspect-[3/4.2]',
    tags: ['chrome', 'simple', 'french'],
    shape: 'almond',
  },
  {
    id: 'pin-red-velvet',
    title: 'Deep Wine Bordeaux Velvet Stiletto Finish',
    photoUrl: '/assets/burgundy_gold_virtual_tryon.jpg',
    aspectClass: 'aspect-[3/4.8]',
    tags: ['red', 'cat eye', 'gel'],
    shape: 'almond',
  },
  {
    id: 'pin-nude-french-clean',
    title: 'Micro French Smile Line on Short Natural Nails',
    photoUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=700&q=80',
    aspectClass: 'aspect-[3/4.1]',
    tags: ['short', 'french', 'simple', 'easy'],
    shape: 'almond',
  },
];

export function ExploreGalleryView({
  exploreSearch,
  setExploreSearch,
  onUploadClick,
  onSelectDesign,
  onTryOnClick,
}: {
  exploreDesigns?: ExploreDesignSet[];
  setExploreDesigns?: React.Dispatch<React.SetStateAction<ExploreDesignSet[]>>;
  exploreCategory?: string;
  setExploreCategory?: (category: string) => void;
  exploreSearch: string;
  setExploreSearch: (search: string) => void;
  mobilePreview?: boolean;
  onUploadClick: () => void;
  onSelectDesign: (id: string) => void;
  onTryOnClick?: (designId?: string) => void;
}) {
  const [activeFilterId, setActiveFilterId] = useState<string>('less-ai');
  const [savedPins, setSavedPins] = useState<Record<string, boolean>>({});

  // Filter Pins based on search input and active visual tag
  const filteredPins = PINTEREST_MANICURE_PINS.filter((pin) => {
    // Tag filter
    if (activeFilterId && activeFilterId !== 'less-ai') {
      const tagObj = PINTEREST_FILTER_TAGS.find((t) => t.id === activeFilterId);
      if (tagObj && tagObj.queryMatch) {
        const matchesTag = pin.tags.some((t) => t.includes(tagObj.queryMatch));
        if (!matchesTag) return false;
      }
    }

    // Text search query
    const query = exploreSearch.trim().toLowerCase();
    if (query) {
      const matchTitle = pin.title.toLowerCase().includes(query);
      const matchTag = pin.tags.some((t) => t.includes(query));
      if (!matchTitle && !matchTag) return false;
    }

    return true;
  });

  const handleToggleSave = async (e: React.MouseEvent, pinId: string) => {
    e.stopPropagation();
    const nextSaved = !savedPins[pinId];
    setSavedPins((prev) => ({
      ...prev,
      [pinId]: nextSaved,
    }));

    try {
      const user = await getCurrentUser();
      if (user?.id) {
        await toggleSetFavorite(user.id, pinId, nextSaved);
      }
    } catch {
      // Local state is preserved
    }
  };

  const handleLaunchTryOn = (pin: ManicurePin) => {
    onSelectDesign(pin.id);
    if (onTryOnClick) {
      onTryOnClick(pin.id);
    }
  };

  return (
    <div className="w-full space-y-3 pb-16">
      {/* 1. Exactly Pinterest: 100% Full-Width Top Header */}
      <div className="sticky top-0 z-30 bg-white pt-2.5 pb-2 px-3 sm:px-6 w-full border-b border-stone-200/50 shadow-2xs">
        {/* Full-width Search Bar Row */}
        <div className="w-full flex items-center gap-3">
          {/* Main Pinterest Gray Search Bar */}
          <div className="flex-1 h-12 bg-[#E9E9E9] hover:bg-[#E1E1E1] focus-within:bg-white focus-within:ring-2 focus-within:ring-stone-400 rounded-full px-4 flex items-center gap-2.5 transition-all">
            {/* Search Icon */}
            <Search className="w-5 h-5 text-stone-500 shrink-0" strokeWidth={2} />

            {/* Input Field */}
            <input
              type="text"
              value={exploreSearch}
              onChange={(e) => setExploreSearch(e.target.value)}
              placeholder="nails design"
              className="w-full bg-transparent text-sm text-stone-900 placeholder:text-stone-500 focus:outline-none"
            />

            {/* Clear Button */}
            {exploreSearch && (
              <button
                type="button"
                onClick={() => setExploreSearch('')}
                className="w-6 h-6 rounded-full hover:bg-stone-300/60 flex items-center justify-center text-stone-500 shrink-0 transition cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Pinterest Camera / Visual Search Lens Button */}
            <button
              type="button"
              onClick={onUploadClick}
              className="p-1.5 rounded-full hover:bg-stone-300/60 text-stone-700 hover:text-[#E0246A] transition cursor-pointer shrink-0"
              title="Visual search / Upload photo"
            >
              <Camera className="w-5 h-5" strokeWidth={1.8} />
            </button>
          </div>

          {/* Pinterest 'All Pins ▾' Dropdown */}
          <div className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-full hover:bg-stone-100 text-xs font-semibold text-stone-800 transition cursor-pointer shrink-0 select-none">
            <span>All Pins</span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
          </div>

          {/* Pinterest User Avatar 'M' on far right */}
          <div
            onClick={() => onTryOnClick?.()}
            className="w-8.5 h-8.5 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer select-none transition"
            title="Profile"
          >
            M
          </div>
        </div>

        {/* 2. Exactly Pinterest: Horizontal Scrolling Visual Categories with Real Thumbnails */}
        <div className="w-full flex items-center gap-2 overflow-x-auto pt-2.5 pb-1 scrollbar-none select-none">
          {/* Far-left Filter Sliders Button */}
          <button
            type="button"
            onClick={() => setActiveFilterId('less-ai')}
            className="flex items-center justify-center w-8.5 h-8.5 rounded-xl bg-[#E9E9E9] hover:bg-[#DFDFDF] text-stone-800 shrink-0 transition"
            title="Filter options"
          >
            <SlidersHorizontal className="w-4 h-4" strokeWidth={1.75} />
          </button>

          {/* Real Photo Thumbnail Pills */}
          {PINTEREST_FILTER_TAGS.map((tag) => {
            const isActive = activeFilterId === tag.id;

            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => {
                  setActiveFilterId(tag.id);
                  if (tag.id === 'less-ai') {
                    setExploreSearch('');
                  }
                }}
                className={`h-9 px-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0 border border-transparent ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-[#E9E9E9] hover:bg-[#DFDFDF] text-stone-850'
                }`}
              >
                {/* Real Mini Thumbnail Photo or Color Swatch */}
                {tag.thumbnailUrl ? (
                  <img
                    src={tag.thumbnailUrl}
                    alt=""
                    className="w-5.5 h-5.5 rounded-md object-cover shrink-0"
                  />
                ) : tag.colorHex ? (
                  <span
                    className="w-5.5 h-5.5 rounded-md shrink-0 border border-black/10"
                    style={{ backgroundColor: tag.colorHex }}
                  />
                ) : null}
                <span>{tag.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Exactly Pinterest: Full-Width 7-Column Masonry Waterfall Grid */}
      <div className="w-full px-3 sm:px-6">
        {filteredPins.length === 0 ? (
          <div className="py-20 px-6 max-w-md mx-auto text-center space-y-4 bg-white rounded-3xl border border-stone-200/80 shadow-2xs mt-8">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-700 mx-auto flex items-center justify-center">
              <Search className="w-5 h-5 text-stone-500" strokeWidth={1.75} />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-medium text-stone-900">
                No pins found
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                We couldn&apos;t find any nail designs matching &ldquo;{exploreSearch}&rdquo;. Try another aesthetic or shape.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setExploreSearch('');
                setActiveFilterId('less-ai');
              }}
              className="h-9 px-4 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition active:scale-95 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 2xl:columns-7 gap-3.5 sm:gap-4 space-y-3.5 sm:space-y-4">
            {filteredPins.map((pin) => {
              const isSaved = Boolean(savedPins[pin.id]);

              return (
                <div
                  key={pin.id}
                  className="break-inside-avoid group cursor-pointer select-none mb-3.5 sm:mb-4"
                  onClick={() => handleLaunchTryOn(pin)}
                >
                  {/* Photo Pin Container */}
                  <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-100 shadow-2xs hover:shadow-lg transition-all duration-300">
                    <img
                      src={pin.photoUrl}
                      alt={pin.title}
                      loading="lazy"
                      className={`w-full object-cover group-hover:scale-102 transition-transform duration-300 ${pin.aspectClass}`}
                    />

                    {/* Dark gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3" />

                    {/* Top Right: Pinterest-Style Red/Pink Save Button */}
                    <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      <button
                        type="button"
                        onClick={(e) => handleToggleSave(e, pin.id)}
                        className={`h-8 px-3.5 rounded-full text-xs font-bold shadow-md transition-all flex items-center gap-1 active:scale-90 cursor-pointer ${
                          isSaved
                            ? 'bg-stone-900 text-white'
                            : 'bg-[#E0246A] hover:bg-[#BE185D] text-white'
                        }`}
                        title={isSaved ? 'Saved to collection' : 'Save Pin'}
                      >
                        <Heart
                          className="w-3.5 h-3.5"
                          fill={isSaved ? 'white' : 'currentColor'}
                        />
                        <span>{isSaved ? 'Saved' : 'Save'}</span>
                      </button>
                    </div>

                    {/* Bottom Center: Instant 1-Tap "Try On" Button */}
                    <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-10 flex justify-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaunchTryOn(pin);
                        }}
                        className="w-full h-9 rounded-full bg-white/95 hover:bg-white text-stone-900 text-xs font-bold shadow-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer backdrop-blur-xs"
                      >
                        <Hand className="w-3.5 h-3.5 text-[#E0246A]" strokeWidth={2} />
                        <span>Try On in Atelier</span>
                      </button>
                    </div>
                  </div>

                  {/* Below Image: Pinterest-Style Title & Meta */}
                  <div className="pt-1.5 px-1 flex items-start justify-between gap-1.5">
                    <p className="text-[12px] font-medium text-stone-850 line-clamp-2 leading-snug group-hover:text-stone-950">
                      {pin.title}
                    </p>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition shrink-0 cursor-pointer"
                      title="More options"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
