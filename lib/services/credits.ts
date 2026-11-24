/**
 * Finglora Credit & Subscription Service
 * Free Plan: 10 complimentary try-on credits
 * Pro Plans: $7/month, $29/6 months ($4.83/mo), $49/year ($4.08/mo)
 */

const CREDITS_STORAGE_KEY = 'finglora_tryon_credits';
const SIGNUP_BONUS_KEY = 'finglora_signup_bonus_granted';
const PRO_STATUS_KEY = 'finglora_is_pro_subscriber';
const PRO_PLAN_KEY = 'finglora_pro_plan';
const USER_EMAIL_KEY = 'finglora_user_email';

export const FREE_SIGNUP_CREDITS = 10;

export type ProPlanType = 'monthly' | 'biannual' | 'annual';

export interface PlanPricing {
  id: ProPlanType;
  name: string;
  price: string;
  period: string;
  billingText: string;
  badge?: string;
  savings?: string;
  monthlyEquivalent: string;
}

export const PRO_PLANS: Record<ProPlanType, PlanPricing> = {
  monthly: {
    id: 'monthly',
    name: 'Monthly',
    price: '$7',
    period: '/month',
    billingText: '$7 billed monthly • Cancel anytime',
    monthlyEquivalent: '$7/mo',
  },
  biannual: {
    id: 'biannual',
    name: '6 Months',
    price: '$29',
    period: '/6 months',
    billingText: '$29 billed every 6 months • Save 31%',
    badge: 'POPULAR',
    savings: 'SAVE 31%',
    monthlyEquivalent: '$4.83/mo',
  },
  annual: {
    id: 'annual',
    name: 'Yearly',
    price: '$49',
    period: '/year',
    billingText: '$49 billed yearly • Best value',
    badge: 'BEST VALUE',
    savings: 'SAVE 42%',
    monthlyEquivalent: '$4.08/mo',
  },
};

export const VIP_EMAILS = [
  'finglora.vip.pro@gmail.com',
  'vip@finglora.com',
  'pro@finglora.com',
  'admin@finglora.com',
];

export function isVipEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return VIP_EMAILS.includes(clean) || clean.includes('finglora.vip') || clean.includes('+pro');
}

export interface UserCreditStatus {
  credits: number;
  isPro: boolean;
  proPlan?: ProPlanType | null;
  hasUsedGuestCredit: boolean;
  hasReceivedSignupBonus: boolean;
}

export function getUserCreditStatus(): UserCreditStatus {
  if (typeof window === 'undefined') {
    return { credits: FREE_SIGNUP_CREDITS, isPro: false, proPlan: null, hasUsedGuestCredit: false, hasReceivedSignupBonus: false };
  }

  const storedEmail = localStorage.getItem(USER_EMAIL_KEY) || '';
  const isVip = isVipEmail(storedEmail);
  const isPro = isVip || localStorage.getItem(PRO_STATUS_KEY) === 'true';
  const proPlan = (localStorage.getItem(PRO_PLAN_KEY) as ProPlanType) || (isPro ? 'annual' : null);
  const hasReceivedSignupBonus = localStorage.getItem(SIGNUP_BONUS_KEY) === 'true';
  
  const storedCredits = localStorage.getItem(CREDITS_STORAGE_KEY);
  let credits = isPro ? 999999 : FREE_SIGNUP_CREDITS; // Default: 10 free credits for free users

  if (!isPro && storedCredits !== null) {
    credits = parseInt(storedCredits, 10);
    if (isNaN(credits)) credits = 0;
  } else if (!isPro && storedCredits === null) {
    // First time guest/free user: initialize with 10 credits
    localStorage.setItem(CREDITS_STORAGE_KEY, FREE_SIGNUP_CREDITS.toString());
  }

  const hasUsedGuestCredit = !isPro && storedCredits !== null && credits < 1 && !hasReceivedSignupBonus;

  return {
    credits: isPro ? 999999 : credits,
    isPro,
    proPlan,
    hasUsedGuestCredit,
    hasReceivedSignupBonus,
  };
}

/**
 * Deduct 1 credit for a try-on session.
 * Returns true if successful, false if paywall is required.
 */
export function useTryOnCredit(): boolean {
  if (typeof window === 'undefined') return true;

  const status = getUserCreditStatus();
  if (status.isPro) return true;

  if (status.credits <= 0) {
    return false; // Requires paywall / signup
  }

  const remaining = status.credits - 1;
  localStorage.setItem(CREDITS_STORAGE_KEY, remaining.toString());
  return true;
}

/**
 * Award 10 credits when user creates a free account
 */
export function grantSignupCreditBonus(): number {
  if (typeof window === 'undefined') return FREE_SIGNUP_CREDITS;

  const alreadyGranted = localStorage.getItem(SIGNUP_BONUS_KEY) === 'true';
  if (alreadyGranted) {
    return getUserCreditStatus().credits;
  }

  const status = getUserCreditStatus();
  // Ensure user has at least 10 credits on signup
  const newBalance = Math.max(status.credits, FREE_SIGNUP_CREDITS);
  localStorage.setItem(CREDITS_STORAGE_KEY, newBalance.toString());
  localStorage.setItem(SIGNUP_BONUS_KEY, 'true');
  return newBalance;
}

/**
 * Upgrade user to Pro subscriber with selected plan
 */
export function activateProSubscription(plan: ProPlanType = 'annual'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PRO_STATUS_KEY, 'true');
  localStorage.setItem(PRO_PLAN_KEY, plan);
  localStorage.setItem(CREDITS_STORAGE_KEY, '999999');
}
