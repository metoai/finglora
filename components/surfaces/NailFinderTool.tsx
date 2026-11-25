'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, RotateCcw, Sparkles } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { CURATED_EDITORIAL_DESIGNS } from '@/constants/nail-data';
import { NailShape } from '@/types/nail';

type FingerProportionId = 'short-wide' | 'balanced' | 'long-slender' | 'petite';
type UndertoneId = 'warm-gold' | 'cool-rose' | 'neutral-olive' | 'deep-rich';

interface FingerOption {
  id: FingerProportionId;
  label: string;
  caption: string;
  shapeId: NailShape;
  shapeLabel: string;
  idealLength: string;
  whyItWorks: string;
}

interface UndertoneOption {
  id: UndertoneId;
  label: string;
  caption: string;
  swatches: [string, string, string];
  bestFinishes: string;
  avoidNote: string;
  matchedSetIds: string[];
  whyShadesWork: string;
}

const FINGER_OPTIONS: FingerOption[] = [
  {
    id: 'short-wide',
    label: 'Short & Wide Nail Beds',
    caption: 'Shorter nail plates or fuller knuckles',
    shapeId: 'almond',
    shapeLabel: 'Soft Almond',
    idealLength: 'Short–Medium',
    whyItWorks:
      'A gentle taper toward a softly rounded tip visually elongates the fingers and slims the sides without fragile sharp corners.',
  },
  {
    id: 'balanced',
    label: 'Classic & Balanced',
    caption: 'Even nail width and medium finger length',
    shapeId: 'oval',
    shapeLabel: 'Classic Oval',
    idealLength: 'Short–Medium',
    whyItWorks:
      'Oval mirrors a natural cuticle curve for effortless, chip-resistant wear that flatters almost every sheer glaze and micro-French tip.',
  },
  {
    id: 'long-slender',
    label: 'Long & Slender Fingers',
    caption: 'Elongated fingers and narrow nail beds',
    shapeId: 'coffin',
    shapeLabel: 'Tapered Coffin',
    idealLength: 'Medium',
    whyItWorks:
      'Slender fingers carry architectural tapered-square tips naturally — giving bold French lines, chrome sweeps, and velvet aura space to shine.',
  },
  {
    id: 'petite',
    label: 'Petite / Short Preference',
    caption: 'You prefer crisp, low-maintenance length',
    shapeId: 'square',
    shapeLabel: 'Soft Squoval',
    idealLength: 'Short',
    whyItWorks:
      'A clean straight edge with gently buffed corners stays durable at the keyboard while keeping sheer nudes and glazed finishes crisp.',
  },
];

const UNDERTONE_OPTIONS: UndertoneOption[] = [
  {
    id: 'warm-gold',
    label: 'Warm / Golden',
    caption: 'Gold jewelry pops · Peachy or golden veins',
    swatches: ['#F5ECE3', '#D4AF37', '#C98A6B'],
    bestFinishes: 'Creamy milky glazes, champagne chrome & warm taupe nudes',
    avoidNote: 'Icy blue-tinted whites or stark chalky silvers',
    matchedSetIds: ['set-milky-gold', 'set-rose-glazed', 'set-editorial-nude'],
    whyShadesWork:
      'Honeyed pearl glazes and champagne-gold accents echo warm skin luminance without looking chalky.',
  },
  {
    id: 'cool-rose',
    label: 'Cool / Rose & Berry',
    caption: 'Silver pops · Rosy or pink-blue undertones',
    swatches: ['#FCE7F3', '#E0246A', '#FAF0EA'],
    bestFinishes: 'Sheer strawberry milk, cool micro-French & pearl chrome',
    avoidNote: 'Mustard yellows or overly orange-peach corals',
    matchedSetIds: ['set-blush-heart', 'set-french-chrome', 'set-rose-glazed'],
    whyShadesWork:
      'Translucent rose-milk bases and crisp cool French tips brighten pink undertones effortlessly.',
  },
  {
    id: 'neutral-olive',
    label: 'Neutral / Olive',
    caption: 'Both gold & silver work · Balanced muted tone',
    swatches: ['#FAF0EA', '#8FA893', '#801A35'],
    bestFinishes: 'Linen neutrals, sheer milky vanilla & deep berry-wine contrast',
    avoidNote: 'Neon corals or washed-out beige shades lighter than your cuticle',
    matchedSetIds: ['set-quiet-linen', 'set-editorial-nude', 'set-burgundy-aura'],
    whyShadesWork:
      'Clean oat-linen sheers and balanced bordeaux pigments create rich editorial contrast against olive skin.',
  },
  {
    id: 'deep-rich',
    label: 'Deep Rich / Espresso-Gold',
    caption: 'Warm, golden or cool-plum rich melanin',
    swatches: ['#3B111D', '#D4AF37', '#F5ECE3'],
    bestFinishes: 'Velvet burgundy cat-eye, glazed gold chrome & crisp French contrast',
    avoidNote: 'Flat opaque chalk-beige without sheer warmth or gloss depth',
    matchedSetIds: ['set-burgundy-aura', 'set-velvet-wine', 'set-milky-gold'],
    whyShadesWork:
      'High-gloss bordeaux velvet, deep plum aura, and luminous glazed pearl create stunning depth and contrast.',
  },
];

