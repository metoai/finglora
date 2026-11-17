'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  ClipboardList,
  Inbox,
  Store,
  Printer,
  Play,
  Pause,
  RotateCcw,
  Paintbrush,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Timer,
} from 'lucide-react';
import { TechProfile } from '@/types/nail';
import { BrandLogo } from '@/components/common/BrandLogo';

export type TechRoute = 'signup' | 'workspace' | 'guide';

export function TechSidebar({
  currentRoute,
  onNavigate,
  techProfile,
  onBrandClick,
  onOpenStationSheet,
  onNavigateCustomer,
}: {
  currentRoute: TechRoute;
  onNavigate: (route: TechRoute) => void;
  techProfile: TechProfile;
  onBrandClick: () => void;
  onOpenStationSheet?: () => void;
  onNavigateCustomer?: () => void;
}) {
  // Salon LED Cure Timer State
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Quick Preset Options
  const curePresets = [
    { label: '10s', value: 10, name: 'Flash' },
    { label: '30s', value: 30, name: 'Base' },
    { label: '60s', value: 60, name: 'Seal' },
    { label: '90s', value: 90, name: 'Build' },
  ];

  // Beep sound on timer completion using Web Audio API
  const playCureChime = () => {
    try {
      if (typeof window === 'undefined') return;
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch {
      // AudioContext may be blocked before user gesture; gracefully ignore
    }
  };

  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            setIsTimerRunning(false);
            setHasCompleted(true);
            playCureChime();
            setTimeout(() => setHasCompleted(false), 2400);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  const selectPreset = (seconds: number) => {
    setIsTimerRunning(false);
    setSelectedDuration(seconds);
    setTimeLeft(seconds);
    setHasCompleted(false);
  };

  const toggleTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(selectedDuration);
    }
    setIsTimerRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(selectedDuration);
    setHasCompleted(false);
  };

  const timerProgress =
    selectedDuration > 0
      ? Math.max(0, Math.min(100, ((selectedDuration - timeLeft) / selectedDuration) * 100))
      : 0;

  const navItems = [
    {
      id: 'guide' as const,
      label: 'Active Client Guide',
      Icon: ClipboardList,
      badge: 'Live',
    },
    {
      id: 'workspace' as const,
      label: 'Decode Photo / Link',
      Icon: Inbox,
    },
    {
      id: 'signup' as const,
      label: 'Studio Profile & Setup',
      Icon: Store,
    },
  ];

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[#161114] text-white px-4 py-5 justify-between z-20 border-r border-white/[0.08] select-none">
      <div className="space-y-5">
        {/* Brand Header */}
        <button
          type="button"
          onClick={onBrandClick}
          className="group block px-1 text-left transition hover:opacity-90 cursor-pointer"
        >
          <BrandLogo
            variant="light"
            size="md"
            badgeText="PRO"
            subtitle="TECHNICIAN ATELIER"
          />
        </button>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map(({ id, label, Icon, badge }) => {
            const isActive = currentRoute === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition duration-150 ${
                  isActive
                    ? 'bg-[#E0246A] text-white shadow-sm font-semibold'
                    : 'text-[#C5B8BD] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0 text-white/90" strokeWidth={1.5} />
                  <span className="truncate">{label}</span>
                </div>
                {badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-medium ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Station Tray Sheet Quick Trigger */}
          <button
            type="button"
            onClick={() => {
              if (onOpenStationSheet) {
                onOpenStationSheet();
              } else {
                onNavigate('guide');
                setTimeout(() => window.print(), 120);
              }
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-[#C5B8BD] hover:text-white hover:bg-white/[0.06] transition duration-150"
          >
            <div className="flex items-center gap-2.5 truncate">
              <Printer className="w-4 h-4 shrink-0 text-[#D4AF37]" strokeWidth={1.5} />
              <span className="truncate">Station Tray Sheet</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.2 rounded font-mono text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20">
              Print
            </span>
          </button>
        </nav>

        {/* Salon LED Cure Timer Module */}
        <div className="bg-[#20181D] rounded-2xl p-3.5 border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-[#D4AF37]" strokeWidth={1.5} />
              <span className="text-[11px] font-semibold text-white/95">Station LED Timer</span>
            </div>
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#A89B9F]">
              {techProfile.stationNumber ? `Station ${techProfile.stationNumber}` : 'Station 01'}
            </span>
          </div>

          {/* Digital Countdown Display */}
          <div
            className={`flex items-center justify-between px-3 py-2 rounded-xl transition duration-200 border ${
              hasCompleted
                ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                : isTimerRunning
                ? 'bg-[#E0246A]/30 border-[#E0246A]/60 text-white'
                : 'bg-black/30 border-white/[0.06] text-white/90'
            }`}
          >
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-xl font-bold tabular-nums tracking-tight">
                {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:
                {String(timeLeft % 60).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-[#A89B9F]">
                {hasCompleted ? 'Cure Done' : isTimerRunning ? 'Curing' : 'Standby'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleTimer}
                aria-label={isTimerRunning ? 'Pause timer' : 'Start timer'}
                className="w-7 h-7 rounded-lg bg-[#E0246A] hover:bg-[#9E2445] text-white flex items-center justify-center transition active:scale-95"
              >
                {isTimerRunning ? (
                  <Pause className="w-3.5 h-3.5" strokeWidth={1.5} />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" strokeWidth={1.5} />
                )}
              </button>
              <button
                type="button"
                onClick={resetTimer}
                aria-label="Reset timer"
                className="w-7 h-7 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-[#A89B9F] hover:text-white flex items-center justify-center transition"
              >
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Progress Micro Bar */}
          <div className="w-full h-1 bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E0246A] transition-all duration-300"
              style={{ width: `${timerProgress}%` }}
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-4 gap-1.5">
            {curePresets.map((preset) => {
              const isSelected = selectedDuration === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => selectPreset(preset.value)}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-mono transition text-center border ${
                    isSelected
                      ? 'bg-white/15 border-[#D4AF37]/50 text-[#D4AF37] font-semibold'
                      : 'bg-white/[0.04] border-transparent text-[#A89B9F] hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  <span className="block leading-none">{preset.label}</span>
                  <span className="block text-[8px] opacity-70 mt-0.5">{preset.name}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#A89B9F] pt-0.5 border-t border-white/[0.06]">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#D4AF37]" strokeWidth={1.5} />
              365+405nm LED
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3 h-3" strokeWidth={1.5} />
              Calibrated
            </span>
          </div>
        </div>

        {/* Flora Chic Editorial Mascot Concierge Card */}
        <div className="bg-[#20181D]/80 rounded-2xl p-3 border border-white/[0.08] flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#D4AF37]/40 shrink-0">
            <Image
              src="/assets/finglora_mascot.jpg"
              alt="Flora Mascot"
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[11px] font-medium text-white/95">
              <span>Flora</span>
              <span className="text-[9px] text-[#D4AF37]">Concierge</span>
            </div>
            <p className="text-[10px] text-[#A89B9F] leading-tight truncate">
              Flash cure smile lines 10s to freeze symmetry
            </p>
          </div>
        </div>
      </div>

      {/* Logged-In Technician Profile & Station Status */}
      <div className="bg-[#20181D] rounded-2xl p-3 border border-white/[0.08] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-[#D4AF37] tracking-wider uppercase">
            Active Chair
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white truncate">{techProfile.name}</p>
          <p className="text-[11px] text-[#A89B9F] truncate">{techProfile.studio}</p>
        </div>
        <div className="pt-1.5 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-[#A89B9F]">
          <span className="truncate">{techProfile.specialty.split('&')[0].trim()}</span>
          <span className="font-mono text-white/60">
            {techProfile.chairCount ? `${techProfile.chairCount} chairs` : '1 chair'}
          </span>
        </div>
      </div>

      {/* Switch to Customer Atelier */}
      {onNavigateCustomer && (
        <button
          type="button"
          onClick={onNavigateCustomer}
          className="w-full mt-2 py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-white/80 hover:text-white text-xs font-medium transition flex items-center justify-between group cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Paintbrush className="w-3.5 h-3.5 text-[#E0246A]" />
            <span>Customer Atelier</span>
          </span>
          <span className="text-[10px] text-white/40 group-hover:text-white/70">Explore →</span>
        </button>
      )}
    </aside>
  );
}
