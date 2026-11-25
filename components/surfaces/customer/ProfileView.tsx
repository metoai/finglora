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
  Sparkles,
  Crown,
  Settings,
  History,
  RotateCcw,
  ExternalLink,
  Dices,
  Maximize2,
  Download,
  Share2,
} from 'lucide-react';
import Link from 'next/link';
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
import { isAuthorizedAdmin } from '@/lib/services/admin';
import { toggleSetFavorite } from '@/lib/services/favorites';
import { updateUserProfile } from '@/lib/services/profile';
import { downscaleImageForVision, uploadUserAvatar } from '@/lib/services/storage';
import { isVipEmail, getUserCreditStatus, PRO_PLANS } from '@/lib/services/credits';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { HandCameraCaptureModal } from '@/components/common/HandCameraCaptureModal';
import { ProPaywallModal } from '@/components/common/ProPaywallModal';
import { SocialShareModal } from '@/components/common/SocialShareModal';
import { shareToStoryOrSocial } from '@/lib/services/editorial-export';
import { buildSharedLookUrl, buildSimpleTechSummary, SimpleTechSummary } from '@/lib/services/share-look';

interface ProfileViewProps {
  userName: string;
  setUserName: (name: string) => void;
  userEmail?: string;
  userAvatarUrl?: string | null;
  setUserAvatarUrl?: (url: string | null) => void;
  userIsPro?: boolean;
  userCredits?: number;
  supabaseUser?: any;
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
  initialView?: 'settings' | 'favorites' | 'history';
  customTryOnHandUrl?: string | null;
  setCustomTryOnHandUrl?: (url: string | null) => void;
  onLogout?: () => void;
}

