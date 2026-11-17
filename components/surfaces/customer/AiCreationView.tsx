'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Paintbrush,
  ArrowLeft,
  Camera,
  X,
  Send,
  Hand,
  Layers,
  Paperclip,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  Finger,
  NailDesign,
  NailFinish,
  NailPattern,
  SkinTonePreset,
} from '@/types/nail';
import { FINGER_KEYS, FINGER_LABELS } from '@/constants/nail-data';
import { NailCanvasPreview } from '@/components/visuals/NailCanvasPreview';
import { EditorialHandVisual } from '@/components/visuals/EditorialHandVisual';
import { BrandLogoIcon } from '@/components/common/BrandLogo';

// Initial preloaded design: "Soft Romance"
const INITIAL_SOFT_ROMANCE: Record<Finger, NailDesign> = {
  thumb: {
    finger: 'thumb',
    title: 'Soft Pink French',
    baseColor: '#F7D8D5',
    accentColor: '#FFFFFF',
    pattern: 'classic-french',
    shape: 'almond',
    length: 'medium',
    finish: 'glossy',
    clientNote: 'Sheer nude foundation with crisp micro-fine white smile lines',
    status: 'detected',
  },
  index: {
    finger: 'index',
    title: 'Glossy Nude',
    baseColor: '#F2DFD7',
    accentColor: '#E8D0C5',
    pattern: 'solid',
    shape: 'almond',
    length: 'medium',
    finish: 'glossy',
    clientNote: 'Natural translucent blush nude with high-gloss mirror shine',
    status: 'detected',
  },
  middle: {
    finger: 'middle',
    title: 'Delicate Pink Floral',
    baseColor: '#F9E8ED',
    accentColor: '#E0246A',
    pattern: 'floral',
    shape: 'almond',
    length: 'medium',
    finish: 'glossy',
    clientNote: 'Hand-painted blossom petals blossoming on soft milky blush',
    status: 'detected',
  },
  ring: {
    finger: 'ring',
    title: 'Floral French',
    baseColor: '#F5CAD2',
    accentColor: '#801A35',
    pattern: 'floral',
    shape: 'almond',
    length: 'medium',
    finish: 'glossy',
    clientNote: 'French smile arch accented with delicate micro-roses and deep berry vines',
    status: 'detected',
  },
  pinky: {
    finger: 'pinky',
    title: 'Glossy Rose',
    baseColor: '#E8B4C0',
    accentColor: '#E0246A',
    pattern: 'solid',
    shape: 'almond',
    length: 'medium',
    finish: 'glossy',
    clientNote: 'Refined rose petal lacquer with subtle crystalline depth',
    status: 'detected',
  },
};

// Conversational Message
interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  imageUrl?: string;
  design?: {
    title: string;
    nails: Record<Finger, NailDesign>;
  };
}

// Starter Suggestion Chips
const STARTER_PROMPTS = [
  'Glazed pearl chrome',
  'Rich velvet bordeaux',
  'Clean girl micro French',
  'Botanical floral ring finger',
  'Champagne gold shimmer',
];

