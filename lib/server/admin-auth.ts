import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { ADMIN_EMAILS } from '@/lib/services/admin';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Ephemeral fallback ensures no predictable static secret is ever hardcoded in source.
// In production / .env.local set ADMIN_SESSION_SECRET so tokens survive server restarts.
const EPHEMERAL_FALLBACK_SECRET = crypto.randomBytes(32).toString('hex');

function getSessionSigningSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_RPC_SECRET ||
    process.env.ADMIN_SECRET_KEY ||
    EPHEMERAL_FALLBACK_SECRET
  );
}

export function getAdminRpcSecret(): string {
  return process.env.ADMIN_RPC_SECRET || '';
}

function timingSafeEqualsText(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export function verifyAdminMasterCredentials(key?: string | null, email?: string | null): boolean {
  const expectedKey = process.env.ADMIN_SECRET_KEY;
  if (!expectedKey || !key) return false;

  if (!timingSafeEqualsText(key, expectedKey)) {
    return false;
  }

  // If an email is supplied, it must be an explicitly allowlisted admin email.
  if (email && email.trim().length > 0) {
    const cleanEmail = email.trim().toLowerCase();
    return ADMIN_EMAILS.includes(cleanEmail);
  }

  return true;
}

export interface AdminTokenPayload {
  role: 'admin';
  email: string;
  iat: number;
  exp: number;
}

export function createAdminSessionToken(email: string): string {
  const now = Date.now();
  const payload: AdminTokenPayload = {
    role: 'admin',
    email: email.trim().toLowerCase(),
    iat: now,
    exp: now + TOKEN_TTL_MS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSessionSigningSecret())
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${sig}`;
}

export function verifyAdminSessionToken(token?: string | null): AdminTokenPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return null;

  const expectedSig = crypto
    .createHmac('sha256', getSessionSigningSecret())
    .update(payloadB64)
    .digest('base64url');

  if (!timingSafeEqualsText(sigB64, expectedSig)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as AdminTokenPayload;
    if (parsed.role !== 'admin' || typeof parsed.exp !== 'number' || parsed.exp <= Date.now()) {
      return null;
    }
    if (!parsed.email || typeof parsed.email !== 'string') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function verifyAdminRequest(
  req: NextRequest
): Promise<{ authorized: true; email: string } | { authorized: false }> {
  // 1. Check HMAC-signed httpOnly cookie or Bearer token
  const cookieToken = req.cookies.get('finglora_admin_token')?.value;
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  const tokenPayload = verifyAdminSessionToken(cookieToken || bearerToken);
  if (tokenPayload) {
    return { authorized: true, email: tokenPayload.email };
  }

  // 2. Also allow a live, email-confirmed Supabase Auth session for explicitly allowlisted admins
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (
      !error &&
      user?.email &&
      user.email_confirmed_at &&
      ADMIN_EMAILS.includes(user.email.trim().toLowerCase())
    ) {
      return { authorized: true, email: user.email.trim().toLowerCase() };
    }
  } catch {
    // ignore auth lookup errors and fail closed
  }

  return { authorized: false };
}

export async function getVerifiedRequestUser() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}
