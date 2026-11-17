import React from 'react';

export interface BrandLogoProps {
  badgeText?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
}

export function BrandLogoIcon({
  size = 'md',
  variant = 'dark',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
  className?: string;
}) {
  const isLight = variant === 'light';

  // Reframed, well-proportioned dimensions
  const dimMap = {
    sm: { box: 'w-7.5 h-7.5 sm:w-8 sm:h-8', flower: 'text-base sm:text-lg' },
    md: { box: 'w-9 h-9 sm:w-9.5 sm:h-9.5', flower: 'text-xl sm:text-[22px]' },
    lg: { box: 'w-11 h-11 sm:w-12 sm:h-12', flower: 'text-2xl sm:text-3xl' },
  }[size];

  return (
    <div
      className={`relative flex items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105 select-none shrink-0 ${
        isLight
          ? 'bg-white/10 border border-white/20 text-[#E0246A] shadow-xs'
          : 'bg-white border border-[#E0246A]/25 shadow-xs shadow-[#E0246A]/10 text-[#E0246A]'
      } ${dimMap.box} ${className}`}
      title="Finglora"
    >
      <span className={`${dimMap.flower} leading-none select-none -translate-y-[0.5px]`}>
        ✿
      </span>
    </div>
  );
}

export function BrandLogo({
  size = 'md',
  variant = 'dark',
  className = '',
  showIcon = true,
  showText = true,
  badgeText,
  subtitle,
}: BrandLogoProps) {
  if (!showIcon && !showText) return null;

  const isLight = variant === 'light';

  const textSizes = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl sm:text-3xl',
  }[size];

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none group cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-98 ${className}`}
      aria-label="Finglora"
    >
      {showIcon && <BrandLogoIcon size={size} variant={variant} />}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-serif font-medium tracking-tight transition-colors ${
                isLight ? 'text-white' : 'text-[#18181B] group-hover:text-[#E0246A]'
              } ${textSizes}`}
            >
              Finglora
            </span>
            {badgeText && (
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-[#E0246A]/15 text-[#E0246A]">
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && (
            <span
              className={`text-[9px] font-mono tracking-widest uppercase mt-0.5 ${
                isLight ? 'text-white/60' : 'text-[#8C8085]'
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
