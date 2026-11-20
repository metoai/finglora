'use client';

import React from 'react';
import {
  Home,
  Compass,
  Hand,
  Heart,
  Paintbrush,
  User,
} from 'lucide-react';
import { Finger, NailDesign } from '@/types/nail';
import { BrandLogo } from '@/components/common/BrandLogo';

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

interface NavItem {
  id: CustomerRoute;
  label: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: number | string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function CustomerSidebar({
  currentRoute,
  onNavigate,
  onBrandClick,
  favoritesCount = 0,
}: {
  currentRoute: CustomerRoute;
  onNavigate: (route: CustomerRoute) => void;
  activeSetName?: string;
  activePhotoUrl?: string;
  nails?: Record<Finger, NailDesign>;
  onBrandClick: () => void;
  favoritesCount?: number;
}) {
  const sections: NavSection[] = [
    {
      title: 'ATELIER',
      items: [
        { id: 'home', label: 'Home', Icon: Home },
        { id: 'tryon', label: 'Try On', Icon: Hand },
        { id: 'explore', label: 'Explore', Icon: Compass },
      ],
    },
    {
      title: 'STUDIO & PROFILE',
      items: [
        { id: 'ai-create', label: 'Studio', Icon: Paintbrush },
        { id: 'favorites', label: 'Saved', Icon: Heart, badge: favoritesCount > 0 ? favoritesCount : undefined },
        { id: 'profile', label: 'Profile', Icon: User },
      ],
    },
  ];

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[#FAFAFA] border-r border-[rgba(31,26,28,0.08)] px-3.5 py-5 justify-between z-20 select-none">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="px-2 pt-1 pb-1">
          <button
            type="button"
            onClick={onBrandClick}
            className="flex items-center text-left w-full group focus:outline-none cursor-pointer"
          >
            <BrandLogo />
          </button>
        </div>

        {/* Navigation with Sections and Titles */}
        <nav className="flex flex-col gap-4">
          {sections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-2.5 pb-1">
                <span className="text-[10px] font-mono font-medium tracking-wider uppercase text-[#8C8085]">
                  {section.title}
                </span>
              </div>

              <div className="flex flex-col gap-[2px]">
                {section.items.map(({ id, label, Icon, badge }) => {
                  const active =
                    currentRoute === id ||
                    (id === 'tryon' && (currentRoute === 'tryon' || currentRoute === 'upload')) ||
                    (id === 'ai-create' && (currentRoute === 'ai-create' || (currentRoute as string) === 'studio'));
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onNavigate(id)}
                      className={`w-full h-9 px-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 flex items-center justify-between group ${
                        active
                          ? 'bg-[#FFFFFF] text-[#E0246A] shadow-xs border border-[rgba(31,26,28,0.06)]'
                          : 'text-[#61565A] hover:text-[#18181B] hover:bg-[#F4F4F5]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-4 h-4 flex items-center justify-center transition-colors ${
                            active ? 'text-[#E0246A]' : 'text-[#8C8085] group-hover:text-[#18181B]'
                          }`}
                        >
                          <Icon className="w-4 h-4" strokeWidth={1.5} />
                        </div>
                        <span className="truncate">{label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {badge !== undefined && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                              active
                                ? 'bg-[#FDE8EF] text-[#E0246A] font-semibold'
                                : 'bg-stone-200/70 text-stone-600'
                            }`}
                          >
                            {badge}
                          </span>
                        )}
                        {active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E0246A]" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Section: Quiet Studio Signature */}
      <div className="pt-4 border-t border-[rgba(31,26,28,0.06)] px-2">
        <span className="text-[11px] font-mono tracking-wider text-stone-400 uppercase">
          Finglora Atelier
        </span>
      </div>
    </aside>
  );
}
