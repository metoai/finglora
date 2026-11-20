/**
 * Finglora Credit & Subscription Service
 * Implements: 1 Guest Credit + 1 Free Signup Credit + Pro Paywall Model
 */

const CREDITS_STORAGE_KEY = 'finglora_tryon_credits';
const SIGNUP_BONUS_KEY = 'finglora_signup_bonus_granted';
const PRO_STATUS_KEY = 'finglora_is_pro_subscriber';

export interface UserCreditStatus {
  credits: number;
  isPro: boolean;
  hasUsedGuestCredit: boolean;
  hasReceivedSignupBonus: boolean;
}

export function getUserCreditStatus(): UserCreditStatus {
  if (typeof window === 'undefined') {
    return { credits: 1, isPro: false, hasUsedGuestCredit: false, hasReceivedSignupBonus: false };
  }

  const isPro = localStorage.getItem(PRO_STATUS_KEY) === 'true';
  const hasReceivedSignupBonus = localStorage.getItem(SIGNUP_BONUS_KEY) === 'true';
  
  const storedCredits = localStorage.getItem(CREDITS_STORAGE_KEY);
  let credits = 1; // Default: 1 free guest credit

  if (storedCredits !== null) {
    credits = parseInt(storedCredits, 10);
    if (isNaN(credits)) credits = 0;
  } else {
    // First time guest: initialize with 1 credit
    localStorage.setItem(CREDITS_STORAGE_KEY, '1');
  }

  const hasUsedGuestCredit = storedCredits !== null && credits < 1 && !hasReceivedSignupBonus;

  return {
    credits: isPro ? 999999 : credits,
    isPro,
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
 * Award +1 credit when user creates an account
 */
export function grantSignupCreditBonus(): number {
  if (typeof window === 'undefined') return 1;

  const alreadyGranted = localStorage.getItem(SIGNUP_BONUS_KEY) === 'true';
  if (alreadyGranted) {
    return getUserCreditStatus().credits;
  }

  const status = getUserCreditStatus();
  const newBalance = status.credits + 1;
  localStorage.setItem(CREDITS_STORAGE_KEY, newBalance.toString());
  localStorage.setItem(SIGNUP_BONUS_KEY, 'true');
  return newBalance;
}

/**
 * Upgrade user to Pro subscriber
 */
export function activateProSubscription(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PRO_STATUS_KEY, 'true');
  localStorage.setItem(CREDITS_STORAGE_KEY, '999999');
}
