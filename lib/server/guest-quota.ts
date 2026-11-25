import crypto from 'crypto';
import { NextResponse } from 'next/server';

export const GUEST_TRYON_COOKIE_NAME = 'fgl_guest_tryon';
export const MAX_GUEST_FREE_TRYONS = 1;
const GUEST_COOKIE_TTL_SEC = 30 * 24 * 60 * 60; // 30 days

const EPHEMERAL_GUEST_SECRET = crypto.randomBytes(32).toString('hex');

function getGuestSigningSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_RPC_SECRET ||
    process.env.ADMIN_SECRET_KEY ||
    EPHEMERAL_GUEST_SECRET
  );
}

interface GuestQuotaPayload {
  used: number;
  iat: number;
}

function timingSafeEqualsText(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function parseCookieHeader(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const k = pair.slice(0, idx).trim();
    if (k === name) {
      return decodeURIComponent(pair.slice(idx + 1).trim());
    }
  }
  return null;
}

/**
 * Reads and verifies the HMAC-signed guest try-on quota cookie from a Request.
 * Invalid or tampered cookies are ignored gracefully unless missing (returns used: 0).
 */
export function readGuestTryOnCount(req: Request): number {
  const raw = parseCookieHeader(req.headers.get('cookie'), GUEST_TRYON_COOKIE_NAME);
  if (!raw) return 0;

  const parts = raw.split('.');
  if (parts.length !== 2) return 0;

  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return 0;

  const expectedSig = crypto
    .createHmac('sha256', getGuestSigningSecret())
    .update(payloadB64)
    .digest('base64url');

  if (!timingSafeEqualsText(sigB64, expectedSig)) {
    return 0;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8')
    ) as GuestQuotaPayload;
    if (typeof parsed.used === 'number' && parsed.used >= 0) {
      return Math.floor(parsed.used);
    }
  } catch {
    // ignore malformed cookie
  }
  return 0;
}

/**
 * Signs a new guest quota token and attaches it as an HttpOnly cookie on the NextResponse.
 */
export function attachGuestTryOnCookie(res: NextResponse, usedCount: number): void {
  const payload: GuestQuotaPayload = {
    used: Math.max(0, Math.floor(usedCount)),
    iat: Date.now(),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', getGuestSigningSecret())
    .update(payloadB64)
    .digest('base64url');

  res.cookies.set(GUEST_TRYON_COOKIE_NAME, `${payloadB64}.${sig}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: GUEST_COOKIE_TTL_SEC,
  });
}
