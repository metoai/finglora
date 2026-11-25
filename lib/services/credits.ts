import { getSupabaseBrowserClient } from '@/lib/supabase/client';

/**
 * Finglora Credit & Subscription Service
 * Guest Experience: 1 complimentary instant virtual try-on (no signup required)
 * Free Account: 10 complimentary try-on credits upon free signup
 * Pro Plans: $7/month, $29/6 months ($4.83/mo), $49/year ($4.08/mo)
 */

const CREDITS_STORAGE_KEY = 'finglora_tryon_credits';
const SIGNUP_BONUS_KEY = 'finglora_signup_bonus_granted';
const GUEST_CREDITS_USED_KEY = 'finglora_guest_credits_used';
const PRO_STATUS_KEY = 'finglora_is_pro_subscriber';
const PRO_PLAN_KEY = 'finglora_pro_plan';
const USER_EMAIL_KEY = 'finglora_user_email';
const SESSION_OWNER_KEY = 'finglora_session_owner_id';

export const GUEST_FREE_CREDITS = 1;
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
  'metoaipr@gmail.com',
  'alazartesema1@gmail.com',
];

export function isVipEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return VIP_EMAILS.includes(clean);
}

export interface UserCreditStatus {
  credits: number;
  isPro: boolean;
  isGuest: boolean;
  proPlan?: ProPlanType | null;
  hasUsedGuestCredit: boolean;
  hasReceivedSignupBonus: boolean;
}

function isAuthenticatedClientSession(): boolean {
  if (typeof window === 'undefined') return false;
  const ownerId = localStorage.getItem(SESSION_OWNER_KEY);
  if (ownerId && ownerId !== 'guest') return true;
  return localStorage.getItem(SIGNUP_BONUS_KEY) === 'true';
}

/**
 * Synchronize client cache strictly with the server credit response or authenticated DB profile row.
 */
export function syncCreditsFromProfile(
  isPro: boolean,
  credits?: number | null,
  isGuest = false
): void {
  if (typeof window === 'undefined') return;
  try {
    if (isGuest) {
      const remaining = typeof credits === 'number' ? Math.max(0, credits) : 0;
      localStorage.setItem(GUEST_CREDITS_USED_KEY, remaining <= 0 ? 'true' : 'false');
      return;
    }

    localStorage.setItem(PRO_STATUS_KEY, isPro ? 'true' : 'false');
    if (isPro) {
      localStorage.setItem(
        CREDITS_STORAGE_KEY,
        String(typeof credits === 'number' ? credits : 999999)
      );
    } else if (typeof credits === 'number') {
      localStorage.setItem(CREDITS_STORAGE_KEY, String(Math.max(0, credits)));
    } else {
      localStorage.setItem(CREDITS_STORAGE_KEY, String(FREE_SIGNUP_CREDITS));
    }
    localStorage.setItem(SIGNUP_BONUS_KEY, 'true');
  } catch {
    // ignore storage quota error
  }
}

export function getUserCreditStatus(explicitIsAuthenticated?: boolean): UserCreditStatus {
  if (typeof window === 'undefined') {
    return {
      credits: GUEST_FREE_CREDITS,
      isPro: false,
      isGuest: true,
      proPlan: null,
      hasUsedGuestCredit: false,
      hasReceivedSignupBonus: false,
    };
  }

  const isAuth =
    typeof explicitIsAuthenticated === 'boolean'
      ? explicitIsAuthenticated
      : isAuthenticatedClientSession();

  if (!isAuth) {
    const guestUsed = localStorage.getItem(GUEST_CREDITS_USED_KEY) === 'true';
    return {
      credits: guestUsed ? 0 : GUEST_FREE_CREDITS,
      isPro: false,
      isGuest: true,
      proPlan: null,
      hasUsedGuestCredit: guestUsed,
      hasReceivedSignupBonus: false,
    };
  }

  const isPro = localStorage.getItem(PRO_STATUS_KEY) === 'true';
  const proPlan = (localStorage.getItem(PRO_PLAN_KEY) as ProPlanType) || (isPro ? 'annual' : null);
  const hasReceivedSignupBonus = localStorage.getItem(SIGNUP_BONUS_KEY) === 'true';

  const storedCredits = localStorage.getItem(CREDITS_STORAGE_KEY);
  let credits = isPro ? 999999 : FREE_SIGNUP_CREDITS;

  if (!isPro && storedCredits !== null) {
    credits = parseInt(storedCredits, 10);
    if (isNaN(credits)) credits = 0;
  } else if (!isPro && storedCredits === null) {
    localStorage.setItem(CREDITS_STORAGE_KEY, FREE_SIGNUP_CREDITS.toString());
  }

  return {
    credits: isPro ? 999999 : credits,
    isPro,
    isGuest: false,
    proPlan,
    hasUsedGuestCredit: false,
    hasReceivedSignupBonus,
  };
}

