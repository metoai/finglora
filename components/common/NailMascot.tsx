'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Paintbrush,
  SlidersHorizontal,
  Compass,
  CheckCircle2,
  BookmarkCheck,
  ChevronRight,
  X,
  Volume2,
  Gem,
  Award,
} from 'lucide-react';
import { NailShape } from '@/types/nail';

export type MascotMood = 'welcome' | 'calibrating' | 'tip' | 'tech_prep' | 'celebrating';

export interface NailMascotProps {
  mood?: MascotMood;
  customTitle?: string;
  customMessage?: string;
  // Aliases for compatibility across surfaces
  speech?: string;
  tagline?: string;
  subline?: string;
  preferredShape?: NailShape | string;
  size?: 'sm' | 'md' | 'lg' | 'hero' | string;
  variant?: 'card' | 'callout' | 'bubble' | 'floating' | 'banner' | string;
  compact?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  onAction?: () => void;
  actionLabel?: string;
}

interface MoodData {
  title: string;
  badge: string;
  message: string;
  secondaryTip: string;
  icon: React.ReactNode;
}

const MOOD_CONFIG: Record<MascotMood, MoodData> = {
  welcome: {
    title: 'Welcome to Finglora',
    badge: 'Flora',
    message:
      'Browse nail designs or create your own custom set. Every design is fitted to your natural hand and nail shape.',
    secondaryTip: 'Tap any finger in the studio to customize its shape, color, or finish.',
    icon: <Paintbrush className="w-4 h-4 text-[#E0246A]" strokeWidth={1.5} />,
  },
  calibrating: {
    title: 'Matching your style',
    badge: 'Flora',
    message:
      'Choosing the best colors for your skin tone. See how sheer neutrals and chrome look in natural light.',
    secondaryTip: 'Almond and oval shapes look great on almost every hand.',
    icon: <SlidersHorizontal className="w-4 h-4 text-[#E0246A]" strokeWidth={1.5} />,
  },
  tip: {
    title: 'Nail care tip',
    badge: 'Flora',
    message:
      'For almond nails, a slightly reinforced center helps keep longer nails strong and prevents breaking.',
    secondaryTip: 'Rub chrome powder gently over a shiny topcoat for the cleanest glazed finish.',
    icon: <Compass className="w-4 h-4 text-[#E0246A]" strokeWidth={1.5} />,
  },
  tech_prep: {
    title: 'Step-by-step recipe',
    badge: 'Flora',
    message:
      'Clean and buff nails, apply base coat, cure under LED light, and paint your chosen design coats.',
    secondaryTip: 'Always seal the tip of the nail on each coat to keep your polish from chipping.',
    icon: <CheckCircle2 className="w-4 h-4 text-[#E0246A]" strokeWidth={1.5} />,
  },
  celebrating: {
    title: 'Design saved',
    badge: 'Flora',
    message:
      'Your nails are ready! Save your design code or share it with your nail artist anytime.',
    secondaryTip: 'You can access all your saved sets from your Profile.',
    icon: <BookmarkCheck className="w-4 h-4 text-[#E0246A]" strokeWidth={1.5} />,
  },
};

