'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Download } from 'lucide-react';

const DISMISSED_KEY = 'finglora_pwa_dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallBanner() {
  const [visible, setVisible] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Don't show if already dismissed or already running as standalone PWA
    if (
      localStorage.getItem(DISMISSED_KEY) === '1' ||
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    ) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt.current) return;
    await deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    deferredPrompt.current = null;
    if (outcome === 'accepted') {
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center gap-3 px-4 py-2.5 bg-[#1F1A1C] text-white shadow-lg">
      {/* Icon */}
      <div className="shrink-0 w-8 h-8 rounded-lg overflow-hidden bg-[#E0246A]/20 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/finglora_logo.png" alt="Finglora" className="w-7 h-7 object-contain" />
      </div>

      {/* Copy */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold leading-tight truncate">Add Finglora to your home screen</p>
        <p className="text-[11px] text-white/50 leading-tight truncate">Faster access, full-screen try-on</p>
      </div>

      {/* Install button */}
      <button
        onClick={handleInstall}
        className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#E0246A] hover:bg-[#BE185D] active:scale-95 text-white text-xs font-semibold transition-all"
      >
        <Download size={13} />
        Install
      </button>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss install banner"
        className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
