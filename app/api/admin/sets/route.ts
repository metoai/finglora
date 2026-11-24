import { NextRequest, NextResponse } from 'next/server';
import { getAdminRpcSecret, verifyAdminRequest } from '@/lib/server/admin-auth';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// List all manicure sets with optional search & category filter
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_list_sets`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        p_category: category || null,
        p_search: search || null,
        p_admin_secret: getAdminRpcSecret(),
      }),
    });

    if (rpcRes.ok) {
      const sets = await rpcRes.json();
      return NextResponse.json({ success: true, sets: Array.isArray(sets) ? sets : [] });
    }

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
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
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

    const cleanPassportCode = passportCode || `FGL-${Math.floor(1000 + Math.random() * 9000)}`;
    const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_upsert_set`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_id: id || null,
        p_title: title,
        p_category: category || 'glazed',
        p_photo_url: photoUrl,
        p_passport_code: cleanPassportCode,
        p_is_curated: isCurated !== undefined ? isCurated : true,
        p_likes_count: likesCount !== undefined ? likesCount : 150,
        p_nails: nails || {},
        p_admin_secret: getAdminRpcSecret(),
      }),
    });

    if (rpcRes.ok) {
      const saved = await rpcRes.json();
      return NextResponse.json({ success: true, set: saved });
    }

    const rpcErr = await rpcRes.text();
    if (!rpcErr.includes('PGRST202')) {
      return NextResponse.json({ error: `Database error: ${rpcErr}` }, { status: rpcRes.status });
    }

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

    const res = await fetch(
      id ? `${SUPABASE_URL}/rest/v1/nail_sets?id=eq.${encodeURIComponent(id)}` : `${SUPABASE_URL}/rest/v1/nail_sets`,
      {
        method: id ? 'PATCH' : 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(recordPayload),
      }
    );

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
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id parameter is required' }, { status: 400 });
    }

    const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_delete_set`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_id: id,
        p_admin_secret: getAdminRpcSecret(),
      }),
    });

    if (rpcRes.ok) {
      return NextResponse.json({ success: true, message: 'Set deleted successfully' });
    }

    const rpcErr = await rpcRes.text();
    if (!rpcErr.includes('PGRST202')) {
      return NextResponse.json({ error: 'Failed to delete set' }, { status: rpcRes.status });
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/nail_sets?id=eq.${encodeURIComponent(id)}`, {
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
