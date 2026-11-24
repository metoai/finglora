import { NextRequest, NextResponse } from 'next/server';
import { getAdminRpcSecret, verifyAdminRequest } from '@/lib/server/admin-auth';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let totalUsers = 0;
    let totalSets = 0;
    let curatedSets = 0;
    let customSets = 0;
    let totalTryOns = 0;
    let categoryCounts: Record<string, number> = {};
    let recentUsers: any[] = [];

    const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_get_stats`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_admin_secret: getAdminRpcSecret() }),
    });

    if (rpcRes.ok) {
      const s = await rpcRes.json();
      totalUsers = s.totalUsers || 0;
      totalSets = s.totalSets || 0;
      curatedSets = s.curatedSets || 0;
      customSets = s.customSets || 0;
      totalTryOns = s.totalTryOns || 0;
      categoryCounts = s.categoryCounts || {};
      recentUsers = s.recentUsers || [];
    } else {
      const [profilesRes, setsRes, tryOnRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id,display_name,email,created_at`, {
          headers: { apikey: SUPABASE_KEY },
        }),
        fetch(`${SUPABASE_URL}/rest/v1/nail_sets?select=id,title,category,is_curated,likes_count,created_at`, {
          headers: { apikey: SUPABASE_KEY },
        }),
        fetch(`${SUPABASE_URL}/rest/v1/try_on_history?select=id,created_at`, {
          headers: { apikey: SUPABASE_KEY },
        }),
      ]);

      const [profiles, sets, tryOns] = await Promise.all([
        profilesRes.ok ? profilesRes.json() : [],
        setsRes.ok ? setsRes.json() : [],
        tryOnRes.ok ? tryOnRes.json() : [],
      ]);

      totalUsers = profiles.length;
      totalSets = sets.length;
      curatedSets = sets.filter((s: any) => s.is_curated).length;
      customSets = totalSets - curatedSets;
      totalTryOns = tryOns.length;
      recentUsers = profiles.slice(-5).reverse();

      sets.forEach((s: any) => {
        const cat = s.category || 'other';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    }

    // Resend API domain stats
    let resendStatus = 'operational';
    let resendDomain = 'mail.metoai.site';
    try {
      const resendRes = await fetch('https://api.resend.com/domains', {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      });
      if (resendRes.ok) {
        const d = await resendRes.json();
        if (d?.data?.[0]) {
          resendDomain = d.data[0].name;
          resendStatus = d.data[0].status;
        }
      }
    } catch {
      resendStatus = 'active';
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalSets,
        curatedSets,
        customSets,
        totalTryOns,
        resend: {
          domain: resendDomain,
          status: resendStatus,
          sender: process.env.RESEND_FROM_EMAIL || 'Finglora <onboarding@resend.dev>',
        },
        categoryCounts,
        recentUsers,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
