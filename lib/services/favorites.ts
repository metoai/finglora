import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export async function toggleSetFavorite(
  userId: string,
  setId: string,
  shouldBeFavorite: boolean
) {
  const supabase = getSupabaseBrowserClient();

  if (shouldBeFavorite) {
    const { error } = await supabase
      .from('user_favorites')
      .upsert({ user_id: userId, set_id: setId } as any);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('set_id', setId);
    if (error) throw error;
  }

  return shouldBeFavorite;
}

export async function fetchUserFavoriteIds(userId: string): Promise<string[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('user_favorites')
    .select('set_id')
    .eq('user_id', userId);

  if (error || !data) return [];
  return (data as any[]).map((d) => d.set_id);
}