export function ProfileView({
  userName,
  setUserName,
  userEmail: propUserEmail,
  userAvatarUrl: propUserAvatarUrl,
  setUserAvatarUrl: propSetUserAvatarUrl,
  userIsPro: propUserIsPro,
  userCredits: propUserCredits,
  supabaseUser,
  preferredShape = 'almond',
  setPreferredShape,
  exploreDesigns = [],
  setExploreDesigns,
  onSelectExploreDesign,
  onBackClick,
  onNavigateTryOn,
  onNavigateLookbook,
  initialView = 'settings',
  customTryOnHandUrl,
  setCustomTryOnHandUrl,
  onLogout,
}: ProfileViewProps) {
  // Navigation inside Profile: 'settings' | 'favorites' | 'history'
  const [currentView, setCurrentView] = useState<'settings' | 'favorites' | 'history'>(initialView);

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

  // Google OAuth / user metadata avatar if available
  const authMetadataAvatar =
    supabaseUser?.user_metadata?.avatar_url || supabaseUser?.user_metadata?.picture || null;

  const [customAvatarPhoto, setCustomAvatarPhoto] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Reset local preview when active authenticated user changes
  useEffect(() => {
    setCustomAvatarPhoto(null);
    setImageError(false);
  }, [supabaseUser?.id, propUserAvatarUrl]);

  const avatarUrl = useMemo(() => {
    if (customAvatarPhoto) return customAvatarPhoto;
    if (propUserAvatarUrl) return propUserAvatarUrl;
    if (authMetadataAvatar) return authMetadataAvatar;
    return null;
  }, [customAvatarPhoto, propUserAvatarUrl, authMetadataAvatar]);

  // Reset imageError when avatarUrl changes
  useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

  const profilePicFileInputRef = useRef<HTMLInputElement>(null);

  const handleCustomAvatarSelected = async (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCustomAvatarPhoto(dataUrl);
      if (!supabaseUser?.id && typeof window !== 'undefined') {
        try {
          localStorage.setItem('finglora_avatar_url', dataUrl);
          window.dispatchEvent(new Event('finglora_avatar_updated'));
        } catch {}
      }
    };
    reader.readAsDataURL(file);

    try {
      const user = await getCurrentUser();
      if (user?.id) {
        const uploadedUrl = await uploadUserAvatar(file, user.id);
        await updateUserProfile(user.id, { avatarUrl: uploadedUrl });
        setCustomAvatarPhoto(uploadedUrl);
        propSetUserAvatarUrl?.(uploadedUrl);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('finglora_avatar_url', uploadedUrl);
            window.dispatchEvent(new Event('finglora_avatar_updated'));
          } catch {}
        }
        showToast('Profile picture updated');
      } else {
        showToast('Profile photo updated for guest session');
      }
    } catch (err) {
      console.warn('Avatar upload failed:', err);
      showToast('Could not upload avatar to cloud storage');
    }
  };

  // Verified email for signed-in accounts; guest indicator when signed out
  const [userEmail, setUserEmail] = useState(() => {
    if (supabaseUser?.email) return supabaseUser.email;
    if (propUserEmail) return propUserEmail;
    return '';
  });

  useEffect(() => {
    if (supabaseUser?.email) {
      setUserEmail(supabaseUser.email);
    } else if (propUserEmail) {
      setUserEmail(propUserEmail);
    } else if (!supabaseUser?.id) {
      setUserEmail('');
    }
  }, [propUserEmail, supabaseUser?.id, supabaseUser?.email]);

  const guestCreditStatus = useMemo(() => getUserCreditStatus(), [userEmail, supabaseUser?.id]);
  const isUserPro = supabaseUser?.id ? Boolean(propUserIsPro) : guestCreditStatus.isPro;
  const isUserVip = Boolean(supabaseUser?.id && isUserPro && isVipEmail(userEmail));
  const displayCredits = supabaseUser?.id
    ? typeof propUserCredits === 'number'
      ? propUserCredits
      : guestCreditStatus.credits
    : guestCreditStatus.credits;
  const showAdminConsoleLink = Boolean(supabaseUser?.id && isAuthorizedAdmin(userEmail));

  // Modals
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isHandModalOpen, setIsHandModalOpen] = useState(false);
  const [isCameraCaptureOpen, setIsCameraCaptureOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  // Inputs
  const [nameInput, setNameInput] = useState(userName);
  const [emailInput, setEmailInput] = useState(userEmail);

  // Notifications toggle
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Favorite filter & search
  const [favoriteCategory, setFavoriteCategory] = useState<string>('All');
  const [favoriteSearch, setFavoriteSearch] = useState<string>('');

  // Try-On History State
  interface TryOnHistoryRecord {
    id: string;
    image_url: string;
    mode: string;
    set_id: string | null;
    skin_tone_id: string | null;
    created_at: string;
  }
  const [tryOnHistory, setTryOnHistory] = useState<TryOnHistoryRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [fullscreenHistoryItem, setFullscreenHistoryItem] = useState<TryOnHistoryRecord | null>(null);
  const [shareHistoryItem, setShareHistoryItem] = useState<TryOnHistoryRecord | null>(null);

  const getHistoryTechSummary = (item: TryOnHistoryRecord): SimpleTechSummary => {
    const matchedDesign = item.set_id
      ? exploreDesigns?.find((d) => d.id === item.set_id) ||
        CURATED_EDITORIAL_DESIGNS.find((d) => d.id === item.set_id)
      : undefined;

    if (matchedDesign?.nails) {
      return buildSimpleTechSummary(matchedDesign.nails, matchedDesign.title);
    }

    return {
      title: matchedDesign?.title || 'Applied Manicure',
      shape: preferredShape || 'almond',
      length: 'medium',
      finish: 'glossy',
      colors: [],
      description: `${preferredShape || 'almond'} shape manicure try-on created in Finglora.`,
    };
  };

  const downloadHistoryItemPhoto = async (item: TryOnHistoryRecord) => {
    try {
      const res = await fetch(item.image_url, { mode: 'cors', credentials: 'omit' });
      if (!res.ok) throw new Error('fetch failed');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `finglora-tryon-${item.id.slice(0, 6)}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      showToast('Photo downloaded');
    } catch {
      window.open(item.image_url, '_blank');
    }
  };

  const handleShareHistoryItem = async (item: TryOnHistoryRecord) => {
    try {
      const summary = getHistoryTechSummary(item);
      const res = await shareToStoryOrSocial(item.image_url, {
        designTitle: summary.title,
        filename: `finglora-tryon-${item.id.slice(0, 6)}.jpg`,
        storyAspect: true,
      });
      if (res.mode === 'dialog') {
        setShareHistoryItem(item);
      } else if (res.mode === 'shared') {
        showToast('Opening share options...');
      }
    } catch {
      setShareHistoryItem(item);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const client = getSupabaseBrowserClient();
        const user = await getCurrentUser();
        if (user?.id) {
          const { data, error } = await client
            .from('try_on_history')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (!error && isMounted) {
            setTryOnHistory(data || []);
          }
          return;
        }

        // Local fallback ONLY when viewing as guest
        if (typeof window !== 'undefined' && isMounted) {
          try {
            const localItem = localStorage.getItem('finglora_synthesized_hand_url');
            if (localItem) {
              setTryOnHistory([
                {
                  id: 'local-active-tryon',
                  image_url: localItem,
                  mode: 'Local Studio',
                  set_id: null,
                  skin_tone_id: null,
                  created_at: new Date().toISOString(),
                },
              ]);
            } else {
              setTryOnHistory([]);
            }
          } catch {
            setTryOnHistory([]);
          }
        }
      } catch (err) {
        console.warn('Could not load online try-on history:', err);
        if (isMounted) setTryOnHistory([]);
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [supabaseUser?.id, currentView]);

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
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('finglora_user_display_name', cleanName);
        } catch {}
      }
    }
    if (!supabaseUser?.id && emailInput.trim()) {
      setUserEmail(emailInput.trim());
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
      const rawDataUrl = reader.result as string;
      const optimized = await downscaleImageForVision(rawDataUrl, 1280, 0.88).catch(() => rawDataUrl);
      if (setCustomTryOnHandUrl) {
        setCustomTryOnHandUrl(optimized);
      }
      showToast('Hand photo saved — ready for 1-tap try-on');
    };
    reader.readAsDataURL(file);
  };

  const handleCameraHandCaptured = async (dataUrl: string) => {
    if (setCustomTryOnHandUrl) {
      setCustomTryOnHandUrl(dataUrl);
    }
    showToast('Hand photo saved — ready for 1-tap try-on');
  };

  const handleRemoveHandPhoto = async () => {
    if (setCustomTryOnHandUrl) {
      setCustomTryOnHandUrl(null);
    }
    showToast('Hand photo removed');
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
  // VIEW: TRY-ON HISTORY TAB (User past applied manicures)
  // -------------------------------------------------------------------------
  if (currentView === 'history') {
    return (
      <>
      <div
        className={`w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 sm:pb-32 md:pb-12 text-stone-900 select-none animate-in fade-in duration-200 ${
          tryOnHistory.length === 0
            ? 'min-h-[calc(100dvh-5.5rem)] flex flex-col items-center justify-center'
            : 'space-y-5 sm:space-y-6'
        }`}
      >
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-5 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
            <div className="bg-[#181416] text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-xl border border-white/10 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <Check className="w-3.5 h-3.5 text-[#E0246A]" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* History Grid or Empty State */}
        {tryOnHistory.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {tryOnHistory.map((item) => (
              <div
                key={item.id}
                className="group relative bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col"
              >
                {/* Photo Display */}
                <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt="Applied Try-On"
                    onClick={() => setFullscreenHistoryItem(item)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103 cursor-pointer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 pointer-events-none" />

                  {/* Mode Badge */}
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-mono border border-white/10">
                    {item.mode || 'Virtual Try-On'}
                  </span>

                  {/* Card Top-Right Actions: Share, Download & Fullscreen */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareHistoryItem(item);
                      }}
                      className="w-7 h-7 rounded-full bg-white/90 text-stone-800 flex items-center justify-center shadow-xs hover:bg-white cursor-pointer transition"
                      title="Share Look"
                      aria-label="Share Look"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadHistoryItemPhoto(item);
                      }}
                      className="w-7 h-7 rounded-full bg-white/90 text-stone-800 flex items-center justify-center shadow-xs hover:bg-white cursor-pointer transition"
                      title="Download Photo"
                      aria-label="Download Photo"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFullscreenHistoryItem(item);
                      }}
                      className="w-7 h-7 rounded-full bg-white/90 text-stone-800 flex items-center justify-center shadow-xs hover:bg-white cursor-pointer transition"
                      title="Open Fullscreen"
                      aria-label="Open Fullscreen"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Details & Actions */}
                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between bg-white">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-medium text-stone-600 block">
                      Applied Manicure
                    </span>
                    <span className="text-[10px] text-stone-400 block font-mono">
                      {new Date(item.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {item.set_id && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectExploreDesign?.(item.set_id!);
                      }}
                      className="w-full h-8 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#E0246A]" />
                      <span>Re-Apply Look</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty History State - Centered in viewport */
          <div className="w-full flex-1 flex items-center justify-center p-2">
            <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-7 sm:p-12 border border-stone-200 text-center space-y-4 shadow-sm mx-auto animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-3xl bg-[#FDF2F8] border border-[#FCE7F3] text-[#E0246A] flex items-center justify-center mx-auto shadow-2xs">
                <Camera className="w-7 h-7 text-[#E0246A]" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-serif font-medium text-stone-900">
                  No Try-On Photos Yet
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                  When you try on any manicure set onto your hand, your AI-synthesized results will be safely saved here so you can revisit them anytime.
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => onNavigateTryOn?.()}
                  className="h-10 px-5 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-semibold transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Launch Virtual Try-On</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* In-App Fullscreen Lightbox */}
      {fullscreenHistoryItem && (
        <div
          onClick={() => setFullscreenHistoryItem(null)}
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full flex flex-col items-center gap-3"
          >
            <div className="w-full flex items-center justify-between gap-2">
              <span className="text-xs text-white/75 font-mono">
                {new Date(fullscreenHistoryItem.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleShareHistoryItem(fullscreenHistoryItem)}
                  className="h-9 px-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadHistoryItemPhoto(fullscreenHistoryItem)}
                  className="h-9 px-3.5 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFullscreenHistoryItem(null)}
                  className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
                  aria-label="Close fullscreen preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="w-full rounded-3xl overflow-hidden bg-stone-950 border border-white/10 shadow-2xl">
              <img
                src={fullscreenHistoryItem.image_url}
                alt="Applied Try-On Fullscreen"
                className="w-full max-h-[78vh] object-contain mx-auto"
              />
            </div>
          </div>
        </div>
      )}

      {/* History Social Share Modal */}
      {shareHistoryItem && (() => {
        const techSummary = getHistoryTechSummary(shareHistoryItem);
        return (
          <SocialShareModal
            isOpen={Boolean(shareHistoryItem)}
            onClose={() => setShareHistoryItem(null)}
            imageUrl={shareHistoryItem.image_url}
            designTitle={techSummary.title}
            techSummary={techSummary}
            shareUrl={buildSharedLookUrl(shareHistoryItem.image_url, techSummary)}
            onDownloadFallback={() => downloadHistoryItemPhoto(shareHistoryItem)}
          />
        );
      })()}
    </>
    );
  }

  // -------------------------------------------------------------------------
  // VIEW: FAVORITES / SAVED DESIGNS TAB
  // -------------------------------------------------------------------------
  if (currentView === 'favorites') {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 sm:pb-32 md:pb-12 space-y-5 sm:space-y-6 text-stone-900 select-none animate-in fade-in duration-200">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-5 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
            <div className="bg-[#181416] text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-xl border border-white/10 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <Check className="w-3.5 h-3.5 text-[#E0246A]" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}



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
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 sm:pb-32 md:pb-12 space-y-6 text-stone-900 animate-in fade-in duration-200">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
          <div className="bg-stone-900 text-white text-xs font-medium px-4 py-2 rounded-full shadow-xl border border-stone-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Check className="w-3.5 h-3.5 text-[#E0246A]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Balanced 2-Column Grid on Desktop (50/50 single-screen layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* ===================================================================
            LEFT COLUMN (6 Cols): Identity, Hand Photo Station & Atelier Guarantee
            =================================================================== */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-5">
          {/* Card 1: Client Atelier Identity */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                {/* Profile Picture with hover overlay */}
                <div className="relative shrink-0 group">
                  <div
                    onClick={() => profilePicFileInputRef.current?.click()}
                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden border border-stone-200/80 bg-[#FDF2F8] shadow-xs flex items-center justify-center cursor-pointer transition-all duration-200 group-hover:scale-102 group-hover:shadow-md relative"
                    title={customAvatarPhoto ? 'Click to change photo' : 'Click to upload custom picture'}
                  >
                    {!imageError && avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={userName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-[#E0246A] to-rose-400 text-white font-serif font-bold text-lg sm:text-xl">
                        {userInitials}
                      </div>
                    )}
                  </div>

                  {/* Quick Dice Randomizer Overlay */}
                  <button
                    type="button"
                    onClick={async () => {
                      const seed = Math.random().toString(36).substring(2, 10);
                      const newUrl = `https://api.dicebear.com/9.x/lorelei/svg?seed=${seed}&backgroundColor=fde8ef,faf7f2,f4efeb`;
                      setCustomAvatarPhoto(newUrl);
                      propSetUserAvatarUrl?.(newUrl);
                      if (supabaseUser?.id) {
                        await updateUserProfile(supabaseUser.id, { avatarUrl: newUrl }).catch(() => {});
                      }
                      showToast('New avatar generated');
                    }}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-white border border-stone-200 shadow-xs flex items-center justify-center text-stone-600 hover:text-[#E0246A] transition cursor-pointer"
                    title="Randomize avatar"
                  >
                    <Dices className="w-3 h-3" />
                  </button>
                </div>

                {/* Identity Info */}
                <div className="min-w-0 space-y-1">
                  <h2 className="text-base sm:text-lg font-semibold text-stone-900 truncate leading-tight">
                    {userName}
                  </h2>
                  <p className="text-xs text-stone-500 font-mono truncate max-w-[200px] sm:max-w-xs">
                    {userEmail || 'Guest studio session'}
                  </p>
                  <div className="pt-0.5">
                    {isUserVip ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-pink-50 text-[#E0246A] border border-[#FCE7F3] text-[10px] font-semibold inline-flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5 fill-[#E0246A]" />
                        <span>VIP Tier</span>
                      </span>
                    ) : isUserPro ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-pink-50 text-[#E0246A] border border-[#FCE7F3] text-[10px] font-semibold inline-flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Pro Plan</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200 text-[10px] font-medium inline-flex items-center gap-1">
                        <span>Free Plan</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={async () => {
                    const seed = Math.random().toString(36).substring(2, 10);
                    const newUrl = `https://api.dicebear.com/9.x/lorelei/svg?seed=${seed}&backgroundColor=fde8ef,faf7f2,f4efeb`;
                    setCustomAvatarPhoto(newUrl);
                    propSetUserAvatarUrl?.(newUrl);
                    if (supabaseUser?.id) {
                      await updateUserProfile(supabaseUser.id, { avatarUrl: newUrl }).catch(() => {});
                    }
                    showToast('New avatar generated');
                  }}
                  className="h-9 px-3.5 rounded-xl border border-stone-200/80 hover:border-pink-300 bg-pink-50/60 hover:bg-pink-50 text-[#E0246A] text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-2xs"
                  title="Generate random avatar"
                >
                  <Dices className="w-3.5 h-3.5" />
                  <span>Randomize</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNameInput(userName);
                    setEmailInput(userEmail);
                    setIsEditProfileOpen(true);
                  }}
                  className="h-9 px-4 rounded-xl border border-stone-200/80 hover:bg-stone-50 text-xs font-semibold text-stone-700 transition cursor-pointer flex items-center justify-center active:scale-95 shadow-2xs"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>

          {/* Card: Plan & Credits Station */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isUserVip || isUserPro ? 'bg-pink-50 text-[#E0246A]' : 'bg-stone-100 text-stone-600'}`}>
                  {isUserVip || isUserPro ? <Crown className="w-4 h-4 fill-[#E0246A]" /> : <Crown className="w-4 h-4 text-stone-500" />}
                </div>
                <div>
                  <span className="text-xs font-semibold text-stone-900 block leading-tight">
                    {isUserVip ? 'VIP Member (Unlimited)' : isUserPro ? 'Pro Member' : 'Free Plan'}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {isUserVip || isUserPro ? 'Unlimited high-definition virtual try-ons' : `${displayCredits} try-on credits remaining`}
                  </span>
                </div>
              </div>

              {isUserVip || isUserPro ? (
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1 shrink-0">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Unlimited</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsPaywallOpen(true)}
                  className="h-8 px-3 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 shadow-xs active:scale-95"
                >
                  <Crown className="w-3 h-3" />
                  <span>Upgrade to Pro</span>
                </button>
              )}
            </div>

            {/* Pricing Highlights for Free Users */}
            {!isUserPro && !isUserVip && (
              <div className="pt-3.5 border-t border-stone-100 grid grid-cols-3 gap-2 text-center">
                <div
                  onClick={() => setIsPaywallOpen(true)}
                  className="pt-3 pb-2.5 px-2 rounded-xl bg-stone-50 hover:bg-pink-50/50 border border-stone-200/60 transition cursor-pointer"
                >
                  <div className="text-[10px] text-stone-500">Monthly</div>
                  <div className="text-xs font-bold text-stone-900 mt-0.5">$7<span className="text-[9px] font-normal text-stone-400">/mo</span></div>
                </div>
                <div
                  onClick={() => setIsPaywallOpen(true)}
                  className="pt-3 pb-2.5 px-2 rounded-xl bg-pink-50/70 hover:bg-pink-50 border border-pink-200 transition cursor-pointer relative"
                >
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#E0246A] text-white text-[8px] font-bold whitespace-nowrap leading-none">
                    POPULAR
                  </span>
                  <div className="text-[10px] text-stone-600">6 Months</div>
                  <div className="text-xs font-bold text-[#E0246A] mt-0.5">$29</div>
                  <div className="text-[9px] text-stone-400">$4.83/mo</div>
                </div>
                <div
                  onClick={() => setIsPaywallOpen(true)}
                  className="pt-3 pb-2.5 px-2 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-200 transition cursor-pointer relative"
                >
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[8px] font-bold whitespace-nowrap leading-none">
                    BEST VALUE
                  </span>
                  <div className="text-[10px] text-stone-600">Yearly</div>
                  <div className="text-xs font-bold text-emerald-700 mt-0.5">$49</div>
                  <div className="text-[9px] text-stone-400">$4.08/mo</div>
                </div>
              </div>
            )}
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
                    Render manicures on your hand
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
                  className="py-6 px-4 w-full rounded-2xl border border-dashed border-stone-300/80 bg-stone-50/50 hover:bg-pink-50/20 hover:border-[#E0246A]/50 transition cursor-pointer flex flex-col items-center justify-center text-center space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-white text-[#E0246A] flex items-center justify-center shadow-xs border border-stone-200/60 group-hover:scale-105 transition-transform">
                    <Hand className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-stone-900">Your Hand Photo</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Upload once to try on any manicure in 1 tap
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                  <button
                    type="button"
                    onClick={() => handFileInputRef.current?.click()}
                    className="h-10 px-3 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCameraCaptureOpen(true)}
                    className="h-10 px-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs hover:border-stone-300 active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#E0246A]" />
                    <span>Live Camera</span>
                  </button>
                </div>
              </div>
            )}
          </div>

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
              onClick={() => setIsSignOutModalOpen(true)}
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

        {/* ===================================================================
            RIGHT COLUMN (6 Cols): Saved Moodboard Shortcut & Studio Preferences
            =================================================================== */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-5">
          {/* Card 1: Saved Looks Shortcut to Full Moodboard */}
          <button
            type="button"
            onClick={() => setCurrentView('favorites')}
            className="w-full p-4 sm:p-5 rounded-3xl bg-white hover:bg-stone-50/80 border border-stone-200/80 shadow-2xs flex items-center justify-between gap-3 transition group cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 min-w-0">
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
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Your bookmarked nail styles
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-[#E0246A] shrink-0">
              <span>Moodboard</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* Card 2: Notifications Preferences */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-2xs">
            <div className="w-full flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                  <Bell className="w-4.5 h-4.5" />
                </div>
                <div className="text-left min-w-0">
                  <span className="text-xs font-semibold text-stone-900 block leading-tight">
                    Seasonal Drops & Updates
                  </span>
                  <span className="text-[11px] text-stone-500 block mt-0.5">
                    New drops, colors & studio updates
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
          </div>
        </div>
      )}

      {/* Always-mounted file input for Hand Photo Upload (accessible from both Settings card and Modal) */}
      <input
        type="file"
        ref={handFileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) {
            handleHandPhotoSelected(file);
          }
        }}
      />

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
                    readOnly={Boolean(supabaseUser?.id)}
                    placeholder={supabaseUser?.id ? '' : 'Guest studio session (optional)'}
                    className={`w-full pl-9 pr-3 h-10 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none ${
                      supabaseUser?.id
                        ? 'bg-stone-50 text-stone-500 cursor-not-allowed'
                        : 'text-stone-900 focus:border-[#E0246A] focus:ring-1 focus:ring-[#E0246A]'
                    }`}
                  />
                </div>
                {supabaseUser?.id && (
                  <p className="text-[10px] text-stone-400 mt-1">
                    Verified sign-in email cannot be changed here.
                  </p>
                )}
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

      {/* Sign Out Confirmation Modal */}
      {isSignOutModalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsSignOutModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-xs p-5 shadow-xl border border-stone-200/80 text-center space-y-3.5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="font-semibold text-stone-900 text-sm">
                Sign out?
              </h3>
              <p className="text-xs text-stone-500 leading-normal">
                Your saved manicures and hand photo are safely stored.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsSignOutModalOpen(false)}
                className="h-9 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer transition active:scale-95"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={async () => {
                  setIsSignOutModalOpen(false);
                  try {
                    await signOutUser();
                  } catch (e) {
                    console.warn('Sign out error:', e);
                  }
                  showToast('Signed out successfully');
                  if (onLogout) onLogout();
                }}
                className="h-9 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer transition active:scale-95 shadow-xs"
              >
                Sign Out
              </button>
            </div>
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

      {/* Pro Subscription Paywall Modal */}
      <ProPaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onSuccess={() => {
          setIsPaywallOpen(false);
          showToast('Pro Access activated! Enjoy unlimited try-ons.');
        }}
      />
      {/* In-App Fullscreen Lightbox for Try-On History */}
      {fullscreenHistoryItem && (
        <div
          onClick={() => setFullscreenHistoryItem(null)}
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full flex flex-col items-center gap-3"
          >
            <div className="w-full flex items-center justify-between gap-2">
              <span className="text-xs text-white/75 font-mono">
                {new Date(fullscreenHistoryItem.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch(fullscreenHistoryItem.image_url);
                      const blob = await res.blob();
                      const blobUrl = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = blobUrl;
                      link.download = `finglora-tryon-${fullscreenHistoryItem.id.slice(0, 6)}.jpg`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(blobUrl);
                      showToast('Photo downloaded');
                    } catch {
                      window.open(fullscreenHistoryItem.image_url, '_blank');
                    }
                  }}
                  className="h-9 px-3.5 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFullscreenHistoryItem(null)}
                  className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
                  aria-label="Close fullscreen preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="w-full rounded-3xl overflow-hidden bg-stone-950 border border-white/10 shadow-2xl">
              <img
                src={fullscreenHistoryItem.image_url}
                alt="Applied Try-On Fullscreen"
                className="w-full max-h-[78vh] object-contain mx-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
