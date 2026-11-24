/**
 * Finglora Admin Authorization & Config
 * Admin allowed emails, master password, and session helpers
 */

export const ADMIN_EMAILS = [
  'metoaipr@gmail.com',
  'alazartesema1@gmail.com',
  'admin@finglora.com',
  'pro@finglora.com',
  'vip@finglora.com',
  'finglora.vip.pro@gmail.com',
];

export const ADMIN_MASTER_KEY = process.env.ADMIN_SECRET_KEY || 'finglora-admin-2026';

export function isAuthorizedAdmin(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return (
    ADMIN_EMAILS.includes(clean) ||
    clean.endsWith('@finglora.com') ||
    clean === 'metoaipr@gmail.com' ||
    clean === 'alazartesema1@gmail.com'
  );
}

export const ADMIN_STORAGE_KEY = 'finglora_admin_auth_token';
