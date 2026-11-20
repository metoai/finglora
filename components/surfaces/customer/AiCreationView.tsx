import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  RotateCcw,
  ArrowLeft,
  Loader2,
  Maximize2,
  X,
  Download,
  Share2,
  ChevronDown,
  Plus,
  Hand,
  Check,
  Copy,
  Sliders,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { Finger, NailDesign } from '@/types/nail';
import { useTryOnCredit, getUserCreditStatus } from '@/lib/services/credits';
import { ProPaywallModal } from '@/components/common/ProPaywallModal';
import { downscaleImageForVision } from '@/lib/services/storage';
import { downloadEditorialImage, shareToStoryOrSocial } from '@/lib/services/editorial-export';

interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
  appliedDesignTitle?: string;
  imageUrl?: string;
}

const CHATGPT_SUGGESTION_PROMPTS = [
  {
    title: 'Glazed Donut Chrome',
    subtitle: 'Pearlescent glazed chrome on soft almond silhouette',
    prompt: 'Glazed donut chrome with soft pearlescent shimmer on almond nails',
  },
  {
    title: 'Micro French Tips',
    subtitle: 'Clean milky rubber base with crisp ultra-thin white tips',
    prompt: 'Micro French tips with sheer pink rubber base and crisp white smile line',
  },
  {
    title: 'Cherry Mocha Velvet',
    subtitle: 'Deep burgundy aura with high-gloss mirror gel shine',
    prompt: 'Cherry mocha velvet burgundy nails with deep mirror gloss finish',
  },
  {
    title: 'Blush Ribbon Coquette',
    subtitle: 'Sheer strawberry milk base with delicate hand-drawn ribbon art',
    prompt: 'Blush pink coquette nails with delicate white ribbon bow accents',
  },
];

