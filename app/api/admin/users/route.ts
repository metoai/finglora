import { NextRequest, NextResponse } from 'next/server';
import { getAdminRpcSecret, verifyAdminRequest } from '@/lib/server/admin-auth';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const adminSecret = getAdminRpcSecret();

    // 1. Specific user drilldown
    if (userId) {
      if (!UUID_REGEX.test(userId)) {
        return NextResponse.json({ error: 'Invalid userId format' }, { status: 400 });
      }

      const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_get_user_detail`, {
        method: 'POST',
        headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_user_id: userId, p_admin_secret: adminSecret }),
      });

      if (rpcRes.ok) {
        const rpcData = await rpcRes.json();
        if (!rpcData?.success || !rpcData?.user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, user: rpcData.user });
      }

      // Fallback only if hardened migration has not yet been executed
      const rpcErr = await rpcRes.text();
      if (!rpcErr.includes('PGRST202')) {
        return NextResponse.json({ error: 'Failed to load user details' }, { status: rpcRes.status });
      }

      const [profileRes, setsRes, tryOnsRes, favsRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
          headers: { apikey: SUPABASE_KEY },
        }),
        fetch(`${SUPABASE_URL}/rest/v1/nail_sets?user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc`, {
          headers: { apikey: SUPABASE_KEY },
        }),
        fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_get_user_try_ons`, {
          method: 'POST',
          headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ p_user_id: userId }),
        }),
        fetch(`${SUPABASE_URL}/rest/v1/user_favorites?user_id=eq.${encodeURIComponent(userId)}&select=set_id,created_at`, {
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
          tryOnsCount: Array.isArray(tryOns) ? tryOns.length : 0,
          tryOns: Array.isArray(tryOns) ? tryOns : [],
          favoritesCount: favorites.length,
          favorites,
        },
      });
    }

    // 2. Full users list
    const listRpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_list_profiles`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_admin_secret: adminSecret }),
    });

    if (listRpcRes.ok) {
      const users = await listRpcRes.json();
      return NextResponse.json({ success: true, users: Array.isArray(users) ? users : [] });
    }

    const listErr = await listRpcRes.text();
    if (!listErr.includes('PGRST202')) {
      return NextResponse.json({ error: 'Failed to fetch user profiles' }, { status: listRpcRes.status });
    }

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

// Update user profile properties (e.g., plan, credits)
export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, isPro, credits, preferredShape, preferredLength } = await req.json();

    if (!userId || !UUID_REGEX.test(userId)) {
      return NextResponse.json({ error: 'Valid userId is required' }, { status: 400 });
    }

    const adminSecret = getAdminRpcSecret();
    const basePayload = {
      target_user_id: userId,
      new_is_pro: isPro !== undefined ? Boolean(isPro) : null,
      new_credits: credits !== undefined ? Math.max(0, Number(credits)) : null,
      new_shape: preferredShape || null,
      new_length: preferredLength || null,
    };

    let res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_update_profile`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...basePayload,
        p_admin_secret: adminSecret,
      }),
    });

    // Fallback to 5-arg legacy signature only if migration hasn't been applied yet
    if (!res.ok) {
      const errText = await res.text();
      if (errText.includes('PGRST202')) {
        res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_update_profile`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(basePayload),
        });
      } else {
        return NextResponse.json(
          { error: `Database error: ${errText}` },
          { status: res.status }
        );
      }
    }

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
