import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('finglora_admin_token')?.value;

    if (!authHeader && !cookieToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    // 1. If specific userId requested, return full user drilldown with sets, try-ons, and favorites
    if (userId) {
      const [profileRes, setsRes, tryOnsRes, favsRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
          headers: { apikey: SUPABASE_KEY },
        }),
        fetch(`${SUPABASE_URL}/rest/v1/nail_sets?user_id=eq.${userId}&order=created_at.desc`, {
          headers: { apikey: SUPABASE_KEY },
        }),
        fetch(`${SUPABASE_URL}/rest/v1/try_on_history?user_id=eq.${userId}&order=created_at.desc`, {
          headers: { apikey: SUPABASE_KEY },
        }),
        fetch(`${SUPABASE_URL}/rest/v1/user_favorites?user_id=eq.${userId}&select=set_id,created_at`, {
          headers: { apikey: SUPABASE_KEY },
        }),
      ]);

      const [profiles, userSets, tryOns, favorites] = await Promise.all([
        profileRes.ok ? profileRes.json() : [],
        setsRes.ok ? setsRes.json() : [],
        tryOnsRes.ok ? tryOnsRes.json() : [],
        favsRes.ok ? favsRes.json() : [],
      ]);

      const profile = profiles[0] || null;
      if (!profile) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        user: {
          ...profile,
          setsCount: userSets.length,
          sets: userSets,
          tryOnsCount: tryOns.length,
          tryOns,
          favoritesCount: favorites.length,
          favorites,
        },
      });
    }

    // 2. Otherwise return full users list with their creation counts
    const [profilesRes, allSetsRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*&order=created_at.desc`, {
        headers: { apikey: SUPABASE_KEY },
      }),
      fetch(`${SUPABASE_URL}/rest/v1/nail_sets?select=user_id`, {
        headers: { apikey: SUPABASE_KEY },
      }),
    ]);

    if (!profilesRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch user profiles' },
        { status: profilesRes.status }
      );
    }

    const profiles = await profilesRes.json();
    const sets = allSetsRes.ok ? await allSetsRes.json() : [];

    // Map sets count to each user
    const userSetsCountMap: Record<string, number> = {};
    sets.forEach((s: any) => {
      if (s.user_id) {
        userSetsCountMap[s.user_id] = (userSetsCountMap[s.user_id] || 0) + 1;
      }
    });

    const enrichedProfiles = profiles.map((p: any) => ({
      ...p,
      setsCount: userSetsCountMap[p.id] || 0,
    }));

    return NextResponse.json({ success: true, users: enrichedProfiles });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}

// Update user profile properties (e.g., plan, credits, notes)
export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('finglora_admin_token')?.value;

    if (!authHeader && !cookieToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, isPro, credits, preferredShape, preferredLength } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Call admin_update_profile SECURITY DEFINER function to bypass RLS and persist reliably
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_update_profile`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target_user_id: userId,
        new_is_pro: isPro !== undefined ? isPro : null,
        new_credits: credits !== undefined ? credits : null,
        new_shape: preferredShape || null,
        new_length: preferredLength || null,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `Database error: ${errText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ success: true, user: data.user || data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
