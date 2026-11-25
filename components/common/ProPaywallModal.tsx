'use client';

import React, { useState } from 'react';
import { X, Check, ShieldCheck, ArrowRight, Sparkles, Coins, Infinity as InfinityIcon } from 'lucide-react';
import {
  CREDIT_PACKS,
  CreditPackType,
  PRO_PLANS,
  ProPlanType,
} from '@/lib/services/credits';

export function ProPaywallModal({
  isOpen,
  onClose,
  onSuccess,
  isGuestFirstTry = false,
  onSignUpClick,
  onSignInClick,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isGuestFirstTry?: boolean;
  onSignUpClick?: () => void;
  onSignInClick?: () => void;
}) {
  const [purchaseTab, setPurchaseTab] = useState<'packs' | 'pro'>('packs');
  const [selectedPack, setSelectedPack] = useState<CreditPackType>('pack15');
  const [selectedPlan, setSelectedPlan] = useState<ProPlanType>('biannual');
  const [isUpgrading, setIsUpgrading] = useState(false);

  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    setIsUpgrading(true);
    setCheckoutNotice(null);
    setTimeout(() => {
      setIsUpgrading(false);
      setCheckoutNotice(
        purchaseTab === 'packs'
          ? 'Online credit pack checkout is being finalized. Contact support@finglora.app for early top-up access.'
          : 'Online billing is being finalized. Contact support@finglora.app for early Pro access.'
      );
    }, 300);
  };

  // Guest who used their 1 free instant try-on sees high-conversion signup offer (10 Free Credits)
  if (isGuestFirstTry && onSignUpClick) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-md rounded-3xl bg-[#FFF5F8] border border-pink-200 shadow-2xl p-6 sm:p-8 text-center space-y-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-pink-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E0246A]/10 border border-[#E0246A]/20 flex items-center justify-center text-[#E0246A] shadow-inner">
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-[#E0246A]/10 text-[#E0246A] text-xs font-semibold tracking-wide">
              Free Preview Used
            </span>
            <h2 className="font-serif text-2xl font-medium text-stone-900 tracking-tight">
              Save Your Hand &amp; Unlock 10 More Looks
            </h2>
            <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
              Create a free account in seconds to save your hand photo, keep your try-on history, and unlock 10 complimentary virtual try-ons.
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onSignUpClick();
              }}
              className="w-full h-12 rounded-2xl bg-[#E0246A] hover:bg-[#BE185D] text-white font-medium text-sm shadow-md shadow-[#E0246A]/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Create Free Account (10 Credits)</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>

            {onSignInClick && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSignInClick();
                }}
                className="w-full h-10 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Already have an account? Sign In
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="text-xs text-stone-500 hover:text-stone-800 transition-colors cursor-pointer pt-1"
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
      <div className="relative w-full max-w-lg rounded-3xl bg-[#FFF8FA] border border-pink-200 shadow-2xl p-6 sm:p-8 text-center space-y-5">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-pink-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Mode Switcher: Non-Expiring Packs vs Unlimited Pro */}
        <div className="inline-flex items-center p-1 rounded-full bg-white border border-stone-200/80 shadow-2xs">
          <button
            type="button"
            onClick={() => {
              setPurchaseTab('packs');
              setCheckoutNotice(null);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer ${
              purchaseTab === 'packs'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-[#E0246A]" />
            <span>Credit Packs</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setPurchaseTab('pro');
              setCheckoutNotice(null);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer ${
              purchaseTab === 'pro'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <InfinityIcon className="w-3.5 h-3.5 text-[#E0246A]" />
            <span>Unlimited Pro</span>
          </button>
        </div>

        <div className="space-y-1.5">
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900 tracking-tight">
            {purchaseTab === 'packs' ? 'Pay-As-You-Go Packs' : 'Finglora Pro'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
            {purchaseTab === 'packs'
              ? 'One-time credits that never expire — no recurring subscription.'
              : 'Unlimited virtual try-ons & AI Studio refinements.'}
          </p>
        </div>

        {purchaseTab === 'packs' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {(['pack15', 'pack50'] as CreditPackType[]).map((packId) => {
              const pack = CREDIT_PACKS[packId];
              const active = selectedPack === packId;
              return (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => setSelectedPack(packId)}
                  className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    active
                      ? 'bg-pink-50/90 border-[#E0246A] ring-2 ring-[#E0246A]/20'
                      : 'bg-white border-stone-200 hover:border-pink-300'
                  }`}
                >
                  {pack.badge && (
                    <span
                      className={`absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-white text-[9px] font-bold tracking-wide ${
                        packId === 'pack50' ? 'bg-emerald-600' : 'bg-[#E0246A]'
                      }`}
                    >
                      {pack.badge}
                    </span>
                  )}
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-stone-900">{pack.name}</div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-stone-900">{pack.price}</span>
                      <span className="text-[11px] font-medium text-[#E0246A]">
                        {pack.perTryPrice}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-3">{pack.subtitle}</p>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {/* Monthly: $7/mo */}
            <button
              type="button"
              onClick={() => setSelectedPlan('monthly')}
              className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                selectedPlan === 'monthly'
                  ? 'bg-pink-50/90 border-[#E0246A] ring-2 ring-[#E0246A]/20'
                  : 'bg-white border-stone-200 hover:border-pink-300'
              }`}
            >
              <div>
                <div className="text-xs font-semibold text-stone-900">Monthly</div>
                <div className="text-base sm:text-lg font-bold text-stone-900 mt-0.5">
                  $7<span className="text-[10px] font-normal text-stone-500">/mo</span>
                </div>
              </div>
              <div className="text-[10px] text-stone-500 mt-2">Billed monthly</div>
            </button>

            {/* 6 Months: $29 ($4.83/mo) */}
            <button
              type="button"
              onClick={() => setSelectedPlan('biannual')}
              className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                selectedPlan === 'biannual'
                  ? 'bg-pink-50/90 border-[#E0246A] ring-2 ring-[#E0246A]/20'
                  : 'bg-white border-stone-200 hover:border-pink-300'
              }`}
            >
              <span className="absolute -top-2.5 right-1.5 px-1.5 py-0.5 rounded-full bg-[#E0246A] text-white text-[8px] font-bold tracking-wide">
                POPULAR
              </span>
              <div>
                <div className="text-xs font-semibold text-stone-900">6 Months</div>
                <div className="text-base sm:text-lg font-bold text-stone-900 mt-0.5">
                  $29
                </div>
                <div className="text-[10px] text-[#E0246A] font-semibold mt-0.5">
                  $4.83/mo
                </div>
              </div>
              <div className="text-[10px] text-stone-500 mt-1">Save 31%</div>
            </button>

            {/* Yearly: $49 ($4.08/mo) */}
            <button
              type="button"
              onClick={() => setSelectedPlan('annual')}
              className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                selectedPlan === 'annual'
                  ? 'bg-pink-50/90 border-[#E0246A] ring-2 ring-[#E0246A]/20'
                  : 'bg-white border-stone-200 hover:border-pink-300'
              }`}
            >
              <span className="absolute -top-2.5 right-1.5 px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[8px] font-bold tracking-wide">
                SAVE 42%
              </span>
              <div>
                <div className="text-xs font-semibold text-stone-900">Yearly</div>
                <div className="text-base sm:text-lg font-bold text-stone-900 mt-0.5">
                  $49
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                  $4.08/mo
                </div>
              </div>
              <div className="text-[10px] text-stone-500 mt-1">Best Value</div>
            </button>
          </div>
        )}

        {/* Included Benefits */}
        <div className="flex flex-col gap-2 text-left bg-white rounded-2xl p-4 border border-stone-200/80">
          {(purchaseTab === 'packs'
            ? [
                'Credits never expire — use across future salon visits',
                'Full 5-finger salon specs & WhatsApp Show-to-Tech',
                'HD downloads with zero recurring commitment',
              ]
            : [
                'Unlimited virtual try-ons & prompt edits',
                'Custom 5-finger designs & AI Studio chat',
                'HD saves, exports & Show-to-Tech cards',
              ]
          ).map((benefit, i) => (
            <div key={i} className="flex items-center gap-2.5 text-xs text-stone-800">
              <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[2.5]" />
              </div>
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        {/* Action */}
        <div className="space-y-2">
          <button
            type="button"
            disabled={isUpgrading}
            onClick={handleUpgrade}
            className="w-full h-12 rounded-2xl bg-[#E0246A] hover:bg-[#BE185D] text-white font-medium text-sm shadow-md shadow-[#E0246A]/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isUpgrading ? (
              <span>Opening checkout...</span>
            ) : purchaseTab === 'packs' ? (
              <span>
                Get {CREDIT_PACKS[selectedPack].name} — {CREDIT_PACKS[selectedPack].price}
              </span>
            ) : (
              <span>
                Continue — {PRO_PLANS[selectedPlan].price}{PRO_PLANS[selectedPlan].period}
              </span>
            )}
          </button>

          {checkoutNotice && (
            <p className="text-xs text-[#E0246A] bg-pink-50 border border-pink-200 rounded-xl px-3 py-2">
              {checkoutNotice}
            </p>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              {purchaseTab === 'packs'
                ? 'One-time purchase • Credits never expire • Instant activation'
                : 'Secure checkout • Instant activation • Cancel anytime'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
