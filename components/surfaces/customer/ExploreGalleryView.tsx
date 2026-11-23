'use client';

import React, { useState, useMemo } from 'react';
import {
  Heart,
  Search,
  X,
  Hand,
  SlidersHorizontal,
  MoreHorizontal,
  LayoutGrid,
  Scissors,
  Circle,
  Palette,
  Eye,
  Wine,
  Coffee,
  Square,
  Wand2,
  Flame,
  Gem,
  Layers,
  Droplets,
} from 'lucide-react';
import { ExploreDesignSet, NailShape } from '@/types/nail';
import { toggleSetFavorite } from '@/lib/services/favorites';
import { getCurrentUser } from '@/lib/services/auth';
import { sanitizeEditorialPhotoUrl, EDITORIAL_ASSET_PHOTOS } from '@/constants/nail-data';

// Standard Minimal Category Filter Tags with Lucide Icons
interface FilterTag {
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  queryMatch: string;
}

const CATEGORY_TAGS: FilterTag[] = [
  { id: 'all', label: 'All Styles', Icon: LayoutGrid, queryMatch: '' },
  { id: 'glazed', label: 'Glazed & Chrome', Icon: Wand2, queryMatch: 'glazed' },
  { id: 'french', label: 'French Tips', Icon: Palette, queryMatch: 'french' },
  { id: 'coquette', label: 'Coquette & Ribbons', Icon: Heart, queryMatch: 'coquette' },
  { id: 'velvet', label: 'Velvet & Aura', Icon: Wine, queryMatch: 'velvet' },
  { id: 'minimal', label: 'Clean Girl Minimal', Icon: Circle, queryMatch: 'minimal' },
  { id: 'cat-eye', label: 'Cat-Eye & 3D', Icon: Eye, queryMatch: 'cat-eye' },
  { id: 'cherry-mocha', label: 'Cherry Mocha', Icon: Coffee, queryMatch: 'cherry-mocha' },
  { id: 'black-minimal', label: 'Noir & Black', Icon: Square, queryMatch: 'black-minimal' },
  { id: 'short-natural', label: 'Short & Natural', Icon: Scissors, queryMatch: 'short-natural' },
  { id: 'almond-coffin', label: 'Sculpted Extensions', Icon: Gem, queryMatch: 'almond-coffin' },
];

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
    title: 'French Tip Nails Forever with Coquette Ribbons',
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/coquette/coquette_pearl_bow_01.jpg',
    aspectClass: 'aspect-[3/4.3]',
    tags: ['french', 'coquette', 'pink', 'simple', 'cute'],
    shape: 'almond',
  },
  {
    id: 'pin-cherry-mocha',
    title: 'Cherry Mocha French Nails ☕ Deep Glossy Tips',
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/french/french_cherry_wine_04.jpg',
    aspectClass: 'aspect-[3/4.7]',
    tags: ['french', 'red', 'mocha', 'gel'],
    shape: 'coffin',
  },
  {
    id: 'pin-milky-glazed',
    title: 'Milky Glazed Gold Donut Chrome Finish',
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_pearl_almond_01.jpg',
    aspectClass: 'aspect-[3/4.1]',
    tags: ['chrome', 'simple', 'short', 'gel'],
    shape: 'almond',
  },
  {
    id: 'pin-nude-clean',
    title: 'Simple Yet Beautiful Clean Girl Nude Manicure',
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_vanilla_squoval_05.jpg',
    aspectClass: 'aspect-[3/4]',
    tags: ['simple', 'short', 'gel'],
    shape: 'almond',
  },
  {
    id: 'pin-burgundy-marble',
    title: 'Burgundy Marble Nails with 24K Gold Leaf Details',
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_bronze_gold_07.jpg',
    aspectClass: 'aspect-[3/4.5]',
    tags: ['red', 'mocha', 'chrome'],
    shape: 'almond',
  },
  {
    id: 'pin-pink-aura',
    title: 'Rose Quartz & Pearl Glaze with Micro Bows 🎀',
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/coquette/coquette_french_bow_03.jpg',
    aspectClass: 'aspect-[3/4.2]',
    tags: ['pink', 'chrome', 'coquette'],
    shape: 'almond',
  },
  {
    id: 'pin-classic-french',
    title: 'Classic Almond French Smile Curve on Sheer Pink',
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/french/french_micro_almond_01.jpg',
    aspectClass: 'aspect-[3/4.4]',
    tags: ['french', 'simple', 'gel'],
    shape: 'almond',
  },
  {
    id: 'pin-short-minimal',
    title: 'Clean Minimalist Sheer Lacquer with High Gloss',
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_rosegold_square_04.jpg',
    aspectClass: 'aspect-[3/3.9]',
    tags: ['short', 'simple', 'square'],
    shape: 'square',
  },
  {
    id: 'pin-cat-eye-shimmer',
    title: 'Velvet Cat Eye Magnetic Gel Polish with Halo Effect',
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_liquid_silver_03.jpg',
    aspectClass: 'aspect-[3/4.6]',
    tags: ['cat eye', 'chrome', 'gel'],
    shape: 'almond',
  },
  {
    id: 'pin-black-coquette',
    title: 'Black Velvet French with Chrome Butterfly Art 🖤',
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/french/french_noir_classic_03.jpg',
    aspectClass: 'aspect-[3/4.4]',
    tags: ['black', 'coquette', 'french'],
    shape: 'coffin',
  },
  {
    id: 'pin-red-valentine',
    title: "30 Red Valentine's Day Negative Space Heart Nails 💌",
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/french/french_baby_blue_square_07.jpg',
    aspectClass: 'aspect-[3/4.3]',
    tags: ['red', 'pink', 'coquette'],
    shape: 'almond',
  },
  {
    id: 'pin-bordeaux-dots',
    title: 'Burgundy French with Micro Polka Dot Accent',
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/french/french_double_arch_05.jpg',
    aspectClass: 'aspect-[3/4.5]',
    tags: ['red', 'french', 'mocha'],
    shape: 'almond',
  },
  {
    id: 'pin-french-clean',
    title: 'Clean Aesthetic French Tips on Long Almond',
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/french/french_espresso_coffin_06.jpg',
    aspectClass: 'aspect-[3/4.2]',
    tags: ['french', 'simple', 'gel'],
    shape: 'almond',
  },
  {
    id: 'pin-mauve-nude',
    title: 'Dusty Rose Petals on Sheer Mauve Almond',
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/french/french_sage_almond_08.jpg',
    aspectClass: 'aspect-[3/4.4]',
    tags: ['pink', 'simple'],
    shape: 'almond',
  },
  {
    id: 'pin-champagne-dust',
    title: 'Champagne Gold Fine Shimmer Gel Manicure',
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_lavender_coffin_06.jpg',
    aspectClass: 'aspect-[3/4.1]',
    tags: ['chrome', 'cat eye', 'gel'],
    shape: 'almond',
  },
  {
    id: 'pin-atelier-hero',
    title: 'Atelier Nude Minimal Square Daily Silhouette',
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_chrome_french_08.jpg',
    aspectClass: 'aspect-[3/4]',
    tags: ['short', 'simple', 'square'],
    shape: 'square',
  },
  {
    id: 'pin-coffin-ribbon',
    title: 'Coffin Dusty Rose with 3D Miniature Bows',
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/coquette/coquette_cherry_ribbon_02.jpg',
    aspectClass: 'aspect-[3/4.6]',
    tags: ['pink', 'coquette'],
    shape: 'coffin',
  },
  {
    id: 'pin-espresso-swirl',
    title: 'Smoked Espresso Chrome Swirl Line Art ☕',
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_strawberry_oval_09.jpg',
    aspectClass: 'aspect-[3/4.5]',
    tags: ['espresso', 'black', 'gel'],
    shape: 'almond',
  },
  {
    id: 'pin-pearl-donut',
    title: 'Glazed Donut Pearl Tips with Dewdrop Texture',
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_holo_stiletto_10.jpg',
    aspectClass: 'aspect-[3/4.2]',
    tags: ['chrome', 'simple', 'french'],
    shape: 'almond',
  },
  {
    id: 'pin-red-velvet',
    title: 'Deep Wine Bordeaux Velvet Stiletto Finish',
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/french/french_gold_foil_09.jpg',
    aspectClass: 'aspect-[3/4.8]',
    tags: ['red', 'cat eye', 'gel'],
    shape: 'almond',
  },
  {
    id: 'pin-nude-french-clean',
    title: 'Micro French Smile Line on Short Natural Nails',
    photoUrl: 'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/french/french_v_cut_chevron_10.jpg',
    aspectClass: 'aspect-[3/4.1]',
    tags: ['short', 'french', 'simple'],
    shape: 'almond',
  },
];