export function AiCreationView({
  prompt: initialPrompt,
  onTryOnClick,
  onBackClick,
  orderedFingers,
  nails: propNails,
  setNails: propSetNails,
  activeSetName,
  setActiveSetName,
  activePhotoUrl,
  setActivePhotoUrl,
  activeSkinTone,
  handOrientation,
}: {
  prompt?: string;
  onTryOnClick: () => void;
  onBackClick: () => void;
  orderedFingers: Finger[];
  nails: Record<Finger, NailDesign>;
  setNails: React.Dispatch<React.SetStateAction<Record<Finger, NailDesign>>>;
  activeSetName: string;
  setActiveSetName: (name: string) => void;
  activePhotoUrl?: string;
  setActivePhotoUrl: (url: string) => void;
  activeSkinTone: SkinTonePreset;
  handOrientation: 'left' | 'right';
}) {
  // Current active manicure set
  const [activeNails, setActiveNails] = useState<Record<Finger, NailDesign>>(
    () => propNails || INITIAL_SOFT_ROMANCE
  );
  const [currentTitle, setCurrentTitle] = useState(
    () => activeSetName || 'Soft Romance'
  );

  // Studio Preview Toggle: 'hand' | 'fingers'
  const [studioViewMode, setStudioViewMode] = useState<'hand' | 'fingers'>('hand');

  // Chat message stream
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: "Hello! I'm Flora, your personal nail artist. Tell me what kind of manicure you're imagining, or upload an inspiration photo. I'll design each finger and bring it to life.",
      timestamp: 'Just now',
      design: {
        title: activeSetName || 'Soft Romance',
        nails: propNails || INITIAL_SOFT_ROMANCE,
      },
    },
  ]);

  // Composer state
  const [composerText, setComposerText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  // Refs
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasHandledInitialPromptRef = useRef(false);

  // Auto-scroll on new messages
  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Keep parent state updated with current look
  useEffect(() => {
    propSetNails(activeNails);
    setActiveSetName(currentTitle);
  }, [activeNails, currentTitle, propSetNails, setActiveSetName]);

  // Run initial prompt once if provided from homepage
  useEffect(() => {
    if (
      initialPrompt &&
      initialPrompt.trim().length > 0 &&
      !hasHandledInitialPromptRef.current
    ) {
      hasHandledInitialPromptRef.current = true;
      handleSendPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  // Handle image upload from device
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Select this design and open Try-On
  const handleLaunchTryOn = (designNails: Record<Finger, NailDesign>, title: string) => {
    setActiveNails(designNails);
    setCurrentTitle(title);
    propSetNails(designNails);
    setActiveSetName(title);
    onTryOnClick();
  };

  // AI Formulation simulation
  const handleSendPrompt = (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : composerText).trim();
    if (!text && !attachedImage) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text || 'Here is my inspiration photo for the manicure:',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: attachedImage || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setComposerText('');
    setAttachedImage(null);
    setIsThinking(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      const updated = JSON.parse(JSON.stringify(activeNails)) as Record<Finger, NailDesign>;
      let aiNote = '';
      let newTitle = currentTitle;

      if (userMsg.imageUrl) {
        aiNote =
          'I extracted the palette from your photo: an iridescent glazed rose-gold finish with delicate floral accents on your ring finger and clean French lines across the rest.';
        newTitle = 'Inspiration Look';
        updated.ring.pattern = 'floral';
        updated.ring.finish = 'glossy';
        updated.ring.baseColor = '#F5CAD2';
        updated.ring.accentColor = '#791D40';
        updated.thumb.pattern = 'classic-french';
        updated.thumb.baseColor = '#F7D8D5';
        updated.index.pattern = 'solid';
        updated.index.baseColor = '#F2DFD7';
        updated.middle.pattern = 'chrome-swirl';
        updated.middle.finish = 'chrome';
        updated.middle.baseColor = '#FDFCF7';
        updated.pinky.pattern = 'solid';
        updated.pinky.baseColor = '#E8B4C0';
      } else if (
        lower.includes('burgundy') ||
        lower.includes('bordeaux') ||
        lower.includes('red') ||
        lower.includes('berry')
      ) {
        aiNote =
          'Changed the color palette to rich velvet bordeaux with warm undertones. It looks luxurious and sophisticated.';
        newTitle = 'Velvet Bordeaux Set';
        FINGER_KEYS.forEach((fk) => {
          updated[fk].baseColor = '#791D40';
          updated[fk].accentColor = '#EAD7A1';
        });
      } else if (lower.includes('french')) {
        aiNote =
          'Transformed your nails with clean, micro-fine French smile lines on a translucent blush foundation.';
        newTitle = 'Classic Parisian French';
        FINGER_KEYS.forEach((fk) => {
          updated[fk].pattern = 'classic-french';
          updated[fk].finish = 'glossy';
          updated[fk].baseColor = '#F7D8D5';
          updated[fk].accentColor = '#FFFFFF';
        });
      } else if (lower.includes('floral') || lower.includes('flower')) {
        aiNote =
          'Added delicate hand-painted botanical blossom petals on your focal ring and middle fingers.';
        newTitle = 'Botanical Flora Set';
        updated.middle.pattern = 'floral';
        updated.middle.baseColor = '#F9E8ED';
        updated.middle.accentColor = '#E0246A';
        updated.ring.pattern = 'floral';
        updated.ring.baseColor = '#F5CAD2';
        updated.ring.accentColor = '#791D40';
      } else if (
        lower.includes('chrome') ||
        lower.includes('glazed') ||
        lower.includes('pearl')
      ) {
        aiNote =
          'Infused a luminous glazed chrome topcoat with pearlescent reflections across every nail.';
        newTitle = 'Glazed Chrome Pearlescent';
        FINGER_KEYS.forEach((fk) => {
          updated[fk].finish = 'chrome';
          updated[fk].pattern = 'chrome-swirl';
          updated[fk].baseColor = '#FDFCF7';
          updated[fk].accentColor = '#EAD7A1';
        });
      } else if (
        lower.includes('minimal') ||
        lower.includes('nude') ||
        lower.includes('clean')
      ) {
        aiNote =
          'Refined your manicure into a clean-girl minimalist look: sheer porcelain glass nudes with ultra-fine accents.';
        newTitle = 'Minimal Sheer Glass';
        FINGER_KEYS.forEach((fk) => {
          updated[fk].pattern = 'minimal-line';
          updated[fk].finish = 'glossy';
          updated[fk].baseColor = '#F2DFD7';
          updated[fk].accentColor = '#281720';
        });
      } else {
        aiNote = `Brought "${text}" to life! I harmonized the colors and apex curvature across all 5 fingers.`;
        newTitle = text.slice(0, 24) || 'Custom AI Manicure';
        updated.ring.baseColor = '#E0246A';
        updated.ring.accentColor = '#EAD7A1';
        updated.ring.pattern = 'chrome-swirl';
      }

      setActiveNails(updated);
      setCurrentTitle(newTitle);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiNote,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        design: {
          title: newTitle,
          nails: updated,
        },
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);
    }, 700);
  };

  return (
    <div className="h-full w-full flex-1 flex flex-col bg-[#FAF9F6] text-[#18181B] font-sans overflow-hidden">
      {/* ==================================================================== */}
      {/* TOP BAR                                                              */}
      {/* ==================================================================== */}
      <header className="shrink-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 py-2.5 sm:py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Back button + Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackClick}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition cursor-pointer active:scale-95"
              title="Return home"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <BrandLogoIcon size="sm" />
              <span className="font-serif text-sm sm:text-base font-medium text-stone-900 tracking-tight hidden sm:inline">
                AI Studio
              </span>
            </div>
          </div>

          {/* Quick Try-On CTA at top right */}
          <button
            type="button"
            onClick={() => handleLaunchTryOn(activeNails, currentTitle)}
            className="h-8 px-4 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 transition cursor-pointer active:scale-95"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Try On</span>
          </button>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* MAIN LAYOUT: MINIMAL CONVERSATION (LEFT) + LIVE STUDIO CANVAS (RIGHT) */}
      {/* ==================================================================== */}
      <main className="flex-1 min-h-0 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 overflow-hidden flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8 h-full min-h-0 flex-1">
          {/* Left Column (Chat Conversation Feed + Input Composer on Left Side Only) */}
          <div className="lg:col-span-7 flex flex-col h-full min-h-0 space-y-2.5 pb-2">
            {/* Scrollable Message History */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-3.5 pr-1 sm:pr-2 py-1 scroll-smooth">
              {messages.map((msg) => {
                const isAi = msg.sender === 'ai';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isAi ? 'items-start' : 'items-end'
                    } animate-in fade-in duration-200`}
                  >
                    {/* Sender Label */}
                    {isAi && (
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="w-4 h-4 rounded-full bg-[#FDF2F8] border border-[#E0246A]/20 flex items-center justify-center text-[#E0246A] text-[9px]">
                          ✿
                        </span>
                        <span className="text-[11px] font-medium text-stone-700">
                          Flora
                        </span>
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[92%] sm:max-w-[88%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed space-y-2.5 ${
                        isAi
                          ? 'bg-white border border-stone-200/80 text-stone-900 shadow-2xs'
                          : 'bg-[#18181B] text-white rounded-br-xs shadow-2xs'
                      }`}
                    >
                      {/* User Image Attachment */}
                      {msg.imageUrl && (
                        <div className="rounded-xl overflow-hidden border border-white/20 max-h-48 mb-2">
                          <img
                            src={msg.imageUrl}
                            alt="Inspiration"
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      )}

                      {/* Text Message */}
                      <p className="whitespace-pre-line">{msg.text}</p>

                      {/* AI Design Box (Left chat message consists of design details, 5-nail breakdown & mobile visual) */}
                      {isAi && msg.design && (
                        <div className="rounded-2xl bg-stone-50 border border-stone-200/80 p-3 sm:p-4 space-y-3 mt-1.5 shadow-2xs">
                          {/* Box Header */}
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[9px] font-mono tracking-widest uppercase text-stone-400 font-semibold block">
                                DESIGN RECIPE
                              </span>
                              <h4 className="font-serif text-sm sm:text-base font-semibold text-stone-900 leading-tight">
                                {msg.design.title}
                              </h4>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-stone-200 text-stone-600 font-medium">
                              5 Fingers
                            </span>
                          </div>

                          {/* MOBILE-ONLY: Hand Visual directly in the chat feed */}
                          <div className="lg:hidden rounded-xl bg-white border border-stone-200/70 p-2 flex items-center justify-center min-h-[220px]">
                            <EditorialHandVisual
                              nails={msg.design.nails}
                              skinTone={activeSkinTone}
                              isRight={handOrientation === 'right'}
                              width={220}
                              height={230}
                            />
                          </div>

                          {/* 5-Finger Nail Breakdown Strip (Visible on Desktop & Mobile) */}
                          <div className="grid grid-cols-5 gap-1.5 p-1.5 sm:p-2 bg-white rounded-xl border border-stone-200/70">
                            {orderedFingers.map((fk) => {
                              const nail = msg.design!.nails[fk];
                              return (
                                <div
                                  key={fk}
                                  className="flex flex-col items-center gap-1 p-1 bg-stone-50 rounded-lg text-center"
                                >
                                  <NailCanvasPreview
                                    nail={nail}
                                    width={22}
                                    height={32}
                                    showCuticle={false}
                                  />
                                  <span className="text-[9px] font-medium text-stone-600 capitalize truncate max-w-full">
                                    {FINGER_LABELS[fk].slice(0, 3)}
                                  </span>
                                  <span
                                    className="w-2 h-2 rounded-full border border-black/10"
                                    style={{ backgroundColor: nail.baseColor }}
                                    title={nail.baseColor}
                                  />
                                </div>
                              );
                            })}
                          </div>

                          {/* Actions in Chat Design Box */}
                          <div className="flex items-center gap-2 pt-0.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleLaunchTryOn(msg.design!.nails, msg.design!.title)
                              }
                              className="flex-1 h-9 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer active:scale-98"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>Try On This Look</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>

                            {/* Desktop Button to preview in right studio showcase */}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveNails(msg.design!.nails);
                                setCurrentTitle(msg.design!.title);
                              }}
                              className="hidden lg:inline-flex h-9 px-3 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium items-center justify-center transition cursor-pointer active:scale-98"
                              title="Show in studio showcase"
                            >
                              Preview
                            </button>
                          </div>
                        </div>
                      )}

                      <span
                        className={`text-[9px] font-mono block text-right pt-0.5 ${
                          isAi ? 'text-stone-400' : 'text-stone-400'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* AI Typing Indicator */}
              {isThinking && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-stone-200/80 text-xs font-mono text-stone-700 max-w-[200px] shadow-2xs">
                  <Paintbrush className="w-3.5 h-3.5 text-[#E0246A] animate-pulse" />
                  <span>Flora is creating...</span>
                </div>
              )}

              <div ref={chatScrollRef} />
            </div>

            {/* Sticky Chat Composer - On the Left Side Only */}
            <div className="shrink-0 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200/80 p-2.5 sm:p-3 space-y-2 shadow-xs sticky bottom-0 z-10">
              {/* Quick Suggestion Chips */}
              <div className="overflow-x-auto scrollbar-none flex items-center gap-1.5 pb-0.5">
                <span className="text-[10px] font-mono text-stone-400 shrink-0 flex items-center gap-1 pl-1">
                  <Sparkles className="w-3 h-3 text-[#E0246A]" />
                  <span>Try:</span>
                </span>
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    disabled={isThinking}
                    onClick={() => handleSendPrompt(prompt)}
                    className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-[#FDF2F8] hover:text-[#E0246A] border border-stone-200/70 text-[11px] text-stone-700 font-medium whitespace-nowrap shadow-2xs shrink-0 cursor-pointer disabled:opacity-40 transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Image Preview if user attached a photo */}
              {attachedImage && (
                <div className="relative inline-block border border-stone-200 rounded-xl overflow-hidden shadow-2xs bg-stone-50">
                  <img
                    src={attachedImage}
                    alt="Inspiration attachment"
                    className="h-14 w-14 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setAttachedImage(null)}
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition cursor-pointer"
                    title="Remove photo"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}

              {/* Composer Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendPrompt();
                }}
                className="flex items-center gap-2"
              >
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />

                {/* Paperclip Button for Photo Upload */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200/80 text-stone-600 flex items-center justify-center shrink-0 transition cursor-pointer active:scale-95"
                  title="Attach nail inspiration photo"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Text Input */}
                <input
                  type="text"
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                  placeholder="Describe your dream nails or what to change..."
                  disabled={isThinking}
                  className="flex-1 h-9 px-3.5 rounded-full bg-stone-100 border border-stone-200/80 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#E0246A] focus:bg-white transition"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={(!composerText.trim() && !attachedImage) || isThinking}
                  className="w-9 h-9 rounded-full bg-[#E0246A] hover:bg-[#BE185D] disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition shadow-md active:scale-95 cursor-pointer"
                  title="Send to Flora"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Live Studio Showcase (Non-scrollable dedicated showcase, always visible) */}
          <div className="hidden lg:flex lg:col-span-5 h-full min-h-0 flex-col justify-center overflow-hidden pb-2 select-none">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs space-y-3.5 text-center">
              {/* Header with Title and Live Sync Status */}
              <div className="flex items-center justify-between pb-2.5 border-b border-stone-100 text-left">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-stone-400 font-semibold block">
                    STUDIO SHOWCASE
                  </span>
                  <h3 className="font-serif text-base sm:text-lg font-normal text-stone-900 tracking-tight truncate max-w-[220px]">
                    {currentTitle}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200/80 text-[10px] font-medium text-stone-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live Sync</span>
                </div>
              </div>

              {/* Showcase Hand Viewport */}
              <div className="rounded-2xl bg-[#F7F4F0] border border-stone-200/60 p-3 flex items-center justify-center max-h-[280px]">
                <EditorialHandVisual
                  nails={activeNails}
                  skinTone={activeSkinTone}
                  isRight={handOrientation === 'right'}
                  width={260}
                  height={270}
                />
              </div>

              {/* Active Palette Row */}
              <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200/60 text-xs">
                <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider">
                  Active Palette
                </span>
                <div className="flex items-center gap-1.5">
                  {orderedFingers.map((fk) => (
                    <div
                      key={fk}
                      className="w-5 h-5 rounded-full border border-black/10 shadow-2xs flex items-center justify-center transition-transform hover:scale-110"
                      style={{ backgroundColor: activeNails[fk].baseColor }}
                      title={`${FINGER_LABELS[fk]}: ${activeNails[fk].baseColor}`}
                    />
                  ))}
                </div>
              </div>

              {/* Quick Try-On Action */}
              <button
                type="button"
                onClick={() => handleLaunchTryOn(activeNails, currentTitle)}
                className="w-full h-11 rounded-2xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-[#E0246A]/20 transition cursor-pointer active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>Try On in AR Camera</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
