import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/server/admin-auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasGeminiKey = !!process.env.GEMINI_API_KEY;
    const hasVertexKey2 = !!process.env.VERTEX_API_KEY_2;
    const hasResendKey = !!process.env.RESEND_API_KEY;
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasSupabaseAnon = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'Finglora <onboarding@resend.dev>';

    // Test Gemini / Vertex connectivity without exposing keys
    let geminiStatus = 'unknown';
    try {
      const gRes = await fetch(
        `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-3.1-flash-lite:countTokens?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'ping' }] }] }),
          signal: AbortSignal.timeout(4000),
        }
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
