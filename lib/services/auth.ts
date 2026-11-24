import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { clearCreditStorage } from '@/lib/services/credits';

const USER_SCOPED_STORAGE_KEYS = [
  'finglora_session_owner_id',
  'finglora_user_email',
  'finglora_user_display_name',
  'finglora_custom_hand_photo',
  'finglora_user_hand_photo',
  'finglora_guest_hand_pending',
  'finglora_synthesized_hand_url',
  'finglora_ai_base_hand_image',
  'finglora_avatar_url',
  'finglora_custom_avatar_photo',
  'finglora_avatar_seed',
  'finglora_session_v1',
  'finglora_notifications_read_ids',
];

export function clearUserLocalSessionData(preserveGuestHand = false) {
  if (typeof window === 'undefined') return;
  clearCreditStorage();
  for (const key of USER_SCOPED_STORAGE_KEYS) {
    if (
      preserveGuestHand &&
      (key === 'finglora_custom_hand_photo' ||
        key === 'finglora_user_hand_photo' ||
        key === 'finglora_guest_hand_pending')
    ) {
      continue;
    }
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore storage errors
    }
  }
  window.dispatchEvent(new Event('finglora_avatar_updated'));
}

export async function signUpWithEmail(email: string, password: string, displayName?: string) {
  const supabase = getSupabaseBrowserClient();
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = (displayName || '').trim() || cleanEmail.split('@')[0];

  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      emailRedirectTo: origin ? `${origin}/auth/callback?next=/home` : undefined,
      data: {
        full_name: cleanName,
      },
    },
  });

  if (error) throw error;

  // Detect duplicate existing unconfirmed vs obfuscated empty identities in Supabase Auth
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new Error('An account with this email already exists. Please sign in instead.');
  }

  const needsEmailVerification = Boolean(data.user && !data.session);
  return {
    user: data.user,
    session: data.session,
    needsEmailVerification,
  };
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = getSupabaseBrowserClient();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }
  if (!password) {
    throw new Error('Please enter your password.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });

  if (error) throw error;
  if (!data.session || !data.user) {
    throw new Error('Login did not return an active session. Please verify your email.');
  }

  return data;
}

export async function resendVerificationEmail(email: string) {
  const supabase = getSupabaseBrowserClient();
  const cleanEmail = email.trim().toLowerCase();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: cleanEmail,
    options: {
      emailRedirectTo: origin ? `${origin}/auth/callback?next=/home` : undefined,
    },
  });
  if (error) throw error;
}

export async function signInWithGoogle() {
  const supabase = getSupabaseBrowserClient();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?next=/home`,
    },
  });

  if (error) throw error;
  return data;
}

export async function signOutUser() {
  const supabase = getSupabaseBrowserClient();
  clearUserLocalSessionData(false);
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const supabase = getSupabaseBrowserClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export function subscribeToAuthChanges(callback: (event: string, session: any) => void) {
  const supabase = getSupabaseBrowserClient();
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return subscription;
}
