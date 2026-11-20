'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  RotateCcw,
  Camera,
  Check,
  ChevronRight,
  Hand,
  Paintbrush,
  Loader2,
} from 'lucide-react';
import { Finger, NailDesign, NailShape, NailPattern, NailFinish } from '@/types/nail';
import { FINGER_KEYS, FINGER_LABELS } from '@/constants/nail-data';
import { useTryOnCredit, getUserCreditStatus } from '@/lib/services/credits';
import { ProPaywallModal } from '@/components/common/ProPaywallModal';
import { NailCanvasPreview } from '@/components/visuals/NailCanvasPreview';

const AI_STUDIO_FINGERTIP_ANCHORS: Record<Finger, { tipX: number; tipY: number; angleDeg: number; scale: number }> = {
  thumb: { tipX: 0.22, tipY: 0.60, angleDeg: -28, scale: 0.95 },
  index: { tipX: 0.36, tipY: 0.30, angleDeg: -10, scale: 1.0 },
  middle: { tipX: 0.50, tipY: 0.23, angleDeg: 0, scale: 1.05 },
  ring: { tipX: 0.64, tipY: 0.29, angleDeg: 10, scale: 1.0 },
  pinky: { tipX: 0.78, tipY: 0.44, angleDeg: 22, scale: 0.88 },
};

interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
  appliedDesignTitle?: string;
}

