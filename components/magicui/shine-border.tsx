import React from 'react';
import { cn } from '@/lib/utils';

interface ShineBorderProps {
  borderRadius?: number;
  borderWidth?: number;
  duration?: number;
  color?: string | string[];
  className?: string;
  children: React.ReactNode;
}

export function ShineBorder({
  borderRadius = 24,
  borderWidth = 1,
  duration = 14,
  color = ['#FFB6C1', '#E0246A', '#E0246A'],
  className,
  children,
}: ShineBorderProps) {
  return (
    <div
      style={
        {
          '--border-radius': `${borderRadius}px`,
        } as React.CSSProperties
      }
      className={cn(
        'relative rounded-[--border-radius] p-px',
        className
      )}
    >
      <div
        style={
          {
            '--border-width': `${borderWidth}px`,
            '--border-radius': `${borderRadius}px`,
            '--duration': `${duration}s`,
            '--mask-linear-gradient': `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            '--background-radial-gradient': `radial-gradient(transparent,transparent, ${
              Array.isArray(color) ? color.join(',') : color
            },transparent,transparent)`,
          } as React.CSSProperties
        }
        className={cn(
          'pointer-events-none absolute inset-0 size-full rounded-[--border-radius] p-[--border-width]',
          '![mask-composite:subtract] [background-image:--background-radial-gradient] [background-size:300%_300%] [mask:--mask-linear-gradient] motion-safe:animate-shine'
        )}
      />
      {children}
    </div>
  );
}
