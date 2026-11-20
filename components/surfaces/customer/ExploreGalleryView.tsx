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
  Sparkles,
  MoreHorizontal,
} from 'lucide-react';
import { ExploreDesignSet, Finger, NailDesign, NailShape } from '@/types/nail';
import { toggleSetFavorite } from '@/lib/services/favorites';
import { getCurrentUser } from '@/lib/services/auth';

// Pinterest Visual Filter Chips with Mini Icons / Color Swatches
interface FilterTag {
  id: string;
  label: string;
  icon?: string;
  colorHex?: string;
  queryMatch: string;
}

const PINTEREST_FILTER_TAGS: FilterTag[] = [
  { id: 'all', label: 'All Styles', queryMatch: '' },
  { id: 'short', label: 'Short', icon: '💅', queryMatch: 'short' },
  { id: 'simple', label: 'Simple', icon: '✨', queryMatch: 'simple' },
  { id: 'french', label: 'French', icon: '🤍', queryMatch: 'french' },
  { id: 'cat-eye', label: 'Cat Eye', icon: '💎', queryMatch: 'cat eye' },
  { id: 'coquette', label: 'Coquette', icon: '🎀', queryMatch: 'coquette' },
  { id: 'red', label: 'Red Wine', colorHex: '#801A35', queryMatch: 'red' },
  { id: 'pink', label: 'Pink Blush', colorHex: '#FCE7F3', queryMatch: 'pink' },
  { id: 'cherry-mocha', label: 'Cherry Mocha', colorHex: '#3B111D', queryMatch: 'mocha' },
  { id: 'black', label: 'Black Minimal', colorHex: '#18181B', queryMatch: 'black' },
  { id: 'chrome', label: 'Chrome Glaze', colorHex: '#E5C697', queryMatch: 'chrome' },
  { id: 'brown', label: 'Espresso', colorHex: '#4A2E18', queryMatch: 'espresso' },
  { id: 'almond', label: 'Almond', icon: '💅', queryMatch: 'almond' },
  { id: 'coffin', label: 'Coffin', icon: '💅', queryMatch: 'coffin' },
];

// Rich, Authentic Pinterest Manicure Pins
interface ManicurePin {
  id: string;
  title: string;
  photoUrl: string;
  aspectClass: string; // for natural masonry height variation
  tags: string[];
  baseColor: string;
  accentColor: string;
  shape: NailShape;
  pattern: string;
  likes: number;
}