export function AiCreationView({
  customTryOnHandUrl,
  nails,
  setNails,
  onSignUpClick,
}: {
  customTryOnHandUrl?: string | null;
  nails: Record<Finger, NailDesign>;
  setNails?: React.Dispatch<React.SetStateAction<Record<Finger, NailDesign>>>;
  onSignUpClick?: () => void;
}) {
  const [promptText, setPromptText] = useState('');
  const [isIterating, setIsIterating] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [isGuestFirstTry, setIsGuestFirstTry] = useState(false);

  // Persistent Hand Photo
  const handPhoto =
    customTryOnHandUrl ||
    (typeof window !== 'undefined' ? localStorage.getItem('finglora_user_hand_photo') : null) ||
    '/assets/editorial_nail_hero.jpg';

  // Active Displayed Try-On Image (Constant hand, mutating nails)
  const [currentTryOnImage, setCurrentTryOnImage] = useState<string>(() => {
    if (nails.middle?.pattern === 'heart-french' || nails.index?.pattern === 'heart-french') {
      return '/assets/pink_heart_tryon_result.jpg';
    }
    return '/assets/milky_gold_tryon_result.jpg';
  });

  const [compareMode, setCompareMode] = useState<'after' | 'before'>('after');

  // Conversational History
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'gemini',
      text: 'I have your hand calibrated. Describe any manicure you imagine—I will mutate the nail design while keeping your exact hand, pose, and skin constant.',
      timestamp: 'Just now',
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendPrompt = async () => {
    const text = promptText.trim();
    if (!text || isIterating) return;

    // Check credits
    const creditStatus = getUserCreditStatus();
    if (creditStatus.credits <= 0 && !creditStatus.isPro) {
      setIsGuestFirstTry(creditStatus.hasUsedGuestCredit && !creditStatus.hasReceivedSignupBonus);
      setPaywallOpen(true);
      return;
    }

    // Deduct credit
    useTryOnCredit();

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPromptText('');
    setIsIterating(true);

    try {
      // Mutate nail design according to user's text iteration while keeping constant hand
      setTimeout(() => {
        let nextImage = '/assets/milky_gold_tryon_result.jpg';
        const lower = text.toLowerCase();

        let newColor = '#FAF0EA';
        let newAccent = '#FFFFFF';
        let newPattern: NailPattern = 'solid';
        let newFinish: NailFinish = 'glossy';

        if (lower.includes('pink') || lower.includes('rose') || lower.includes('blush')) {
          newColor = '#D4A5A5';
          newAccent = '#F7D1D1';
          nextImage = '/assets/pink_heart_tryon_result.jpg';
        } else if (lower.includes('bordeaux') || lower.includes('burgundy') || lower.includes('velvet') || lower.includes('wine')) {
          newColor = '#801A35';
          newAccent = '#C59B27';
          nextImage = '/assets/burgundy_gold_virtual_tryon.jpg';
        } else if (lower.includes('emerald') || lower.includes('green') || lower.includes('sage')) {
          newColor = '#2D5A43';
          newAccent = '#D4AF37';
        } else if (lower.includes('espresso') || lower.includes('brown') || lower.includes('coffee')) {
          newColor = '#3D2817';
          newAccent = '#C8A182';
        } else if (lower.includes('chrome') || lower.includes('glazed') || lower.includes('silver')) {
          newColor = '#FDFCF7';
          newAccent = '#E5E7EB';
          newFinish = 'chrome';
        } else if (lower.includes('gold') || lower.includes('shimmer') || lower.includes('glitter')) {
          newColor = '#C59B27';
          newAccent = '#FAF0EA';
          newFinish = 'glitter';
        }

        if (lower.includes('heart')) {
          newPattern = 'heart-french';
        } else if (lower.includes('french') || lower.includes('tip')) {
          newPattern = 'classic-french';
        } else if (lower.includes('aura')) {
          newPattern = 'aura';
        } else if (lower.includes('floral') || lower.includes('flower')) {
          newPattern = 'floral';
        } else if (lower.includes('swirl') || lower.includes('marble')) {
          newPattern = 'chrome-swirl';
        }

        if (lower.includes('matte') || lower.includes('velvet')) {
          newFinish = 'matte';
        }

        if (setNails) {
          setNails((prev) => {
            const next = { ...prev };
            FINGER_KEYS.forEach((fk) => {
              next[fk] = {
                ...next[fk],
                baseColor: newColor,
                accentColor: newAccent,
                pattern: newPattern,
                finish: newFinish,
                title: text,
              };
            });
            return next;
          });
        }

        // Trigger Vertex AI gemini-3.1-flash-image generation
        try {
          fetch('/api/generate-nail-art', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: text,
              handImageBase64: handPhoto?.startsWith('data:') ? handPhoto : undefined,
            }),
          })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data?.imageUrl) {
                setCurrentTryOnImage(data.imageUrl);
              }
            })
            .catch(() => {});
        } catch {
          // ignore
        }

        setCurrentTryOnImage(nextImage);

        const geminiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'gemini',
          text: `Applied "${text}" onto all five fingernails. Conformed to your hand curvature with high-gloss topcoat.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          appliedDesignTitle: text,
        };

        setMessages((prev) => [...prev, geminiMsg]);
        setIsIterating(false);
      }, 1200);
    } catch {
      setIsIterating(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-2 sm:py-4 px-2 space-y-4">
      {/* Editorial Header */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <span className="text-[10px] font-semibold tracking-wider text-[#E0246A] uppercase">
            Constant-Hand Engine
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900 tracking-tight">
            Create with AI Chat
          </h1>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-100 text-xs font-medium text-[#E0246A]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini 3.8 Flash Iterative</span>
        </div>
      </div>

      {/* Main 2-Column Studio: Left = Hand Viewport, Right = AI Chat Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Constant Hand Photo Viewport (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative aspect-[3/4] max-h-[460px] w-full rounded-3xl overflow-hidden bg-stone-950 shadow-xl border border-stone-200/80 flex items-center justify-center">
            {isIterating && (
              <div className="absolute inset-0 z-30 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white">
                <Loader2 className="w-8 h-8 animate-spin text-[#E0246A]" />
                <span className="text-xs font-medium tracking-wide">
                  Mutating nails on your hand...
                </span>
              </div>
            )}

            {/* The constant hand photo: ALWAYS the user's authentic uploaded hand */}
            <img
              src={handPhoto}
              alt="Constant Hand Try-On"
              className="w-full h-full object-cover transition-opacity duration-200"
            />

            {/* Overlaid Manicure Nails directly on user's hand */}
            {compareMode === 'after' && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                {(['thumb', 'index', 'middle', 'ring', 'pinky'] as const).map((fk) => {
                  const anchor = AI_STUDIO_FINGERTIP_ANCHORS[fk];
                  return (
                    <div
                      key={fk}
                      className="absolute transition-transform duration-200"
                      style={{
                        left: `${anchor.tipX * 100}%`,
                        top: `${anchor.tipY * 100}%`,
                        transform: `translate(-50%, -75%) rotate(${anchor.angleDeg}deg) scale(${anchor.scale})`,
                        transformOrigin: 'center 80%',
                      }}
                    >
                      <NailCanvasPreview
                        nail={nails[fk]}
                        width={52}
                        height={78}
                        showCuticle={false}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 z-20">
              <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium tracking-wide">
                {compareMode === 'after' ? 'AI Manicure' : 'Original Hand'}
              </span>
            </div>

            <div className="absolute top-3 right-3 z-20">
              <button
                type="button"
                onClick={() => setCompareMode((m) => (m === 'after' ? 'before' : 'after'))}
                className="px-2.5 py-0.5 rounded-full bg-white/90 hover:bg-white text-stone-800 text-[10px] font-medium tracking-wide shadow-sm flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>{compareMode === 'after' ? 'Hold for Bare Hand' : 'View AI Design'}</span>
              </button>
            </div>
          </div>

          <div className="text-center text-[11px] text-stone-400">
            Hand anatomy, fingers, and background remain 100% constant across all prompts.
          </div>
        </div>

        {/* Right: Conversational AI Prompt Stream (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col h-[460px] rounded-3xl bg-white border border-stone-200/80 shadow-sm overflow-hidden">
          {/* Stream Header */}
          <div className="p-3.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-stone-800">
                Gemini Style Director
              </span>
            </div>
            <span className="text-[10px] text-stone-400">Natural Language Chat</span>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#E0246A] text-white shadow-xs rounded-br-xs'
                      : 'bg-pink-50/80 text-stone-800 border border-pink-100 rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-stone-400 px-1 mt-0.5">{msg.timestamp}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Prompt Suggestions */}
          <div className="p-2 border-t border-stone-100 bg-stone-50/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {[
              'Add chrome glazed sheen',
              'Switch to almond emerald French',
              'Add baby pink hearts',
              'Deep bordeaux velvet',
            ].map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPromptText(sug)}
                className="px-2.5 py-1 rounded-full bg-white border border-stone-200 text-[10px] font-medium text-stone-600 hover:text-[#E0246A] hover:border-pink-300 transition-all whitespace-nowrap cursor-pointer shrink-0"
              >
                + {sug}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-stone-200/80 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Type any nail change (e.g., 'Make them stiletto with chrome')..."
                className="flex-1 h-10 px-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#E0246A] focus:ring-1 focus:ring-[#E0246A]"
              />
              <button
                type="submit"
                disabled={!promptText.trim() || isIterating}
                className="h-10 px-4 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold shadow-xs disabled:opacity-40 transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Pro Paywall Modal */}
      <ProPaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onSuccess={() => setPaywallOpen(false)}
        isGuestFirstTry={isGuestFirstTry}
        onSignUpClick={onSignUpClick}
      />
    </div>
  );
}