export function NailMascot({
  mood = 'welcome',
  customTitle,
  customMessage,
  speech,
  tagline,
  subline,
  preferredShape,
  size = 'md',
  variant = 'card',
  compact = false,
  dismissible = false,
  onDismiss,
  className = '',
  onAction,
  actionLabel,
}: NailMascotProps) {
  const [showSecondary, setShowSecondary] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const config = MOOD_CONFIG[mood] || MOOD_CONFIG.welcome;

  // Resolve shape-specific tip if available
  let shapeTip = '';
  if (preferredShape) {
    switch (preferredShape) {
      case 'almond':
        shapeTip = 'Almond contours flatter elongated nail beds. Anchor the apex 35% from the cuticle to maintain slender tapered lateral walls.';
        break;
      case 'coffin':
        shapeTip = 'Coffin silhouettes require reinforced stress zones. Ensure straight horizontal free-edge filing parallel to the knuckle axis.';
        break;
      case 'oval':
        shapeTip = 'Oval silhouettes mirror your natural eponychium curve. A sheer rubber base preserves elegant symmetry on short to medium lengths.';
        break;
      case 'square':
        shapeTip = 'Square profiles demand crisp 90-degree lateral corners. Float a leveling apex builder to prevent edge rounding.';
        break;
      case 'stiletto':
        shapeTip = 'Stiletto tips focus stress along the central spine. Reinforce the longitudinal apex line for structural integrity.';
        break;
      default:
        break;
    }
  }

  const title = customTitle || tagline || config.title;
  const badge = tagline && !customTitle ? tagline : config.badge;
  const subtitle = subline || (preferredShape ? `Profile: ${preferredShape}` : "Flora's Notes");
  const primaryMessage = speech || customMessage || (preferredShape && mood === 'tip' && shapeTip ? shapeTip : config.message);
  const activeMessage = showSecondary ? (config.secondaryTip || primaryMessage) : primaryMessage;

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) onDismiss();
  };

  // HERO VARIANT (e.g. on Landing Surface "Meet Flora")
  if (size === 'hero' || variant === 'hero') {
    return (
      <aside
        aria-label="Flora Showcase"
        className={`relative bg-[#FFFFFF] border border-[#18181B]/08 rounded-3xl p-6 sm:p-10 shadow-[0_8px_32px_-4px_rgba(31,26,28,0.06)] overflow-hidden transition-all duration-300 hover:shadow-[0_16px_40px_-6px_rgba(31,26,28,0.1)] ${className}`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Portrait Column */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group">
              <div className="relative w-52 h-52 sm:w-64 sm:h-64 rounded-3xl overflow-hidden border border-[#E0246A]/20 ring-8 ring-[#FAFAFA] shadow-[0_8px_24px_-4px_rgba(31,26,28,0.1)] transition-transform duration-300 group-hover:scale-[1.02]">
                <Image
                  src="https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/brand/finglora_mascot.jpg"
                  alt="Flora, Finglora Assistant"
                  width={256}
                  height={256}
                  priority
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-3 -right-3 sm:bottom-2 sm:-right-4 px-3.5 py-1.5 rounded-full bg-[#E0246A] text-white text-[10.5px] font-medium tracking-wide uppercase border border-white/20 shadow-sm flex items-center gap-1.5">
                <Gem className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
                <span>Flora</span>
              </div>
            </div>
          </div>

          {/* Narrative Column */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDF2F8] border border-[#E0246A]/20 text-[#E0246A] text-[10.5px] font-medium tracking-wide uppercase">
              <Award className="w-3.5 h-3.5 text-[#E0246A]" strokeWidth={1.5} />
              <span>{subline || 'Personal Nail Assistant'}</span>
            </div>

            <h3
              className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#18181B] tracking-tight leading-[1.15]"
              style={{ fontFamily: 'var(--font-serif, "Cormorant Garamond", Georgia, serif)' }}
            >
              {title}
            </h3>

            <p className="text-sm sm:text-base text-[#61565A] font-normal leading-relaxed">
              {activeMessage}
            </p>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSecondary(!showSecondary)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#E0246A] hover:text-[#BE185D] py-2 transition-colors"
              >
                <span>{showSecondary ? 'Show primary philosophy' : 'Read Flora’s secret technique'}</span>
                <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // CALLOUT VARIANT (e.g. in Onboarding steps)
  if (variant === 'callout') {
    return (
      <aside
        aria-label="Flora Atelier Callout"
        className={`relative bg-[#FFFFFF] border border-[#18181B]/08 rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_-2px_rgba(31,26,28,0.04)] flex items-start gap-4 transition-all hover:border-[#18181B]/14 ${className}`}
      >
        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#C59B27]/40 ring-2 ring-[#FAFAFA] shrink-0">
          <Image
            src="https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/brand/finglora_mascot.jpg"
            alt="Flora, Finglora Nail Muse"
            width={48}
            height={48}
            className="w-full h-full object-cover object-top"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#E0246A] ring-1 ring-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#E0246A]">
              {badge}
            </span>
            {subline && (
              <span className="text-[10px] text-[#7B7075] uppercase tracking-wider hidden sm:inline">
                {subline}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-[13px] text-[#18181B] font-normal leading-relaxed mt-1">
            {activeMessage}
          </p>
        </div>
      </aside>
    );
  }

  // FLOATING PILL VARIANT
  if (variant === 'floating') {
    return (
      <aside
        aria-label="Flora Atelier Muse"
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 p-2 pr-4 bg-[#FFFFFF] border border-[#18181B]/10 rounded-full shadow-[0_8px_24px_-4px_rgba(31,26,28,0.12)] transition-all duration-200 hover:-translate-y-0.5 ${className}`}
      >
        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#C59B27]/40 ring-2 ring-[#FAFAFA] shrink-0">
          <Image
            src="https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/brand/finglora_mascot.jpg"
            alt="Flora, Finglora Nail Muse"
            width={40}
            height={40}
            className="w-full h-full object-cover object-top"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#E0246A] ring-1 ring-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7B7075] leading-none">
            {badge}
          </span>
          <p className="text-[12px] font-medium text-[#18181B] line-clamp-1 leading-snug mt-0.5">
            {title}
          </p>
        </div>
      </aside>
    );
  }

  // BANNER VARIANT
  if (variant === 'banner') {
    return (
      <aside
        aria-label="Flora Atelier Muse"
        className={`w-full bg-[#FAFAFA] border border-[#18181B]/08 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 transition-all ${className}`}
      >
        <div className="flex items-center gap-3.5">
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-[#C59B27]/40 ring-2 ring-[#FAFAFA] shrink-0">
            <Image
              src="https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/brand/finglora_mascot.jpg"
              alt="Flora, Finglora Nail Muse"
              width={48}
              height={48}
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#E0246A]">
                {badge}
              </span>
              <span className="w-1 h-1 rounded-full bg-[#C59B27]" />
              <span className="text-[11px] text-[#7B7075]">{subtitle}</span>
            </div>
            <p className="text-[13px] text-[#18181B] font-normal leading-relaxed mt-0.5">
              {activeMessage}
            </p>
          </div>
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className="text-[#7B7075] hover:text-[#18181B] p-1.5 rounded-full hover:bg-[#F4F4F5] transition-colors"
            aria-label="Dismiss message"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}
      </aside>
    );
  }

  // DEFAULT EDITORIAL CARD & SPEECH BUBBLE
  return (
    <aside
      aria-label="Flora Atelier Muse"
      className={`relative bg-[#FFFFFF] border border-[#18181B]/08 rounded-2xl p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(31,26,28,0.05)] transition-all duration-200 hover:shadow-[0_8px_28px_-4px_rgba(31,26,28,0.08)] ${className}`}
    >
      <div className="flex items-start gap-4">
        {/* Flora Portrait with Luxury Jewelry Bezel */}
        <button
          type="button"
          onClick={() => setShowSecondary(!showSecondary)}
          title="Click to toggle alternate atelier advice"
          className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-[#C59B27]/45 ring-4 ring-[#FAFAFA] shrink-0 transition-transform duration-200 hover:scale-[1.03] cursor-pointer"
        >
          <Image
            src="https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/brand/finglora_mascot.jpg"
            alt="Flora, Finglora Nail Muse"
            width={64}
            height={64}
            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
          />
          {/* Subtle pulse jewel */}
          <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-[#E0246A] ring-2 ring-white" />
        </button>

        {/* Content & Editorial Advice */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAFAFA] text-[#E0246A] border border-[#C59B27]/30 text-[10px] font-medium tracking-[0.14em] uppercase">
                {config.icon}
                {badge}
              </span>
              <span className="text-[11px] text-[#7B7075] flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-[#C59B27]" strokeWidth={1.5} />
                {subtitle}
              </span>
            </div>

            {dismissible && (
              <button
                type="button"
                onClick={handleDismiss}
                className="text-[#7B7075] hover:text-[#18181B] p-1 rounded-md hover:bg-[#FAFAFA] transition-colors"
                aria-label="Dismiss note"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            )}
          </div>

          <h4
            className="font-serif text-[17px] sm:text-[19px] font-medium text-[#18181B] tracking-tight leading-tight mt-2.5"
            style={{ fontFamily: 'var(--font-serif, "Cormorant Garamond", Georgia, serif)' }}
          >
            {title}
          </h4>

          <p className="text-[13px] text-[#61565A] font-normal leading-relaxed mt-1.5">
            {activeMessage}
          </p>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3 pt-3.5 mt-3 border-t border-[#18181B]/06">
            <button
              type="button"
              onClick={() => setShowSecondary(!showSecondary)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#E0246A] hover:text-[#BE185D] transition-colors"
            >
              <span>{showSecondary ? 'Show primary guidance' : 'Alternate pro tip'}</span>
              <ChevronRight className="w-3 h-3" strokeWidth={1.5} />
            </button>

            {onAction && actionLabel && (
              <button
                type="button"
                onClick={onAction}
                className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-[#18181B] text-[#FAFAFA] hover:bg-[#E0246A] text-[11.5px] font-medium transition-colors"
              >
                {actionLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
