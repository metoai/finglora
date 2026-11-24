import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/server/admin-auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    const currentFromEmail = process.env.RESEND_FROM_EMAIL || 'Finglora <onboarding@resend.dev>';

    // Fetch verified domains from Resend
    let domains = [];
    try {
      const res = await fetch('https://api.resend.com/domains', {
        headers: { Authorization: `Bearer ${resendKey}` },
      });
      if (res.ok) {
        const d = await res.json();
        domains = d.data || [];
      }
    } catch {
      // ignore
    }

    // Fetch API keys info from Resend
    let apiKeys = [];
    try {
      const res = await fetch('https://api.resend.com/api-keys', {
        headers: { Authorization: `Bearer ${resendKey}` },
      });
      if (res.ok) {
        const k = await res.json();
        apiKeys = k.data || [];
      }
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      emailConfig: {
        currentFromEmail,
        isConfigured: !!resendKey,
        domains,
        apiKeys,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