/**
 * Deduct 1 credit locally (for instant UI feedback for guest or fallback).
 * Prefer server enforcement via /api/generate-nail-art & consume_tryon_credit RPC.
 */
export function useTryOnCredit(): boolean {
  if (typeof window === 'undefined') return true;

  const status = getUserCreditStatus();
  if (status.isPro) return true;

  if (status.credits <= 0) {
    return false;
  }

  if (status.isGuest) {
    localStorage.setItem(GUEST_CREDITS_USED_KEY, 'true');
    return true;
  }

  const remaining = status.credits - 1;
  localStorage.setItem(CREDITS_STORAGE_KEY, remaining.toString());
  return true;
}

/**
 * Atomically deduct 1 credit via Supabase RPC for logged-in users, syncing local state.
 */
export async function consumeAuthenticatedCredit(): Promise<{
  allowed: boolean;
  credits: number;
  isPro: boolean;
}> {
  try {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      const ok = useTryOnCredit();
      const s = getUserCreditStatus(false);
      return { allowed: ok, credits: s.credits, isPro: s.isPro };
    }

    const { data, error } = await (supabase as any).rpc('consume_tryon_credit');
    if (!error && data && typeof data.allowed === 'boolean') {
      syncCreditsFromProfile(Boolean(data.is_pro), data.credits, false);
      return {
        allowed: Boolean(data.allowed),
        credits: typeof data.credits === 'number' ? data.credits : 0,
        isPro: Boolean(data.is_pro),
      };
    }
  } catch {
    // fallback to local check only if RPC is not deployed yet
  }

  const ok = useTryOnCredit();
  const s = getUserCreditStatus();
  return { allowed: ok, credits: s.credits, isPro: s.isPro };
}

/**
 * Award 10 credits when user creates a free account
 */
export function grantSignupCreditBonus(): number {
  if (typeof window === 'undefined') return FREE_SIGNUP_CREDITS;

  const alreadyGranted = localStorage.getItem(SIGNUP_BONUS_KEY) === 'true';
  if (alreadyGranted) {
    return getUserCreditStatus(true).credits;
  }

  const stored = parseInt(localStorage.getItem(CREDITS_STORAGE_KEY) || '0', 10);
  const newBalance = Math.max(isNaN(stored) ? 0 : stored, FREE_SIGNUP_CREDITS);
  localStorage.setItem(CREDITS_STORAGE_KEY, newBalance.toString());
  localStorage.setItem(SIGNUP_BONUS_KEY, 'true');
  return newBalance;
}

/**
 * Upgrade user to Pro subscriber with selected plan (client display cache after verified checkout)
 */
export function activateProSubscription(plan: ProPlanType = 'annual'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PRO_STATUS_KEY, 'true');
  localStorage.setItem(PRO_PLAN_KEY, plan);
  localStorage.setItem(CREDITS_STORAGE_KEY, '999999');
}

export function clearCreditStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CREDITS_STORAGE_KEY);
  localStorage.removeItem(SIGNUP_BONUS_KEY);
  localStorage.removeItem(PRO_STATUS_KEY);
  localStorage.removeItem(PRO_PLAN_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
}
