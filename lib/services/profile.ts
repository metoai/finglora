import { getSupabaseBrowserClient } from '@/lib/supabase/client';
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
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as any;

  return {
    id: row.id,
    displayName: row.display_name,
    email: row.email,
    avatarUrl: row.avatar_url,
    preferredShape: (row.preferred_shape || 'almond') as NailShape,
    preferredLength: (row.preferred_length || 'medium') as NailLength,
    skinToneId: row.skin_tone_id || 'warm-ivory',
    handOrientation: (row.hand_orientation || 'right') as 'left' | 'right',
    customHandUrl: row.custom_hand_url,
  };
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<{
    displayName: string;
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
