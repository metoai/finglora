import { NextRequest, NextResponse } from 'next/server';
import { getResendClient, DEFAULT_FROM_EMAIL, getProReceiptEmailHtml } from '@/lib/services/email';
import { getVerifiedRequestUser, verifyAdminRequest } from '@/lib/server/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const adminAuth = await verifyAdminRequest(req);
    const verifiedUser = adminAuth.authorized ? null : await getVerifiedRequestUser();
    if (!adminAuth.authorized && !verifiedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resend = getResendClient();
    if (!resend) {
      return NextResponse.json(
        { error: 'Email service is not configured (missing RESEND_API_KEY)' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { email, name, planName, amountPaid, period } = body;

    if (!email || typeof email !== 'string' || !planName || !amountPaid) {
      return NextResponse.json(
        { error: 'Email, planName, and amountPaid are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!adminAuth.authorized && verifiedUser?.email?.trim().toLowerCase() !== cleanEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: cleanEmail,
      subject: `Finglora Pro Subscription Receipt — ${planName}`,
      html: getProReceiptEmailHtml({
        name,
        planName,
        amountPaid,
        period: period || 'Billed every 6 months',
      }),
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Failed to send receipt email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: data?.id,
      message: 'Pro receipt email sent successfully',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
