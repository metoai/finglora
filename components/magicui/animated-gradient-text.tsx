import React, { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

export interface AnimatedGradientTextProps extends ComponentPropsWithoutRef<'div'> {
  className?: string;
  children: React.ReactNode;
}

export function AnimatedGradientText({
  className,
  children,
  ...props
}: AnimatedGradientTextProps) {
  return (
    <div
      className={cn(
        'group relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-2xl px-4 py-1.5 text-xs font-medium shadow-[inset_0_-8px_10px_#8fdfff1f] backdrop-blur-xs transition-shadow duration-500 ease-out [--bg-size:300%]',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'animate-gradient absolute inset-0 block size-full rounded-[inherit] bg-gradient-to-r from-[#FFB6C1]/50 via-[#E0246A]/50 to-[#E0246A]/50 bg-[length:var(--bg-size)_100%] p-[1px] ![mask-composite:subtract] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]'
        )}
      />
      {children}
    </div>
  );
}