export function NailFinderTool() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedFinger, setSelectedFinger] = useState<FingerProportionId | null>(null);
  const [selectedUndertone, setSelectedUndertone] = useState<UndertoneId | null>(null);

  const fingerResult = FINGER_OPTIONS.find((f) => f.id === selectedFinger) || FINGER_OPTIONS[0];
  const undertoneResult =
    UNDERTONE_OPTIONS.find((u) => u.id === selectedUndertone) || UNDERTONE_OPTIONS[0];

  const recommendedSets = undertoneResult.matchedSetIds
    .map((id) => CURATED_EDITORIAL_DESIGNS.find((d) => d.id === id))
    .filter((d): d is (typeof CURATED_EDITORIAL_DESIGNS)[number] => Boolean(d));

  const primarySet = recommendedSets[0] || CURATED_EDITORIAL_DESIGNS[0];

  const handleReset = () => {
    setSelectedFinger(null);
    setSelectedUndertone(null);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-[#FCFAF8] text-[#181216] flex flex-col justify-between">
      {/* Top Header */}
      <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-3 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center">
          <BrandLogo size="sm" />
        </Link>

        <Link
          href="/tryon"
          className="h-9 px-3.5 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition"
        >
          <span>Open Try-On</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#E0246A]" />
        </Link>
      </header>

      {/* Main Centered Finder Card */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-center">
        <div className="space-y-6">
          {/* Progress Header */}
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F5] border border-pink-200/80 text-[#E0246A] text-[11px] font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>15-Second Shape &amp; Undertone Finder</span>
            </span>

            <h1 className="font-serif text-2xl sm:text-4xl font-normal text-stone-900 tracking-tight">
              {step === 1 && 'Which best describes your hands & nails?'}
              {step === 2 && 'What is your natural skin undertone?'}
              {step === 3 && `Your Match: ${fingerResult.shapeLabel} + ${undertoneResult.label}`}
            </h1>

            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
              {step === 1 && 'Pick your finger proportion so we can match the most flattering silhouette.'}
              {step === 2 && 'We pair polish pigments and chrome finishes that brighten your natural tone.'}
              {step === 3 && 'Tap any matched look below to preview it directly on your own hand.'}
            </p>
          </div>

          {/* Step Indicator Bar */}
          <div className="max-w-xs mx-auto grid grid-cols-3 gap-2">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  step >= idx ? 'bg-[#E0246A]' : 'bg-stone-200'
                }`}
              />
            ))}
          </div>

          {/* STEP 1: Finger & Nail Proportion */}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {FINGER_OPTIONS.map((opt) => {
                const active = selectedFinger === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSelectedFinger(opt.id);
                      setStep(2);
                    }}
                    className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer group active:scale-99 ${
                      active
                        ? 'bg-pink-50/70 border-[#E0246A] ring-2 ring-[#E0246A]/15'
                        : 'bg-white border-stone-200/90 hover:border-[#E0246A]/50 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-stone-900 group-hover:text-[#E0246A] transition-colors">
                          {opt.label}
                        </p>
                        <p className="text-xs text-stone-500 mt-1">{opt.caption}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-medium shrink-0">
                        {opt.shapeLabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 2: Skin Undertone */}
          {step === 2 && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {UNDERTONE_OPTIONS.map((opt) => {
                  const active = selectedUndertone === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedUndertone(opt.id);
                        setStep(3);
                      }}
                      className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer group active:scale-99 ${
                        active
                          ? 'bg-pink-50/70 border-[#E0246A] ring-2 ring-[#E0246A]/15'
                          : 'bg-white border-stone-200/90 hover:border-[#E0246A]/50 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm sm:text-base font-semibold text-stone-900 group-hover:text-[#E0246A] transition-colors">
                            {opt.label}
                          </p>
                          <p className="text-xs text-stone-500 mt-1">{opt.caption}</p>
                        </div>
                        <div className="flex items-center -space-x-1.5 shrink-0">
                          {opt.swatches.map((hex) => (
                            <span
                              key={hex}
                              className="w-5 h-5 rounded-full border-2 border-white shadow-xs"
                              style={{ backgroundColor: hex }}
                            />
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to hand shape</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Tailored Result + Direct Virtual Try-On Funnel */}
          {step === 3 && (
            <div className="space-y-5 pt-1 animate-in fade-in duration-200">
              {/* Diagnostic Formula Summary */}
              <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-sm space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-stone-200/70 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 block">
                      Recommended Silhouette
                    </span>
                    <p className="text-base font-semibold text-stone-900">
                      {fingerResult.shapeLabel} · {fingerResult.idealLength}
                    </p>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {fingerResult.whyItWorks}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-stone-200/70 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 block">
                      Undertone Formula
                    </span>
                    <p className="text-base font-semibold text-stone-900">
                      {undertoneResult.bestFinishes}
                    </p>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {undertoneResult.whyShadesWork}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-stone-600 border-t border-stone-100">
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      Tip: Skip <strong className="font-medium text-stone-800">{undertoneResult.avoidNote.toLowerCase()}</strong>
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-900 font-medium cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Retake</span>
                  </button>
                </div>
              </div>

              {/* 3 Curated Looks Ready for 1-Tap Virtual Try-On */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs sm:text-sm font-semibold text-stone-900">
                    Your Top Curated Matches
                  </h2>
                  <span className="text-[11px] text-stone-500">
                    Opens in Virtual Try-On
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {recommendedSets.map((design) => (
                    <Link
                      key={design.id}
                      href={`/tryon?set=${encodeURIComponent(design.id)}&shape=${encodeURIComponent(fingerResult.shapeId)}`}
                      className="group bg-white rounded-2xl border border-stone-200/80 hover:border-[#E0246A]/60 overflow-hidden shadow-2xs transition flex sm:flex-col items-center sm:items-stretch gap-3 sm:gap-0 p-2.5 sm:p-0"
                    >
                      <div className="w-20 h-20 sm:w-full sm:aspect-[4/3] rounded-xl sm:rounded-none overflow-hidden bg-stone-100 shrink-0">
                        <img
                          src={design.photoUrl}
                          alt={design.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0 sm:p-3.5 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-medium uppercase tracking-wider text-[#E0246A]">
                            {design.category}
                          </span>
                          <span className="text-[10px] text-stone-400 capitalize">
                            {fingerResult.shapeLabel}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-stone-900 truncate">
                          {design.title}
                        </p>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#E0246A] pt-0.5">
                          <span>Try on my hand</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Primary CTA */}
              <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={`/tryon?set=${encodeURIComponent(primarySet.id)}&shape=${encodeURIComponent(fingerResult.shapeId)}`}
                  className="w-full sm:w-auto px-6 h-12 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-md shadow-[#E0246A]/20 transition active:scale-95"
                >
                  <span>Preview Top Match on My Hand</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between text-xs text-stone-400 border-t border-stone-200/60">
        <Link href="/" className="hover:text-stone-700 transition">
          © {new Date().getFullYear()} Finglora
        </Link>
        <Link href="/tryon" className="hover:text-[#E0246A] transition font-medium">
          Skip to Virtual Try-On →
        </Link>
      </footer>
    </div>
  );
}
