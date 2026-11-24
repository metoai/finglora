import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { syncCreditsFromProfile } from '@/lib/services/credits';
import { NailShape, NailLength } from '@/types/nail';

export interface UserProfile {
  id: string;
  displayName: string;
  email: string | null;
  avatarUrl: string | null;
  preferredShape: NailShape;
  preferredLength: NailLength;
  skinToneId: string;
  handOrientation: 'left' | 'right';
  customHandUrl: string | null;
  isPro: boolean;
  credits: number;
}

function mapProfileRow(row: any): UserProfile {
  const isPro = Boolean(row.is_pro);
  const credits = typeof row.credits === 'number' ? row.credits : isPro ? 999999 : 10;

  syncCreditsFromProfile(isPro, credits);

  return {
    id: row.id,
    displayName: row.display_name || 'Elena',
    email: row.email || null,
    avatarUrl: row.avatar_url || null,
    preferredShape: (row.preferred_shape || 'almond') as NailShape,
    preferredLength: (row.preferred_length || 'medium') as NailLength,
    skinToneId: row.skin_tone_id || 'warm-ivory',
    handOrientation: (row.hand_orientation || 'right') as 'left' | 'right',
    customHandUrl: row.custom_hand_url || null,
    isPro,
    credits,
  };
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapProfileRow(data);
}

/**
 * Fetch the authenticated user's profile, provisioning it cleanly if the trigger row isn't ready yet.
 */
export async function ensureAndFetchUserProfile(authUser: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, any>;
}): Promise<UserProfile | null> {
  const existing = await fetchUserProfile(authUser.id);
  if (existing) return existing;

  // Brief retry in case handle_new_user trigger is completing right after signup
  await new Promise((r) => setTimeout(r, 180));
  const retry = await fetchUserProfile(authUser.id);
  if (retry) return retry;

  // Provision row directly under RLS "Users can insert own profile"
  try {
    const supabase = getSupabaseBrowserClient();
    const displayName =
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      (authUser.email ? authUser.email.split('@')[0] : 'Elena');
    const avatarUrl =
      authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null;

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: authUser.id,
        email: authUser.email || null,
        display_name: displayName,
        avatar_url: avatarUrl,
      } as any)
      .select()
      .single();

    if (!error && data) {
      return mapProfileRow(data);
    }
  } catch {
    // ignore duplicate insert race
  }

  return await fetchUserProfile(authUser.id);
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<{
    displayName: string;
    avatarUrl: string | null;
    preferredShape: NailShape;
    preferredLength: NailLength;
    skinToneId: string;
    handOrientation: 'left' | 'right';
    customHandUrl: string | null;
  }>
) {
  const supabase = getSupabaseBrowserClient();

  const payload: any = {};
  if (updates.displayName !== undefined) payload.display_name = updates.displayName;
  if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
  if (updates.preferredShape !== undefined) payload.preferred_shape = updates.preferredShape;
  if (updates.preferredLength !== undefined) payload.preferred_length = updates.preferredLength;
  if (updates.skinToneId !== undefined) payload.skin_tone_id = updates.skinToneId;
  if (updates.handOrientation !== undefined) payload.hand_orientation = updates.handOrientation;
  if (updates.customHandUrl !== undefined) payload.custom_hand_url = updates.customHandUrl;

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
