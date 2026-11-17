'use client';

import React from 'react';
import {
  Home,
  Compass,
  ImagePlus,
  Hand,
  ChevronRight,
  Heart,
  Paintbrush,
} from 'lucide-react';
import { Finger, NailDesign } from '@/types/nail';
import { FINGER_KEYS } from '@/constants/nail-data';
import { BrandLogo } from '@/components/common/BrandLogo';
import { NailCanvasPreview } from '@/components/visuals/NailCanvasPreview';

export type CustomerRoute =
  | 'home'
  | 'explore'
  | 'upload'
  | 'tryon'
  | 'ai-create'
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
  activeSetName,
  nails,
  onBrandClick,
  favoritesCount = 0,
}: {
  currentRoute: CustomerRoute;
  onNavigate: (route: CustomerRoute) => void;
  activeSetName: string;
  nails: Record<Finger, NailDesign>;
  onBrandClick: () => void;
  favoritesCount?: number;
}) {
  const sections: NavSection[] = [
    {
      title: 'DISCOVER',
      items: [
        { id: 'home', label: 'Home', Icon: Home },
        { id: 'explore', label: 'Explore', Icon: Compass },
        { id: 'favorites', label: 'Favorites', Icon: Heart, badge: favoritesCount > 0 ? favoritesCount : undefined },
      ],
    },
    {
      title: 'STUDIO',
      items: [
        { id: 'tryon', label: 'Try On', Icon: Hand },
        { id: 'ai-create', label: 'Create with AI', Icon: Paintbrush },
        { id: 'upload', label: 'Upload Photo', Icon: ImagePlus },
      ],
    },
  ];

  // Derive predominant shape and finish from nails
  const sampleNail = nails.index || nails.thumb;
  const currentShape = sampleNail?.shape || 'almond';
  const currentFinish = sampleNail?.finish || 'glossy';

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
                  const active = currentRoute === id;
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

      {/* Bottom Section: Active Set Mini Visualizer & Client Profile */}
      <div className="space-y-3 pt-4 border-t border-[rgba(31,26,28,0.08)]">
        {/* Active Set Card with Mini Procedural 5-Finger Tray */}
        <div
          onClick={() => onNavigate('tryon')}
          className="cursor-pointer bg-[#FFFFFF] rounded-2xl p-3 border border-[rgba(31,26,28,0.08)] shadow-2xs hover:border-[rgba(31,26,28,0.16)] transition-all group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#8C8085]">
              Active Set
            </span>
            <span className="text-[10px] font-medium text-[#E0246A] capitalize">
              {currentShape}
            </span>
          </div>
          <p className="text-xs font-medium text-[#18181B] truncate mb-2.5 group-hover:text-[#E0246A] transition-colors">
            {activeSetName}
          </p>

          {/* Mini Procedural 5-Finger Tray */}
          <div className="bg-[#FAFAFA] rounded-xl p-2 border border-[rgba(31,26,28,0.06)] grid grid-cols-5 gap-1 items-end justify-items-center">
            {FINGER_KEYS.map((fk) => {
              const nail = nails[fk];
              return (
                <div key={fk} className="flex flex-col items-center">
                  <NailCanvasPreview
                    nail={nail}
                    width={22}
                    height={34}
                    showCuticle={false}
                  />
                  <span className="text-[8px] font-mono text-[#8C8085] mt-1">
                    {fk.slice(0, 1).toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Profile / Account Link */}
        <button
          type="button"
          onClick={() => onNavigate('profile')}
          className={`w-full h-10 px-2.5 rounded-xl border transition-all flex items-center justify-between text-left group cursor-pointer ${
            currentRoute === 'profile'
              ? 'bg-[#FDE8EF] border-[#E0246A]/20 text-[#E0246A]'
              : 'bg-transparent hover:bg-[#F4F4F5] border-transparent hover:border-[rgba(31,26,28,0.06)]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-[#E0246A]/30 ring-1 ring-[#FAFAFA] shrink-0 bg-[#FDE8EF]">
              <img
                src="https://api.dicebear.com/9.x/lorelei/svg?seed=Elise&backgroundColor=fde8ef"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p
                className={`text-xs font-medium truncate transition-colors ${
                  currentRoute === 'profile'
                    ? 'text-[#E0246A] font-semibold'
                    : 'text-[#18181B] group-hover:text-[#E0246A]'
                }`}
              >
                Profile
              </p>
              <p className="text-[10px] text-[#8C8085] truncate capitalize">
                {currentShape} shape
              </p>
            </div>
          </div>
          <ChevronRight
            className={`w-3.5 h-3.5 transition-colors ${
              currentRoute === 'profile'
                ? 'text-[#E0246A]'
                : 'text-[#8C8085] group-hover:text-[#18181B]'
            }`}
            strokeWidth={1.5}
          />
        </button>
      </div>
    </aside>
  );
}
