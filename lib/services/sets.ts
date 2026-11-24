import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { ExploreDesignSet, Finger, NailDesign, SkinTonePreset } from '@/types/nail';
import { HAND_SKIN_TONES } from '@/constants/nail-data';

function mapRowToExploreSet(row: any, isSaved = false): ExploreDesignSet {
  const skinTone =
    HAND_SKIN_TONES.find((s) => s.id === row.skin_tone_id) || HAND_SKIN_TONES[1];

  return {
    id: row.id,
    passportCode: row.passport_code,
    title: row.title,
    category: row.category,
    subtitle: row.subtitle || '',
    photoUrl: row.photo_url,
    likes: row.likes_count || 0,
    isSaved,
    skinTone,
    backdrop: row.backdrop || 'linear-gradient(135deg, #FAF7F2 0%, #F4EFEB 100%)',
    chairMinutes: row.chair_minutes || 60,
    nails: row.nails as Record<Finger, NailDesign>,
  };
}

export async function fetchExploreSets(currentUserId?: string): Promise<ExploreDesignSet[]> {
  const supabase = getSupabaseBrowserClient();

  // 1. Fetch public / curated sets
  const { data: sets, error } = await supabase
    .from('nail_sets')
    .select('*')
    .or('is_curated.eq.true,is_public.eq.true')
    .order('likes_count', { ascending: false });

  if (error || !sets) {
    console.warn('Failed to fetch sets from Supabase:', error?.message);
    return [];
  }

  // 2. Fetch user favorites if logged in
  let favIds = new Set<string>();
  if (currentUserId) {
    const { data: favs } = await supabase
      .from('user_favorites')
      .select('set_id')
      .eq('user_id', currentUserId);
    if (favs) {
      favIds = new Set((favs as any[]).map((f) => f.set_id));
    }
  }

  return (sets as any[]).map((s) => mapRowToExploreSet(s, favIds.has(s.id)));
}

export async function getSetByPassportCode(passportCode: string): Promise<ExploreDesignSet | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('nail_sets')
    .select('*')
    .eq('passport_code', passportCode.trim())
    .maybeSingle();

  if (error || !data) return null;
  return mapRowToExploreSet(data);
}

export async function saveUserManicureSet({
  userId,
  passportCode,
  title,
  category = 'Custom',
  subtitle = 'Custom Studio Design',
  photoUrl,
  nails,
  skinToneId = 'warm-ivory',
  backdrop,
}: {
  userId: string;
  passportCode: string;
  title: string;
  category?: string;
  subtitle?: string;
  photoUrl: string;
  nails: Record<Finger, NailDesign>;
  skinToneId?: string;
  backdrop?: string;
}) {
  const supabase = getSupabaseBrowserClient();

  let targetCode = passportCode;

  // Check if passportCode belongs to another user or a curated set to avoid RLS 403
  if (targetCode) {
    try {
      const { data: existing } = await supabase
        .from('nail_sets')
        .select('user_id')
        .eq('passport_code', targetCode)
        .maybeSingle();

      if (existing && existing.user_id !== userId) {
        targetCode = `FGL-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    } catch {
      // ignore
    }
  } else {
    targetCode = `FGL-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const record: any = {
    user_id: userId,
    passport_code: targetCode,
    title,
    category,
    subtitle,
    photo_url: photoUrl,
    nails,
    skin_tone_id: skinToneId,
    backdrop: backdrop || 'linear-gradient(135deg, #FAF7F2 0%, #F4EFEB 100%)',
    is_curated: false,
    is_public: true,
  };

  const { data, error } = await supabase
    .from('nail_sets')
    .upsert(record, { onConflict: 'passport_code' })
    .select()
    .single();

  if (error) throw error;
  return mapRowToExploreSet(data);
}
