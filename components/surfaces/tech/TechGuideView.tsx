'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Printer,
  CheckCircle2,
  Circle,
  Clock,
  Layers,
  Palette,
  Maximize2,
  X,
  RotateCcw,
  Plus,
  Sliders,
  ShieldCheck,
  Check,
  FileText,
  User,
  Hash,
  Share2,
} from 'lucide-react';
import { ExploreDesignSet, Finger, NailDesign } from '@/types/nail';
import { FINGER_LABELS } from '@/constants/nail-data';
import { generateTechStepsForNail } from '@/utils/tech-formula';
import { InspirationPhotoCard } from '@/components/visuals/InspirationPhotoCard';
import { NailCanvasPreview } from '@/components/visuals/NailCanvasPreview';
import { NailMascot } from '@/components/common/NailMascot';

export function TechGuideView({
  activeSample,
  activePhotoUrl,
  techSourceLabel,
  activeSetName,
  orderedFingers,
  techSelectedFinger,
  setTechSelectedFinger,
  nails,
  techCompletedSteps,
  setTechCompletedSteps,
  onNewClientPhotoClick,
}: {
  activeSample: ExploreDesignSet;
  activePhotoUrl: string;
  techSourceLabel: string;
  activeSetName: string;
  orderedFingers: Finger[];
  techSelectedFinger: 'all' | Finger;
  setTechSelectedFinger: (finger: 'all' | Finger) => void;
  nails: Record<Finger, NailDesign>;
  techCompletedSteps: Record<string, boolean>;
  setTechCompletedSteps: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onNewClientPhotoClick: () => void;
}) {
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const displayedFingers =
    techSelectedFinger === 'all' ? orderedFingers : [techSelectedFinger];

  // Calculate overall steps completed
  const totalSteps = orderedFingers.length * 4;
  let completedCount = 0;
  orderedFingers.forEach((fk) => {
    for (let stepNum = 1; stepNum <= 4; stepNum++) {
      if (techCompletedSteps[`${fk}-${stepNum}`]) {
        completedCount++;
      }
    }
  });

  const percentComplete = Math.round((completedCount / totalSteps) * 100);

  const resetAllSteps = () => {
    setTechCompletedSteps({});
  };

  const passportCode = activeSample.passportCode || 'FGL-8492';
  const chairMinutes = activeSample.chairMinutes || 75;

  return (
    <div className="space-y-7 select-none print:m-0 print:p-0">
      {/* Top Station Header Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#18181B]/[0.08] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 print:hidden">
        <div className="flex items-center gap-4">
          {/* Inspiration Photo Thumbnail with Modal Trigger */}
          <div
            onClick={() => setShowPhotoModal(true)}
            className="group relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl shrink-0 overflow-hidden border border-[#18181B]/[0.08] cursor-pointer shadow-sm transition hover:ring-2 hover:ring-[#E0246A]/40"
          >
            <InspirationPhotoCard item={activeSample} photoOverride={activePhotoUrl} />
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
              <Maximize2 className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E0246A] text-white text-[11px] font-mono font-medium">
                #{passportCode}
              </span>
              <span className="text-[11px] font-mono text-[#61565A] bg-[#FAFAFA] border border-[#18181B]/[0.08] px-2 py-0.5 rounded-full">
                {techSourceLabel}
              </span>
            </div>

            <h1 className="font-serif text-xl sm:text-2xl font-normal text-[#18181B] tracking-tight">
              {activeSetName} — Station Execution Guide
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[#61565A]">
              <span className="flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-[#E0246A]" strokeWidth={1.5} />
                <span>Estimated Chair Time:</span>
                <strong className="text-[#18181B]">{chairMinutes} mins</strong>
              </span>
              <span className="text-[#8C8085]">•</span>
              <span className="text-emerald-700 font-mono">
                {completedCount}/{totalSteps} steps verified ({percentComplete}%)
              </span>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={resetAllSteps}
            title="Reset checklist for next client"
            className="px-3 py-2 rounded-xl bg-[#FAFAFA] hover:bg-[#F4F4F5] border border-[#18181B]/[0.08] text-xs font-mono text-[#61565A] hover:text-[#18181B] transition inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="hidden sm:inline">Reset Steps</span>
          </button>

          <button
            type="button"
            onClick={onNewClientPhotoClick}
            className="px-3.5 py-2 rounded-xl bg-[#FAFAFA] hover:bg-[#F4F4F5] border border-[#18181B]/[0.08] text-xs font-semibold text-[#18181B] transition inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[#E0246A]" strokeWidth={1.5} />
            <span>New Photo / Link</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="px-4 py-2 rounded-xl bg-[#E0246A] hover:bg-[#66152A] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition active:translate-y-px"
          >
            <Printer className="w-3.5 h-3.5 text-[#D4AF37]" strokeWidth={1.5} />
            <span>Station Tray Sheet</span>
          </button>
        </div>
      </div>

      {/* Flora Station Protocol Guidance */}
      <NailMascot mood="tech_prep" variant="banner" className="print:hidden" />

      {/* Chair Progress Metric Fill Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#18181B]/[0.08] shadow-sm space-y-2 print:hidden">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#18181B] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
            <span>Live Chair Protocol Verification</span>
          </span>
          <span className="font-mono text-[#61565A]">
            {completedCount} of {totalSteps} protocol steps completed ({percentComplete}%)
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#FAFAFA] border border-[#18181B]/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E0246A] transition-all duration-300 rounded-full"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>

      {/* 5-Finger Visual Overview Gallery Cards */}
      <div className="space-y-3 print:hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-[#61565A]">
            Five-Finger Set Architecture
          </span>
          <span className="text-[11px] text-[#8C8085] font-mono">
            Click finger card to filter steps
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {orderedFingers.map((fk) => {
            const nail = nails[fk];
            const isSelected = techSelectedFinger === fk;
            return (
              <div
                key={fk}
                onClick={() =>
                  setTechSelectedFinger(techSelectedFinger === fk ? 'all' : fk)
                }
                className={`cursor-pointer rounded-2xl p-3.5 border transition duration-150 flex flex-col items-center text-center space-y-2.5 ${
                  isSelected
                    ? 'bg-[#FAFAFA] border-[#E0246A] ring-2 ring-[#E0246A]/20 shadow-sm'
                    : 'bg-white border-[#18181B]/[0.08] hover:border-[#18181B]/[0.18]'
                }`}
              >
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-[#FAFAFA] border border-[#18181B]/[0.08] text-[#18181B] font-semibold">
                  {FINGER_LABELS[fk]}
                </span>

                <div className="py-1 flex items-center justify-center">
                  <NailCanvasPreview
                    nail={nail}
                    width={48}
                    height={72}
                    showCuticle={false}
                  />
                </div>

                <div className="w-full space-y-1 text-left pt-1 border-t border-[#18181B]/[0.06]">
                  <p className="text-xs font-semibold text-[#18181B] truncate">{nail.title}</p>
                  <div className="flex items-center justify-between text-[10px] text-[#61565A] font-mono">
                    <span className="capitalize">{nail.shape}</span>
                    <span className="capitalize">{nail.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#61565A] font-mono pt-0.5">
                    <span className="capitalize truncate">{nail.finish}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/10"
                        style={{ background: nail.baseColor }}
                        title={`Base: ${nail.baseColor}`}
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/10"
                        style={{ background: nail.accentColor }}
                        title={`Art: ${nail.accentColor}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs for Chair Execution */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 print:hidden">
        <button
          type="button"
          onClick={() => setTechSelectedFinger('all')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition ${
            techSelectedFinger === 'all'
              ? 'bg-[#E0246A] text-white shadow-sm'
              : 'bg-white text-[#18181B] border border-[#18181B]/[0.08] hover:bg-[#FAFAFA]'
          }`}
        >
          All 5 Fingers (Station Matrix)
        </button>
        {orderedFingers.map((fk) => {
          const isSelected = techSelectedFinger === fk;
          return (
            <button
              key={fk}
              type="button"
              onClick={() => setTechSelectedFinger(fk)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono whitespace-nowrap inline-flex items-center gap-2 transition ${
                isSelected
                  ? 'bg-[#E0246A] text-white shadow-sm font-semibold'
                  : 'bg-white text-[#18181B] border border-[#18181B]/[0.08] hover:bg-[#FAFAFA]'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full border border-black/20"
                style={{ background: nails[fk].baseColor }}
              />
              <span>{FINGER_LABELS[fk]}</span>
            </button>
          );
        })}
      </div>

      {/* Layer-by-Layer Technical Formula Matrix Cards */}
      <div className="space-y-6">
        {displayedFingers.map((fk) => {
          const nail = nails[fk];
          const steps = generateTechStepsForNail(nail);

          return (
            <div
              key={fk}
              className="bg-white rounded-2xl border border-[#18181B]/[0.08] shadow-sm overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-[#FAFAFA] px-5 py-4 border-b border-[#18181B]/[0.08] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-lg bg-[#E0246A] text-white text-xs font-mono font-semibold uppercase tracking-wider">
                    {FINGER_LABELS[fk]}
                  </span>
                  <div>
                    <h2 className="font-serif text-lg font-normal text-[#18181B]">
                      {nail.title}
                    </h2>
                    <span className="text-[11px] font-mono text-[#61565A]">
                      {nail.shape.toUpperCase()} • {nail.length.toUpperCase()} • {nail.finish.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-[#18181B]/[0.08] flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/15"
                      style={{ background: nail.baseColor }}
                    />
                    <span>Base {nail.baseColor}</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-[#18181B]/[0.08] flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/15"
                      style={{ background: nail.accentColor }}
                    />
                    <span>Accent {nail.accentColor}</span>
                  </span>
                </div>
              </div>

              {/* Card Body: 3-Stage Visual Evolution + 4 Technical Formula Steps */}
              <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* 3-Stage Mini Evolution Preview */}
                <div className="lg:col-span-4 bg-[#FAFAFA] rounded-xl p-4 border border-[#18181B]/[0.08] space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#61565A] block text-center">
                    Curing Layer Progression
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white rounded-lg p-2 border border-[#18181B]/[0.08] flex flex-col items-center">
                      <NailCanvasPreview
                        nail={{ ...nail, pattern: 'solid', finish: 'glossy' }}
                        width={38}
                        height={60}
                        showCuticle={false}
                      />
                      <span className="block text-[10px] font-mono text-[#61565A] mt-1.5">
                        1. Base
                      </span>
                    </div>

                    <div className="bg-white rounded-lg p-2 border border-[#18181B]/[0.08] flex flex-col items-center">
                      <NailCanvasPreview
                        nail={{ ...nail, finish: 'glossy' }}
                        width={38}
                        height={60}
                        showCuticle={false}
                      />
                      <span className="block text-[10px] font-mono text-[#61565A] mt-1.5">
                        2. Artistry
                      </span>
                    </div>

                    <div className="bg-white rounded-lg p-2 border border-[#E0246A]/30 ring-1 ring-[#E0246A]/20 flex flex-col items-center">
                      <NailCanvasPreview
                        nail={nail}
                        width={38}
                        height={60}
                        showCuticle={false}
                      />
                      <span className="block text-[10px] font-mono text-[#E0246A] font-semibold mt-1.5">
                        3. Cured
                      </span>
                    </div>
                  </div>

                  {nail.clientNote && (
                    <div className="p-2.5 rounded-lg bg-white border border-[#18181B]/[0.08] text-[11px] text-[#61565A] space-y-0.5">
                      <span className="font-semibold text-[#18181B] block">Client Note:</span>
                      <p className="italic leading-relaxed">&ldquo;{nail.clientNote}&rdquo;</p>
                    </div>
                  )}
                </div>

                {/* 4 Technical Formula Steps Checklist */}
                <div className="lg:col-span-8 space-y-3">
                  {steps.map((st) => {
                    const stepKey = `${fk}-${st.num}`;
                    const isChecked = !!techCompletedSteps[stepKey];

                    return (
                      <div
                        key={stepKey}
                        onClick={() =>
                          setTechCompletedSteps((prev) => ({
                            ...prev,
                            [stepKey]: !prev[stepKey],
                          }))
                        }
                        className={`cursor-pointer p-4 rounded-xl border transition-all duration-150 flex items-start gap-3.5 ${
                          isChecked
                            ? 'bg-emerald-50/50 border-emerald-200/80 text-[#18181B]'
                            : 'bg-white border-[#18181B]/[0.08] hover:border-[#E0246A]/40 hover:bg-[#FAFAFA]/50'
                        }`}
                      >
                        {/* Checkbox Icon */}
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition ${
                            isChecked
                              ? 'bg-emerald-600 text-white'
                              : 'border border-[#18181B]/[0.2] bg-white text-[#61565A]'
                          }`}
                        >
                          {isChecked ? (
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          ) : (
                            <span className="text-[11px] font-mono font-semibold">{st.num}</span>
                          )}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1 space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span
                              className={`text-xs font-semibold ${
                                isChecked ? 'text-emerald-900' : 'text-[#18181B]'
                              }`}
                            >
                              Phase {st.num}: {st.phase}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FAFAFA] border border-[#18181B]/[0.08] text-[#E0246A] font-semibold">
                                {st.cure}
                              </span>
                            </div>
                          </div>

                          <p
                            className={`text-xs leading-relaxed ${
                              isChecked ? 'text-[#61565A]' : 'text-[#18181B]'
                            }`}
                          >
                            {st.text}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#61565A] font-mono">
                            <span className="text-[#8C8085]">Tool:</span>
                            <span className="text-[#18181B]">{st.tool}</span>
                          </div>

                          {st.tip && (
                            <p className="text-[11px] text-[#E0246A] italic pt-0.5">
                              Pro Tip: {st.tip}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Flora Chic Editorial Mascot Salon Advice Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#18181B]/[0.08] shadow-sm flex items-center gap-3 print:hidden">
        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#D4AF37]/50 shrink-0">
          <Image
            src="/assets/finglora_mascot.jpg"
            alt="Flora Mascot"
            fill
            className="object-cover"
            sizes="36px"
          />
        </div>
        <div className="flex-1 text-xs">
          <span className="font-serif font-semibold text-[#18181B]">Flora&apos;s Tray Tip: </span>
          <span className="text-[#61565A]">
            Print the Station Tray Sheet and slip it into an acrylic stand at your table. It gives
            you glanceable cure times and color recipes without requiring phone interaction between
            steps.
          </span>
        </div>
      </div>

      {/* High-Resolution Client Reference Photo Modal */}
      {showPhotoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 print:hidden"
          onClick={() => setShowPhotoModal(false)}
        >
          <div
            className="relative bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#18181B]/[0.08]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#E0246A] font-semibold">
                  Original Client Inspiration Reference
                </span>
                <h3 className="font-serif text-lg font-normal text-[#18181B]">
                  #{passportCode} — {activeSetName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="w-8 h-8 rounded-full bg-[#FAFAFA] hover:bg-[#F4F4F5] text-[#18181B] flex items-center justify-center transition"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-[#18181B]/[0.08]">
              <InspirationPhotoCard item={activeSample} photoOverride={activePhotoUrl} showPins={true} />
            </div>

            <p className="text-xs text-[#61565A] text-center leading-relaxed">
              Detection points indicate reverse-engineered color extraction zones for thumb, index,
              middle, ring, and pinky.
            </p>
          </div>
        </div>
      )}

      {/* Printable Station Sheet Modal / Dedicated Acrylic Stand View */}
      {showPrintModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto print:static print:p-0 print:bg-white"
          onClick={() => setShowPrintModal(false)}
        >
          <div
            className="relative bg-white text-[#18181B] rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#18181B]/[0.08] print:border-none print:shadow-none print:p-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Controls (Hidden in Print) */}
            <div className="flex items-center justify-between pb-3 border-b border-[#18181B]/[0.08] print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#E0246A]" strokeWidth={1.5} />
                <span className="font-serif text-lg font-normal">
                  Salon Table Tray Sheet Preview
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#E0246A] hover:bg-[#66152A] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition"
                >
                  <Printer className="w-3.5 h-3.5 text-[#D4AF37]" strokeWidth={1.5} />
                  <span>Print Sheet Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="w-8 h-8 rounded-full bg-[#FAFAFA] hover:bg-[#F4F4F5] text-[#18181B] flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Acrylic Stand Physical Sheet Layout */}
            <div className="space-y-6 text-[#18181B] print:space-y-4">
              {/* Sheet Header */}
              <div className="flex items-start justify-between pb-4 border-b-2 border-[#18181B]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-2xl font-bold tracking-tight text-[#18181B]">
                      Finglora
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#FAFAFA] border border-[#18181B]/[0.1] font-semibold text-[#E0246A]">
                      Station Tray Formula
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-normal text-[#18181B] mt-1">
                    {activeSetName}
                  </h3>
                  <p className="text-xs text-[#61565A]">
                    Source: {techSourceLabel}
                  </p>
                </div>

                <div className="text-right text-xs font-mono space-y-0.5">
                  <div>
                    <span className="text-[#8C8085]">Passport:</span>{' '}
                    <strong className="text-[#E0246A]">#{passportCode}</strong>
                  </div>
                  <div>
                    <span className="text-[#8C8085]">Chair Time:</span>{' '}
                    <strong>{chairMinutes} mins</strong>
                  </div>
                  <div>
                    <span className="text-[#8C8085]">Date:</span>{' '}
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* 5-Finger Formula Breakdown Table */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#E0246A] font-semibold block">
                  Five-Finger Recipe & Specifications
                </span>
                <table className="w-full text-xs border border-[#18181B]/[0.15] text-left">
                  <thead className="bg-[#FAFAFA] font-mono text-[11px] border-b border-[#18181B]/[0.15]">
                    <tr>
                      <th className="p-2 border-r border-[#18181B]/[0.1]">Finger</th>
                      <th className="p-2 border-r border-[#18181B]/[0.1]">Shape & Length</th>
                      <th className="p-2 border-r border-[#18181B]/[0.1]">Base Shade</th>
                      <th className="p-2 border-r border-[#18181B]/[0.1]">Art / Accent</th>
                      <th className="p-2 border-r border-[#18181B]/[0.1]">Pattern</th>
                      <th className="p-2">Finish & Seal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#18181B]/[0.1]">
                    {orderedFingers.map((fk) => {
                      const nail = nails[fk];
                      return (
                        <tr key={fk} className="hover:bg-[#FAFAFA]/40">
                          <td className="p-2 font-semibold font-mono border-r border-[#18181B]/[0.1]">
                            {FINGER_LABELS[fk]}
                          </td>
                          <td className="p-2 border-r border-[#18181B]/[0.1] capitalize">
                            {nail.shape} • {nail.length}
                          </td>
                          <td className="p-2 border-r border-[#18181B]/[0.1] font-mono">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/20"
                                style={{ background: nail.baseColor }}
                              />
                              <span>{nail.baseColor}</span>
                            </div>
                          </td>
                          <td className="p-2 border-r border-[#18181B]/[0.1] font-mono">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/20"
                                style={{ background: nail.accentColor }}
                              />
                              <span>{nail.accentColor}</span>
                            </div>
                          </td>
                          <td className="p-2 border-r border-[#18181B]/[0.1] capitalize">
                            {nail.pattern.replace(/-/g, ' ')}
                          </td>
                          <td className="p-2 capitalize font-mono">
                            {nail.finish} (LED 60s)
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Protocol Summary Matrix */}
              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#18181B]/[0.1] space-y-1">
                  <span className="font-semibold text-[#18181B] block">
                    Phase 1 & 2: Prep & Apex
                  </span>
                  <p className="text-[11px] text-[#61565A]">
                    Etch with 180-grit buffer, 99% alcohol cleanse, pH balance primer. Self-leveling
                    rubber base bead at 1/3 apex stress zone (LED 30s).
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#18181B]/[0.1] space-y-1">
                  <span className="font-semibold text-[#18181B] block">
                    Phase 3 & 4: Pigment & Seal
                  </span>
                  <p className="text-[11px] text-[#61565A]">
                    Thin pigment coats, 000 precision liner smile line / blooming art. No-wipe
                    tempered topcoat capping free edge (LED 60s). Cuticle nectar finish.
                  </p>
                </div>
              </div>

              {/* Technician Sign-Off & Aftercare */}
              <div className="pt-4 border-t border-[#18181B]/[0.15] grid grid-cols-2 gap-6 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8C8085] block">
                    Client Maintenance Aftercare:
                  </span>
                  <p className="text-[11px] text-[#61565A] mt-0.5">
                    Apply botanical cuticle nectar morning and evening. Avoid prolonged hot water
                    submersion in the first 24 hours. Schedule rebalance at 3-4 weeks.
                  </p>
                </div>
                <div className="flex flex-col justify-end text-right">
                  <div className="border-b border-[#18181B]/[0.3] pb-1 w-48 ml-auto" />
                  <span className="text-[10px] font-mono text-[#8C8085] mt-1">
                    Technician Signature / Station Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
