import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

function sanitizeRedirectPath(rawNext: string | null): string {
  if (!rawNext || typeof rawNext !== 'string') return '/home';
  const trimmed = rawNext.trim();
  // Require strict relative path starting with single '/' (block '//evil.com', 'https://...', '/\evil', etc.)
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\') || trimmed.includes('@')) {
    return '/home';
  }
  return trimmed;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const nextPath = sanitizeRedirectPath(requestUrl.searchParams.get('next'));
  const authError = requestUrl.searchParams.get('error');

  const isLocal =
    process.env.NODE_ENV === 'development' ||
    requestUrl.hostname === 'localhost' ||
    requestUrl.hostname === '127.0.0.1';

  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL;
  const baseUrl = isLocal
    ? requestUrl.origin
    : configuredOrigin || requestUrl.origin;

  if (authError) {
    return NextResponse.redirect(new URL('/?error=oauth_failed', baseUrl));
  }

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(nextPath, baseUrl));
    }
    console.error('[OAuth Callback Error]:', error);
  }

  return NextResponse.redirect(new URL('/?error=oauth_failed', baseUrl));
}
