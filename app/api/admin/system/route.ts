import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('finglora_admin_token')?.value;

    if (!authHeader && !cookieToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasGeminiKey = !!process.env.GEMINI_API_KEY;
    const hasVertexKey2 = !!process.env.VERTEX_API_KEY_2;
    const hasResendKey = !!process.env.RESEND_API_KEY;
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasSupabaseAnon = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'Finglora <onboarding@resend.dev>';

    // Test Gemini connectivity
    let geminiStatus = 'unknown';
    try {
      const gRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
      );
      geminiStatus = gRes.ok ? 'connected' : 'error';
    } catch {
      geminiStatus = 'unreachable';
    }

    // Test Supabase connectivity
    let supabaseStatus = 'unknown';
    try {
      const sRes = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/nail_sets?select=id&limit=1`,
        { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! } }
      );
      supabaseStatus = sRes.ok ? 'connected' : 'error';
    } catch {
      supabaseStatus = 'unreachable';
    }

    return NextResponse.json({
      success: true,
      system: {
        nodeEnv: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        pricing: {
          monthly: '$7/mo',
          biannual: '$29 / 6mo',
          annual: '$49 / yr',
          freeSignupCredits: 10,
        },
        services: {
          geminiVision: {
            configured: hasGeminiKey,
            status: geminiStatus,
            model: 'google-gemini-3.1-flash-lite / 3.8-flash',
          },
          vertexSecondary: {
            configured: hasVertexKey2,
          },
          supabaseDb: {
            configured: hasSupabaseUrl && hasSupabaseAnon,
            status: supabaseStatus,
            url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          },
          resendEmail: {
            configured: hasResendKey,
            sender: resendFromEmail,
          },
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
