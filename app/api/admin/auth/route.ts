import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_MASTER_KEY, ADMIN_EMAILS } from '@/lib/services/admin';

export async function POST(req: NextRequest) {
  try {
    const { key, email } = await req.json();

    const cleanEmail = (email || '').trim().toLowerCase();
    const isMasterKey = key === ADMIN_MASTER_KEY;
    const isEmailAllowed = ADMIN_EMAILS.includes(cleanEmail) || cleanEmail.endsWith('@finglora.com');

    if (!isMasterKey && !isEmailAllowed) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid admin credentials' },
        { status: 401 }
      );
    }

    // Generate lightweight signed-like session token
    const token = Buffer.from(
      JSON.stringify({
        role: 'admin',
        email: cleanEmail || 'admin@finglora.com',
        issuedAt: Date.now(),
      })
    ).toString('base64');

    const res = NextResponse.json({
      success: true,
      token,
      email: cleanEmail || 'admin@finglora.com',
    });

    res.cookies.set('finglora_admin_token', token, {
      httpOnly: false,
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
