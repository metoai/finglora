'use client';

import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { Finger, NailDesign, SkinTonePreset } from '@/types/nail';
import { FINGER_LABELS } from '@/constants/nail-data';
import { EditorialHandVisual } from '@/components/visuals/EditorialHandVisual';
import { NailCanvasPreview } from '@/components/visuals/NailCanvasPreview';
import { BorderBeam } from '@/components/magicui/border-beam';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
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
}: {
  activePassportCode: string;
  activeSetName: string;
  orderedFingers: Finger[];
  nails: Record<Finger, NailDesign>;
  activeSkinTone: SkinTonePreset;
  handOrientation: 'left' | 'right';
  onCopyShareLink: () => void;
  onPreviewTechView?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    onCopyShareLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl space-y-7">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[rgba(31,26,28,0.06)]">
        <div>
          <span className="text-[11px] font-mono tracking-wider uppercase text-[#E0246A] block mb-1">
            Design Passport • {activePassportCode}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#18181B] tracking-tight">
            Design Passport
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <ShimmerButton
            onClick={handleShare}
            shimmerColor="#FDE8EF"
            background="linear-gradient(135deg, #E0246A 0%, #BE185D 100%)"
            borderRadius="12px"
            className="h-10 px-4 text-xs font-medium shadow-xs"
          >
            <span className="inline-flex items-center gap-2 text-white">
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
                  <span>Share Design</span>
                </>
              )}
            </span>
          </ShimmerButton>
        </div>
      </div>

      {/* Luxury Design Passport Card */}
      <div className="relative bg-[#FFFFFF] rounded-3xl border border-[rgba(31,26,28,0.08)] shadow-sm overflow-hidden">
        <BorderBeam size={300} duration={14} colorFrom="#E0246A" colorTo="#BE185D" borderWidth={1.5} />

        {/* Passport Top Banner */}
        <div className="bg-gradient-to-r from-[#18181B] via-[#4A0E22] to-[#E0246A] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
          {/* Subtle watermark pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none [background:radial-gradient(circle_at_20%_20%,#FFFFFF_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="relative z-10 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono tracking-wider uppercase text-white/90 border border-white/20">
                Finglora Passport • #{activePassportCode}
              </span>
              <span className="text-[10px] font-mono text-white/60">
                5-Finger Formula
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-white">
              {activeSetName}
            </h2>
            <p className="text-xs text-white/75 font-normal">
              Curated manicure set • Ready to wear or share
            </p>
          </div>

          {/* Shareable Link Pill with ShineBorder */}
          <div className="relative z-10 shrink-0">
            <ShineBorder
              borderRadius={14}
              borderWidth={1}
              color={['#E0246A', '#FFFFFF', '#E0246A']}
              duration={10}
              className="bg-black/30 backdrop-blur-xs border border-white/15"
            >
              <div
                onClick={handleShare}
                className="cursor-pointer px-4 py-2.5 flex items-center gap-3 group"
              >
                <div>
                  <span className="block text-white/60 text-[9px] font-mono uppercase tracking-wider">
                    Passport Link
                  </span>
                  <span className="font-mono text-xs font-medium text-white group-hover:text-[#E0246A] transition-colors">
                    finglora.app/p/{activePassportCode}
                  </span>
                </div>
                <Copy className="w-3.5 h-3.5 text-white/60 group-hover:text-white transition-colors" strokeWidth={1.5} />
              </div>
            </ShineBorder>
          </div>
        </div>

        {/* Passport Body: Hand Visual + High-Contrast 5-Finger Technical Breakdown */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Visualizer Column (4 cols) */}
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
                height={205}
                isRight={handOrientation === 'right'}
              />
            </div>

            {/* Mini 5-Finger Preview Row (8 cols) */}
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {orderedFingers.map((fk) => {
                const n = nails[fk];
                return (
                  <div
                    key={fk}
                    className="rounded-xl p-3 bg-[#FAFAFA] border border-[rgba(31,26,28,0.06)] text-center flex flex-col items-center shadow-2xs"
                  >
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#E0246A] mb-1.5">
                      {FINGER_LABELS[fk]}
                    </span>
                    <NailCanvasPreview nail={n} width={44} height={68} showCuticle={true} />
                    <p className="font-medium text-[11px] text-[#18181B] mt-2 line-clamp-1">
                      {n.title}
                    </p>
                    <span className="text-[10px] font-mono text-[#8C8085] mt-0.5 capitalize">
                      {n.shape}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clean Design Breakdown Table */}
          <div className="pt-4 border-t border-[rgba(31,26,28,0.08)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#18181B]">
                Design Breakdown
              </span>
              <span className="text-[11px] font-mono text-[#8C8085]">
                Recipe Steps
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[rgba(31,26,28,0.08)] bg-[#FFFFFF]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[rgba(31,26,28,0.08)] text-[10px] font-mono text-[#8C8085] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Finger</th>
                    <th className="py-2.5 px-3">Pattern</th>
                    <th className="py-2.5 px-3">Base Color</th>
                    <th className="py-2.5 px-3">Accent Art</th>
                    <th className="py-2.5 px-3">Shape & Length</th>
                    <th className="py-2.5 px-3">Finish</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(31,26,28,0.06)] text-[#18181B]">
                  {orderedFingers.map((fk) => {
                    const n = nails[fk];
                    return (
                      <tr key={fk} className="hover:bg-[#FAFAFA]/60 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-[#E0246A]">
                          {FINGER_LABELS[fk]}
                        </td>
                        <td className="py-2.5 px-3 capitalize">
                          {n.pattern.replace(/-/g, ' ')}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                              style={{ backgroundColor: n.baseColor }}
                            />
                            <span className="font-mono text-[11px]">{n.baseColor.toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                              style={{ backgroundColor: n.accentColor }}
                            />
                            <span className="font-mono text-[11px]">{n.accentColor.toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] capitalize">
                          {n.shape} • {n.length}
                        </td>
                        <td className="py-2.5 px-3 capitalize">
                          {n.finish}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Mascot Celebration */}
      <NailMascot mood="celebrating" />
    </div>
  );
}
