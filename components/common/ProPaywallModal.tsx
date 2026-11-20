'use client';

import React, { useState } from 'react';
import { X, Check, Crown, ShieldCheck, ArrowRight, Hand } from 'lucide-react';
import { activateProSubscription } from '@/lib/services/credits';

export function ProPaywallModal({
  isOpen,
  onClose,
  onSuccess,
  isGuestFirstTry = false,
  onSignUpClick,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isGuestFirstTry?: boolean;
  onSignUpClick?: () => void;
}) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [isUpgrading, setIsUpgrading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    setIsUpgrading(true);
    setTimeout(() => {
      activateProSubscription();
      setIsUpgrading(false);
      onSuccess();
      onClose();
    }, 800);
  };

  // If user is a guest who just finished their 1st credit, offer the "+1 Free Credit on Signup" first!
  if (isGuestFirstTry && onSignUpClick) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-md rounded-3xl bg-[#FFF5F8] border border-pink-200 shadow-2xl p-6 sm:p-8 text-center space-y-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-pink-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E0246A]/10 border border-[#E0246A]/20 flex items-center justify-center text-[#E0246A] shadow-inner">
            <Hand className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-[#E0246A]/10 text-[#E0246A] text-xs font-semibold tracking-wide">
              1st Try-On Completed
            </span>
            <h2 className="font-serif text-2xl font-medium text-stone-900 tracking-tight">
              Unlock 1 More Free Try-On
            </h2>
            <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
              Create a free account to save your manicure recipe and receive an additional try-on credit.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                onSignUpClick();
              }}
              className="w-full h-12 rounded-2xl bg-[#E0246A] hover:bg-[#BE185D] text-white font-medium text-sm shadow-md shadow-[#E0246A]/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Create Free Account (+1 Credit)</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-xs text-stone-500 hover:text-stone-800 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-[#FFF8FA] border border-pink-200 shadow-2xl p-6 sm:p-8 text-center space-y-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-pink-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#E0246A] to-rose-400 flex items-center justify-center shadow-lg shadow-[#E0246A]/20">
          <Crown className="w-7 h-7 text-white" />
        </div>

        <div className="space-y-1.5">
          <span className="px-3 py-1 rounded-full bg-[#E0246A]/10 text-[#E0246A] text-[11px] font-semibold tracking-wider uppercase">
            Finglora Pro Salon Pass
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900 tracking-tight">
            Unlimited Photorealistic Try-Ons
          </h2>
          <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
            You have used all your complimentary try-on credits. Upgrade to Finglora Pro for unlimited high-definition Gemini virtual manicures.
          </p>
        </div>

        {/* Feature List */}
        <div className="space-y-2 text-left bg-white/80 rounded-2xl p-4 border border-pink-100 shadow-xs">
          {[
            'Unlimited Gemini Photorealistic Virtual Try-Ons',
            'Constant Hand AI Chat Iterations (Mutate with words)',
            '5-Finger High-Res Photographic Studio Assets',
            'Full Salon Formula Recipes & Passport Codes',
            'Zero Watermarks & Instant 4K Export',
          ].map((benefit, i) => (
            <div key={i} className="flex items-center gap-2.5 text-xs text-stone-800">
              <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[2.5]" />
              </div>
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        {/* Plan Selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelectedPlan('annual')}
            className={`p-3.5 rounded-2xl border text-left transition-all relative ${
              selectedPlan === 'annual'
                ? 'bg-pink-50/90 border-[#E0246A] ring-1 ring-[#E0246A]'
                : 'bg-white border-stone-200 hover:border-pink-300'
            }`}
          >
            <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-[#E0246A] text-white text-[9px] font-bold tracking-wide">
              SAVE 35%
            </span>
            <div className="text-xs font-semibold text-stone-900">Annual</div>
            <div className="text-lg font-bold text-stone-900 mt-0.5">$6.58<span className="text-[10px] font-normal text-stone-500">/mo</span></div>
            <div className="text-[10px] text-stone-500 mt-0.5">$79 billed yearly</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPlan('monthly')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              selectedPlan === 'monthly'
                ? 'bg-pink-50/90 border-[#E0246A] ring-1 ring-[#E0246A]'
                : 'bg-white border-stone-200 hover:border-pink-300'
            }`}
          >
            <div className="text-xs font-semibold text-stone-900">Monthly</div>
            <div className="text-lg font-bold text-stone-900 mt-0.5">$9.99<span className="text-[10px] font-normal text-stone-500">/mo</span></div>
            <div className="text-[10px] text-stone-500 mt-0.5">Cancel anytime</div>
          </button>
        </div>

        {/* Upgrade Action */}
        <div className="space-y-2">
          <button
            type="button"
            disabled={isUpgrading}
            onClick={handleUpgrade}
            className="w-full h-12 rounded-2xl bg-[#E0246A] hover:bg-[#BE185D] text-white font-medium text-sm shadow-md shadow-[#E0246A]/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isUpgrading ? (
              <span>Activating Pro Access...</span>
            ) : (
              <>
                <Crown className="w-4 h-4 text-white" />
                <span>Upgrade to Pro — Unlimited Access</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure 256-bit checkout • Instant activation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
