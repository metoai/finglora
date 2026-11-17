import React from 'react';
import { ToastItem } from '@/types/nail';

export function ToastContainer({ toasts }: { toasts: ToastItem[] }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-[#18181B] text-white px-4 py-3 rounded-2xl shadow-xl border border-white/10 flex items-center gap-2.5 text-xs sm:text-sm font-medium"
        >
          <span className="w-2 h-2 rounded-full bg-[#FFB6C1] shrink-0" />
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}
