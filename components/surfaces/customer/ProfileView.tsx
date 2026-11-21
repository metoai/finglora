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
  Search,
  Dices,
  Sparkles,
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
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6 text-stone-900 select-none animate-in fade-in duration-200">
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
                  <Compass className="w-4 h-4 text-[#E0246A]" />
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
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 text-stone-900 animate-in fade-in duration-200">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
          <div className="bg-stone-900 text-white text-xs font-medium px-4 py-2 rounded-full shadow-xl border border-stone-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Check className="w-3.5 h-3.5 text-[#E0246A]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackClick}
            className="w-9 h-9 rounded-full bg-white hover:bg-stone-100 border border-stone-200/80 text-stone-700 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs shrink-0"
            title="Return to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-normal text-stone-900 tracking-tight">
              Profile & Settings
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Atelier client identity, hand photo calibration & signature style
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF2F8] text-[#E0246A] border border-[#FCE7F3] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VIP Atelier Access</span>
          </span>
        </div>
      </div>

      {/* Balanced 2-Column Grid on Desktop (50/50 single-screen layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* ===================================================================
            LEFT COLUMN (6 Cols): Identity, Hand Photo Station & Atelier Guarantee
            =================================================================== */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-5">
          {/* Card 1: Client Atelier Identity */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Avatar with Dice roll & custom upload */}
                <div className="relative shrink-0 group">
                  <div
                    onClick={() => profilePicFileInputRef.current?.click()}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border border-stone-200 bg-[#FDF2F8] shadow-xs flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
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

                  {/* Profile Pic Giver Dice Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      randomizeAvatar();
                    }}
                    title="Roll new default profile picture"
                    className="absolute -bottom-1 -right-1 w-6.5 h-6.5 rounded-full bg-white border border-stone-200 shadow-xs flex items-center justify-center text-[#E0246A] hover:text-[#BE185D] hover:bg-pink-50 transition active:scale-90 cursor-pointer"
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
                  <h2 className="text-base sm:text-lg font-semibold text-stone-900 truncate leading-tight">
                    {userName}
                  </h2>
                  <p className="text-xs text-stone-500 font-mono truncate mt-0.5">{userEmail}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={randomizeAvatar}
                      className="text-xs text-[#E0246A] hover:text-[#BE185D] font-medium cursor-pointer inline-flex items-center gap-1 active:scale-95 transition"
                      title="Roll a new default profile avatar"
                    >
                      <Dices className="w-3.5 h-3.5" />
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
                className="h-9 px-3.5 rounded-xl border border-stone-200/80 hover:bg-stone-50 text-xs font-semibold text-stone-700 transition cursor-pointer shrink-0 flex items-center justify-center active:scale-95 shadow-2xs"
              >
                Edit
              </button>
            </div>

            {/* Quick Member Badges */}
            <div className="pt-2 border-t border-stone-100 flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-[11px] font-medium inline-flex items-center gap-1 capitalize">
                <span>💅 Shape:</span>
                <span className="font-semibold text-stone-900">{preferredShape}</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-pink-50 text-[#E0246A] text-[11px] font-medium inline-flex items-center gap-1">
                <span>✨ Tier:</span>
                <span className="font-semibold">VIP Unlimited</span>
              </span>
            </div>
          </div>

          {/* Card 2: Hand Photo Studio Station */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-50 text-[#E0246A] flex items-center justify-center shrink-0">
                  <Hand className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-stone-900 block leading-tight">
                    Hand Photo Calibration
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Used to render manicures directly onto your hand
                  </span>
                </div>
              </div>

              {customTryOnHandUrl ? (
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 inline-flex items-center gap-1 shrink-0">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Ready</span>
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200 shrink-0">
                  Not Added
                </span>
              )}
            </div>

            {customTryOnHandUrl ? (
              <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-14 h-16 sm:w-16 sm:h-18 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shrink-0 shadow-2xs group">
                    <img
                      src={customTryOnHandUrl}
                      alt="Saved Hand Photo"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-stone-900 truncate">Saved Hand Photo</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">Active for 1-tap try-on</p>
                    <button
                      type="button"
                      onClick={() => setIsHandModalOpen(true)}
                      className="text-[11px] text-[#E0246A] hover:text-[#BE185D] font-medium mt-1 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Preview / Retake</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsHandModalOpen(true)}
                    className="h-8.5 px-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-700 transition cursor-pointer active:scale-95 shadow-2xs"
                  >
                    Manage
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveHandPhoto}
                    className="w-8.5 h-8.5 rounded-xl border border-stone-200 hover:bg-red-50 text-stone-400 hover:text-red-600 transition cursor-pointer flex items-center justify-center active:scale-95"
                    title="Remove Hand Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  onClick={() => handFileInputRef.current?.click()}
                  className="py-5 px-4 w-full rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/70 hover:bg-pink-50/20 transition cursor-pointer flex flex-col items-center justify-center text-center space-y-1.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-pink-50 text-[#E0246A] flex items-center justify-center">
                    <Hand className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-stone-900">Your Hand Photo</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Upload once to try on any manicure in 1 tap
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handFileInputRef.current?.click()}
                    className="h-9.5 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCameraCaptureOpen(true)}
                    className="h-9.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200/80 text-stone-800 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#E0246A]" />
                    <span>Live Camera</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Atelier Guarantee */}
          <div className="bg-stone-50/80 rounded-3xl p-4 sm:p-5 border border-stone-200/70 space-y-2.5">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Atelier Guarantee
            </span>
            <div className="space-y-2 text-xs text-stone-700">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#E0246A] shrink-0" />
                <span>Unlimited 1-tap virtual try-ons across all 100 styles</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Private on-device photo synthesis and encrypted storage</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            RIGHT COLUMN (6 Cols): Silhouette, Saved Moodboard Shortcut & Settings
            =================================================================== */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-5">
          {/* Card 1: Signature Nail Silhouette & Studio Preferences */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-2xs space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E0246A]" />
                <h3 className="text-sm font-semibold text-stone-900">
                  Signature Nail Silhouette
                </h3>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Finglora customizes all studio designs to your signature nail shape
              </p>
            </div>

            {/* Shape Selector Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {(['almond', 'coffin', 'oval', 'square', 'stiletto'] as NailShape[]).map((shape) => {
                const active = preferredShape.toLowerCase() === shape.toLowerCase();
                return (
                  <button
                    key={shape}
                    type="button"
                    onClick={() => {
                      if (setPreferredShape) {
                        setPreferredShape(shape);
                      }
                      if (typeof window !== 'undefined') {
                        try {
                          localStorage.setItem('finglora_preferred_shape', shape);
                        } catch {}
                      }
                      showToast(`Signature shape set to ${shape.charAt(0).toUpperCase() + shape.slice(1)}`);
                    }}
                    className={`h-9 px-3.5 sm:px-4 rounded-xl text-xs font-semibold capitalize transition cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                      active
                        ? 'bg-[#E0246A] text-white shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/80'
                    }`}
                  >
                    {active && <Check className="w-3.5 h-3.5" />}
                    <span>{shape}</span>
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="border-t border-stone-100 pt-3">
              {/* Notifications Toggle */}
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="text-xs font-semibold text-stone-900 block leading-tight">
                      Seasonal Drops & Updates
                    </span>
                    <span className="text-[11px] text-stone-500 truncate block">
                      New style drops, color releases & studio updates
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
                    notificationsEnabled ? 'bg-[#E0246A]' : 'bg-stone-200'
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
          </div>

          {/* Card 2: Saved Looks Shortcut to Full Moodboard (Clean, compact, NO photo clutter) */}
          <button
            type="button"
            onClick={() => setCurrentView('favorites')}
            className="w-full p-4 sm:p-4.5 rounded-3xl bg-white hover:bg-stone-50/80 border border-stone-200/80 shadow-2xs flex items-center justify-between transition group cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#E0246A] flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 fill-[#E0246A]" />
              </div>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-stone-900 group-hover:text-[#E0246A] transition-colors leading-tight">
                    Saved Looks
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FDF2F8] text-[#E0246A] border border-[#FCE7F3]">
                    {savedDesigns.length}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                  View your bookmarked styles in the full moodboard
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-[#E0246A] shrink-0">
              <span>Open Moodboard</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* Card 3: Support, Privacy & Sign Out */}
          <div className="bg-white rounded-3xl p-2 sm:p-2.5 border border-stone-200/80 shadow-2xs divide-y divide-stone-100">
            {/* Help & Support */}
            <button
              type="button"
              onClick={() => setIsSupportModalOpen(true)}
              className="w-full h-11 px-3.5 rounded-2xl hover:bg-stone-50 transition flex items-center justify-between cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <span className="text-xs font-semibold text-stone-900 group-hover:text-[#E0246A] transition-colors block leading-tight">
                    Help & Support
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                <span>support@finglora.com</span>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors" />
              </div>
            </button>

            {/* Camera & Data Privacy */}
            <button
              type="button"
              onClick={() => setIsPrivacyModalOpen(true)}
              className="w-full h-11 px-3.5 rounded-2xl hover:bg-stone-50 transition flex items-center justify-between cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <span className="text-xs font-semibold text-stone-900 group-hover:text-[#E0246A] transition-colors block leading-tight">
                    Camera & Data Privacy
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                <span>Private on-device</span>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors" />
              </div>
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
              className="w-full h-11 px-3.5 rounded-2xl hover:bg-red-50/70 transition flex items-center justify-between cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
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
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-stone-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-semibold text-stone-900">Hand Photo</h3>
                <p className="text-[11px] text-stone-500">
                  Upload once to try on manicures anytime
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsHandModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {customTryOnHandUrl ? (
              <div className="space-y-3">
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-stone-200 bg-stone-100">
                  <img
                    src={customTryOnHandUrl}
                    alt="My Hand"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-semibold backdrop-blur-xs flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Saved for 1-Tap Try-On</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handFileInputRef.current?.click()}
                    className="flex-1 h-9 rounded-xl border border-stone-200 text-stone-800 hover:bg-stone-50 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-[#E0246A]" />
                    <span>Upload New</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCameraCaptureOpen(true)}
                    className="flex-1 h-9 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Camera</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveHandPhoto}
                    className="h-9 px-3 rounded-xl border border-stone-200 hover:bg-red-50 text-red-600 text-xs font-medium transition cursor-pointer flex items-center justify-center"
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
                  className="aspect-[4/3] w-full rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/70 hover:bg-pink-50/20 transition cursor-pointer flex flex-col items-center justify-center p-5 text-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#E0246A] flex items-center justify-center">
                    <Hand className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-stone-900">Your Hand Photo</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Upload from gallery or take a quick photo
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handFileInputRef.current?.click()}
                    className="h-10 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCameraCaptureOpen(true)}
                    className="h-10 rounded-xl border border-stone-200 bg-white text-stone-800 hover:bg-stone-50 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#E0246A]" />
                    <span>Camera</span>
                  </button>
                </div>

                <p className="text-[11px] text-stone-500 text-center leading-relaxed">
                  Saved securely so every manicure instantly renders onto your own hand.
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
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-stone-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-stone-900">Account Details</h3>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                  Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    required
                    placeholder="Your name"
                    className="w-full pl-9 pr-3 h-10 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#E0246A] focus:ring-1 focus:ring-[#E0246A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    placeholder="your.email@example.com"
                    className="w-full pl-9 pr-3 h-10 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#E0246A] focus:ring-1 focus:ring-[#E0246A]"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="flex-1 h-9 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition cursor-pointer"
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
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-stone-200/80 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-pink-50 text-[#E0246A] flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-stone-900">Help & Support</h3>
              <p className="text-xs text-stone-500 mt-1">
                Need styling advice, custom fitting, or assistance with Virtual Try-On?
              </p>
            </div>
            <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/70 text-xs text-stone-900 space-y-1">
              <p className="font-semibold text-sm">Finglora Support</p>
              <p className="text-stone-500">support@finglora.com</p>
            </div>
            <button
              type="button"
              onClick={() => setIsSupportModalOpen(false)}
              className="w-full h-10 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold cursor-pointer transition active:scale-95"
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
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-stone-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-stone-900">Privacy & Security</h3>
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-stone-600 leading-relaxed">
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
              className="w-full h-10 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold cursor-pointer transition active:scale-95"
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
