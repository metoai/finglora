import React from 'react';

export interface BrandLogoProps {
  badgeText?: string;
  subtitle?: string;
  showWebsite?: boolean;
  websiteName?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
  onClick?: () => void;
}

export function BrandLogoIcon({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
  className?: string;
}) {
  const dimMap = {
    sm: 'w-6 h-6 sm:w-7 sm:h-7',
    md: 'w-7 h-7 sm:w-8 sm:h-8',
    lg: 'w-9 h-9 sm:w-10 sm:h-10',
  }[size];

  return (
    <img
      src="/assets/finglora_logo.png"
      alt="Finglora emblem"
      className={`object-contain select-none shrink-0 transition-transform duration-200 group-hover:scale-105 ${dimMap} ${className}`}
      loading="eager"
      decoding="async"
    />
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
  showWebsite = false,
  websiteName = 'finglora.com',
  onClick,
}: BrandLogoProps) {
  if (!showIcon && !showText) return null;

  const isLight = variant === 'light';

  const textSizes = {
    sm: 'text-lg sm:text-xl',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  }[size];

  const displayedSubtitle = subtitle || (showWebsite ? websiteName : undefined);

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 sm:gap-3 select-none group cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-98 ${className}`}
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
          {displayedSubtitle && (
            <span
              className={`text-[9.5px] sm:text-[10px] font-mono tracking-wider mt-0.5 transition-colors ${
                isLight ? 'text-white/60' : 'text-[#8C8085] group-hover:text-[#E0246A]'
              }`}
            >
              {displayedSubtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
