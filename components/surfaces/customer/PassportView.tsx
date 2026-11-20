'use client';

import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Hand,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Finger, NailDesign, SkinTonePreset } from '@/types/nail';
import { FINGER_LABELS } from '@/constants/nail-data';
import { EditorialHandVisual } from '@/components/visuals/EditorialHandVisual';
import { NailCanvasPreview } from '@/components/visuals/NailCanvasPreview';
import { BorderBeam } from '@/components/magicui/border-beam';
import { ShineBorder } from '@/components/magicui/shine-border';
import { NailMascot } from '@/components/common/NailMascot';

export function PassportView({
  activePassportCode,
  activeSetName,
  orderedFingers,
  nails,
  activeSkinTone,
  handOrientation,
  onCopyShareLink,
  onPreviewTechView,
  onTryOnClick,
}: {
  activePassportCode: string;
  activeSetName: string;
  orderedFingers: Finger[];
  nails: Record<Finger, NailDesign>;
  activeSkinTone: SkinTonePreset;
  handOrientation: 'left' | 'right';
  onCopyShareLink: () => void;
  onPreviewTechView?: () => void;
  onTryOnClick?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  // Format cleanly to #FGL-XXXX
  const cleanCode = (activePassportCode || '4091')
    .replace(/^#?FGL-?/i, '')
    .toUpperCase();
  const formattedPassportCode = `#FGL-${cleanCode}`;

  const handleShare = () => {
    onCopyShareLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <div className="w-full max-w-5xl space-y-7">
      {/* Header Bar with Strict 4px Rhythm */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[rgba(31,26,28,0.06)]">
        <div>
          <span className="text-[11px] font-mono tracking-wider uppercase text-[#E0246A] block mb-1">
            Design Passport • {formattedPassportCode}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#18181B] tracking-tight">
            Design Passport
          </h1>
        </div>

        {/* Primary & Secondary Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Secondary Button: Share Recipe / Copy Link */}
          <button
            type="button"
            onClick={handleShare}
            className="h-11 px-4 rounded-xl bg-[#FFFFFF] border border-[rgba(31,26,28,0.12)] hover:bg-[#F4F4F5] text-xs font-semibold text-[#18181B] transition-all inline-flex items-center gap-2 shadow-2xs cursor-pointer active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#E0246A]" strokeWidth={2.5} />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-[#E0246A]" strokeWidth={1.75} />
                <span>Share Recipe</span>
              </>
            )}
          </button>

          {/* Primary Button: Try On This Look (#E0246A) */}
          <button
            type="button"
            onClick={onTryOnClick}
            className="h-11 px-5 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white font-semibold flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer text-xs sm:text-sm"
          >
            <Hand className="w-4 h-4" strokeWidth={2} />
            <span>Try On This Look</span>
          </button>
        </div>
      </div>

      {/* Luxury Design Passport Card with Embossed Styling & Clean Hairline Borders */}
      <div className="relative bg-[#FFFFFF] rounded-3xl border border-[rgba(31,26,28,0.08)] shadow-sm overflow-hidden">
        <BorderBeam size={320} duration={14} colorFrom="#E0246A" colorTo="#BE185D" borderWidth={1.5} />

        {/* Passport Embossed Top Banner */}
        <div className="bg-gradient-to-r from-[#18181B] via-[#4A0E22] to-[#E0246A] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
          {/* Subtle watermark pattern & radial foil glow */}
          <div className="absolute inset-0 opacity-10 pointer-events-none [background:radial-gradient(circle_at_25%_25%,#FFFFFF_1.5px,transparent_1.5px)] [background-size:20px_20px]" />
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#E0246A]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2.5">
              {/* Luxury Embossed Code Badge */}
              <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-mono font-bold tracking-widest uppercase text-white border border-white/25 shadow-inner backdrop-blur-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FDE8EF]" />
                <span>{formattedPassportCode}</span>
              </span>

              <span className="text-[11px] font-mono text-white/70 uppercase tracking-wider">
                5-Finger Technical Blueprint
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-white drop-shadow-xs">
              {activeSetName || 'Atelier Bespoke Look'}
            </h2>

            <p className="text-xs text-white/80 font-normal max-w-lg leading-relaxed">
              Curated manicure formula with 5 standalone nail bed geometry specifications, precision color hex values, and topcoat finishes.
            </p>
          </div>

          {/* Shareable Link Pill with ShineBorder */}
          <div className="relative z-10 shrink-0">
            <ShineBorder
              borderRadius={16}
              borderWidth={1}
              color={['#E0246A', '#FFFFFF', '#E0246A']}
              duration={10}
              className="bg-black/35 backdrop-blur-md border border-white/20"
            >
              <div
                onClick={handleShare}
                className="cursor-pointer px-4 py-3 flex items-center gap-3.5 group"
                title="Click to copy passport link"
              >
                <div>
                  <span className="block text-white/60 text-[9px] font-mono uppercase tracking-widest">
                    Passport URL
                  </span>
                  <span className="font-mono text-xs font-medium text-white group-hover:text-[#FDE8EF] transition-colors">
                    finglora.app/p/{cleanCode.toLowerCase()}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/80 group-hover:text-white group-hover:bg-white/20 transition-all">
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-300" strokeWidth={2.5} />
                  ) : (
                    <Copy className="w-4 h-4" strokeWidth={1.75} />
                  )}
                </div>
              </div>
            </ShineBorder>
          </div>
        </div>

        {/* Passport Body: Hand Visual + 5-Finger Technical Breakdown */}
        <div className="p-6 sm:p-8 space-y-7">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Visualizer Column with Hairline Border (4 cols) */}
            <div className="md:col-span-4 rounded-2xl pt-4 px-4 pb-0 bg-[#FAFAFA] border border-[rgba(31,26,28,0.06)] flex flex-col items-center justify-end shadow-2xs">
              <div className="w-full text-center pb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C8085]">
                  Full Hand Blueprint ({handOrientation} Hand)
                </span>
              </div>
              <EditorialHandVisual
                nails={nails}
                skinTone={activeSkinTone}
                width={200}
                height={210}
                isRight={handOrientation === 'right'}
              />
            </div>

            {/* 5-Finger Technical Breakdown: Mini Cards Row (8 cols) */}
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {orderedFingers.map((fk) => {
                const n = nails[fk];
                return (
                  <div
                    key={fk}
                    className="rounded-2xl p-3 bg-[#FAFAFA] border border-[rgba(31,26,28,0.06)] text-center flex flex-col items-center shadow-2xs hover:bg-[#F4F4F5] transition-colors"
                  >
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#E0246A] mb-1.5 font-semibold">
                      {FINGER_LABELS[fk]}
                    </span>
                    <NailCanvasPreview nail={n} width={44} height={70} showCuticle={true} />
                    <p className="font-semibold text-[11px] text-[#18181B] mt-2 line-clamp-1">
                      {n.title}
                    </p>
                    <span className="text-[10px] font-mono text-[#8C8085] mt-0.5 capitalize">
                      {n.shape} • {n.length}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5-Finger Technical Breakdown Specifications Table */}
          <div className="pt-5 border-t border-[rgba(31,26,28,0.08)] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#18181B] block">
                  5-Finger Technical Specifications
                </span>
                <span className="text-[11px] text-[#8C8085]">
                  Thumb to Pinky exact color recipe, geometry, and topcoat
                </span>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#FAFAFA] border border-[rgba(31,26,28,0.08)] text-[#8C8085]">
                5 Beds Configured
              </span>
            </div>

            {/* High-Contrast Technical Recipe Table */}
            <div className="overflow-x-auto rounded-2xl border border-[rgba(31,26,28,0.08)] bg-[#FFFFFF]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[rgba(31,26,28,0.08)] text-[10px] font-mono text-[#8C8085] uppercase tracking-wider">
                    <th className="py-3 px-3.5">Finger</th>
                    <th className="py-3 px-3.5">Pattern Motif</th>
                    <th className="py-3 px-3.5">Base Lacquer</th>
                    <th className="py-3 px-3.5">Accent Art</th>
                    <th className="py-3 px-3.5">Silhouette & Length</th>
                    <th className="py-3 px-3.5">Topcoat Finish</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(31,26,28,0.06)] text-[#18181B]">
                  {orderedFingers.map((fk) => {
                    const n = nails[fk];
                    return (
                      <tr key={fk} className="hover:bg-[#FAFAFA]/70 transition-colors">
                        <td className="py-3 px-3.5 font-semibold text-[#E0246A]">
                          {FINGER_LABELS[fk]}
                        </td>
                        <td className="py-3 px-3.5 capitalize font-medium">
                          {n.pattern.replace(/-/g, ' ')}
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-2xs"
                              style={{ backgroundColor: n.baseColor }}
                            />
                            <span className="font-mono text-[11px] font-semibold text-[#18181B]">
                              {n.baseColor.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-2xs"
                              style={{ backgroundColor: n.accentColor }}
                            />
                            <span className="font-mono text-[11px] font-semibold text-[#18181B]">
                              {n.accentColor.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3.5 font-mono text-[11px] capitalize font-medium">
                          {n.shape} • {n.length}
                        </td>
                        <td className="py-3 px-3.5 capitalize">
                          <span className="px-2 py-0.5 rounded-md bg-[#FAFAFA] border border-[rgba(31,26,28,0.06)] text-[#61565A]">
                            {n.finish}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card Footer Actions */}
          <div className="pt-5 border-t border-[rgba(31,26,28,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-[#8C8085]">
              <ShieldCheck className="w-4 h-4 text-[#E0246A]" />
              <span>Certified Finglora 5-Finger Formula • Ready for Virtual Try-On</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleShare}
                className="flex-1 sm:flex-initial h-11 px-4 rounded-xl bg-[#FFFFFF] border border-[rgba(31,26,28,0.12)] hover:bg-[#F4F4F5] text-xs font-semibold text-[#18181B] transition-all inline-flex items-center justify-center gap-2 shadow-2xs cursor-pointer active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#E0246A]" strokeWidth={2.5} />
                    <span>Link Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#E0246A]" strokeWidth={1.75} />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onTryOnClick}
                className="flex-1 sm:flex-initial h-11 px-5 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white font-semibold flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer text-xs sm:text-sm"
              >
                <Hand className="w-4 h-4" strokeWidth={2} />
                <span>Try On This Look</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mascot Celebration */}
      <NailMascot mood="celebrating" />
    </div>
  );
}
