'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  User,
  Check,
  Heart,
  ChevronRight,
  Bell,
  HelpCircle,
  LogOut,
  Hand,
  Compass,
  X,
  Mail,
  ShieldCheck,
  Camera,
  UploadCloud,
  Trash2,
  Sparkles,
  Search,
  Dices,
} from 'lucide-react';
import {
  ExploreDesignSet,
  Finger,
  NailDesign,
  NailShape,
  SkinTonePreset,
} from '@/types/nail';
import {
  NAIL_SHAPES,
  CURATED_EDITORIAL_DESIGNS,
  EDITORIAL_ASSET_PHOTOS,
  sanitizeEditorialPhotoUrl,
} from '@/constants/nail-data';
import { signOutUser, getCurrentUser } from '@/lib/services/auth';
import { toggleSetFavorite } from '@/lib/services/favorites';
import { updateUserProfile } from '@/lib/services/profile';
import { uploadUserHandPhoto } from '@/lib/services/storage';
import { HandCameraCaptureModal } from '@/components/common/HandCameraCaptureModal';

interface ProfileViewProps {
  userName: string;
  setUserName: (name: string) => void;
  preferredShape?: NailShape;
  setPreferredShape?: (shape: NailShape) => void;
  skinToneId?: string;
  setSkinToneId?: (id: string) => void;
  activeSkinTone?: SkinTonePreset;
  activeSetName?: string;
  nails?: Record<Finger, NailDesign>;
  orderedFingers?: Finger[];
  exploreDesigns?: ExploreDesignSet[];
  setExploreDesigns?: React.Dispatch<React.SetStateAction<ExploreDesignSet[]>>;
  onSelectExploreDesign?: (id: string) => void;
  onBackClick: () => void;
  onNavigateAiStudio?: () => void;
  onNavigateTryOn?: () => void;
  onNavigateLookbook?: () => void;
  onTuneVibeClick?: () => void;
  handOrientation?: 'left' | 'right';
  initialView?: 'settings' | 'favorites';
  customTryOnHandUrl?: string | null;
  setCustomTryOnHandUrl?: (url: string | null) => void;
  onLogout?: () => void;
}

