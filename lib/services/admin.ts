/**
 * Finglora Admin Allowlist Helpers
 * Server authentication & secrets live strictly in lib/server/admin-auth.ts
 */

export const ADMIN_EMAILS = [
  'metoaipr@gmail.com',
  'alazartesema1@gmail.com',
  'admin@finglora.com',
  'pro@finglora.com',
  'vip@finglora.com',
  'finglora.vip.pro@gmail.com',
];

export function isAuthorizedAdmin(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(clean);
}

export const ADMIN_STORAGE_KEY = 'finglora_admin_auth_token';