export function ExploreGalleryView({
  exploreDesigns = [],
  exploreSearch,
  setExploreSearch,
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
  onUploadClick?: () => void;
  onSelectDesign: (id: string) => void;
  onTryOnClick?: (designId?: string) => void;
}) {
  const [activeFilterId, setActiveFilterId] = useState<string>('all');
  const [savedPins, setSavedPins] = useState<Record<string, boolean>>({});

  // Transform exploreDesigns from Supabase into display pins, fallback to curated pins
  const allPins = useMemo(() => {
    if (exploreDesigns && exploreDesigns.length > 0) {
      return exploreDesigns.map((d, idx) => ({
        id: d.id,
        passportCode: d.passportCode || `FGL-${1000 + idx}`,
        title: d.title,
        photoUrl: sanitizeEditorialPhotoUrl(d.photoUrl, idx),
        aspectClass:
          idx % 5 === 0
            ? 'aspect-[3/4.4]'
            : idx % 3 === 0
            ? 'aspect-[3/4.2]'
            : idx % 2 === 0
            ? 'aspect-[3/4]'
            : 'aspect-[3/4.3]',
        category: (d.category || 'curated').toLowerCase(),
        shape: (d.nails?.middle?.shape || d.nails?.thumb?.shape || 'almond') as NailShape,
      }));
    }

    return PINTEREST_MANICURE_PINS.map((pin, idx) => ({
      id: pin.id,
      passportCode: `FGL-${1000 + idx}`,
      title: pin.title,
      photoUrl: sanitizeEditorialPhotoUrl(pin.photoUrl, idx),
      aspectClass: pin.aspectClass,
      category: (pin.tags[0] || 'curated').toLowerCase(),
      shape: pin.shape,
    }));
  }, [exploreDesigns]);

  // Filter Pins based on search input and active category
  const filteredPins = useMemo(() => {
    return allPins.filter((pin) => {
      // Category filter
      if (activeFilterId && activeFilterId !== 'all') {
        const pinCat = pin.category.toLowerCase();
        const tagObj = CATEGORY_TAGS.find((t) => t.id === activeFilterId);
        const target = (tagObj?.queryMatch || activeFilterId).toLowerCase();
        const matchesCat = pinCat === target || pinCat.includes(target) || target.includes(pinCat);
        if (!matchesCat) return false;
      }

      // Text search query
      const query = exploreSearch.trim().toLowerCase();
      if (query) {
        const matchTitle = pin.title.toLowerCase().includes(query);
        const matchCat = pin.category.toLowerCase().includes(query);
        const matchCode = pin.passportCode.toLowerCase().includes(query);
        const matchShape = (pin.shape || '').toLowerCase().includes(query);
        if (!matchTitle && !matchCat && !matchCode && !matchShape) return false;
      }

      return true;
    });
  }, [allPins, activeFilterId, exploreSearch]);

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

  const handleLaunchTryOn = (pin: { id: string }) => {
    onSelectDesign(pin.id);
    if (onTryOnClick) {
      onTryOnClick(pin.id);
    }
  };

  return (
    <div className="w-full space-y-3 pb-20 md:pb-8">
      {/* 1. Pure Pinterest Header: Full-Width Search Input (No camera button, no All Pins, no clutter) */}
      <div className="sticky top-0 z-30 bg-white pt-2.5 pb-2 px-3 sm:px-6 w-full border-b border-stone-200/50 shadow-2xs">
        {/* Full-width Search Bar */}
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-12 bg-[#E9E9E9] hover:bg-[#E1E1E1] focus-within:bg-white focus-within:ring-2 focus-within:ring-stone-400 rounded-full px-4 flex items-center gap-3 transition-all">
            {/* Search Icon */}
            <Search className="w-5 h-5 text-stone-500 shrink-0" strokeWidth={2} />

            {/* Input Field */}
            <input
              type="text"
              value={exploreSearch}
              onChange={(e) => setExploreSearch(e.target.value)}
              placeholder="Search nail designs, aesthetics, colors, shapes..."
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
          </div>
        </div>

        {/* 2. Standard Minimal Category Filter Buttons */}
        <div className="w-full flex items-center gap-2 overflow-x-auto pt-2.5 pb-1 scrollbar-none select-none">
          {/* Filter Sliders Icon */}
          <button
            type="button"
            onClick={() => {
              setActiveFilterId('all');
              setExploreSearch('');
            }}
            className="flex items-center justify-center w-9 sm:w-9.5 h-9 sm:h-9.5 rounded-xl sm:rounded-2xl bg-white hover:bg-stone-50 text-stone-700 shrink-0 transition cursor-pointer active:scale-95 border border-stone-200/80 shadow-2xs"
            title="Reset Filters"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.8} />
          </button>

          {/* Minimal Icon + Label Category Buttons - Modern Rounded Squircle */}
          {CATEGORY_TAGS.map((tag) => {
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
                className={`h-9 sm:h-9.5 px-3.5 sm:px-4 rounded-xl sm:rounded-2xl flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer active:scale-95 shrink-0 border text-xs sm:text-[13px] font-semibold whitespace-nowrap shadow-2xs ${
                  isActive
                    ? 'bg-[#E0246A] text-white border-[#E0246A] shadow-[0_3px_12px_rgba(224,36,106,0.28)]'
                    : 'bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 border-stone-200/80'
                }`}
              >
                <tag.Icon
                  className={`w-3.5 h-3.5 transition-colors ${
                    isActive ? 'text-white' : 'text-stone-500'
                  }`}
                  strokeWidth={isActive ? 2 : 1.75}
                />
                <span>{tag.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Pure Pinterest Multi-Column Masonry Grid */}
      <div className="w-full px-3 sm:px-6">
        {filteredPins.length === 0 ? (
          <div className="py-20 px-6 max-w-md mx-auto text-center space-y-4 bg-white rounded-3xl border border-stone-200/80 shadow-2xs mt-8">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-700 mx-auto flex items-center justify-center">
              <Search className="w-5 h-5 text-stone-500" strokeWidth={1.75} />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-medium text-stone-900">
                No designs found
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                We couldn&apos;t find any designs matching &ldquo;{exploreSearch}&rdquo;. Try another aesthetic or color.
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
            {filteredPins.map((pin, idx) => {
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
                      src={sanitizeEditorialPhotoUrl(pin.photoUrl, idx)}
                      alt={pin.title || 'Manicure inspiration'}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          EDITORIAL_ASSET_PHOTOS[idx % EDITORIAL_ASSET_PHOTOS.length];
                      }}
                      className={`w-full object-cover group-hover:scale-102 transition-transform duration-300 ${pin.aspectClass}`}
                    />

                    {/* Gradient Scrim on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3" />

                    {/* Top Left: Passport Code Pill */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="px-2 py-0.5 rounded-full bg-black/60 text-white text-[9px] font-bold backdrop-blur-xs uppercase border border-white/10 shadow-2xs">
                        {pin.passportCode}
                      </span>
                    </div>

                    {/* Top Right: Pinterest-Style Save Button */}
                    <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      <button
                        type="button"
                        onClick={(e) => handleToggleSave(e, pin.id)}
                        className={`h-8 px-3 rounded-full text-xs font-bold shadow-md transition-all flex items-center gap-1 active:scale-90 cursor-pointer ${
                          isSaved
                            ? 'bg-stone-900 text-white'
                            : 'bg-[#E0246A] hover:bg-[#BE185D] text-white'
                        }`}
                        title={isSaved ? 'Saved' : 'Save'}
                      >
                        <Heart
                          className="w-3.5 h-3.5"
                          fill={isSaved ? 'white' : 'currentColor'}
                        />
                        <span>{isSaved ? 'Saved' : 'Save'}</span>
                      </button>
                    </div>

                    {/* Bottom Center: Instant 1-Tap "Try On" Button (Clean, no 'customize' button) */}
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
                        <span>Try On</span>
                      </button>
                    </div>
                  </div>

                  {/* Below Image: Pinterest Title, Shape & Options */}
                  <div className="pt-2 px-1 flex items-start justify-between gap-1.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-semibold text-stone-900 line-clamp-1 leading-snug group-hover:text-[#E0246A] transition-colors">
                        {pin.title}
                      </p>
                      <p className="text-[10.5px] text-stone-500 capitalize mt-0.5">
                        {pin.shape} shape · {pin.category.replace('-', ' ')}
                      </p>
                    </div>

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
