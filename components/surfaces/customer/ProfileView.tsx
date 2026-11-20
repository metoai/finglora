'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  User,
  Check,
  Heart,
  ChevronRight,
  Bell,
  HelpCircle,
  LogOut,
  Paintbrush,
  Hand,
  Compass,
  X,
  Mail,
  ShieldCheck,
  Dices,
  Camera,
  UploadCloud,
  Trash2,
} from 'lucide-react';
import {
  ExploreDesignSet,
  Finger,
  NailDesign,
  NailShape,
  SkinTonePreset,
} from '@/types/nail';
import { signOutUser, getCurrentUser } from '@/lib/services/auth';
import { toggleSetFavorite } from '@/lib/services/favorites';
import { updateUserProfile } from '@/lib/services/profile';
import { uploadUserHandPhoto } from '@/lib/services/storage';

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

  // Open-source DiceBear Avatar Seed (v9, latest free open-source package)
  const [avatarSeed, setAvatarSeed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('finglora_avatar_seed');
      if (saved) return saved;
    }
    return userName || 'Elise';
  });

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
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Inputs
  const [nameInput, setNameInput] = useState(userName);
  const [emailInput, setEmailInput] = useState(userEmail);

  // Notifications toggle
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Favorite filter
  const [favoriteCategory, setFavoriteCategory] = useState<string>('All');

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

  // DiceBear v9 open-source avatar URL
  const avatarUrl = `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(
    avatarSeed
  )}&backgroundColor=f9e8ed,ffd5dc,fae1dd`;

  // Randomize profile picture using DiceBear
  const randomizeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(2, 9);
    setAvatarSeed(randomSeed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('finglora_avatar_seed', randomSeed);
    }
    showToast('New random profile avatar generated');
  };

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
    if (favoriteCategory === 'All') return true;
    return d.category === favoriteCategory;
  });

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
  // VIEW: FAVORITES PAGE
  // -------------------------------------------------------------------------
  if (currentView === 'favorites') {
    return (
      <div className="max-w-xl lg:max-w-6xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 space-y-6 text-[#281720]">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-4 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
            <div className="bg-[#281720] text-white text-xs font-medium px-4 py-2 rounded-full shadow-xl border border-white/10 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <Check className="w-3.5 h-3.5 text-[#E0246A]" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Header with Back to Profile */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F0DFE4]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentView('settings')}
              className="w-9 h-9 rounded-full bg-white hover:bg-[#FDE8EF] border border-[#F0DFE4] text-[#281720] flex items-center justify-center transition cursor-pointer active:scale-95"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl sm:text-2xl font-medium text-[#281720]">
                Favorites
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FDE8EF] text-[#E0246A]">
                {savedDesigns.length}
              </span>
            </div>
          </div>

          {onNavigateLookbook && (
            <button
              type="button"
              onClick={onNavigateLookbook}
              className="text-xs font-medium text-[#E0246A] hover:text-[#BE185D] transition flex items-center gap-1 cursor-pointer"
            >
              <span>Designs</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        {savedDesigns.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {['All', 'Floral', 'Chrome', 'French', 'Minimal', 'Bold'].map((cat) => {
              const active = favoriteCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFavoriteCategory(cat)}
                  className={`h-7 px-3 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer active:scale-95 ${
                    active
                      ? 'bg-[#281720] text-white shadow-xs font-semibold'
                      : 'bg-white text-[#806D76] hover:text-[#281720] border border-[#F0DFE4]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Grid of Saved Favorites */}
        {filteredFavorites.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
            {filteredFavorites.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectExploreDesign?.(item.id);
                }}
                className="group relative flex flex-col rounded-2xl overflow-hidden bg-white border border-[#F0DFE4] shadow-2xs hover:shadow-md transition-all cursor-pointer"
              >
                {/* Photo Container */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#FAF7F2]">
                  <img
                    src={item.photoUrl || '/assets/editorial_nail_hero.jpg'}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Heart / Unsave button */}
                  <button
                    type="button"
                    title="Remove from favorites"
                    onClick={(e) => handleToggleFavorite(item.id, e)}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-[#E0246A] hover:scale-110 active:scale-90 transition shadow-xs cursor-pointer z-10"
                  >
                    <Heart className="w-4 h-4 fill-[#E0246A]" />
                  </button>

                  {/* Category Pill */}
                  <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs">
                    {item.category}
                  </span>

                  {/* Try On Button on card bottom */}
                  <div className="absolute inset-x-2.5 bottom-2.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectExploreDesign?.(item.id);
                      }}
                      className="w-full h-8 rounded-xl bg-white/95 hover:bg-white text-[#281720] text-xs font-semibold shadow-md backdrop-blur-sm flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <Hand className="w-3.5 h-3.5 text-[#E0246A]" strokeWidth={1.75} />
                      <span>Try On</span>
                    </button>
                  </div>
                </div>

                {/* Card Title */}
                <div className="p-2.5 bg-white">
                  <p className="text-xs font-semibold text-[#281720] truncate">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-[#F0DFE4] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FDE8EF] text-[#E0246A] flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6 text-[#E0246A]" />
            </div>
            <h3 className="text-sm font-semibold text-[#281720]">No favorites</h3>
            <p className="text-xs text-[#806D76] max-w-sm mx-auto">
              Tap the heart icon on any look to save it here.
            </p>
            {onNavigateLookbook && (
              <button
                type="button"
                onClick={onNavigateLookbook}
                className="mt-2 h-9 px-4 rounded-xl bg-[#281720] hover:bg-[#3d2732] text-white text-xs font-medium transition cursor-pointer inline-flex items-center gap-1.5 shadow-2xs active:scale-95"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Explore Designs</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // VIEW: MINIMAL GROUPED SECTIONS (1-Word Names, No Descriptions)
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
      <div className="flex items-center justify-between pb-2 border-b border-[#F0DFE4]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackClick}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#FDE8EF] border border-[#F0DFE4] text-[#281720] flex items-center justify-center transition cursor-pointer active:scale-95"
            title="Return"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-serif text-xl sm:text-2xl font-medium text-[#281720]">
            Profile
          </h1>
        </div>
      </div>

      {/* Main Grid: 2-column on desktop (lg), stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8 items-start gap-4">
        {/* Left Column on Desktop: User Hero & Overview */}
        <div className="lg:col-span-5 space-y-4">
          {/* User Card with DiceBear Open-Source Avatar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#F0DFE4] shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Avatar with Randomizer Dice overlay */}
              <div className="relative shrink-0 group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border border-[#E0246A]/25 bg-[#FDE8EF] shadow-xs flex items-center justify-center">
                  <img
                    src={avatarUrl || "https://api.dicebear.com/9.x/lorelei/svg?seed=Elise&backgroundColor=fde8ef"}
                    alt={userName}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={randomizeAvatar}
                  title="Generate random profile avatar"
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-[#F0DFE4] shadow-xs flex items-center justify-center text-[#E0246A] hover:text-[#BE185D] hover:bg-[#FDE8EF] transition active:scale-90 cursor-pointer"
                >
                  <Dices className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-semibold text-[#281720] truncate leading-tight">
                  {userName}
                </h2>
                <p className="text-xs text-[#806D76] truncate mt-0.5">{userEmail}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setNameInput(userName);
                setEmailInput(userEmail);
                setIsEditProfileOpen(true);
              }}
              className="h-8 px-3 rounded-xl bg-transparent hover:bg-[#FDE8EF] border border-[#F0DFE4] hover:border-[#E0246A]/30 text-xs font-medium text-[#281720] hover:text-[#E0246A] transition cursor-pointer shrink-0"
            >
              Edit
            </button>
          </div>

          {/* Desktop Studio Overview Card */}
          <div className="hidden lg:block bg-white rounded-2xl p-4 border border-[#F0DFE4] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#281720]">Studio Overview</h3>
              <span className="text-[10px] font-mono uppercase text-[#806D76]">Client</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <button
                type="button"
                onClick={() => setCurrentView('favorites')}
                className="p-3 rounded-xl bg-[#FAF7F2] hover:bg-[#FDE8EF] border border-[#F0DFE4]/50 transition cursor-pointer group text-left"
              >
                <span className="block text-xl font-serif font-bold text-[#E0246A]">
                  {savedDesigns.length}
                </span>
                <span className="text-[11px] text-[#806D76] group-hover:text-[#281720] font-medium">
                  Saved Looks
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsHandModalOpen(true)}
                className="p-3 rounded-xl bg-[#FAF7F2] hover:bg-[#FDE8EF] border border-[#F0DFE4]/50 transition cursor-pointer group text-left"
              >
                <span className="block text-xl font-serif font-bold text-[#281720]">
                  {customTryOnHandUrl ? 'Ready' : 'Setup'}
                </span>
                <span className="text-[11px] text-[#806D76] group-hover:text-[#281720] font-medium">
                  Try-On Hand
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column on Desktop: Grouped Sections with Visible Titles */}
        <div className="lg:col-span-7 space-y-5">
          {/* =====================================================================
              SECTION 1: SAVED & HAND
              ===================================================================== */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold tracking-wider text-[#806D76] uppercase px-1">
              SAVED & HAND
            </p>
            <div className="bg-white rounded-2xl border border-[#F0DFE4] divide-y divide-[#F0DFE4] shadow-2xs overflow-hidden">
              {/* FAVORITES (OPENS FAVORITES PAGE) */}
              <button
                type="button"
                onClick={() => setCurrentView('favorites')}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-[#FFFAF8] transition cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FDE8EF] text-[#E0246A] flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4 fill-[#E0246A]" />
                  </div>
                  <span className="text-xs font-semibold text-[#281720] group-hover:text-[#E0246A] transition-colors">
                    Favorites
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FDE8EF] text-[#E0246A]">
                    {savedDesigns.length}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#806D76] group-hover:text-[#281720] transition-colors" />
                </div>
              </button>

              {/* HAND (UPLOAD ONCE FOR 1-TAP TRY-ON) */}
              <button
                type="button"
                onClick={() => setIsHandModalOpen(true)}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-[#FFFAF8] transition cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FDE8EF] text-[#E0246A] flex items-center justify-center shrink-0">
                    <Hand className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-[#281720] group-hover:text-[#E0246A] transition-colors">
                    Hand
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {customTryOnHandUrl ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32]">
                      Saved
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FDE8EF] text-[#E0246A]">
                      Upload
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-[#806D76] group-hover:text-[#281720] transition-colors" />
                </div>
              </button>
            </div>
          </div>

          {/* =====================================================================
              SECTION 2: ACCOUNT & NOTIFICATIONS
              ===================================================================== */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold tracking-wider text-[#806D76] uppercase px-1">
              ACCOUNT & PREFERENCES
            </p>
            <div className="bg-white rounded-2xl border border-[#F0DFE4] divide-y divide-[#F0DFE4] shadow-2xs overflow-hidden">
              {/* ACCOUNT */}
              <button
                type="button"
                onClick={() => {
                  setNameInput(userName);
                  setEmailInput(userEmail);
                  setIsEditProfileOpen(true);
                }}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-[#FFFAF8] transition cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-[#281720] group-hover:text-[#E0246A] transition-colors">
                    Account
                  </span>
                </div>

                <ChevronRight className="w-4 h-4 text-[#806D76] group-hover:text-[#281720] transition-colors" />
              </button>

              {/* NOTIFICATIONS */}
              <div className="px-4 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-[#281720]">Notifications</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNotificationsEnabled(!notificationsEnabled);
                    showToast(!notificationsEnabled ? 'Notifications enabled' : 'Notifications muted');
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-none ${
                    notificationsEnabled ? 'bg-[#E0246A]' : 'bg-stone-300'
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

          {/* =====================================================================
              SECTION 3: SUPPORT & PRIVACY
              ===================================================================== */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold tracking-wider text-[#806D76] uppercase px-1">
              SUPPORT & PRIVACY
            </p>
            <div className="bg-white rounded-2xl border border-[#F0DFE4] divide-y divide-[#F0DFE4] shadow-2xs overflow-hidden">
              {/* SUPPORT */}
              <button
                type="button"
                onClick={() => setIsSupportModalOpen(true)}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-[#FFFAF8] transition cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-[#281720] group-hover:text-[#E0246A] transition-colors">
                    Support
                  </span>
                </div>

                <ChevronRight className="w-4 h-4 text-[#806D76] group-hover:text-[#281720] transition-colors" />
              </button>

              {/* PRIVACY */}
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(true)}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-[#FFFAF8] transition cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-[#281720] group-hover:text-[#E0246A] transition-colors">
                    Privacy
                  </span>
                </div>

                <ChevronRight className="w-4 h-4 text-[#806D76] group-hover:text-[#281720] transition-colors" />
              </button>
            </div>
          </div>

          {/* =====================================================================
              SECTION 4: SESSION
              ===================================================================== */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold tracking-wider text-[#806D76] uppercase px-1">
              SESSION
            </p>
            <div className="bg-white rounded-2xl border border-[#F0DFE4] shadow-2xs overflow-hidden">
              {/* LOGOUT */}
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
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-[#FDE8EF]/40 transition cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FDE8EF] text-[#E0246A] flex items-center justify-center shrink-0">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-[#E0246A]">Logout</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------------
          MODAL: MY HAND PHOTO (UPLOAD ONCE & NEVER RE-UPLOAD)
          --------------------------------------------------------------------- */}
      {isHandModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-[#F0DFE4] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-semibold text-[#281720]">My Hand</h3>
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
                    src={customTryOnHandUrl || '/assets/editorial_nail_hero.jpg'}
                    alt="My Hand"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-semibold backdrop-blur-xs flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#E8F5E9]" />
                    <span>Saved for 1-Tap Try-On</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handFileInputRef.current?.click()}
                    className="flex-1 h-9 rounded-xl bg-[#281720] hover:bg-[#3d2732] text-white text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Change Photo</span>
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
              <div className="space-y-3">
                <div
                  onClick={() => handFileInputRef.current?.click()}
                  className="aspect-[4/3] w-full rounded-2xl border-2 border-dashed border-[#F0DFE4] bg-[#FFFAF8] hover:bg-[#FDE8EF]/30 transition cursor-pointer flex flex-col items-center justify-center p-5 text-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#FDE8EF] text-[#E0246A] flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#281720]">Upload Hand Photo</p>
                    <p className="text-[10px] text-[#806D76] mt-0.5">
                      Clear flat hand photo on plain background
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-[#806D76] text-center leading-relaxed">
                  Saved securely on your device. Every design will instantly render on your hand!
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
          MODAL: EDIT NAME & EMAIL
          --------------------------------------------------------------------- */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-[#F0DFE4] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-[#281720]">Account</h3>
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
          MODAL: SUPPORT
          --------------------------------------------------------------------- */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-[#F0DFE4] space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FDE8EF] text-[#E0246A] flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#281720]">Support</h3>
              <p className="text-xs text-[#806D76] mt-1">
                Need nail consultation, custom sizing, or assistance with Virtual Try-On?
              </p>
            </div>
            <div className="bg-[#FFFAF8] rounded-2xl p-3 border border-[#F0DFE4] text-xs text-[#281720] space-y-1">
              <p className="font-semibold">Finglora Studio Support</p>
              <p className="text-[#806D76]">support@finglora.com</p>
            </div>
            <button
              type="button"
              onClick={() => setIsSupportModalOpen(false)}
              className="w-full h-9 rounded-xl bg-[#281720] text-white text-xs font-medium cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------
          MODAL: PRIVACY
          --------------------------------------------------------------------- */}
      {isPrivacyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-[#F0DFE4] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-[#281720]">Privacy</h3>
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-[#806D76] leading-relaxed">
              <p>
                Camera frames and hand photos used for Virtual Try-On are processed locally on your device and are never sent to external servers without your permission.
              </p>
              <p>
                Your design passports, saved hand photo, and favorites are safely stored on your browser.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPrivacyModalOpen(false)}
              className="w-full h-9 rounded-xl bg-[#281720] text-white text-xs font-medium cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
