'use client';

import React from 'react';
import {
  Home,
  Compass,
  Plus,
  Bell,
  MessageCircle,
  Settings,
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
}: CustomerSidebarProps) {
  const isHomeActive = currentRoute === 'home';
  const isExploreActive = currentRoute === 'explore';
  const isTryOnActive = currentRoute === 'tryon' || currentRoute === 'upload';
  const isStudioActive = currentRoute === 'ai-create' || (currentRoute as string) === 'studio';
  const isFavoritesActive = currentRoute === 'favorites';
  const isProfileActive = currentRoute === 'profile';

  return (
    <aside
      className="hidden md:flex w-14 sm:w-16 flex-col fixed inset-y-0 left-0 bg-white border-r border-stone-200/60 py-3.5 justify-between items-center z-40 select-none"
      aria-label="Atelier Navigation"
    >
      {/* Top: Red/Pink Pinterest-Style Circular Logo */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={onBrandClick}
          className="w-10 h-10 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white flex items-center justify-center transition-all cursor-pointer group active:scale-95 shadow-2xs"
          title="Finglora Home"
        >
          <span className="text-xl leading-none select-none font-bold -translate-y-[0.5px]">✿</span>
        </button>
      </div>

      {/* Center: Pinterest-Style Bare Icon Rail (No harsh black circles, uniform 44px buttons) */}
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

        {/* Explore (Feed / Inspo) */}
        <button
          type="button"
          onClick={() => onNavigate('explore')}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer relative group ${
            isExploreActive
              ? 'text-stone-950 font-bold bg-stone-100'
              : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
          }`}
          title="Explore Pins"
          aria-label="Explore Manicures"
        >
          <Compass className="w-5.5 h-5.5" strokeWidth={isExploreActive ? 2.25 : 1.75} />
          <span className="absolute left-14 px-2.5 py-1 bg-stone-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
            Explore Pins
          </span>
        </button>

        {/* Create / Action (+ Button like Pinterest) */}
        <button
          type="button"
          onClick={() => onNavigate('tryon')}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer relative group ${
            isTryOnActive
              ? 'text-stone-950 font-bold bg-stone-100'
              : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
          }`}
          title="Virtual Try-On"
          aria-label="Virtual Try-On"
        >
          <Plus className="w-6 h-6" strokeWidth={isTryOnActive ? 2.5 : 2} />
          <span className="absolute left-14 px-2.5 py-1 bg-stone-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
            Virtual Try-On
          </span>
        </button>

        {/* Notifications / Studio Updates */}
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
          <Bell className="w-5.5 h-5.5" strokeWidth={isStudioActive ? 2.25 : 1.75} />
          <span className="absolute -top-0.5 right-1.5 w-2 h-2 rounded-full bg-[#E0246A]" />
          <span className="absolute left-14 px-2.5 py-1 bg-stone-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
            AI Studio
          </span>
        </button>

        {/* Messages / Saved Pins */}
        <button
          type="button"
          onClick={() => onNavigate('favorites')}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer relative group ${
            isFavoritesActive
              ? 'text-stone-950 font-bold bg-stone-100'
              : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
          }`}
          title="Saved Pins"
          aria-label="Saved Designs"
        >
          <MessageCircle className="w-5.5 h-5.5" strokeWidth={isFavoritesActive ? 2.25 : 1.75} />
          {favoritesCount > 0 && (
            <span className="absolute top-1 right-1 px-1 min-w-3.5 h-3.5 rounded-full bg-[#E0246A] text-white text-[9px] font-bold flex items-center justify-center">
              {favoritesCount}
            </span>
          )}
          <span className="absolute left-14 px-2.5 py-1 bg-stone-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
            Saved Pins ({favoritesCount})
          </span>
        </button>
      </nav>

      {/* Bottom: Settings Gear */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => onNavigate('profile')}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition cursor-pointer relative group ${
            isProfileActive
              ? 'text-stone-950 bg-stone-100'
              : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
          }`}
          title="Settings & Profile"
          aria-label="Settings"
        >
          <Settings className="w-5.5 h-5.5" strokeWidth={1.75} />
          <span className="absolute left-14 px-2.5 py-1 bg-stone-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
            Settings & Profile
          </span>
        </button>
      </div>
    </aside>
  );
}
