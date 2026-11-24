import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';

  // Determine the canonical base URL
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const isLocal = process.env.NODE_ENV === 'development' || requestUrl.origin.includes('localhost') || requestUrl.origin.includes('127.0.0.1');

  const baseUrl = isLocal
    ? requestUrl.origin
    : forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : requestUrl.origin;

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, baseUrl));
    }
    console.error('[OAuth Callback Error]:', error);
  }

  // Redirect back to home with error notice if code exchange fails or is missing
  return NextResponse.redirect(new URL(`${next}?error=oauth_failed`, baseUrl));
}