const PINTEREST_MANICURE_PINS: ManicurePin[] = [
  {
    id: 'pin-french-bow',
    title: 'French Tip Nails Forever 🤍✨ with Coquette Ribbons',
    photoUrl: '/assets/pink_heart_tryon_result.jpg',
    aspectClass: 'aspect-[3/4.2]',
    tags: ['french', 'coquette', 'pink', 'simple', 'almond'],
    baseColor: '#FCE7F3',
    accentColor: '#E0246A',
    shape: 'almond',
    pattern: 'heart-french',
    likes: 2450,
  },
  {
    id: 'pin-burgundy-marble',
    title: 'Burgundy Marble Nails with 24K Gold Leaf Details',
    photoUrl: '/assets/burgundy_gold_virtual_tryon.jpg',
    aspectClass: 'aspect-[3/4.6]',
    tags: ['red', 'mocha', 'chrome', 'almond'],
    baseColor: '#FAF0EA',
    accentColor: '#801A35',
    shape: 'almond',
    pattern: 'aura',
    likes: 3120,
  },
  {
    id: 'pin-milky-glazed',
    title: 'Milky Glazed Gold Donut Chrome Finish',
    photoUrl: '/assets/milky_gold_tryon_result.jpg',
    aspectClass: 'aspect-[3/4]',
    tags: ['chrome', 'simple', 'short', 'almond'],
    baseColor: '#F5ECE3',
    accentColor: '#D4AF37',
    shape: 'almond',
    pattern: 'aura',
    likes: 1890,
  },
  {
    id: 'pin-cherry-mocha',
    title: 'Cherry Mocha French Nails ☕ Deep Glossy Tips',
    photoUrl: '/assets/burgundy_gold_virtual_tryon.jpg',
    aspectClass: 'aspect-[3/4.8]',
    tags: ['french', 'red', 'mocha', 'coffin'],
    baseColor: '#FAF0EA',
    accentColor: '#3B111D',
    shape: 'coffin',
    pattern: 'classic-french',
    likes: 4210,
  },
  {
    id: 'pin-atelier-nude',
    title: 'Simple Yet Beautiful Clean Girl Nude Manicure',
    photoUrl: '/assets/editorial_nail_hero.jpg',
    aspectClass: 'aspect-[3/4.1]',
    tags: ['simple', 'short', 'almond', 'black'],
    baseColor: '#FAF0EA',
    accentColor: '#FFFFFF',
    shape: 'almond',
    pattern: 'solid',
    likes: 1540,
  },
  {
    id: 'pin-rose-quartz',
    title: 'Rose Quartz & Pearl Glaze with Micro Bows 🎀',
    photoUrl: '/assets/pink_heart_tryon_result.jpg',
    aspectClass: 'aspect-[3/4.4]',
    tags: ['pink', 'coquette', 'chrome', 'almond'],
    baseColor: '#FCE7F3',
    accentColor: '#E0246A',
    shape: 'almond',
    pattern: 'aura',
    likes: 2780,
  },
  {
    id: 'pin-bordeaux-stiletto',
    title: 'Deep Bordeaux Velvet Gloss with Gold Micro Line',
    photoUrl: '/assets/burgundy_gold_virtual_tryon.jpg',
    aspectClass: 'aspect-[3/4.5]',
    tags: ['red', 'cat eye', 'mocha', 'almond'],
    baseColor: '#3B111D',
    accentColor: '#D4AF37',
    shape: 'almond',
    pattern: 'minimal-line',
    likes: 3670,
  },
  {
    id: 'pin-french-micro',
    title: 'Clean Girl Micro French on Natural Nail Bed',
    photoUrl: '/assets/editorial_nail_hero.jpg',
    aspectClass: 'aspect-[3/3.9]',
    tags: ['french', 'simple', 'short', 'short square'],
    baseColor: '#FAF0EA',
    accentColor: '#FFFFFF',
    shape: 'square',
    pattern: 'classic-french',
    likes: 1980,
  },
  {
    id: 'pin-glazed-pearl-tips',
    title: 'Glazed Pearl Chrome French Tips on Sheer Pink',
    photoUrl: '/assets/milky_gold_tryon_result.jpg',
    aspectClass: 'aspect-[3/4.3]',
    tags: ['french', 'chrome', 'pink', 'almond'],
    baseColor: '#FCE7F3',
    accentColor: '#FAF0EA',
    shape: 'almond',
    pattern: 'classic-french',
    likes: 2840,
  },
  {
    id: 'pin-black-coquette',
    title: 'Black Velvet French with Chrome Butterfly Art 🖤',
    photoUrl: '/assets/editorial_nail_hero.jpg',
    aspectClass: 'aspect-[3/4.7]',
    tags: ['black', 'coquette', 'french', 'coffin'],
    baseColor: '#FAF0EA',
    accentColor: '#18181B',
    shape: 'coffin',
    pattern: 'minimal-line',
    likes: 3890,
  },
  {
    id: 'pin-red-heart-minimal',
    title: '30 Red Valentine Negative Space Heart Nails 💌',
    photoUrl: '/assets/pink_heart_tryon_result.jpg',
    aspectClass: 'aspect-[3/4.2]',
    tags: ['red', 'pink', 'coquette', 'almond'],
    baseColor: '#FCE7F3',
    accentColor: '#E0246A',
    shape: 'almond',
    pattern: 'heart-french',
    likes: 5120,
  },
  {
    id: 'pin-burgundy-polka',
    title: 'Burgundy French with Micro Polka Dot Accent',
    photoUrl: '/assets/burgundy_gold_virtual_tryon.jpg',
    aspectClass: 'aspect-[3/4.4]',
    tags: ['red', 'french', 'mocha', 'almond'],
    baseColor: '#FAF0EA',
    accentColor: '#801A35',
    shape: 'almond',
    pattern: 'classic-french',
    likes: 2150,
  },
  {
    id: 'pin-champagne-dust',
    title: 'Champagne Dust Fine Shimmer Gel Manicure',
    photoUrl: '/assets/milky_gold_tryon_result.jpg',
    aspectClass: 'aspect-[3/4.1]',
    tags: ['chrome', 'cat eye', 'simple', 'almond'],
    baseColor: '#FAF0EA',
    accentColor: '#E5C697',
    shape: 'almond',
    pattern: 'aura',
    likes: 1720,
  },
  {
    id: 'pin-coffin-ribbon',
    title: 'Coffin Dusty Rose with 3D Miniature Bows',
    photoUrl: '/assets/pink_heart_tryon_result.jpg',
    aspectClass: 'aspect-[3/4.6]',
    tags: ['coquette', 'pink', 'coffin'],
    baseColor: '#FCE7F3',
    accentColor: '#E0246A',
    shape: 'coffin',
    pattern: 'heart-french',
    likes: 3410,
  },
  {
    id: 'pin-espresso-swirl',
    title: 'Smoked Espresso Chrome Swirl Line Art',
    photoUrl: '/assets/editorial_nail_hero.jpg',
    aspectClass: 'aspect-[3/4.3]',
    tags: ['espresso', 'brown', 'black', 'almond'],
    baseColor: '#FAF0EA',
    accentColor: '#2A1B1F',
    shape: 'almond',
    pattern: 'minimal-line',
    likes: 2290,
  },
  {
    id: 'pin-glazed-coffin',
    title: 'High-Gloss Glazed Donut Coffin Shape Manicure',
    photoUrl: '/assets/milky_gold_tryon_result.jpg',
    aspectClass: 'aspect-[3/4.5]',
    tags: ['chrome', 'coffin', 'simple'],
    baseColor: '#F5ECE3',
    accentColor: '#FAF0EA',
    shape: 'coffin',
    pattern: 'aura',
    likes: 2980,
  },
];

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
  const [activeFilterId, setActiveFilterId] = useState<string>('all');
  const [savedPins, setSavedPins] = useState<Record<string, boolean>>({});

  // Filter Pins based on search input and active visual tag
  const filteredPins = PINTEREST_MANICURE_PINS.filter((pin) => {
    // Tag filter
    if (activeFilterId !== 'all') {
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
    // If it exists in exploreDesigns, select that ID; otherwise pass fallback
    onSelectDesign(pin.id);
    if (onTryOnClick) {
      onTryOnClick(pin.id);
    }
  };

  return (
    <div className="w-full space-y-4 pb-16">
      {/* 1. Pinterest-Style Top Search & Visual Action Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md pt-2 pb-3 px-2 sm:px-4 border-b border-stone-200/60 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          {/* Main Pinterest Rounded Search Bar */}
          <div className="flex-1 relative flex items-center bg-[#EFEFEF] hover:bg-[#E7E7E7] focus-within:bg-white focus-within:ring-2 focus-within:ring-stone-300 rounded-full h-11 sm:h-12 px-4 transition-all border border-transparent focus-within:border-stone-300 shadow-2xs">
            {/* Search Icon */}
            <Search className="w-4.5 h-4.5 text-stone-500 shrink-0 mr-2.5" strokeWidth={2} />

            {/* Input Field */}
            <input
              type="text"
              value={exploreSearch}
              onChange={(e) => setExploreSearch(e.target.value)}
              placeholder="Search for nail designs, aesthetics, shapes..."
              className="w-full bg-transparent text-xs sm:text-sm text-stone-900 placeholder:text-stone-500 focus:outline-none"
            />

            {/* Clear Button */}
            {exploreSearch && (
              <button
                type="button"
                onClick={() => setExploreSearch('')}
                className="w-6 h-6 rounded-full hover:bg-stone-300/60 flex items-center justify-center text-stone-500 shrink-0 mr-2 transition cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            )}

            {/* Pinterest Camera / Visual Search Lens Button */}
            <button
              type="button"
              onClick={onUploadClick}
              className="p-1.5 rounded-full hover:bg-stone-300/60 text-stone-700 hover:text-[#E0246A] transition cursor-pointer shrink-0"
              title="Visual Search / Upload Inspo Photo"
            >
              <Camera className="w-5 h-5" strokeWidth={1.8} />
            </button>
          </div>

          {/* Filter Dropdown Pill (Pinterest 'All Pins' dropdown) */}
          <div className="hidden sm:flex items-center gap-1 px-3.5 h-11 rounded-full bg-stone-100 hover:bg-stone-200/80 border border-stone-200/70 text-xs font-semibold text-stone-800 transition cursor-pointer shrink-0 select-none">
            <span>All Pins</span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
          </div>

          {/* Direct Upload Button (Brand rose) */}
          <button
            type="button"
            onClick={onUploadClick}
            className="h-11 px-4 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden md:inline">Upload Inspo</span>
          </button>
        </div>

        {/* 2. Pinterest Visual Filter Tag Carousel */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto pt-2.5 pb-1 scrollbar-none select-none">
          {/* Sliders filter button */}
          <div className="flex items-center justify-center w-8.5 h-8.5 rounded-full bg-stone-100 border border-stone-200/80 text-stone-700 shrink-0 shadow-2xs">
            <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.8} />
          </div>

          {PINTEREST_FILTER_TAGS.map((tag) => {
            const isActive = activeFilterId === tag.id;
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => {
                  setActiveFilterId(tag.id);
                  if (tag.id === 'all') {
                    setExploreSearch('');
                  }
                }}
                className={`h-8.5 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0 border ${
                  isActive
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-stone-100 text-stone-800 border-stone-200/70 hover:bg-stone-200/80'
                }`}
              >
                {/* Optional mini color dot or emoji icon */}
                {tag.colorHex && (
                  <span
                    className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: tag.colorHex }}
                  />
                )}
                {tag.icon && <span className="text-[11px] leading-none">{tag.icon}</span>}
                <span>{tag.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Pinterest Masonry Waterfall Feed */}
      <div className="px-2 sm:px-4 max-w-[1600px] mx-auto">
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
                setActiveFilterId('all');
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

                    {/* Top Right: Pinterest-Style Save Button */}
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
