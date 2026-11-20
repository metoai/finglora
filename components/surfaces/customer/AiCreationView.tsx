import React, { useState, useRef, useEffect } from 'react';
import {
  Sliders,
  Send,
  RotateCcw,
  ArrowLeft,
  Loader2,
  Maximize2,
  X,
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
  imageUrl?: string;
}

export function AiCreationView({
  customTryOnHandUrl,
  initialHandDesignUrl,
  initialPrompt,
  onClearInitialPrompt,
  nails,
  setNails,
  onSignUpClick,
  onBackToTryOn,
}: {
  customTryOnHandUrl?: string | null;
  initialHandDesignUrl?: string | null;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  nails: Record<Finger, NailDesign>;
  setNails?: React.Dispatch<React.SetStateAction<Record<Finger, NailDesign>>>;
  onSignUpClick?: () => void;
  onBackToTryOn?: () => void;
}) {
  const [promptText, setPromptText] = useState('');
  const [isIterating, setIsIterating] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [isGuestFirstTry, setIsGuestFirstTry] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  // Persistent Bare Hand Photo: Check customTryOnHandUrl, finglora_custom_hand_photo, finglora_user_hand_photo
  const originalBareHandPhoto =
    customTryOnHandUrl ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('finglora_custom_hand_photo') ||
        localStorage.getItem('finglora_user_hand_photo')
      : null) ||
    '/assets/editorial_nail_hero.jpg';

  // Active Displayed AI-Generated Try-On Hand Image
  const [currentTryOnImage, setCurrentTryOnImage] = useState<string>(() => {
    if (initialPrompt && initialPrompt.trim()) {
      return originalBareHandPhoto;
    }
    return (
      initialHandDesignUrl ||
      (typeof window !== 'undefined' ? localStorage.getItem('finglora_ai_base_hand_image') : null) ||
      originalBareHandPhoto
    );
  });

  useEffect(() => {
    if (initialHandDesignUrl && (!initialPrompt || !initialPrompt.trim())) {
      setCurrentTryOnImage(initialHandDesignUrl);
      setCompareMode('after');
    }
  }, [initialHandDesignUrl, initialPrompt]);

  const [compareMode, setCompareMode] = useState<'after' | 'before'>('after');

  // Conversational History
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialPrompt && initialPrompt.trim()) {
      return [
        {
          id: 'initial-user',
          sender: 'user',
          text: initialPrompt.trim(),
          timestamp: 'Just now',
        },
      ];
    }
    return [
      {
        id: '1',
        sender: 'gemini',
        text: "Your hand is ready. Describe any design or adjustment you'd like to create, such as nail shape, color, finish, or artistry.",
        timestamp: 'Just now',
        imageUrl: initialHandDesignUrl || originalBareHandPhoto,
        appliedDesignTitle: 'Starting Hand',
      },
    ];
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const executedInitialPromptRef = useRef<string | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Main Prompt Execution Function
  const executePrompt = async (text: string, isInitialCreation = false) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Check credits
    const creditStatus = getUserCreditStatus();
    if (creditStatus.credits <= 0 && !creditStatus.isPro) {
      setIsGuestFirstTry(creditStatus.hasUsedGuestCredit && !creditStatus.hasReceivedSignupBonus);
      setPaywallOpen(true);
      return;
    }

    useTryOnCredit();
    setIsIterating(true);

    try {
      // 1. Downscale hand image for vision model
      // If initial creation, always anchor directly to the user's natural bare hand photo
      const baseSource = isInitialCreation ? originalBareHandPhoto : (currentTryOnImage || originalBareHandPhoto);
      let handBase64 = '';
      if (baseSource.startsWith('data:image/')) {
        handBase64 = baseSource;
      } else {
        handBase64 = await downscaleImageForVision(baseSource, 1024, 0.88);
      }

      // 2. Call /api/generate-nail-art in hand-tryon mode
      const promptInstruction = isInitialCreation
        ? `On this human hand, generate and apply this custom manicure design: "${trimmed}". Preserve the natural hand pose, finger positions, skin tone, and background. Seamlessly apply the requested nail shapes, colors, and art onto each fingernail with glossy salon gel clearcoat.`
        : `On this human hand with manicure, update and customize the manicure according to this request: "${trimmed}". Preserve the hand pose, finger positions, skin tone, and background. Seamlessly apply the requested nail shapes, colors, and art onto the fingernails with high-gloss salon gel clearcoat.`;

      const res = await fetch('/api/generate-nail-art', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'hand-tryon',
          handImageBase64: handBase64 || undefined,
          prompt: promptInstruction,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.imageUrl) {
          setCurrentTryOnImage(data.imageUrl);
          setCompareMode('after');
          try {
            localStorage.setItem('finglora_ai_base_hand_image', data.imageUrl);
          } catch {}

          const geminiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'gemini',
            text: isInitialCreation
              ? `Created "${trimmed}" directly on your hand! Describe any adjustments or details you'd like to refine.`
              : `Applied "${trimmed}" directly onto your hand in photorealistic detail. What else would you like to customize?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            appliedDesignTitle: trimmed,
            imageUrl: data.imageUrl,
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
        : `Could not apply "${trimmed}". Please try describing the change differently.`;

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

  // Automatically trigger creation when arriving from homepage with initialPrompt
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() && executedInitialPromptRef.current !== initialPrompt.trim()) {
      executedInitialPromptRef.current = initialPrompt.trim();
      executePrompt(initialPrompt.trim(), true);
      onClearInitialPrompt?.();
    }
  }, [initialPrompt]);

  const handleSendPrompt = async () => {
    const text = promptText.trim();
    if (!text || isIterating) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPromptText('');
    executePrompt(text, false);
  };

  return (
    <div className="w-full max-w-6xl xl:max-w-7xl mx-auto h-full flex flex-col min-h-0 py-2 sm:py-4 px-3 sm:px-6 gap-2 sm:gap-4">
      {/* Editorial Header */}
      <div className="flex items-center justify-between gap-3 pb-2 sm:pb-3 border-b border-stone-200/80 shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3">
          {onBackToTryOn && (
            <button
              type="button"
              onClick={onBackToTryOn}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-stone-200 hover:border-[#E0246A] flex items-center justify-center text-stone-700 hover:text-[#E0246A] transition cursor-pointer active:scale-95 shadow-2xs shrink-0"
              title="Back to Virtual Try-On"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <span className="text-[9px] sm:text-[10px] font-mono tracking-wider text-stone-400 uppercase block leading-none mb-0.5">
              Virtual Studio
            </span>
            <h1 className="font-serif text-lg sm:text-2xl font-normal text-stone-900 tracking-tight leading-tight">
              Create with AI
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Active Hand Thumbnail on Mobile (Tap to inspect anytime) */}
          <button
            type="button"
            onClick={() => {
              setZoomImageUrl(currentTryOnImage);
              setIsZoomOpen(true);
            }}
            className="flex lg:hidden items-center gap-1.5 p-1 rounded-full bg-white border border-stone-200 shadow-2xs cursor-pointer hover:border-[#E0246A] transition active:scale-95"
            title="Inspect Active Hand"
          >
            <img
              src={compareMode === 'before' ? originalBareHandPhoto : currentTryOnImage}
              alt="Active Hand"
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-[10px] font-medium text-stone-600 pr-1.5">Inspect</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-stone-100 border border-stone-200/60 text-[11px] sm:text-xs font-medium text-stone-700 shadow-2xs">
            <Sliders className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E0246A]" />
            <span>Atelier Studio</span>
          </div>
        </div>
      </div>

      {/* Main Studio Area:
          - Mobile (< lg): Conversational studio timeline where each new design appears inline as a card in the chat
          - Desktop (lg+): 12-column grid with hand viewport on left and chat on right
      */}
      <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-12 gap-2.5 sm:gap-4 lg:gap-6 items-stretch">
        {/* Desktop Left Column: Large Constant Viewport (7 Cols on desktop, HIDDEN ON MOBILE so mobile flows as dynamic timeline) */}
        <div className="hidden lg:flex lg:col-span-7 flex-col items-center justify-center min-h-0">
          <div className="relative h-full max-h-[620px] aspect-[3/4] rounded-3xl overflow-hidden bg-stone-100 shadow-sm border border-stone-200/90 flex items-center justify-center mx-auto transition-all duration-200 shrink-0 group">
            {isIterating && (
              <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white text-center p-4">
                <Loader2 className="w-8 h-8 animate-spin text-[#E0246A]" />
                <span className="text-sm font-semibold tracking-wide">
                  Creating manicure...
                </span>
                <span className="text-xs text-stone-300">
                  Fitting requested nail art to your fingernails
                </span>
              </div>
            )}

            {/* Photorealistic Hand */}
            <img
              src={compareMode === 'before' ? originalBareHandPhoto : currentTryOnImage}
              alt="Hand Try-On"
              onClick={() => {
                setZoomImageUrl(currentTryOnImage);
                setIsZoomOpen(true);
              }}
              className="w-full h-full object-cover transition duration-200 cursor-pointer"
              title="Click to zoom in"
            />

            {/* Badges & Controls */}
            <div className="absolute top-3 left-3 z-20">
              <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium tracking-wide">
                {compareMode === 'after' ? 'Manicure' : 'Natural Hand'}
              </span>
            </div>

            <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCompareMode((m) => (m === 'after' ? 'before' : 'after'))}
                className="px-2.5 py-1 rounded-full bg-white/90 hover:bg-white text-stone-800 text-[10px] font-medium tracking-wide shadow-xs flex items-center gap-1 cursor-pointer transition active:scale-95"
              >
                <RotateCcw className="w-3 h-3 text-stone-600" />
                <span>{compareMode === 'after' ? 'Hold for Natural' : 'View Manicure'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoomImageUrl(currentTryOnImage);
                  setIsZoomOpen(true);
                }}
                className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-stone-800 shadow-xs flex items-center justify-center cursor-pointer transition active:scale-95"
                title="Inspect Fullscreen"
              >
                <Maximize2 className="w-3.5 h-3.5 text-stone-600" />
              </button>
            </div>
          </div>

          <div className="text-center text-[11px] text-stone-400 mt-2">
            Hand anatomy, skin tone, fingers, and lighting remain constant across all prompts.
          </div>
        </div>

        {/* Right Column / Mobile Full Area: Conversational AI Prompt Stream & Input Dock */}
        <div className="lg:col-span-5 flex-1 min-h-0 flex flex-col rounded-2xl lg:rounded-3xl bg-white border border-stone-200/90 shadow-sm overflow-hidden">
          {/* Stream Header */}
          <div className="px-3 py-2 sm:px-3.5 sm:py-2.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70 shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-stone-800">
                Atelier AI Assistant
              </span>
            </div>
            <span className="text-[10px] text-stone-400 font-mono">Live Studio Timeline</span>
          </div>

          {/* Messages Body (scrollable) */}
          <div className="flex-1 min-h-0 p-2.5 sm:p-4 overflow-y-auto space-y-3 scrollbar-thin">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] sm:max-w-[85%] rounded-2xl px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-[#E0246A] text-white shadow-xs rounded-br-xs'
                        : 'bg-stone-100 text-stone-800 rounded-bl-xs'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* Generated Design Card (Inline in the message stream!) */}
                    {msg.imageUrl && (
                      <div className="mt-2.5 rounded-xl sm:rounded-2xl overflow-hidden bg-stone-200 border border-stone-300/80 shadow-xs relative group max-w-[240px] xs:max-w-[260px] sm:max-w-[280px] aspect-[3/4]">
                        <img
                          src={msg.imageUrl}
                          alt={msg.appliedDesignTitle || 'Manicure Design'}
                          className="w-full h-full object-cover cursor-pointer transition group-hover:scale-[1.02] duration-200"
                          onClick={() => {
                            setZoomImageUrl(msg.imageUrl || null);
                            setIsZoomOpen(true);
                          }}
                          title="Click to zoom in"
                        />
                        {/* Badges on card */}
                        <div className="absolute top-2 left-2 z-10">
                          <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] font-medium">
                            {msg.appliedDesignTitle || 'Manicure'}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setZoomImageUrl(msg.imageUrl || null);
                              setIsZoomOpen(true);
                            }}
                            className="w-6 h-6 rounded-full bg-white/90 hover:bg-white text-stone-800 shadow-xs flex items-center justify-center cursor-pointer transition active:scale-95"
                            title="Fullscreen inspector"
                          >
                            <Maximize2 className="w-3 h-3 text-stone-600" />
                          </button>
                        </div>
                        {/* Bottom tap hint */}
                        <div
                          onClick={() => {
                            setZoomImageUrl(msg.imageUrl || null);
                            setIsZoomOpen(true);
                          }}
                          className="absolute inset-x-0 bottom-0 py-1.5 px-2.5 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-between text-white text-[9px] font-medium cursor-pointer"
                        >
                          <span>{msg.appliedDesignTitle || 'New Design'}</span>
                          <span className="text-white/90 underline text-[9px]">Tap to inspect</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-stone-400 px-1 mt-0.5">{msg.timestamp}</span>
                </div>
              );
            })}

            {/* In-stream Assistant Loading State */}
            {isIterating && (
              <div className="flex flex-col items-start animate-in fade-in duration-200">
                <div className="bg-stone-100 text-stone-800 rounded-2xl rounded-bl-xs px-3.5 py-2.5 text-xs flex items-center gap-2.5 shadow-2xs border border-stone-200/80">
                  <Loader2 className="w-4 h-4 animate-spin text-[#E0246A] shrink-0" />
                  <div>
                    <span className="font-semibold text-stone-900 block text-xs">
                      Creating new manicure on your hand...
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Fitting requested nail art to your fingernails
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Prompt Suggestions */}
          <div className="px-2.5 py-1.5 sm:px-3 sm:py-2 border-t border-stone-100 bg-stone-50/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            {[
              'Almond shape',
              'White French tips',
              'Glazed chrome finish',
              'Deep bordeaux lacquer',
              'Velvet aura gradient',
            ].map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPromptText(sug)}
                className="px-2.5 py-1 rounded-full bg-white border border-stone-200 text-[10px] font-medium text-stone-600 hover:text-stone-900 hover:border-[#E0246A] transition whitespace-nowrap cursor-pointer shrink-0 active:scale-95"
              >
                + {sug}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-2 sm:p-3 border-t border-stone-200 bg-white shrink-0">
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
                className="flex-1 h-9 sm:h-10 px-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#E0246A] focus:bg-white transition"
              />
              <button
                type="submit"
                disabled={!promptText.trim() || isIterating}
                className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold shadow-xs disabled:opacity-40 transition cursor-pointer shrink-0 flex items-center justify-center gap-1 active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Fullscreen Zoom Lightbox Modal */}
      {(zoomImageUrl || isZoomOpen) && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => {
            setZoomImageUrl(null);
            setIsZoomOpen(false);
          }}
        >
          <div
            className="flex items-center justify-between text-white pb-3 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs font-medium text-white/80">Hand Manicure Inspector</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCompareMode((m) => (m === 'after' ? 'before' : 'after'))}
                className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition cursor-pointer"
              >
                {compareMode === 'after' ? 'Natural Hand' : 'Manicure'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoomImageUrl(null);
                  setIsZoomOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div
            className="flex-1 flex items-center justify-center min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={
                compareMode === 'before'
                  ? originalBareHandPhoto
                  : (zoomImageUrl || currentTryOnImage)
              }
              alt="Hand High Resolution"
              className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}

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
