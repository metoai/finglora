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

const SETS_CACHE_TTL_MS = 5 * 60 * 1000;
const memorySetsCache = new Map<string, { ts: number; data: ExploreDesignSet[] }>();

function getCacheKey(currentUserId?: string) {
  return `finglora_explore_sets_v2_${currentUserId || 'guest'}`;
}

export function getCachedExploreSets(currentUserId?: string): ExploreDesignSet[] | null {
  const key = getCacheKey(currentUserId);
  const mem = memorySetsCache.get(key);
  if (mem && Date.now() - mem.ts < SETS_CACHE_TTL_MS && mem.data.length > 0) {
    return mem.data;
  }
  if (typeof window !== 'undefined') {
    try {
      const raw = window.sessionStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.ts && Date.now() - parsed.ts < SETS_CACHE_TTL_MS && Array.isArray(parsed.data)) {
          memorySetsCache.set(key, parsed);
          return parsed.data;
        }
      }
    } catch {
      // ignore storage errors
    }
  }
  return null;
}

export async function fetchExploreSets(currentUserId?: string): Promise<ExploreDesignSet[]> {
  const supabase = getSupabaseBrowserClient();

  // 1. Fetch curated sets (plus active user's own custom sets if authenticated) in parallel with favorites
  const filterClause = currentUserId
    ? `is_curated.eq.true,user_id.eq.${currentUserId}`
    : 'is_curated.eq.true';

  const setsPromise = supabase
    .from('nail_sets')
    .select('id,passport_code,title,category,subtitle,photo_url,likes_count,skin_tone_id,backdrop,chair_minutes,nails,is_curated')
    .or(filterClause)
    .order('likes_count', { ascending: false });

  const favsPromise = currentUserId
    ? supabase.from('user_favorites').select('set_id').eq('user_id', currentUserId)
    : Promise.resolve({ data: null } as { data: any[] | null });

  const [{ data: sets, error }, { data: favs }] = await Promise.all([setsPromise, favsPromise]);

  if (error || !sets) {
    console.warn('Failed to fetch sets from Supabase:', error?.message);
    return getCachedExploreSets(currentUserId) || [];
  }

  const favIds = new Set<string>(favs ? (favs as any[]).map((f) => f.set_id) : []);

  // 2. Sort curated first, filter empty photos, and deduplicate redundant auto-saved rows
  const seenKeys = new Set<string>();
  const uniqueSets = (sets as any[])
    .filter((s) => Boolean(s.photo_url && String(s.photo_url).trim()))
    .sort((a, b) => Number(Boolean(b.is_curated)) - Number(Boolean(a.is_curated)))
    .filter((s) => {
      const key = `${String(s.title || '').trim().toLowerCase()}|${String(s.photo_url || '').trim()}`;
      if (seenKeys.has(key)) return false;
      seenKeys.add(key);
      return true;
    });

  const mapped = uniqueSets.map((s) => mapRowToExploreSet(s, favIds.has(s.id)));

  // 3. Cache for instant subsequent renders
  const key = getCacheKey(currentUserId);
  const entry = { ts: Date.now(), data: mapped };
  memorySetsCache.set(key, entry);
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(entry));
    } catch {
      // ignore storage quota errors
    }
  }

  return mapped;
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
  isPublic = false,
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
  isPublic?: boolean;
}) {
  const supabase = getSupabaseBrowserClient();

  let targetCode = passportCode;

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
    is_public: isPublic,
  };

  const { data, error } = await supabase
    .from('nail_sets')
    .upsert(record, { onConflict: 'passport_code' })
    .select()
    .single();

  if (error) throw error;
  return mapRowToExploreSet(data);
}
