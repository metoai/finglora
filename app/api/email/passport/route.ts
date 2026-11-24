import { NextRequest, NextResponse } from 'next/server';
import { getResendClient, DEFAULT_FROM_EMAIL, getPassportEmailHtml } from '@/lib/services/email';

export async function POST(req: NextRequest) {
  try {
    const resend = getResendClient();
    if (!resend) {
      console.warn('[Resend Passport Email]: RESEND_API_KEY is not configured on this environment');
      return NextResponse.json(
        { error: 'Email service is not configured (missing RESEND_API_KEY)' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { email, name, passportCode, designName, shape, length, colors, imageUrl } = body;

    if (!email || !passportCode) {
      return NextResponse.json(
        { error: 'Email and passportCode are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: cleanEmail,
      subject: `Your Finglora Design Recipe — ${passportCode} (${designName || 'Bespoke Look'})`,
      html: getPassportEmailHtml({
        recipientName: name,
        passportCode,
        designName: designName || 'Custom Manicure Recipe',
        shape: shape || 'Almond',
        length: length || 'Medium',
        colors: colors || ['#F9E9E9', '#E0246A'],
        imageUrl,
      }),
    });

    if (error) {
      console.warn('[Resend Passport Email Error]:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to send passport email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: data?.id,
      message: 'Passport email sent successfully',
    });
  } catch (err: any) {
    console.error('[API Email Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error sending email' },
      { status: 500 }
    );
  }
}
