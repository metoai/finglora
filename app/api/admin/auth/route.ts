import { NextRequest, NextResponse } from 'next/server';
import {
  createAdminSessionToken,
  verifyAdminMasterCredentials,
  verifyAdminRequest,
} from '@/lib/server/admin-auth';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    email: auth.email,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const key = typeof body?.key === 'string' ? body.key : '';
    const email = typeof body?.email === 'string' ? body.email : '';

    // Allow either valid master key (with optional allowlisted email) OR an already-verified Supabase admin session
    let authorizedEmail = '';
    if (verifyAdminMasterCredentials(key, email)) {
      authorizedEmail = (email || '').trim().toLowerCase() || 'admin@finglora.com';
    } else {
      const existingAuth = await verifyAdminRequest(req);
      if (existingAuth.authorized) {
        authorizedEmail = existingAuth.email;
      }
    }

    if (!authorizedEmail) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid admin credentials' },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken(authorizedEmail);

    const res = NextResponse.json({
      success: true,
      email: authorizedEmail,
    });

    res.cookies.set('finglora_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set('finglora_admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}