const QUICK_CHIPS = [
  'Glazed Chrome',
  'French Tips',
  'Cherry Mocha',
  'Almond Shape',
  'Velvet Aura',
  'Micro Glitter',
  'Square Tips',
];

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
  const [exportToast, setExportToast] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mobileActiveTab, setMobileActiveTab] = useState<'chat' | 'canvas'>('chat');

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
    return [];
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const executedInitialPromptRef = useRef<string | null>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isIterating]);

  // Adjust textarea height like ChatGPT
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

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
              ? `Created "${trimmed}" directly on your hand in high-definition salon gel realism. What adjustments would you like to refine?`
              : `Applied "${trimmed}" directly onto your hand. All fingernails have been updated with seamless edge blending.`,
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
        : `Could not apply "${trimmed}". Please try describing the change with different details.`;

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
        text: 'Connection error while contacting AI atelier. Please try again.',
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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    executePrompt(text, false);
  };

  const handleStartNewLook = () => {
    setMessages([]);
    setPromptText('');
    setCurrentTryOnImage(originalBareHandPhoto);
    setCompareMode('after');
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadBrandedLook = async (targetImg?: string | null, title?: string) => {
    const imgUrl = targetImg || zoomImageUrl || currentTryOnImage;
    if (!imgUrl) return;
    setIsExporting(true);
    try {
      await downloadEditorialImage(imgUrl, {
        designTitle: title || 'Custom AI Manicure',
        filename: `finglora-${(title || 'ai-manicure').toLowerCase().replace(/\s+/g, '-')}.jpg`,
      });
      setExportToast('High-resolution manicure photo saved with Finglora atelier brand');
      setTimeout(() => setExportToast(null), 3000);
    } catch {
      setExportToast('Could not download image. Please try again.');
      setTimeout(() => setExportToast(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareToStory = async (targetImg?: string | null, title?: string) => {
    const imgUrl = targetImg || zoomImageUrl || currentTryOnImage;
    if (!imgUrl) return;
    setIsExporting(true);
    try {
      const res = await shareToStoryOrSocial(imgUrl, {
        designTitle: title || 'Custom AI Manicure',
        filename: `finglora-story-${(title || 'ai-manicure').toLowerCase().replace(/\s+/g, '-')}.jpg`,
        storyAspect: true,
      });
      if (res.mode === 'shared') {
        setExportToast('Story sheet opened');
      } else {
        setExportToast('Story photo downloaded with Finglora branding');
      }
      setTimeout(() => setExportToast(null), 3000);
    } catch {
      setExportToast('Could not share story. Please try again.');
      setTimeout(() => setExportToast(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white text-stone-900 overflow-hidden select-none">
      {/* Toast Notification */}
      {exportToast && (
        <div className="fixed top-5 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
          <div className="bg-[#181416] text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-xl border border-white/10 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Check className="w-3.5 h-3.5 text-[#E0246A]" />
            <span>{exportToast}</span>
          </div>
        </div>
      )}

      {/* 1. Clean, Spacious Header (Simplified on Mobile) */}
      <header className="h-12 sm:h-14 border-b border-stone-200/80 px-2.5 sm:px-6 flex items-center justify-between shrink-0 bg-white z-20 gap-2">
        {/* Left: Back button + Model badge */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
          {onBackToTryOn && (
            <button
              type="button"
              onClick={onBackToTryOn}
              className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-600 hover:text-stone-900 transition cursor-pointer active:scale-95 shrink-0"
              title="Back to Virtual Try-On"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {/* Model Title: Single line without wrapping */}
          <div className="flex items-center gap-1.5 py-1 select-none">
            <span className="font-semibold text-sm sm:text-base text-stone-900 tracking-tight whitespace-nowrap">
              Finglora AI
            </span>
            <span className="text-[11px] font-medium text-stone-400 hidden sm:inline">
              Vision 3.1
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:inline" />
          </div>
        </div>

        {/* Center on Mobile: Compact [Chat | Hand] Toggle */}
        <div className="flex lg:hidden items-center bg-stone-100 rounded-full p-0.5 border border-stone-200/60 shrink-0">
          <button
            type="button"
            onClick={() => setMobileActiveTab('chat')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
              mobileActiveTab === 'chat'
                ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Chat
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveTab('canvas')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
              mobileActiveTab === 'canvas'
                ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Hand
          </button>
        </div>

        {/* Right: Clean Actions (Single '+' on mobile, full actions on sm+) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={handleStartNewLook}
            className="h-8 px-2.5 sm:px-3 rounded-full hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-2xs"
            title="Start fresh look"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Look</span>
          </button>

          <button
            type="button"
            onClick={() => handleDownloadBrandedLook(currentTryOnImage)}
            disabled={isExporting}
            className="hidden sm:flex w-8 h-8 rounded-full hover:bg-stone-100 text-stone-700 items-center justify-center transition cursor-pointer active:scale-95 disabled:opacity-50"
            title="Download high-resolution image"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleShareToStory(currentTryOnImage)}
            disabled={isExporting}
            className="hidden sm:flex w-8 h-8 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs"
            title="Share to Instagram Story"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Full-Space Workspace: Desktop Split Screen / Mobile View Switcher */}
      <div className="flex-1 min-h-0 w-full flex overflow-hidden">
        {/* ============================================================== */}
        {/* LEFT PANE: PHOTOREALISTIC HAND CANVAS                          */}
        {/* (Full width on mobile when tab='canvas', 48% on desktop)       */}
        {/* ============================================================== */}
        <div
          className={`${
            mobileActiveTab === 'canvas' ? 'flex' : 'hidden lg:flex'
          } w-full lg:w-[46%] xl:w-[44%] h-full flex-col bg-[#F9F9F9] border-r border-stone-200/80 p-3 sm:p-5 lg:p-6 justify-between items-center relative overflow-hidden`}
        >
          {/* Top Canvas Bar */}
          <div className="w-full flex items-center justify-between z-10">
            {/* Pill Toggle: [Natural Hand] [Manicure] */}
            <div className="inline-flex rounded-full bg-white p-0.5 border border-stone-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setCompareMode('before')}
                className={`px-3 py-1 rounded-full text-xs transition cursor-pointer ${
                  compareMode === 'before'
                    ? 'bg-stone-900 text-white font-semibold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Natural Hand
              </button>
              <button
                type="button"
                onClick={() => setCompareMode('after')}
                className={`px-3 py-1 rounded-full text-xs transition cursor-pointer ${
                  compareMode === 'after'
                    ? 'bg-[#E0246A] text-white font-semibold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Manicure Look
              </button>
            </div>

            {/* Quick Fullscreen Inspector */}
            <button
              type="button"
              onClick={() => {
                setZoomImageUrl(currentTryOnImage);
                setIsZoomOpen(true);
              }}
              className="w-8 h-8 rounded-full bg-white border border-stone-200 text-stone-700 hover:text-stone-900 shadow-2xs flex items-center justify-center cursor-pointer transition active:scale-95"
              title="Inspect Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Main Hand Viewport */}
          <div className="relative w-full max-w-[440px] aspect-[3/4] my-auto rounded-3xl overflow-hidden bg-stone-200/70 border border-stone-300/80 shadow-md flex items-center justify-center group">
            {isIterating && (
              <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-white text-center p-6 animate-in fade-in duration-200">
                <Loader2 className="w-9 h-9 animate-spin text-[#E0246A]" />
                <div className="space-y-1">
                  <span className="text-sm font-semibold tracking-wide block">
                    Generating Bespoke Manicure...
                  </span>
                  <span className="text-xs text-stone-300 block max-w-xs leading-relaxed">
                    Preserving hand anatomy, finger pose, and lighting with high-gloss salon gel clearcoat
                  </span>
                </div>
              </div>
            )}

            <img
              src={compareMode === 'before' ? originalBareHandPhoto : currentTryOnImage}
              alt="Live Hand Viewport"
              onClick={() => {
                setZoomImageUrl(currentTryOnImage);
                setIsZoomOpen(true);
              }}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102 cursor-pointer"
              title="Click to zoom in"
            />

            {/* Live Indicator Pill */}
            <div className="absolute top-3 left-3 z-20">
              <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium tracking-wide flex items-center gap-1.5 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{compareMode === 'after' ? 'Manicure Active' : 'Natural Hand'}</span>
              </span>
            </div>

            {/* Hold to Compare floating button */}
            <div className="absolute bottom-3 inset-x-0 flex justify-center z-20 pointer-events-none">
              <button
                type="button"
                onClick={() => setCompareMode((m) => (m === 'after' ? 'before' : 'after'))}
                className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-white text-stone-900 text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer transition active:scale-95 border border-stone-200/60"
              >
                <RotateCcw className="w-3 h-3 text-[#E0246A]" />
                <span>{compareMode === 'after' ? 'View Natural Hand' : 'View Manicure'}</span>
              </button>
            </div>
          </div>

          {/* Bottom Anatomy Note */}
          <div className="w-full text-center text-[11px] text-stone-400 font-mono tracking-tight pt-1">
            Hand anatomy, skin tone, and lighting locked · Photorealistic LED gel clearcoat
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT PANE: CHATGPT LIGHT-MODE CONVERSATIONAL ASSISTANT        */}
        {/* (Full width on mobile when tab='chat', 54% on desktop)         */}
        {/* ============================================================== */}
        <div
          className={`${
            mobileActiveTab === 'chat' ? 'flex' : 'hidden lg:flex'
          } w-full lg:w-[54%] xl:w-[56%] h-full flex-col bg-white justify-between overflow-hidden relative`}
        >
          {/* Scrollable Message History Area */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 lg:px-12 py-4 sm:py-6 space-y-6 scrollbar-thin">
            {/* If no messages yet: Show ChatGPT-Style Welcome Hero with 4 Suggestion Cards */}
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-8 sm:py-12 space-y-6 animate-in fade-in duration-300">
                {/* Brand Monogram */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-stone-900 text-white flex items-center justify-center shadow-2xs font-serif text-2xl sm:text-3xl font-bold">
                  F
                </div>

                <div className="space-y-1.5">
                  <h2 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900 tracking-tight">
                    What look are we creating today?
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
                    Describe any manicure, shape, color, or finish. Finglora AI applies it directly onto your hand in photorealistic detail.
                  </p>
                </div>

                {/* 2x2 Clean Suggestion Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full text-left pt-2">
                  {CHATGPT_SUGGESTION_PROMPTS.map((card, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setPromptText(card.prompt);
                        if (textareaRef.current) {
                          textareaRef.current.focus();
                        }
                      }}
                      className="p-3 sm:p-3.5 rounded-2xl border border-stone-200/80 hover:border-stone-300 hover:bg-stone-50/80 transition-all text-left cursor-pointer group active:scale-98 shadow-2xs space-y-1"
                    >
                      <h4 className="font-semibold text-xs sm:text-sm text-stone-900 group-hover:text-[#E0246A] transition-colors">
                        {card.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 leading-normal line-clamp-2">
                        {card.subtitle}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Message Stream */
              <div className="space-y-6 max-w-2xl mx-auto">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';

                  if (isUser) {
                    return (
                      <div key={msg.id} className="flex justify-end animate-in fade-in duration-150">
                        <div className="bg-[#F4F4F4] text-stone-900 rounded-3xl rounded-br-md px-4 sm:px-5 py-2.5 sm:py-3 max-w-[85%] text-xs sm:text-sm leading-relaxed shadow-2xs">
                          {msg.text}
                        </div>
                      </div>
                    );
                  }

                  // Gemini / Assistant Message
                  return (
                    <div key={msg.id} className="flex gap-3 sm:gap-4 items-start animate-in fade-in duration-200">
                      {/* Avatar */}
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-stone-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs text-[10px] sm:text-[11px] font-bold">
                        AI
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-3">
                        <p className="text-xs sm:text-sm text-stone-800 leading-relaxed">
                          {msg.text}
                        </p>

                        {/* Generated Manicure Card inline in thread */}
                        {msg.imageUrl && (
                          <div className="rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm max-w-xs sm:max-w-sm space-y-0 group">
                            <div className="relative aspect-[3/4] overflow-hidden bg-stone-200">
                              <img
                                src={msg.imageUrl}
                                alt={msg.appliedDesignTitle || 'Generated Look'}
                                onClick={() => {
                                  setZoomImageUrl(msg.imageUrl || null);
                                  setIsZoomOpen(true);
                                }}
                                className="w-full h-full object-cover cursor-pointer group-hover:scale-102 transition duration-300"
                              />

                              <div className="absolute top-2.5 left-2.5">
                                <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium capitalize">
                                  {msg.appliedDesignTitle || 'Manicure'}
                                </span>
                              </div>

                              <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDownloadBrandedLook(msg.imageUrl, msg.appliedDesignTitle)}
                                  disabled={isExporting}
                                  className="w-7 h-7 rounded-full bg-white/95 text-stone-800 hover:bg-white shadow-xs flex items-center justify-center transition cursor-pointer active:scale-90"
                                  title="Download HD"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleShareToStory(msg.imageUrl, msg.appliedDesignTitle)}
                                  disabled={isExporting}
                                  className="w-7 h-7 rounded-full bg-[#E0246A] text-white hover:bg-[#BE185D] shadow-xs flex items-center justify-center transition cursor-pointer active:scale-90"
                                  title="Share to Story"
                                >
                                  <Share2 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setZoomImageUrl(msg.imageUrl || null);
                                    setIsZoomOpen(true);
                                  }}
                                  className="w-7 h-7 rounded-full bg-white/95 text-stone-800 hover:bg-white shadow-xs flex items-center justify-center transition cursor-pointer active:scale-90"
                                  title="Inspect Fullscreen"
                                >
                                  <Maximize2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="p-3 bg-white flex items-center justify-between border-t border-stone-100">
                              <div>
                                <span className="text-xs font-semibold text-stone-900 block truncate">
                                  {msg.appliedDesignTitle || 'Custom Look'}
                                </span>
                                <span className="text-[10px] text-stone-400">High-gloss gel finish</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  if (msg.imageUrl) {
                                    setCurrentTryOnImage(msg.imageUrl);
                                    setCompareMode('after');
                                    setMobileActiveTab('canvas');
                                  }
                                }}
                                className="px-3 py-1.5 rounded-full bg-stone-900 hover:bg-[#E0246A] text-white text-xs font-semibold transition cursor-pointer active:scale-95 shadow-xs"
                              >
                                View on Hand
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Assistant Action Bar (Copy text, timestamp) */}
                        <div className="flex items-center gap-2 pt-1 text-[11px] text-stone-400">
                          <span>{msg.timestamp}</span>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(msg.id, msg.text)}
                            className="hover:text-stone-700 transition cursor-pointer flex items-center gap-1"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Loading / Generating State in thread */}
                {isIterating && (
                  <div className="flex gap-3 sm:gap-4 items-start animate-in fade-in duration-200">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-stone-100 border border-stone-200 text-[#E0246A] flex items-center justify-center shrink-0 shadow-2xs">
                      <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-[#E0246A]" />
                    </div>
                    <div className="space-y-1 py-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-stone-900">
                          Finglora AI is crafting your manicure...
                        </span>
                      </div>
                      <p className="text-xs text-stone-500">
                        Applying custom gel layer, blending cuticle edges, and rendering specular light reflections.
                      </p>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Bottom Floating Prompt Dock (ChatGPT Style in White Mode) */}
          <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-t from-white via-white to-transparent shrink-0 max-w-2xl w-full mx-auto space-y-2">
            {/* Quick Suggestion Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 select-none">
              {QUICK_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPromptText((prev) => (prev ? `${prev}, ${chip}` : chip));
                    if (textareaRef.current) {
                      textareaRef.current.focus();
                    }
                  }}
                  className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-[11px] font-medium text-stone-700 whitespace-nowrap transition cursor-pointer active:scale-95 shrink-0"
                >
                  + {chip}
                </button>
              ))}
            </div>

            {/* ChatGPT White Floating Capsule Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt();
              }}
              className="bg-[#F4F4F4] hover:bg-[#EFEFEF] focus-within:bg-white focus-within:ring-2 focus-within:ring-stone-300 rounded-[28px] border border-stone-200/80 p-2 sm:p-2.5 shadow-sm transition-all flex items-end gap-2"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={promptText}
                onChange={handleTextareaInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendPrompt();
                  }
                }}
                placeholder="Message Finglora AI to customize shape, color, pattern, finish..."
                className="flex-1 bg-transparent text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none resize-none px-2 py-1 max-h-28 leading-relaxed"
              />

              <button
                type="submit"
                disabled={!promptText.trim() || isIterating}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs active:scale-95 ${
                  promptText.trim() && !isIterating
                    ? 'bg-stone-900 hover:bg-[#E0246A] text-white'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
                title="Send Prompt"
              >
                {isIterating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>

            <div className="text-center text-[10px] text-stone-400">
              Finglora AI uses Google Gemini Vision to photorealistically adapt manicures to human hands.
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Zoom Lightbox Modal */}
      {(zoomImageUrl || isZoomOpen) && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => {
            setZoomImageUrl(null);
            setIsZoomOpen(false);
          }}
        >
          <div
            className="flex items-center justify-between text-white pb-3 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs font-semibold tracking-wide text-white/90">
              Hand Manicure Inspector
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCompareMode((m) => (m === 'after' ? 'before' : 'after'))}
                className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition cursor-pointer"
              >
                {compareMode === 'after' ? 'Show Natural Hand' : 'Show Manicure'}
              </button>
              <button
                type="button"
                onClick={() => handleDownloadBrandedLook(zoomImageUrl || currentTryOnImage)}
                disabled={isExporting}
                className="px-3 py-1 rounded-full bg-white text-stone-900 hover:bg-stone-100 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-stone-900" />
                <span className="hidden sm:inline">Download HD</span>
              </button>
              <button
                type="button"
                onClick={() => handleShareToStory(zoomImageUrl || currentTryOnImage)}
                disabled={isExporting}
                className="px-3 py-1 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Share2 className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">Share Story</span>
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
