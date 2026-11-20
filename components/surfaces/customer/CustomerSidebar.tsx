'use client';

import React from 'react';
import {
  Home,
  Compass,
  Hand,
  Heart,
  Paintbrush,
  Settings,
  Sparkles,
} from 'lucide-react';
import { Finger, NailDesign, NailShape } from '@/types/nail';

export type CustomerRoute =
  | 'home'
  | 'explore'
  | 'upload'
  | 'tryon'
  | 'ai-create'
  | 'studio'
  | 'passport'
  | 'profile'
  | 'favorites'
  | 'signup';

export interface CustomerSidebarProps {
  currentRoute: CustomerRoute;
  onNavigate: (route: CustomerRoute) => void;
  onBrandClick: () => void;
  favoritesCount?: number;
  userName?: string;
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
}: CustomerSidebarProps) {
  const isHomeActive = currentRoute === 'home';
  const isExploreActive = currentRoute === 'explore';
  const isTryOnActive = currentRoute === 'tryon' || currentRoute === 'upload';
  const isStudioActive = currentRoute === 'ai-create' || (currentRoute as string) === 'studio';
  const isFavoritesActive = currentRoute === 'favorites';
  const isProfileActive = currentRoute === 'profile';

  const userInitials = userName && userName.trim()
    ? userName.trim().slice(0, 2).toUpperCase()
    : 'FL';

  return (
    <aside
      className="hidden md:flex w-16 flex-col fixed inset-y-0 left-0 bg-white border-r border-stone-200/80 py-4 justify-between items-center z-40 select-none shadow-[1px_0_4px_rgba(0,0,0,0.02)]"
      aria-label="Atelier Navigation"
    >
      {/* Top: Finglora Brand Emblem */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={onBrandClick}
          className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-stone-100 transition-all cursor-pointer group relative active:scale-95"
          title="Finglora Home"
        >
          <div className="w-9 h-9 rounded-full bg-[#FDE8EF] border border-[#E0246A]/20 flex items-center justify-center text-[#E0246A] group-hover:scale-105 transition-transform">
            <span className="text-xl leading-none select-none -translate-y-[0.5px]">✿</span>
          </div>

          {/* Floating Tooltip */}
          <span className="absolute left-14 px-2 py-1 bg-stone-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
            Finglora Home
          </span>
        </button>
      </div>

      {/* Center: Pinterest-Style Icon Rail */}
      <nav className="flex flex-col items-center gap-3">
        {/* Home */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer relative group ${
            isHomeActive
              ? 'bg-stone-950 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
          }`}
          aria-label="Home"
        >
          <Home className="w-5 h-5" strokeWidth={isHomeActive ? 2 : 1.75} />
          <span className="absolute left-14 px-2 py-1 bg-stone-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
            Home
          </span>
        </button>

        {/* Explore (Feed / Inspo) */}
        <button
          type="button"
          onClick={() => onNavigate('explore')}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer relative group ${
            isExploreActive
              ? 'bg-stone-950 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
          }`}
          aria-label="Explore Manicures"
        >
          <Compass className="w-5 h-5" strokeWidth={isExploreActive ? 2 : 1.75} />
          <span className="absolute left-14 px-2 py-1 bg-stone-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
            Explore Pins
          </span>
        </button>

        {/* Try On (Prominent Action Button, like Pinterest's Create button) */}
        <button
          type="button"
          onClick={() => onNavigate('tryon')}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer relative group active:scale-95 shadow-xs ${
            isTryOnActive
              ? 'bg-[#E0246A] text-white ring-4 ring-[#E0246A]/20 shadow-md'
              : 'bg-[#E0246A] text-white hover:bg-[#BE185D] hover:shadow-md'
          }`}
          aria-label="Virtual Try-On"
        >
          <Hand className="w-5 h-5 text-white" strokeWidth={2} />
          <span className="absolute left-14 px-2 py-1 bg-stone-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
            Virtual Try-On
          </span>
        </button>

        {/* Studio / AI Create */}
        <button
          type="button"
          onClick={() => onNavigate('ai-create')}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer relative group ${
            isStudioActive
              ? 'bg-stone-950 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
          }`}
          aria-label="AI Studio"
        >
          <Paintbrush className="w-5 h-5" strokeWidth={isStudioActive ? 2 : 1.75} />
          <span className="absolute left-14 px-2 py-1 bg-stone-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
            AI Studio
          </span>
        </button>

        {/* Saved (Pins / Favorites) */}
        <button
          type="button"
          onClick={() => onNavigate('favorites')}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer relative group ${
            isFavoritesActive
              ? 'bg-stone-950 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
          }`}
          aria-label="Saved Designs"
        >
          <Heart
            className={`w-5 h-5 ${isFavoritesActive ? 'text-white' : 'text-stone-600'}`}
            strokeWidth={isFavoritesActive ? 2 : 1.75}
            fill={isFavoritesActive ? 'white' : 'none'}
          />
          {favoritesCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E0246A] text-white text-[9.5px] font-bold flex items-center justify-center border-2 border-white">
              {favoritesCount}
            </span>
          )}
          <span className="absolute left-14 px-2 py-1 bg-stone-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
            Saved Pins ({favoritesCount})
          </span>
        </button>
      </nav>

      {/* Bottom: Profile & Settings */}
      <div className="flex flex-col items-center gap-3">
        {/* Profile Monogram */}
        <button
          type="button"
          onClick={() => onNavigate('profile')}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition cursor-pointer relative group border ${
            isProfileActive
              ? 'border-[#E0246A] ring-2 ring-[#E0246A]/20 bg-[#FDE8EF] text-[#E0246A]'
              : 'border-stone-200 bg-stone-100 text-stone-700 hover:border-stone-300'
          }`}
          aria-label="Profile and Silhouette"
        >
          {userInitials}
          <span className="absolute left-14 px-2 py-1 bg-stone-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
            Profile & Settings
          </span>
        </button>

        {/* Settings Gear */}
        <button
          type="button"
          onClick={() => onNavigate('profile')}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-950 hover:bg-stone-100 transition cursor-pointer relative group ${
            isProfileActive ? 'text-stone-900' : ''
          }`}
          aria-label="Settings"
        >
          <Settings className="w-4.5 h-4.5" strokeWidth={1.75} />
          <span className="absolute left-14 px-2 py-1 bg-stone-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
            Settings
          </span>
        </button>
      </div>
    </aside>
  );
}
