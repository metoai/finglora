import { NextRequest, NextResponse } from 'next/server';
import { getResendClient, DEFAULT_FROM_EMAIL, getLowCreditsEmailHtml } from '@/lib/services/email';

export async function POST(req: NextRequest) {
  try {
    const resend = getResendClient();
    if (!resend) {
      return NextResponse.json(
        { error: 'Email service is not configured (missing RESEND_API_KEY)' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { email, name, remainingCredits } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const credits = typeof remainingCredits === 'number' ? remainingCredits : 1;
    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: cleanEmail,
      subject: `Finglora — You have ${credits} try-on credit${credits === 1 ? '' : 's'} remaining`,
      html: getLowCreditsEmailHtml({
        name,
        remainingCredits: credits,
      }),
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Failed to send low credits email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: data?.id,
      message: 'Low credits email sent successfully',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
