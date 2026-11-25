import React, { useState } from 'react';
import { X, Check, Copy, Share2 } from 'lucide-react';
import { SimpleTechSummary } from '@/lib/services/share-look';

export interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string | null;
  designTitle?: string;
  shareUrl?: string;
  techSummary?: SimpleTechSummary | null;
  onDownloadFallback?: () => void;
}

export function SocialShareModal({
  isOpen,
  onClose,
  imageUrl,
  designTitle = 'Finglora Manicure',
  shareUrl,
  techSummary,
  onDownloadFallback,
}: SocialShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeActionNote, setActiveActionNote] = useState<string | null>(null);

  if (!isOpen) return null;

  const resolvedUrl =
    shareUrl || (typeof window !== 'undefined' ? window.location.href : 'https://finglora.app');

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(resolvedUrl);
      setCopied(true);
      setActiveActionNote('Link copied');
      setTimeout(() => {
        setCopied(false);
        setActiveActionNote(null);
      }, 2200);
    } catch {
      setActiveActionNote('Could not copy link');
      setTimeout(() => setActiveActionNote(null), 2200);
    }
  };

  const handleShareTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(resolvedUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleShareX = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(resolvedUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleShareWhatsApp = () => {
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(resolvedUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleShareInstagram = async () => {
    if (onDownloadFallback) {
      onDownloadFallback();
      setActiveActionNote('Photo saved — upload directly to Instagram.');
      setTimeout(() => setActiveActionNote(null), 3500);
    } else {
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    }
  };

  const handleSharePhotoOnly = async () => {
    if (imageUrl && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const file = new File([blob], 'finglora-manicure.jpg', {
          type: blob.type || 'image/jpeg',
        });
        if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file] });
          onClose();
          return;
        }
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') return;
      }
    }

    if (onDownloadFallback) {
      onDownloadFallback();
      setActiveActionNote('Photo saved to your device');
      setTimeout(() => setActiveActionNote(null), 2200);
    }
  };

  const specLine = techSummary
    ? `${techSummary.shape} • ${techSummary.length} • ${techSummary.finish}`
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-stone-200/90 space-y-4 animate-in zoom-in-95 duration-150 relative select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimal Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-medium text-stone-900 tracking-tight">
            Share Look
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition cursor-pointer"
            aria-label="Close share modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Minimal Card: Generated Photo + Simple Tech Description */}
        <div className="rounded-2xl bg-[#FAF7F2] border border-stone-200/70 p-3 space-y-2.5">
          {imageUrl && (
            <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-stone-100">
              <img src={imageUrl} alt={designTitle} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-semibold text-stone-900 truncate">
                {techSummary?.title || designTitle}
              </h4>
              {specLine && (
                <span className="text-[10px] text-stone-500 capitalize shrink-0">
                  {specLine}
                </span>
              )}
            </div>
            {techSummary?.description && (
              <p className="text-[11px] text-stone-600 leading-relaxed line-clamp-2">
                {techSummary.description}
              </p>
            )}
          </div>
        </div>

        {activeActionNote && (
          <div className="py-2 px-3 rounded-xl bg-rose-50 border border-rose-200/80 text-[11px] text-[#E0246A] font-medium text-center">
            {activeActionNote}
          </div>
        )}

        {/* Primary Actions: Share Photo Only + Copy Link */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleSharePhotoOnly}
            className="h-10 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Photo</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="h-10 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied' : 'Copy Link'}</span>
          </button>
        </div>

        {/* Social App Quick Row */}
        <div className="grid grid-cols-4 gap-2 pt-1 border-t border-stone-100">
          <button
            type="button"
            onClick={handleShareInstagram}
            className="flex flex-col items-center gap-1.5 py-2 rounded-xl hover:bg-stone-50 transition cursor-pointer group"
            title="Share to Instagram"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
              </svg>
            </div>
            <span className="text-[10px] font-medium text-stone-600">Instagram</span>
          </button>

          <button
            type="button"
            onClick={handleShareTelegram}
            className="flex flex-col items-center gap-1.5 py-2 rounded-xl hover:bg-stone-50 transition cursor-pointer group"
            title="Share to Telegram"
          >
            <div className="w-9 h-9 rounded-xl bg-[#229ED9] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current -translate-x-[1px]" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z" />
              </svg>
            </div>
            <span className="text-[10px] font-medium text-stone-600">Telegram</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex flex-col items-center gap-1.5 py-2 rounded-xl hover:bg-stone-50 transition cursor-pointer group"
            title="Share to WhatsApp"
          >
            <div className="w-9 h-9 rounded-xl bg-[#25D366] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m5.81 13.99c-.25.7-1.44 1.34-2.01 1.42-.52.08-1.18.11-1.91-.12-.44-.14-1-.33-1.72-.64-3.03-1.31-5.01-4.37-5.16-4.57-.15-.2-1.23-1.64-1.23-3.13 0-1.49.78-2.22 1.06-2.52.28-.3.61-.38.81-.38h.58c.19 0 .44-.07.68.52.25.6.86 2.09.93 2.24.08.15.13.33.03.53-.1.2-.15.33-.3.51-.15.17-.32.39-.45.52-.15.15-.31.31-.13.62.18.3.78 1.29 1.68 2.09 1.15 1.03 2.13 1.35 2.43 1.5.3.15.48.13.66-.08.18-.2.75-.88.95-1.18.2-.3.4-.25.68-.15.28.1 1.76.83 2.06.98.3.15.5.23.58.35.08.13.08.73-.17 1.43z" />
              </svg>
            </div>
            <span className="text-[10px] font-medium text-stone-600">WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleShareX}
            className="flex flex-col items-center gap-1.5 py-2 rounded-xl hover:bg-stone-50 transition cursor-pointer group"
            title="Share to X"
          >
            <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <span className="text-[10px] font-medium text-stone-600">X</span>
          </button>
        </div>
      </div>
    </div>
  );
}
