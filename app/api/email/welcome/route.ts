import { NextRequest, NextResponse } from 'next/server';
import { getResendClient, DEFAULT_FROM_EMAIL, getWelcomeEmailHtml } from '@/lib/services/email';

export async function POST(req: NextRequest) {
  try {
    const resend = getResendClient();
    if (!resend) {
      console.warn('[Resend Email]: RESEND_API_KEY is not configured on this environment');
      return NextResponse.json(
        { error: 'Email service is not configured (missing RESEND_API_KEY)' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { email, name } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || '').trim() || 'Manicure Enthusiast';

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: cleanEmail,
      subject: `Welcome to Finglora Atelier, ${cleanName}`,
      html: getWelcomeEmailHtml(cleanName),
    });

    if (error) {
      console.warn('[Resend Email Error]:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to send welcome email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: data?.id,
      message: 'Welcome email sent successfully',
    });
  } catch (err: any) {
    console.error('[API Email Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error sending email' },
      { status: 500 }
    );
  }
}