export function ProfileView({
  userName,
  setUserName,
  preferredShape = 'almond',
  setPreferredShape,
  exploreDesigns = [],
  setExploreDesigns,
  onSelectExploreDesign,
  onBackClick,
  onNavigateLookbook,
  initialView = 'settings',
  customTryOnHandUrl,
  setCustomTryOnHandUrl,
  onLogout,
}: ProfileViewProps) {
  // Navigation inside Profile: 'settings' | 'favorites'
  const [currentView, setCurrentView] = useState<'settings' | 'favorites'>(initialView);

  useEffect(() => {
    if (initialView) {
      setCurrentView(initialView);
    }
  }, [initialView]);

  // Luxury Editorial Monogram Initials (e.g. "VC" or user initials on refined bordeaux badge)
  const userInitials = useMemo(() => {
    const name = (userName || 'Client').trim();
    if (!name) return 'VC';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }, [userName]);

  // Open-source Default Profile Avatar Seed & Giver
  const [avatarSeed, setAvatarSeed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('finglora_avatar_seed');
      if (saved) return saved;
    }
    return 'Vivian';
  });

  const [customAvatarPhoto, setCustomAvatarPhoto] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('finglora_custom_avatar_photo');
    }
    return null;
  });

  const avatarUrl = useMemo(() => {
    if (customAvatarPhoto) return customAvatarPhoto;
    return `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(avatarSeed)}&backgroundColor=fde8ef`;
  }, [avatarSeed, customAvatarPhoto]);

  const profilePicFileInputRef = useRef<HTMLInputElement>(null);

  const randomizeAvatar = () => {
    const seeds = [
      'Vivian', 'Elise', 'Chloe', 'Amelie', 'Camille', 'Juliette',
      'Margaux', 'Giselle', 'Helene', 'Ines', 'Adele', 'Colette',
      'Claire', 'Sasha', 'Nadia', 'Zoe', 'Leona', 'Celeste', 'Flora'
    ];
    const next = seeds[Math.floor(Math.random() * seeds.length)] + '-' + Math.floor(Math.random() * 999);
    setAvatarSeed(next);
    setCustomAvatarPhoto(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('finglora_avatar_seed', next);
      localStorage.removeItem('finglora_custom_avatar_photo');
      localStorage.setItem('finglora_avatar_url', `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(next)}&backgroundColor=fde8ef`);
    }
    showToast('New profile avatar rolled ✿');
  };

  const handleCustomAvatarSelected = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCustomAvatarPhoto(dataUrl);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('finglora_custom_avatar_photo', dataUrl);
          localStorage.setItem('finglora_avatar_url', dataUrl);
        } catch {}
      }
      showToast('Custom profile picture updated');
    };
    reader.readAsDataURL(file);
  };

  // User Email state
  const [userEmail, setUserEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('finglora_user_email');
      if (saved) return saved;
    }
    const slug = (userName || 'client').toLowerCase().replace(/[^a-z0-9]/g, '.');
    return `${slug}@finglora.com`;
  });

  // Modals
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isHandModalOpen, setIsHandModalOpen] = useState(false);
  const [isCameraCaptureOpen, setIsCameraCaptureOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Inputs
  const [nameInput, setNameInput] = useState(userName);
  const [emailInput, setEmailInput] = useState(userEmail);

  // Notifications toggle
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Favorite filter & search
  const [favoriteCategory, setFavoriteCategory] = useState<string>('All');
  const [favoriteSearch, setFavoriteSearch] = useState<string>('');

  // File input ref for hand photo upload
  const handFileInputRef = useRef<HTMLInputElement | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  useEffect(() => {
    setNameInput(userName);
  }, [userName]);

  useEffect(() => {
    if (initialView) {
      setCurrentView(initialView);
    }
  }, [initialView]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nameInput.trim();
    if (cleanName) {
      setUserName(cleanName);
    }
    if (emailInput.trim()) {
      setUserEmail(emailInput.trim());
      if (typeof window !== 'undefined') {
        localStorage.setItem('finglora_user_email', emailInput.trim());
      }
    }
    setIsEditProfileOpen(false);
    showToast('Profile updated');

    try {
      const user = await getCurrentUser();
      if (user?.id && cleanName) {
        await updateUserProfile(user.id, { displayName: cleanName });
      }
    } catch (err) {
      console.warn('Profile sync skipped:', err);
    }
  };

  // Upload hand photo once
  const handleHandPhotoSelected = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      if (setCustomTryOnHandUrl) {
        setCustomTryOnHandUrl(result);
      }
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('finglora_custom_hand_photo', result);
          localStorage.setItem('finglora_user_hand_photo', result);
        }
      } catch {
        // storage quota fallback
      }
      showToast('Hand photo saved — ready for 1-tap try-on');

      // Upload to Supabase Storage and update profiles in DB
      try {
        const user = await getCurrentUser();
        if (user?.id) {
          const uploadedUrl = await uploadUserHandPhoto(file, user.id);
          if (uploadedUrl && uploadedUrl.startsWith('http')) {
            await updateUserProfile(user.id, { customHandUrl: uploadedUrl });
            if (setCustomTryOnHandUrl) setCustomTryOnHandUrl(uploadedUrl);
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('finglora_custom_hand_photo', uploadedUrl);
                localStorage.setItem('finglora_user_hand_photo', uploadedUrl);
              } catch {}
            }
          }
        }
      } catch (err) {
        console.warn('Profile hand sync skipped:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCameraHandCaptured = async (dataUrl: string) => {
    if (setCustomTryOnHandUrl) {
      setCustomTryOnHandUrl(dataUrl);
    }
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('finglora_custom_hand_photo', dataUrl);
        localStorage.setItem('finglora_user_hand_photo', dataUrl);
      }
    } catch {
      // storage quota fallback
    }
    showToast('Hand photo saved — ready for 1-tap try-on');

    try {
      const user = await getCurrentUser();
      if (user?.id) {
        const uploadedUrl = await uploadUserHandPhoto(dataUrl, user.id);
        if (uploadedUrl && uploadedUrl.startsWith('http')) {
          await updateUserProfile(user.id, { customHandUrl: uploadedUrl });
          if (setCustomTryOnHandUrl) setCustomTryOnHandUrl(uploadedUrl);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('finglora_custom_hand_photo', uploadedUrl);
              localStorage.setItem('finglora_user_hand_photo', uploadedUrl);
            } catch {}
          }
        }
      }
    } catch (err) {
      console.warn('Profile camera hand sync skipped:', err);
    }
  };

  const handleRemoveHandPhoto = async () => {
    if (setCustomTryOnHandUrl) {
      setCustomTryOnHandUrl(null);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('finglora_custom_hand_photo');
      localStorage.removeItem('finglora_user_hand_photo');
    }
    showToast('Hand photo removed');

    try {
      const user = await getCurrentUser();
      if (user?.id) {
        await updateUserProfile(user.id, { customHandUrl: null });
      }
    } catch (err) {
      console.warn('Profile hand removal skipped:', err);
    }
  };

  // Saved designs list
  const savedDesigns = exploreDesigns.filter((d) => d.isSaved);
  const filteredFavorites = savedDesigns.filter((d) => {
    const matchesCategory =
      favoriteCategory === 'All' ||
      d.category.toLowerCase().includes(favoriteCategory.toLowerCase());
    const middleNail = d.nails?.middle;
    const matchesSearch =
      !favoriteSearch.trim() ||
      d.title.toLowerCase().includes(favoriteSearch.toLowerCase()) ||
      d.category.toLowerCase().includes(favoriteSearch.toLowerCase()) ||
      Boolean(middleNail?.finish && middleNail.finish.toLowerCase().includes(favoriteSearch.toLowerCase())) ||
      Boolean(middleNail?.shape && middleNail.shape.toLowerCase().includes(favoriteSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Curated recommendations for low-count filler (< 4) or empty state
  const recommendations = React.useMemo(() => {
    const pool = exploreDesigns && exploreDesigns.length > 0 ? exploreDesigns : CURATED_EDITORIAL_DESIGNS;
    const unSaved = pool.filter((d) => !savedDesigns.some((s) => s.id === d.id));
    if (unSaved.length >= 4) {
      return unSaved.slice(0, 4);
    }
    const additional = CURATED_EDITORIAL_DESIGNS.filter(
      (d) => !savedDesigns.some((s) => s.id === d.id) && !unSaved.some((u) => u.id === d.id)
    );
    const combined = [...unSaved, ...additional];
    return combined.length > 0 ? combined.slice(0, 4) : CURATED_EDITORIAL_DESIGNS.slice(0, 4);
  }, [exploreDesigns, savedDesigns]);

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (setExploreDesigns) {
      setExploreDesigns((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isSaved: !item.isSaved } : item))
      );
      showToast('Removed from favorites');
      try {
        const user = await getCurrentUser();
        if (user?.id) {
          await toggleSetFavorite(user.id, id, false);
        }
      } catch (err) {
        console.warn('Favorite sync skipped:', err);
      }
    }
  };

  // -------------------------------------------------------------------------
  // VIEW: FAVORITES / SAVED DESIGNS TAB
  // -------------------------------------------------------------------------
  if (currentView === 'favorites') {
    return (
      <div className="w-full max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-5 sm:space-y-6 text-stone-900 select-none animate-in fade-in duration-200">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-5 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
            <div className="bg-[#181416] text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-xl border border-white/10 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <Check className="w-3.5 h-3.5 text-[#E0246A]" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* 1. Header with Back button, Title, Count Badge, and Explore More link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200/80">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                if (initialView === 'favorites' && onBackClick) {
                  onBackClick();
                } else {
                  setCurrentView('settings');
                }
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 hover:text-stone-900 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs shrink-0"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-normal text-stone-900 tracking-tight leading-tight">
                  Saved Looks
                </h1>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FDF2F8] text-[#E0246A] border border-[#FCE7F3]">
                  {savedDesigns.length}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
                Your personal curated moodboard and try-on collection
              </p>
            </div>
          </div>

          {onNavigateLookbook && (
            <button
              type="button"
              onClick={onNavigateLookbook}
              className="text-xs font-semibold text-[#E0246A] hover:text-[#BE185D] transition flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>Explore More Pins</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2. Search & Category Filters Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1 select-none">
            {['All', 'French', 'Glazed', 'Chrome', 'Velvet', 'Minimal'].map((cat) => {
              const active = favoriteCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFavoriteCategory(cat)}
                  className={`h-8 sm:h-8.5 px-3 sm:px-3.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer active:scale-95 shrink-0 ${
                    active
                      ? 'bg-stone-900 text-white font-semibold shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Quick Search in Saved Designs */}
          {savedDesigns.length > 0 && (
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={favoriteSearch}
                onChange={(e) => setFavoriteSearch(e.target.value)}
                placeholder="Search saved manicures..."
                className="w-full h-8.5 pl-8 pr-7 rounded-full bg-stone-100 hover:bg-stone-200/60 focus:bg-white focus:ring-2 focus:ring-stone-300 border border-transparent text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none transition"
              />
              {favoriteSearch && (
                <button
                  type="button"
                  onClick={() => setFavoriteSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* 3. Expansive Full-Space Moodboard Grid (2 to 6 columns) */}
        {filteredFavorites.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4.5">
            {filteredFavorites.map((item, idx) => {
              const photoSrc = sanitizeEditorialPhotoUrl(item.photoUrl, idx);
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectExploreDesign?.(item.id);
                  }}
                  className="group relative flex flex-col justify-end rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-2xs hover:shadow-lg transition-all duration-300 cursor-pointer aspect-[3/4.2]"
                >
                  {/* Photo with zoom on hover */}
                  <img
                    src={photoSrc}
                    alt={item.title}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        EDITORIAL_ASSET_PHOTOS[idx % EDITORIAL_ASSET_PHOTOS.length];
                    }}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
                  />

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                  {/* Category Badge top-left */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/50 text-white text-[9.5px] font-semibold backdrop-blur-xs capitalize border border-white/10">
                      {item.category}
                    </span>
                  </div>

                  {/* Heart Unsave Button top-right */}
                  <button
                    type="button"
                    title="Remove from favorites"
                    onClick={(e) => handleToggleFavorite(item.id, e)}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-[#E0246A] hover:scale-110 active:scale-90 transition shadow-xs cursor-pointer z-10"
                  >
                    <Heart className="w-4 h-4 fill-[#E0246A]" />
                  </button>

                  {/* Card Bottom Details & 1-Tap Try On */}
                  <div className="relative z-10 p-3 sm:p-3.5 space-y-2">
                    <div>
                      <h4 className="text-white text-xs sm:text-sm font-semibold leading-tight drop-shadow-xs truncate">
                        {item.title}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-white/70 mt-0.5 truncate">
                        {item.nails?.middle?.finish || 'Gel Gloss'} · <span className="capitalize">{item.nails?.middle?.shape || 'Almond'}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectExploreDesign?.(item.id);
                      }}
                      className="w-full h-8 sm:h-8.5 rounded-full bg-white hover:bg-stone-50 text-stone-900 text-[11px] sm:text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <Hand className="w-3.5 h-3.5 text-[#E0246A]" strokeWidth={2} />
                      <span>Try On</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : savedDesigns.length > 0 ? (
          /* Empty search result */
          <div className="bg-stone-50 rounded-3xl p-8 sm:p-12 border border-stone-200 text-center space-y-3">
            <p className="text-sm font-medium text-stone-700">
              No saved manicures match &ldquo;{favoriteSearch}&rdquo;
            </p>
            <button
              type="button"
              onClick={() => {
                setFavoriteSearch('');
                setFavoriteCategory('All');
              }}
              className="h-8.5 px-4 rounded-full bg-stone-900 text-white text-xs font-semibold transition cursor-pointer active:scale-95"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          /* Empty State: 0 saved designs */
          <div className="bg-white rounded-3xl p-8 sm:p-14 border border-stone-200 text-center space-y-4 max-w-lg mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-3xl bg-[#FDF2F8] border border-[#FCE7F3] text-[#E0246A] flex items-center justify-center mx-auto shadow-2xs">
              <Heart className="w-7 h-7 text-[#E0246A]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-serif font-medium text-stone-900">
                Your Saved Collection is Empty
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                Tap the heart on any manicure from Inspiration or Virtual Try-On to curate your bespoke favorites moodboard.
              </p>
            </div>

            {onNavigateLookbook && (
              <div className="pt-2 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={onNavigateLookbook}
                  className="h-10 px-5 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-semibold transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs active:scale-95"
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore Manicures</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 4. Rich Trending to Discover Section (Fills the space when favorites are few) */}
        {filteredFavorites.length < 6 && recommendations.length > 0 && (
          <div className="pt-8 sm:pt-10 border-t border-stone-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E0246A]" />
                  <h2 className="font-serif text-lg sm:text-xl font-medium text-stone-900 tracking-tight">
                    Trending to Discover
                  </h2>
                </div>
                <p className="text-xs text-stone-500">
                  Curated editorial looks ready for your moodboard and instant 1-tap try-on
                </p>
              </div>

              {onNavigateLookbook && (
                <button
                  type="button"
                  onClick={onNavigateLookbook}
                  className="text-xs font-semibold text-[#E0246A] hover:text-[#BE185D] transition flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4.5">
              {recommendations.map((item, idx) => {
                const photoSrc = sanitizeEditorialPhotoUrl(item.photoUrl, idx);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectExploreDesign?.(item.id);
                    }}
                    className="group relative flex flex-col justify-end rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-2xs hover:shadow-lg transition-all duration-300 cursor-pointer aspect-[3/4.2]"
                  >
                    <img
                      src={photoSrc}
                      alt={item.title}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          EDITORIAL_ASSET_PHOTOS[idx % EDITORIAL_ASSET_PHOTOS.length];
                      }}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                    {/* Category Tag */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/50 text-white text-[9.5px] font-semibold backdrop-blur-xs capitalize border border-white/10">
                        {item.category}
                      </span>
                    </div>

                    {/* Heart Save / Add Button */}
                    <button
                      type="button"
                      title={item.isSaved ? 'Remove from favorites' : 'Save to favorites'}
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (setExploreDesigns) {
                          const nextSaved = !item.isSaved;
                          setExploreDesigns((prev) =>
                            prev.map((x) => (x.id === item.id ? { ...x, isSaved: nextSaved } : x))
                          );
                          showToast(nextSaved ? 'Saved to favorites' : 'Removed from favorites');
                          try {
                            const user = await getCurrentUser();
                            if (user?.id) {
                              await toggleSetFavorite(user.id, item.id, nextSaved);
                            }
                          } catch (err) {
                            console.warn('Favorite sync skipped:', err);
                          }
                        }
                      }}
                      className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center transition shadow-xs cursor-pointer z-10 ${
                        item.isSaved
                          ? 'text-[#E0246A]'
                          : 'text-stone-400 hover:text-[#E0246A] hover:scale-110 active:scale-90'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${item.isSaved ? 'fill-[#E0246A] text-[#E0246A]' : ''}`}
                        strokeWidth={1.75}
                      />
                    </button>

                    {/* Card Bottom Details & 1-Tap Try On */}
                    <div className="relative z-10 p-3 sm:p-3.5 space-y-2">
                      <div>
                        <h4 className="text-white text-xs sm:text-sm font-semibold leading-tight drop-shadow-xs truncate">
                          {item.title}
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-white/70 mt-0.5 truncate">
                          {item.nails?.middle?.finish || 'Gel Gloss'} · <span className="capitalize">{item.nails?.middle?.shape || 'Almond'}</span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectExploreDesign?.(item.id);
                        }}
                        className="w-full h-8 sm:h-8.5 rounded-full bg-white hover:bg-stone-50 text-stone-900 text-[11px] sm:text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                      >
                        <Hand className="w-3.5 h-3.5 text-[#E0246A]" strokeWidth={2} />
                        <span>Try On</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // VIEW: MAIN PROFILE VIEW (Clean Profile Card + Account Settings)
  // -------------------------------------------------------------------------
  return (
    <div className="max-w-xl lg:max-w-5xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 space-y-6 text-[#281720]">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
          <div className="bg-[#281720] text-white text-xs font-medium px-4 py-2 rounded-full shadow-xl border border-white/10 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Check className="w-3.5 h-3.5 text-[#E0246A]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F0DFE4]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackClick}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#FDE8EF] border border-[#F0DFE4] text-[#281720] flex items-center justify-center transition cursor-pointer active:scale-95"
            title="Return to Atelier"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-serif text-xl sm:text-2xl font-medium text-[#281720]">
            Profile & Settings
          </h1>
        </div>
      </div>

      {/* Main Grid: Balanced 2-column layout on desktop (lg), stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-start">
        {/* Left Column: Cohesive Full Card (Profile Details + Hand Photo Status + Saved Looks Summary) */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#F0DFE4] shadow-2xs space-y-5">
            {/* 1. Profile Silhouette & Identity with Default Profile Pic Giver */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Avatar with Default Profile Pic Giver (Dice roll) & Custom Upload */}
                <div className="relative shrink-0 group">
                  <div
                    onClick={() => profilePicFileInputRef.current?.click()}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border border-[#E0246A]/25 bg-[#FDE8EF] shadow-xs flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                    title="Click to upload custom picture, or use dice to roll random avatar"
                  >
                    <img
                      src={avatarUrl}
                      alt={userName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>

                  {/* The Profile Pic Giver Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      randomizeAvatar();
                    }}
                    title="Roll new default profile picture"
                    className="absolute -bottom-1 -right-1 w-6.5 h-6.5 rounded-full bg-white border border-[#F0DFE4] shadow-xs flex items-center justify-center text-[#E0246A] hover:text-[#BE185D] hover:bg-[#FDE8EF] transition active:scale-90 cursor-pointer"
                  >
                    <Dices className="w-3.5 h-3.5" />
                  </button>

                  <input
                    ref={profilePicFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleCustomAvatarSelected(f);
                    }}
                  />
                </div>

                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-semibold text-[#281720] truncate leading-tight">
                    {userName}
                  </h2>
                  <p className="text-xs text-[#806D76] truncate mt-0.5">{userEmail}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#FDE8EF] text-[#801A35] border border-[#801A35]/15">
                      Atelier Client
                    </span>
                    <button
                      type="button"
                      onClick={randomizeAvatar}
                      className="text-[10px] text-[#E0246A] hover:underline font-medium cursor-pointer inline-flex items-center gap-1"
                      title="Roll a new default profile avatar"
                    >
                      <Dices className="w-3 h-3" />
                      <span>Roll Avatar</span>
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setNameInput(userName);
                  setEmailInput(userEmail);
                  setIsEditProfileOpen(true);
                }}
                className="min-h-[44px] h-11 px-3.5 rounded-xl bg-transparent hover:bg-[#FDE8EF] border border-[#F0DFE4] hover:border-[#801A35]/30 text-xs font-semibold text-[#281720] hover:text-[#801A35] transition cursor-pointer shrink-0 flex items-center justify-center active:scale-95"
              >
                Edit
              </button>
            </div>

            {/* 2. Hand Photo Status & Blueprint */}
            <div className="pt-4 border-t border-[#F0DFE4] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FDE8EF] text-[#801A35] flex items-center justify-center shrink-0">
                    <Hand className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#281720] block">
                      My Hand Blueprint
                    </span>
                    <span className="text-[10px] text-[#806D76]">
                      Calibrated for 1-tap try-on
                    </span>
                  </div>
                </div>

                {customTryOnHandUrl ? (
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] inline-flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#2E7D32]" />
                    <span>Ready</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]">
                    Photo Needed
                  </span>
                )}
              </div>

              {customTryOnHandUrl ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] border border-[#F0DFE4]/80">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 shrink-0">
                      <img
                        src={customTryOnHandUrl}
                        alt="My Hand"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#281720] truncate">Custom Hand Photo</p>
                      <p className="text-[10px] text-[#806D76]">Saved to account</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsHandModalOpen(true)}
                    className="min-h-[44px] h-11 px-3.5 rounded-xl bg-white hover:bg-[#FDE8EF] border border-[#F0DFE4] text-xs font-semibold text-[#281720] hover:text-[#801A35] transition cursor-pointer shrink-0 flex items-center justify-center active:scale-95 shadow-2xs"
                  >
                    Manage
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handFileInputRef.current?.click()}
                    className="min-h-[44px] h-11 rounded-xl bg-[#801A35] hover:bg-[#681329] text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCameraCaptureOpen(true)}
                    className="min-h-[44px] h-11 rounded-xl bg-white hover:bg-stone-50 border border-[#F0DFE4] text-[#281720] text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
                  >
                    <Camera className="w-4 h-4 text-[#801A35]" />
                    <span>Camera</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Saved Look Summary */}
            <div className="pt-4 border-t border-[#F0DFE4] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FDE8EF] text-[#801A35] flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4 fill-[#801A35]" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#281720] block">
                      Saved Atelier Looks
                    </span>
                    <span className="text-[10px] text-[#806D76]">
                      Bookmarked inspirations
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-[#801A35] px-2.5 py-0.5 rounded-full bg-[#FDE8EF]">
                  {savedDesigns.length} {savedDesigns.length === 1 ? 'Look' : 'Looks'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] border border-[#F0DFE4]/80">
                <div className="flex items-center gap-2.5 min-w-0">
                  {savedDesigns.length > 0 ? (
                    <div className="flex -space-x-2 overflow-hidden shrink-0">
                      {savedDesigns.slice(0, 3).map((item) => (
                        <img
                          key={item.id}
                          src={item.photoUrl || '/assets/editorial_nail_hero.jpg'}
                          alt=""
                          className="inline-block w-9 h-9 rounded-full ring-2 ring-white object-cover"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#FDE8EF]/60 flex items-center justify-center shrink-0">
                      <Heart className="w-4 h-4 text-[#801A35]" />
                    </div>
                  )}
                  <div className="min-w-0 pl-1">
                    <p className="text-xs font-medium text-[#281720] truncate">
                      {savedDesigns.length > 0
                        ? `${savedDesigns.length} Saved Design${savedDesigns.length > 1 ? 's' : ''}`
                        : 'No saved looks yet'}
                    </p>
                    <p className="text-[10px] text-[#806D76] truncate">
                      {savedDesigns.length > 0 ? 'Ready for virtual try-on' : 'Bookmark looks to try on'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentView('favorites')}
                  className="min-h-[44px] h-11 px-3.5 rounded-xl bg-white hover:bg-[#FDE8EF] border border-[#F0DFE4] text-xs font-semibold text-[#801A35] transition cursor-pointer flex items-center gap-1 shadow-2xs shrink-0 active:scale-95"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Account Details, Preferred Silhouette Selector, and Support/Privacy */}
        <div className="space-y-4">
          {/* Card 1: Account Details & Preferred Silhouette */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#F0DFE4] shadow-2xs space-y-4">
            {/* Account Details Item */}
            <button
              type="button"
              onClick={() => {
                setNameInput(userName);
                setEmailInput(userEmail);
                setIsEditProfileOpen(true);
              }}
              className="w-full min-h-[44px] h-11 px-3.5 rounded-xl bg-[#FAF7F2] hover:bg-[#FDE8EF]/40 border border-[#F0DFE4] transition flex items-center justify-between cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <span className="text-xs font-semibold text-[#281720] group-hover:text-[#801A35] transition-colors block leading-tight truncate">
                    Account Details
                  </span>
                  <span className="text-[10px] text-[#806D76] truncate block">
                    {userName} · {userEmail}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#806D76] group-hover:text-[#281720] transition-colors shrink-0" />
            </button>

            {/* Preferred Silhouette Selector */}
            <div className="pt-3 border-t border-[#F0DFE4] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FDE8EF] text-[#801A35] flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#281720] block">
                      Preferred Silhouette
                    </span>
                    <span className="text-[10px] text-[#806D76]">
                      Default shape across try-on
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-medium text-[#801A35] px-2 py-0.5 rounded-md bg-[#FDE8EF] capitalize">
                  {preferredShape || 'Almond'}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-0.5">
                {NAIL_SHAPES.map((s) => {
                  const isSelected = (preferredShape || 'almond') === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setPreferredShape?.(s.id);
                        showToast(`Preferred shape updated to ${s.label}`);
                      }}
                      className={`min-h-[44px] h-11 rounded-xl text-xs font-medium transition cursor-pointer flex items-center justify-center active:scale-95 ${
                        isSelected
                          ? 'bg-[#801A35] text-white shadow-2xs font-semibold'
                          : 'bg-[#FAF7F2] text-[#806D76] hover:bg-stone-100 hover:text-[#281720] border border-[#F0DFE4]'
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notifications Toggle */}
            <div className="pt-3 border-t border-[#F0DFE4] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#281720] block">Notifications</span>
                  <span className="text-[10px] text-[#806D76]">
                    Seasonal look drops & updates
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setNotificationsEnabled(!notificationsEnabled);
                  showToast(!notificationsEnabled ? 'Notifications enabled' : 'Notifications muted');
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-none shrink-0 ${
                  notificationsEnabled ? 'bg-[#801A35]' : 'bg-stone-300'
                }`}
                aria-label="Toggle notifications"
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Card 2: Support, Privacy & Session */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#F0DFE4] shadow-2xs space-y-2.5">
            {/* Atelier Support */}
            <button
              type="button"
              onClick={() => setIsSupportModalOpen(true)}
              className="w-full min-h-[44px] h-11 px-3.5 rounded-xl bg-[#FAF7F2] hover:bg-[#FDE8EF]/40 border border-[#F0DFE4] transition flex items-center justify-between cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <span className="text-xs font-semibold text-[#281720] group-hover:text-[#801A35] transition-colors block leading-tight">
                    Atelier Support
                  </span>
                  <span className="text-[10px] text-[#806D76] truncate block">
                    Concierge styling & virtual try-on help
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#806D76] group-hover:text-[#281720] transition-colors shrink-0" />
            </button>

            {/* Camera & Data Privacy */}
            <button
              type="button"
              onClick={() => setIsPrivacyModalOpen(true)}
              className="w-full min-h-[44px] h-11 px-3.5 rounded-xl bg-[#FAF7F2] hover:bg-[#FDE8EF]/40 border border-[#F0DFE4] transition flex items-center justify-between cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <span className="text-xs font-semibold text-[#281720] group-hover:text-[#801A35] transition-colors block leading-tight">
                    Camera & Data Privacy
                  </span>
                  <span className="text-[10px] text-[#806D76] truncate block">
                    Private on-device hand processing
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#806D76] group-hover:text-[#281720] transition-colors shrink-0" />
            </button>

            {/* Sign Out */}
            <button
              type="button"
              onClick={async () => {
                try {
                  await signOutUser();
                } catch (e) {
                  console.warn('Sign out error:', e);
                }
                showToast('Signed out successfully');
                if (onLogout) onLogout();
              }}
              className="w-full min-h-[44px] h-11 px-3.5 rounded-xl bg-white hover:bg-red-50/60 border border-red-200/60 transition flex items-center justify-between cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-red-600">Sign Out</span>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400 group-hover:text-red-600 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------------
          MODAL: MY HAND PHOTO (UPLOAD ONCE & 1-TAP READY)
          --------------------------------------------------------------------- */}
      {isHandModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-[#F0DFE4] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-semibold text-[#281720]">My Hand Photo</h3>
                <p className="text-[11px] text-[#806D76]">
                  Upload once to try on designs anytime
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsHandModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {customTryOnHandUrl ? (
              <div className="space-y-3">
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-[#F0DFE4] bg-stone-100">
                  <img
                    src={customTryOnHandUrl}
                    alt="My Hand"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-semibold backdrop-blur-xs flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#E8F5E9]" />
                    <span>Saved for 1-Tap Try-On</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handFileInputRef.current?.click()}
                    className="flex-1 h-9 rounded-xl border border-[#F0DFE4] text-[#281720] hover:bg-stone-50 text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-[#E0246A]" />
                    <span>Upload New</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCameraCaptureOpen(true)}
                    className="flex-1 h-9 rounded-xl bg-[#281720] hover:bg-[#3d2732] text-white text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Camera</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveHandPhoto}
                    className="h-9 px-3 rounded-xl border border-[#F0DFE4] hover:bg-red-50 text-red-600 text-xs font-medium transition cursor-pointer flex items-center justify-center"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  onClick={() => handFileInputRef.current?.click()}
                  className="aspect-[4/3] w-full rounded-2xl border-2 border-dashed border-[#F0DFE4] bg-[#FFFAF8] hover:bg-[#FDE8EF]/20 transition cursor-pointer flex flex-col items-center justify-center p-5 text-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#FDE8EF] text-[#E0246A] flex items-center justify-center">
                    <Hand className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#281720]">Your Hand Photo</p>
                    <p className="text-[10px] text-[#806D76] mt-0.5">
                      Upload from gallery or take a quick photo
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handFileInputRef.current?.click()}
                    className="h-10 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCameraCaptureOpen(true)}
                    className="h-10 rounded-xl border border-[#F0DFE4] bg-white text-[#281720] hover:bg-stone-50 text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#E0246A]" />
                    <span>Camera</span>
                  </button>
                </div>

                <p className="text-[11px] text-[#806D76] text-center leading-relaxed">
                  Saved securely to your account so every manicure instantly renders onto your own hand!
                </p>
              </div>
            )}

            <input
              type="file"
              ref={handFileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleHandPhotoSelected(file);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------
          MODAL: EDIT ACCOUNT DETAILS
          --------------------------------------------------------------------- */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-[#F0DFE4] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-[#281720]">Account Details</h3>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#806D76] uppercase tracking-wider mb-1">
                  Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#806D76] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    required
                    placeholder="Your name"
                    className="w-full pl-9 pr-3 h-10 rounded-xl border border-[#F0DFE4] text-xs sm:text-sm text-[#281720] focus:outline-none focus:border-[#E0246A] focus:ring-1 focus:ring-[#E0246A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#806D76] uppercase tracking-wider mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#806D76] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    placeholder="your.email@example.com"
                    className="w-full pl-9 pr-3 h-10 rounded-xl border border-[#F0DFE4] text-xs sm:text-sm text-[#281720] focus:outline-none focus:border-[#E0246A] focus:ring-1 focus:ring-[#E0246A]"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="flex-1 h-9 rounded-xl border border-[#F0DFE4] text-xs font-semibold text-[#806D76] hover:bg-stone-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------
          MODAL: ATELIER SUPPORT
          --------------------------------------------------------------------- */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-[#F0DFE4] space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FDE8EF] text-[#E0246A] flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#281720]">Atelier Support</h3>
              <p className="text-xs text-[#806D76] mt-1">
                Need bespoke nail styling advice, custom fitting, or assistance with Virtual Try-On?
              </p>
            </div>
            <div className="bg-[#FFFAF8] rounded-2xl p-3.5 border border-[#F0DFE4] text-xs text-[#281720] space-y-1">
              <p className="font-semibold text-sm">Finglora Concierge</p>
              <p className="text-[#806D76]">support@finglora.com</p>
            </div>
            <button
              type="button"
              onClick={() => setIsSupportModalOpen(false)}
              className="w-full h-10 rounded-xl bg-[#281720] hover:bg-[#3d2732] text-white text-xs font-semibold cursor-pointer transition active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------
          MODAL: CAMERA & DATA PRIVACY
          --------------------------------------------------------------------- */}
      {isPrivacyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-[#F0DFE4] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-[#281720]">Privacy & Security</h3>
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-[#806D76] leading-relaxed">
              <p>
                Camera frames and hand photos used for Virtual Try-On are processed securely on your device and are never shared with third parties.
              </p>
              <p>
                Your design passports, saved hand photo, and bespoke favorites remain private to your Finglora account.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPrivacyModalOpen(false)}
              className="w-full h-10 rounded-xl bg-[#281720] hover:bg-[#3d2732] text-white text-xs font-semibold cursor-pointer transition active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Live Hand Camera Capture Modal */}
      <HandCameraCaptureModal
        isOpen={isCameraCaptureOpen}
        onClose={() => setIsCameraCaptureOpen(false)}
        onCaptureHand={handleCameraHandCaptured}
        onUploadFileFallback={(file) => handleHandPhotoSelected(file)}
      />
    </div>
  );
}
