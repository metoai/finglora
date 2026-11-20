import React, { useState } from 'react';
import { X, Check, Copy, Share2, ExternalLink } from 'lucide-react';

export interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string | null;
  designTitle?: string;
  shareUrl?: string;
  onDownloadFallback?: () => void;
}

export function SocialShareModal({
  isOpen,
  onClose,
  imageUrl,
  designTitle = 'Finglora Manicure',
  shareUrl = 'https://finglora.com',
  onDownloadFallback,
}: SocialShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeActionNote, setActiveActionNote] = useState<string | null>(null);

  if (!isOpen) return null;

  const resolvedUrl =
    shareUrl || (typeof window !== 'undefined' ? window.location.href : 'https://finglora.com');
  const shareText = `Check out this bespoke manicure created with Finglora Atelier (finglora.com)`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${resolvedUrl}`);
      setCopied(true);
      setActiveActionNote('Link copied to clipboard!');
      setTimeout(() => {
        setCopied(false);
        setActiveActionNote(null);
      }, 2500);
    } catch {
      setActiveActionNote('Could not copy link.');
      setTimeout(() => setActiveActionNote(null), 2500);
    }
  };

  const handleShareTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(resolvedUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareX = () => {
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(resolvedUrl)}`;
    window.open(xUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${resolvedUrl}`)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareInstagram = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${resolvedUrl}`);
      setActiveActionNote('Link copied! Open Instagram and paste into Story or Post.');
      setTimeout(() => {
        window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
      }, 600);
      setTimeout(() => setActiveActionNote(null), 4000);
    } catch {
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `${designTitle} · Finglora`,
          text: shareText,
          url: resolvedUrl,
        });
        onClose();
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-stone-200/90 space-y-4 animate-in zoom-in-95 duration-200 relative select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#E0246A] text-sm">✿</span>
              <span className="font-serif text-base font-semibold text-stone-900 tracking-tight">
                Share Manicure
              </span>
            </div>
            <span className="text-[11px] font-mono text-stone-400 block mt-0.5">
              finglora.com
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition cursor-pointer active:scale-95"
            aria-label="Close share modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thumbnail Preview */}
        {imageUrl && (
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-stone-50 border border-stone-200/70">
            <div className="w-12 h-14 rounded-xl overflow-hidden bg-stone-200 shrink-0 border border-white shadow-2xs">
              <img src={imageUrl} alt={designTitle} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-stone-900 truncate">
                {designTitle}
              </h4>
              <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                Bespoke Look · finglora.com
              </p>
            </div>
          </div>
        )}

        {/* Status / Action Note */}
        {activeActionNote && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-[11px] text-[#E0246A] font-medium text-center animate-in fade-in duration-150">
            {activeActionNote}
          </div>
        )}

        {/* 4 Social App Action Buttons */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {/* Instagram */}
          <button
            type="button"
            onClick={handleShareInstagram}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-stone-50 border border-stone-200/80 transition cursor-pointer active:scale-95 group"
            title="Share to Instagram"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </div>
            <span className="text-[10px] font-medium text-stone-700 truncate">Instagram</span>
          </button>

          {/* Telegram */}
          <button
            type="button"
            onClick={handleShareTelegram}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-stone-50 border border-stone-200/80 transition cursor-pointer active:scale-95 group"
            title="Share to Telegram"
          >
            <div className="w-10 h-10 rounded-xl bg-[#229ED9] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current translate-x-[-1px] translate-y-[1px]" viewBox="0 0 24 24">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.198 1.006.128.828.922z" />
              </svg>
            </div>
            <span className="text-[10px] font-medium text-stone-700 truncate">Telegram</span>
          </button>

          {/* X (Twitter) */}
          <button
            type="button"
            onClick={handleShareX}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-stone-50 border border-stone-200/80 transition cursor-pointer active:scale-95 group"
            title="Share to X"
          >
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <span className="text-[10px] font-medium text-stone-700 truncate">X (Twitter)</span>
          </button>

          {/* WhatsApp */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-stone-50 border border-stone-200/80 transition cursor-pointer active:scale-95 group"
            title="Share to WhatsApp"
          >
            <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.122.553 4.113 1.523 5.845l-1.616 5.908 6.079-1.593c1.669.911 3.58 1.439 5.614 1.439 6.627 0 12-5.373 12-12s-5.373-12-12-12z" />
              </svg>
            </div>
            <span className="text-[10px] font-medium text-stone-700 truncate">WhatsApp</span>
          </button>
        </div>

        {/* Copy Link Input Bar */}
        <div className="pt-1">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl border border-stone-200/90 bg-stone-50/80">
            <input
              type="text"
              readOnly
              value={resolvedUrl}
              className="w-full px-2.5 text-xs text-stone-600 font-mono bg-transparent outline-none truncate"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="h-8 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shrink-0 flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* System Native Share or Download Options */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleNativeShare}
            className="flex-1 h-9 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>More Apps...</span>
          </button>

          {onDownloadFallback && (
            <button
              type="button"
              onClick={() => {
                onDownloadFallback();
                onClose();
              }}
              className="h-9 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Save File</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
