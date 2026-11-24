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

    // Parallel fetch from Supabase REST
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

    const totalUsers = profiles.length;
    const totalSets = sets.length;
    const curatedSets = sets.filter((s: any) => s.is_curated).length;
    const customSets = totalSets - curatedSets;
    const totalTryOns = tryOns.length;

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    sets.forEach((s: any) => {
      const cat = s.category || 'other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

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
        recentUsers: profiles.slice(-5).reverse(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
