'use client';

import React from 'react';
import {
  Home,
  Compass,
  Hand,
  Paintbrush,
  Heart,
  User,
  Settings,
  Camera,
} from 'lucide-react';
import { Finger, NailDesign, NailShape } from '@/types/nail';
import { BrandLogoIcon } from '@/components/common/BrandLogo';

export type CustomerRoute =
  | 'home'
  | 'explore'
  | 'upload'
  | 'tryon'
  | 'ai-create'
  | 'passport'
  | 'profile'
  | 'favorites'
  | 'history'
  | 'signup';

export interface CustomerSidebarProps {
  currentRoute: CustomerRoute;
  onNavigate: (route: CustomerRoute) => void;
  onBrandClick: () => void;
  favoritesCount?: number;
  userName?: string;
  avatarUrl?: string | null;
  preferredShape?: NailShape;
  activeSetName?: string;
  activePhotoUrl?: string;
  nails?: Record<Finger, NailDesign>;
}

export function CustomerSidebar({
  currentRoute,
  onNavigate,
  onBrandClick,
  favoritesCount = 0,
  userName = 'Flora',
  avatarUrl = null,
}: CustomerSidebarProps) {
  const isHomeActive = currentRoute === 'home';
  const isExploreActive = currentRoute === 'explore';
  const isTryOnActive = currentRoute === 'tryon' || currentRoute === 'upload';
  const isStudioActive = currentRoute === 'ai-create';
  const isFavoritesActive = currentRoute === 'favorites';
  const isHistoryActive = currentRoute === 'history';
  const isProfileActive = currentRoute === 'profile';

  const nameParts = (userName || '').trim().split(/\s+/).filter(Boolean);
  const userInitials =
    nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      : nameParts[0]
      ? nameParts[0].slice(0, 2).toUpperCase()
      : 'FL';

  const [avatarLoadError, setAvatarLoadError] = React.useState(false);

  React.useEffect(() => {
    setAvatarLoadError(false);
  }, [avatarUrl]);

  return (
    <aside
      className="hidden md:flex w-14 sm:w-16 flex-col fixed inset-y-0 left-0 bg-white border-r border-stone-200/60 py-3.5 justify-between items-center z-40 select-none"
      aria-label="Studio Navigation"
    >
      {/* Top: Brand Logo */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={onBrandClick}
          className="w-10 h-10 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200/80 flex items-center justify-center transition-all cursor-pointer group active:scale-95 shadow-2xs p-1"
          title="Finglora Home"
        >
          <BrandLogoIcon size="md" className="w-7 h-7" />
        </button>
      </div>

      {/* Center: Reverted Finglora Studio Icons (Home, Explore, Try On, AI Studio, Saved) */}
      <nav className="flex flex-col items-center gap-2">
        {/* Home */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer relative group ${
            isHomeActive
              ? 'text-stone-950 font-bold bg-stone-100'
              : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
          }`}
          title="Home"
          aria-label="Home"
        >
          <Home className="w-5.5 h-5.5" strokeWidth={isHomeActive ? 2.25 : 1.75} />
          <span className="absolute left-14 px-2.5 py-1 bg-stone-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
            Home
          </span>
        </button>

        {/* Explore */}
        <button
          type="button"
          onClick={() => onNavigate('explore')}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer relative group ${
            isExploreActive
              ? 'text-stone-950 font-bold bg-stone-100'
              : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
          }`}
          title="Explore Manicures"
          aria-label="Explore Manicures"
        >
          <Compass className="w-5.5 h-5.5" strokeWidth={isExploreActive ? 2.25 : 1.75} />
          <span className="absolute left-14 px-2.5 py-1 bg-stone-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
            Explore
          </span>
        </button>

        {/* Try On (Reverted Hand Icon) */}
        <button
          type="button"
          onClick={() => onNavigate('tryon')}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer relative group ${
            isTryOnActive
              ? 'text-[#E0246A] font-bold bg-[#FDE8EF]'
              : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
          }`}
          title="Virtual Try-On"
          aria-label="Virtual Try-On"
        >
          <Hand className="w-5.5 h-5.5" strokeWidth={isTryOnActive ? 2.25 : 1.75} />
          <span className="absolute left-14 px-2.5 py-1 bg-stone-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
            Try On
          </span>
        </button>

        {/* AI Studio (Reverted Paintbrush Icon) */}
        <button
          type="button"
          onClick={() => onNavigate('ai-create')}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer relative group ${
            isStudioActive
              ? 'text-stone-950 font-bold bg-stone-100'
              : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
          }`}
          title="AI Studio"
          aria-label="AI Studio"
        >
          <Paintbrush className="w-5.5 h-5.5" strokeWidth={isStudioActive ? 2.25 : 1.75} />
          <span className="absolute left-14 px-2.5 py-1 bg-stone-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
            AI Studio
          </span>
        </button>

        {/* Saved (Reverted Heart Icon) */}
        <button
          type="button"
          onClick={() => onNavigate('favorites')}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer relative group ${
            isFavoritesActive
              ? 'text-stone-950 font-bold bg-stone-100'
              : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
          }`}
          title="Saved Looks"
          aria-label="Saved Looks"
        >
          <Heart
            className="w-5.5 h-5.5"
            strokeWidth={isFavoritesActive ? 2.25 : 1.75}
            fill={isFavoritesActive ? 'currentColor' : 'none'}
          />
          {favoritesCount > 0 && (
            <span className="absolute top-1 right-1 px-1 min-w-3.5 h-3.5 rounded-full bg-[#E0246A] text-white text-[9px] font-bold flex items-center justify-center">
              {favoritesCount}
            </span>
          )}
          <span className="absolute left-14 px-2.5 py-1 bg-stone-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
            Saved ({favoritesCount})
          </span>
        </button>

        {/* Try-On History (Camera Icon) */}
        <button
          type="button"
          onClick={() => onNavigate('history')}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer relative group ${
            isHistoryActive
              ? 'text-stone-950 font-bold bg-stone-100'
              : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
          }`}
          title="Try-On History"
          aria-label="Try-On History"
        >
          <Camera
            className="w-5.5 h-5.5"
            strokeWidth={isHistoryActive ? 2.25 : 1.75}
          />
          <span className="absolute left-14 px-2.5 py-1 bg-stone-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
            Try-On History
          </span>
        </button>
      </nav>

      {/* Bottom: Profile & Settings */}
      <div className="flex flex-col items-center gap-2">
        {/* User Profile */}
        <button
          type="button"
          onClick={() => onNavigate('profile')}
          className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-xs font-semibold transition cursor-pointer relative group border ${
            isProfileActive
              ? 'border-[#E0246A] ring-2 ring-[#E0246A]/20 bg-[#FDE8EF]'
              : 'border-stone-200 bg-stone-100 hover:border-stone-300'
          }`}
          title="Profile"
          aria-label="Profile"
        >
          {avatarUrl && !avatarLoadError ? (
            <img
              src={avatarUrl}
              alt={userName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={() => setAvatarLoadError(true)}
            />
          ) : (
            <span className="text-stone-700">{userInitials}</span>
          )}
          <span className="absolute left-14 px-2.5 py-1 bg-stone-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
            Profile
          </span>
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={() => onNavigate('profile')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-950 hover:bg-stone-100 transition cursor-pointer relative group"
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" strokeWidth={1.75} />
          <span className="absolute left-14 px-2.5 py-1 bg-stone-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
            Settings
          </span>
        </button>
      </div>
    </aside>
  );
}
