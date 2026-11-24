import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// List all manicure sets with optional search & category filter
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('finglora_admin_token')?.value;

    if (!authHeader && !cookieToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = `${SUPABASE_URL}/rest/v1/nail_sets?select=*&order=created_at.desc`;
    if (category && category !== 'all') {
      query += `&category=eq.${encodeURIComponent(category)}`;
    }
    if (search) {
      query += `&title=ilike.*${encodeURIComponent(search)}*`;
    }

    const res = await fetch(query, {
      headers: { apikey: SUPABASE_KEY },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch nail sets' },
        { status: res.status }
      );
    }

    const sets = await res.json();
    return NextResponse.json({ success: true, sets });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}

// Create new manicure set or update existing
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('finglora_admin_token')?.value;

    if (!authHeader && !cookieToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, category, photoUrl, passportCode, isCurated, likesCount, nails } = body;

    if (!title || !photoUrl) {
      return NextResponse.json(
        { error: 'Title and photoUrl are required' },
        { status: 400 }
      );
    }

    const cleanPassportCode = passportCode || `#FGL-${Math.floor(1000 + Math.random() * 9000)}`;
    const recordPayload = {
      title,
      category: category || 'glazed',
      photo_url: photoUrl,
      passport_code: cleanPassportCode,
      is_curated: isCurated !== undefined ? isCurated : true,
      is_public: true,
      likes_count: likesCount !== undefined ? likesCount : 150,
      chair_minutes: 60,
      nails: nails || {},
    };

    let res;
    if (id) {
      // Update
      res = await fetch(`${SUPABASE_URL}/rest/v1/nail_sets?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(recordPayload),
      });
    } else {
      // Insert
      res = await fetch(`${SUPABASE_URL}/rest/v1/nail_sets`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(recordPayload),
      });
    }

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `Database error: ${errText}` },
        { status: res.status }
      );
    }

    const saved = await res.json();
    return NextResponse.json({ success: true, set: saved[0] || saved });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}

// Delete set
export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('finglora_admin_token')?.value;

    if (!authHeader && !cookieToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id parameter is required' }, { status: 400 });
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/nail_sets?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_KEY,
        Prefer: 'return=representation',
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to delete set' },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, message: 'Set deleted successfully' });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
