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

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=*&order=created_at.desc`,
      {
        headers: { apikey: SUPABASE_KEY },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch user profiles' },
        { status: res.status }
      );
    }

    const profiles = await res.json();
    return NextResponse.json({ success: true, users: profiles });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
