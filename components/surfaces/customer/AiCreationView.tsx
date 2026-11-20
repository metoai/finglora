import React, { useState, useRef, useEffect } from 'react';
import {
  Sliders,
  Send,
  RotateCcw,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Finger, NailDesign } from '@/types/nail';
import { useTryOnCredit, getUserCreditStatus } from '@/lib/services/credits';
import { ProPaywallModal } from '@/components/common/ProPaywallModal';
import { downscaleImageForVision } from '@/lib/services/storage';

interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
  appliedDesignTitle?: string;
}

export function AiCreationView({
  customTryOnHandUrl,
  initialHandDesignUrl,
  nails,
  setNails,
  onSignUpClick,
  onBackToTryOn,
}: {
  customTryOnHandUrl?: string | null;
  initialHandDesignUrl?: string | null;
  nails: Record<Finger, NailDesign>;
  setNails?: React.Dispatch<React.SetStateAction<Record<Finger, NailDesign>>>;
  onSignUpClick?: () => void;
  onBackToTryOn?: () => void;
}) {
  const [promptText, setPromptText] = useState('');
  const [isIterating, setIsIterating] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [isGuestFirstTry, setIsGuestFirstTry] = useState(false);

  // Persistent Bare Hand Photo
  const originalBareHandPhoto =
    customTryOnHandUrl ||
    (typeof window !== 'undefined' ? localStorage.getItem('finglora_user_hand_photo') : null) ||
    '/assets/editorial_nail_hero.jpg';

  // Active Displayed AI-Generated Try-On Hand Image
  const [currentTryOnImage, setCurrentTryOnImage] = useState<string>(() => {
    return (
      initialHandDesignUrl ||
      (typeof window !== 'undefined' ? localStorage.getItem('finglora_ai_base_hand_image') : null) ||
      customTryOnHandUrl ||
      (typeof window !== 'undefined' ? localStorage.getItem('finglora_user_hand_photo') : null) ||
      '/assets/editorial_nail_hero.jpg'
    );
  });

  useEffect(() => {
    if (initialHandDesignUrl) {
      setCurrentTryOnImage(initialHandDesignUrl);
      setCompareMode('after');
    }
  }, [initialHandDesignUrl]);

  const [compareMode, setCompareMode] = useState<'after' | 'before'>('after');

  // Conversational History
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'gemini',
      text: "Your manicure is ready on your hand. Describe any adjustment you'd like to make, such as nail shape, finish, or tip style.",
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
      // 1. Downscale current hand image for image-to-image
      let handBase64 = '';
      const baseSource = currentTryOnImage || originalBareHandPhoto;
      if (baseSource.startsWith('data:image/')) {
        handBase64 = baseSource;
      } else {
        handBase64 = await downscaleImageForVision(baseSource, 1024, 0.88);
      }

      // 2. Call /api/generate-nail-art in image-to-image mode
      const res = await fetch('/api/generate-nail-art', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'hand-tryon',
          handImageBase64: handBase64 || undefined,
          prompt: `On this human hand with manicure, update and customize the manicure according to this request: "${text}". Preserve the hand pose, finger positions, skin tone, and background. Seamlessly apply the requested nail shapes, colors, and art onto the fingernails with high-gloss salon gel clearcoat.`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.imageUrl) {
          setCurrentTryOnImage(data.imageUrl);
          setCompareMode('after');
          try {
            localStorage.setItem('finglora_ai_base_hand_image', data.imageUrl);
            localStorage.setItem('finglora_custom_hand_photo', data.imageUrl);
          } catch {}

          const geminiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'gemini',
            text: `Applied "${text}" directly onto your hand in photorealistic detail. What else would you like to customize?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            appliedDesignTitle: text,
          };
          setMessages((prev) => [...prev, geminiMsg]);
          setIsIterating(false);
          return;
        }
      }

      const errJson = await res.json().catch(() => ({}));
      const is429 = res.status === 429 || errJson?.isRateLimit;
      const errorMsg = is429
        ? 'Service is experiencing high demand. Please wait a moment and try again.'
        : `Could not apply "${text}". Please try describing the change differently.`;

      const geminiErr: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'gemini',
        text: errorMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, geminiErr]);
    } catch (err: unknown) {
      const geminiErr: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'gemini',
        text: 'Connection error. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, geminiErr]);
    } finally {
      setIsIterating(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-2 sm:py-4 px-2 space-y-4">
      {/* Editorial Header */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div className="flex items-center gap-3">
          {onBackToTryOn && (
            <button
              type="button"
              onClick={onBackToTryOn}
              className="w-9 h-9 rounded-full bg-white border border-stone-200 hover:border-[#E0246A] flex items-center justify-center text-stone-700 hover:text-[#E0246A] transition cursor-pointer active:scale-95 shadow-2xs"
              title="Back to Virtual Try-On"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <span className="text-[10px] font-mono tracking-wider text-stone-400 uppercase">
              Virtual Studio
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900 tracking-tight">
              Edit Manicure
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-xs font-medium text-stone-700">
          <Sliders className="w-3.5 h-3.5 text-stone-500" />
          <span>AI Editor</span>
        </div>
      </div>

      {/* Main 2-Column Studio: Left = Hand Viewport, Right = AI Chat Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Constant Hand Photo Viewport (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative aspect-[3/4] max-h-[460px] w-full rounded-2xl overflow-hidden bg-stone-100 shadow-sm border border-stone-200 flex items-center justify-center">
            {isIterating && (
              <div className="absolute inset-0 z-30 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white text-center p-4">
                <Loader2 className="w-7 h-7 animate-spin text-white" />
                <span className="text-xs font-medium tracking-wide">
                  Updating manicure...
                </span>
              </div>
            )}

            {/* Photorealistic Hand */}
            <img
              src={compareMode === 'before' ? originalBareHandPhoto : currentTryOnImage}
              alt="Hand Try-On"
              className="w-full h-full object-cover transition duration-200"
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 z-20">
              <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium tracking-wide">
                {compareMode === 'after' ? 'Manicure' : 'Natural Hand'}
              </span>
            </div>

            <div className="absolute top-3 right-3 z-20">
              <button
                type="button"
                onClick={() => setCompareMode((m) => (m === 'after' ? 'before' : 'after'))}
                className="px-2.5 py-1 rounded-full bg-white/90 hover:bg-white text-stone-800 text-[10px] font-medium tracking-wide shadow-xs flex items-center gap-1.5 cursor-pointer transition active:scale-95"
              >
                <RotateCcw className="w-3 h-3 text-stone-600" />
                <span>{compareMode === 'after' ? 'Hold for Natural Hand' : 'View Manicure'}</span>
              </button>
            </div>
          </div>

          <div className="text-center text-[11px] text-stone-400">
            Hand anatomy, skin tone, fingers, and lighting remain constant across all prompts.
          </div>
        </div>

        {/* Right: Conversational AI Prompt Stream (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col h-[460px] rounded-2xl bg-white border border-stone-200 shadow-sm overflow-hidden">
          {/* Stream Header */}
          <div className="p-3.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-stone-800">
                Assistant
              </span>
            </div>
            <span className="text-[10px] text-stone-400">Live Chat</span>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#E0246A] text-white shadow-xs rounded-br-xs'
                      : 'bg-stone-100 text-stone-800 rounded-bl-xs'
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
              'Almond shape',
              'White French tips',
              'Glazed chrome finish',
              'Deep bordeaux lacquer',
            ].map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPromptText(sug)}
                className="px-2.5 py-1 rounded-full bg-white border border-stone-200 text-[10px] font-medium text-stone-600 hover:text-stone-900 hover:border-stone-400 transition whitespace-nowrap cursor-pointer shrink-0"
              >
                + {sug}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-stone-200 bg-white">
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
                placeholder="Describe a change (e.g. 'Almond shape with glazed chrome')..."
                className="flex-1 h-10 px-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400"
              />
              <button
                type="submit"
                disabled={!promptText.trim() || isIterating}
                className="h-10 px-4 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-medium shadow-md shadow-[#E0246A]/20 disabled:opacity-40 transition cursor-pointer shrink-0 flex items-center justify-center gap-1"
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
