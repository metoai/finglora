'use client';

import React from 'react';
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
  Sparkles,
} from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { NailShape } from '@/types/nail';
import { CustomerRoute } from './CustomerSidebar';

export interface CustomerTopBarProps {
  currentRoute: CustomerRoute;
  onNavigate: (route: CustomerRoute) => void;
  onBrandClick: () => void;
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
}: CustomerTopBarProps) {
  const routeBreadcrumbs: Record<CustomerRoute, string> = {
    home: 'Home',
    explore: 'Explore',
    tryon: 'Try On',
    'ai-create': 'Studio',
    studio: 'Studio',
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
    { id: 'ai-create', label: 'Studio', Icon: Paintbrush },
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
    { id: 'ai-create', label: 'Studio', Icon: Paintbrush },
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
              (id === 'ai-create' && (currentRoute === 'ai-create' || (currentRoute as string) === 'studio'));

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
            <Sparkles className="w-3.5 h-3.5 text-[#E0246A]" />
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

          {/* Monogram Avatar / Profile Button (Desktop) */}
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className={`hidden md:flex w-8.5 h-8.5 rounded-full items-center justify-center text-xs font-semibold transition cursor-pointer border ${
              currentRoute === 'profile'
                ? 'border-[#E0246A] ring-2 ring-[#E0246A]/20 bg-[#FDE8EF] text-[#E0246A]'
                : 'border-stone-200/80 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50'
            }`}
            title="Profile & Settings"
          >
            {userInitials}
          </button>

          {/* Mobile Right Controls */}
          <div className="md:hidden flex items-center gap-1.5">
            {/* Quick Saved button if favorites exist */}
            {favoritesCount > 0 && (
              <button
                type="button"
                onClick={() => onNavigate('favorites')}
                className={`w-8.5 h-8.5 rounded-full flex items-center justify-center transition border ${
                  currentRoute === 'favorites'
                    ? 'border-[#E0246A] bg-[#FDE8EF] text-[#E0246A]'
                    : 'border-stone-200 bg-white text-stone-700'
                }`}
                aria-label="Saved designs"
              >
                <Heart className="w-4 h-4 text-[#E0246A]" fill="#E0246A" />
              </button>
            )}

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
              (id === 'ai-create' && (currentRoute === 'ai-create' || (currentRoute as string) === 'studio'));

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
        </div>
      )}
    </header>
  );
}
