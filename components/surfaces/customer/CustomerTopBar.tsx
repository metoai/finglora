'use client';

import React, { useState, useEffect } from 'react';
import {
  Home,
  Compass,
  Hand,
  Paintbrush,
  Heart,
  User,
  Menu,
  X,
  ChevronRight,
  Bell,
  Palette,
  Check,
  LogOut,
} from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { signOutUser } from '@/lib/services/auth';
import { NailShape } from '@/types/nail';
import { CustomerRoute } from './CustomerSidebar';

export interface CustomerTopBarProps {
  currentRoute: CustomerRoute;
  onNavigate: (route: CustomerRoute) => void;
  onBrandClick: () => void;
  onLogout?: () => void;
  favoritesCount?: number;
  userName?: string;
  preferredShape?: NailShape;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CustomerTopBar({
  currentRoute,
  onNavigate,
  onBrandClick,
  favoritesCount = 0,
  userName = 'Flora',
  preferredShape = 'almond',
  mobileMenuOpen,
  setMobileMenuOpen,
  onLogout,
}: CustomerTopBarProps) {
  const routeBreadcrumbs: Record<CustomerRoute, string> = {
    home: 'Home',
    explore: 'Explore',
    tryon: 'Try On',
    'ai-create': 'AI Studio',
    passport: 'Passport',
    upload: 'Try On',
    favorites: 'Saved',
    profile: 'Profile',
    signup: 'Create Account',
  };

  const navLinks: {
    id: CustomerRoute;
    label: string;
    Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    badge?: number;
  }[] = [
    { id: 'home', label: 'Home', Icon: Home },
    { id: 'tryon', label: 'Try On', Icon: Hand },
    { id: 'explore', label: 'Explore', Icon: Compass },
    { id: 'ai-create', label: 'AI Studio', Icon: Paintbrush },
    {
      id: 'favorites',
      label: 'Saved',
      Icon: Heart,
      badge: favoritesCount > 0 ? favoritesCount : undefined,
    },
  ];

  const allDrawerItems: {
    id: CustomerRoute;
    label: string;
    Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    badge?: number;
  }[] = [
    { id: 'home', label: 'Home', Icon: Home },
    { id: 'tryon', label: 'Try On', Icon: Hand },
    { id: 'explore', label: 'Explore', Icon: Compass },
    { id: 'ai-create', label: 'AI Studio', Icon: Paintbrush },
    {
      id: 'favorites',
      label: 'Saved',
      Icon: Heart,
      badge: favoritesCount > 0 ? favoritesCount : undefined,
    },
    { id: 'profile', label: 'Profile & Settings', Icon: User },
  ];

  const userInitials = userName && userName.trim()
    ? userName.trim().slice(0, 2).toUpperCase()
    : 'FL';

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  interface TopBarNotification {
    id: string;
    title: string;
    description: string;
    time: string;
    read: boolean;
    type: 'silhouette' | 'trend' | 'hand' | 'atelier';
    route?: CustomerRoute;
  }

  const defaultNotifications: TopBarNotification[] = [
    {
      id: 'notif-1',
      title: 'Studio Ready',
      description: `Your ${preferredShape} shape is set and ready to try on any look.`,
      time: 'Just now',
      read: false,
      type: 'silhouette',
      route: 'tryon',
    },
    {
      id: 'notif-2',
      title: 'Trending Looks Added',
      description: 'Glazed Chrome & Micro French sets added to explore.',
      time: '1h ago',
      read: false,
      type: 'trend',
      route: 'explore',
    },
    {
      id: 'notif-3',
      title: 'Hand Photo Saved',
      description: 'Your hand is saved for 1-tap virtual try-on anytime.',
      time: 'Today',
      read: true,
      type: 'hand',
      route: 'tryon',
    },
  ];

  const [notifications, setNotifications] = useState<TopBarNotification[]>(defaultNotifications);

  useEffect(() => {
    const updateAvatar = () => {
      if (typeof window !== 'undefined') {
        const custom = localStorage.getItem('finglora_custom_avatar_photo');
        if (custom) {
          setAvatarUrl(custom);
          return;
        }
        const saved = localStorage.getItem('finglora_avatar_url');
        if (saved) {
          setAvatarUrl(saved);
          return;
        }
        const seed = localStorage.getItem('finglora_avatar_seed') || 'Vivian';
        setAvatarUrl(
          `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(seed)}&backgroundColor=fde8ef`
        );
      }
    };

    updateAvatar();
    window.addEventListener('storage', updateAvatar);
    window.addEventListener('finglora_avatar_updated', updateAvatar);
    return () => {
      window.removeEventListener('storage', updateAvatar);
      window.removeEventListener('finglora_avatar_updated', updateAvatar);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedRead = localStorage.getItem('finglora_notifications_read_ids');
        const readIds: string[] = savedRead ? JSON.parse(savedRead) : [];
        setNotifications(
          defaultNotifications.map((n) => ({
            ...n,
            read: readIds.includes(n.id) || n.read,
          }))
        );
      } catch {
        // Fallback to default state
      }
    }
  }, [currentRoute, preferredShape]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'finglora_notifications_read_ids',
        JSON.stringify(updated.map((n) => n.id))
      );
    }
  };

  const handleNotificationClick = (notif: TopBarNotification) => {
    const updated = notifications.map((n) =>
      n.id === notif.id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    if (typeof window !== 'undefined') {
      try {
        const savedRead = localStorage.getItem('finglora_notifications_read_ids');
        const readIds: string[] = savedRead ? JSON.parse(savedRead) : [];
        if (!readIds.includes(notif.id)) {
          readIds.push(notif.id);
          localStorage.setItem(
            'finglora_notifications_read_ids',
            JSON.stringify(readIds)
          );
        }
      } catch {
        // Safe ignore
      }
    }
    setIsNotificationsOpen(false);
    if (notif.route) {
      onNavigate(notif.route);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[rgba(31,26,28,0.06)] shadow-2xs select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onBrandClick}
            className="flex items-center text-left focus:outline-none cursor-pointer group"
            aria-label="Finglora Home"
          >
            <BrandLogo size="sm" />
          </button>

          {/* Mobile active breadcrumb */}
          <div className="md:hidden flex items-center gap-1.5 text-xs">
            <span className="text-[#8C8085]/60 font-mono">/</span>
            <span className="font-semibold text-stone-900">
              {routeBreadcrumbs[currentRoute] || 'Home'}
            </span>
          </div>
        </div>

        {/* Center: Desktop Luxury Segmented Navigation Pills */}
        <nav className="hidden md:flex items-center bg-stone-100/80 p-1 rounded-full border border-stone-200/60 shadow-2xs">
          {navLinks.map(({ id, label, Icon, badge }) => {
            const active =
              currentRoute === id ||
              (id === 'tryon' && (currentRoute === 'tryon' || currentRoute === 'upload')) ||
              (id === 'ai-create' && currentRoute === 'ai-create');

            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                  active
                    ? 'bg-white text-stone-950 font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-950 hover:bg-white/60'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 transition-colors ${
                    active ? (id === 'tryon' ? 'text-[#E0246A]' : 'text-stone-900') : 'text-stone-500'
                  }`}
                  strokeWidth={active ? 2 : 1.75}
                />
                <span>{label}</span>

                {badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full leading-tight ${
                      active
                        ? 'bg-[#FDE8EF] text-[#E0246A] font-semibold'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {badge}
                  </span>
                )}

                {active && id === 'tryon' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E0246A]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions, Silhouette Pill & Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Silhouette Badge (Desktop) */}
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100/90 hover:bg-stone-200/70 border border-stone-200/70 text-xs font-medium text-stone-700 transition cursor-pointer"
            title="Your Preferred Silhouette"
          >
            <span className="w-2 h-2 rounded-full bg-[#E0246A] ring-2 ring-pink-100 shrink-0" />
            <span className="capitalize">{preferredShape}</span>
          </button>

          {/* Quick Action Try On (Desktop only when not on Try On) */}
          {currentRoute !== 'tryon' && currentRoute !== 'upload' && (
            <button
              type="button"
              onClick={() => onNavigate('tryon')}
              className="hidden sm:inline-flex items-center gap-1.5 h-8.5 px-3.5 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Hand className="w-3.5 h-3.5" />
              <span>Try On</span>
            </button>
          )}

          {/* Notification Button (Desktop) */}
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            className={`hidden md:flex relative w-8.5 h-8.5 rounded-full items-center justify-center transition border active:scale-95 cursor-pointer ${
              isNotificationsOpen
                ? 'border-[#E0246A] bg-[#FDE8EF] text-[#E0246A]'
                : 'border-stone-200/80 bg-white text-stone-700 hover:border-stone-300 hover:text-[#E0246A] hover:bg-stone-50'
            }`}
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E0246A] ring-2 ring-white" />
            )}
          </button>

          {/* Avatar / Profile Button (Desktop) */}
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className={`hidden md:flex w-8.5 h-8.5 rounded-full overflow-hidden items-center justify-center text-xs font-semibold transition cursor-pointer border ${
              currentRoute === 'profile'
                ? 'border-[#E0246A] ring-2 ring-[#E0246A]/20 bg-[#FDE8EF] text-[#E0246A]'
                : 'border-stone-200/80 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50'
            }`}
            title="Profile & Settings"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              userInitials
            )}
          </button>

          {/* Mobile Right Controls */}
          <div className="md:hidden flex items-center gap-1.5">
            {/* Working Notification Button (Mobile - Replaced old fav button) */}
            <button
              type="button"
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              className={`relative w-9 h-9 rounded-full flex items-center justify-center transition border active:scale-95 cursor-pointer shadow-2xs ${
                isNotificationsOpen
                  ? 'border-[#E0246A] bg-[#FDE8EF] text-[#E0246A]'
                  : 'border-[#F0DFE4] bg-white text-[#18181B] hover:text-[#E0246A] hover:border-[#E0246A]'
              }`}
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E0246A] ring-2 ring-white" />
              )}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="w-9 h-9 rounded-full bg-white border border-[#F0DFE4] text-[#18181B] hover:text-[#E0246A] hover:border-[#E0246A] flex items-center justify-center transition shadow-2xs cursor-pointer active:scale-95"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4 text-[#18181B]" />
              ) : (
                <Menu className="w-4 h-4 text-[#18181B]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#F0DFE4] px-4 py-3 space-y-1 shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
          {allDrawerItems.map(({ id, label, Icon, badge }) => {
            const active =
              currentRoute === id ||
              (id === 'tryon' && (currentRoute === 'tryon' || currentRoute === 'upload')) ||
              (id === 'ai-create' && currentRoute === 'ai-create');

            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onNavigate(id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full h-10 px-3 rounded-xl text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                  active
                    ? 'bg-[#FDE8EF] text-[#E0246A] font-semibold'
                    : 'text-stone-800 hover:text-[#E0246A] hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" strokeWidth={active ? 2 : 1.75} />
                  <span>{label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {badge !== undefined && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[#FDE8EF] text-[#E0246A] font-semibold">
                      {badge}
                    </span>
                  )}
                  <ChevronRight
                    className={`w-3.5 h-3.5 ${
                      active ? 'text-[#E0246A]' : 'text-stone-400'
                    }`}
                  />
                </div>
              </button>
            );
          })}

          {/* Sign Out Button in Mobile Menu */}
          <div className="pt-1.5 mt-1 border-t border-stone-100">
            <button
              type="button"
              onClick={async () => {
                setMobileMenuOpen(false);
                try {
                  await signOutUser();
                } catch (e) {
                  console.warn('Sign out error:', e);
                }
                if (onLogout) {
                  onLogout();
                } else {
                  window.location.href = '/';
                }
              }}
              className="w-full h-10 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50/70 transition flex items-center justify-between cursor-pointer active:scale-95"
            >
              <div className="flex items-center gap-2.5">
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Sign Out</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
            </button>
          </div>
        </div>
      )}

      {/* Working Notifications Modal / Popover */}
      {isNotificationsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center sm:justify-end sm:pr-6 sm:pt-16 p-3 sm:p-4 bg-stone-900/35 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsNotificationsOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-stone-200/90 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh] mt-2 sm:mt-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-3.5 sm:p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-pink-100/90 text-[#E0246A] flex items-center justify-center">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs sm:text-sm text-stone-900 leading-tight">
                    Notifications
                  </h3>
                  <p className="text-[10px] text-stone-400">
                    {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-[#E0246A] hover:underline cursor-pointer active:scale-95"
                  >
                    Mark read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer transition active:scale-95"
                  aria-label="Close notifications"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="p-2 sm:p-2.5 overflow-y-auto space-y-1.5 divide-y divide-stone-100/80">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-400">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3 rounded-xl sm:rounded-2xl transition cursor-pointer flex items-start gap-2.5 sm:gap-3 text-left ${
                      item.read
                        ? 'hover:bg-stone-50/80 opacity-75'
                        : 'bg-pink-50/40 hover:bg-pink-50/70 border border-pink-100/70'
                    }`}
                  >
                    <div
                      className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full shrink-0 flex items-center justify-center mt-0.5 ${
                        item.read
                          ? 'bg-stone-100 text-stone-500'
                          : 'bg-[#E0246A] text-white shadow-xs'
                      }`}
                    >
                      {item.type === 'silhouette' && <Hand className="w-3.5 h-3.5" />}
                      {item.type === 'trend' && <Compass className="w-3.5 h-3.5" />}
                      {item.type === 'hand' && <Check className="w-3.5 h-3.5" />}
                      {item.type === 'atelier' && <Palette className="w-3.5 h-3.5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={`text-xs font-semibold truncate ${
                            item.read ? 'text-stone-800' : 'text-stone-900'
                          }`}
                        >
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-stone-400 shrink-0 font-mono">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5 leading-snug line-clamp-2">
                        {item.description}
                      </p>
                      {item.route && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#E0246A] mt-1 hover:underline">
                          <span>Open in {routeBreadcrumbs[item.route] || 'App'}</span>
                          <ChevronRight className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>

                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-[#E0246A] shrink-0 mt-1.5 ring-2 ring-pink-100" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 sm:p-3 border-t border-stone-100 bg-stone-50/40 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsNotificationsOpen(false);
                  onNavigate('profile');
                }}
                className="text-[11px] font-medium text-stone-500 hover:text-[#E0246A] transition cursor-pointer"
              >
                Manage alert preferences in Settings →
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
