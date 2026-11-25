-- Drop legacy unauthenticated SECURITY DEFINER admin RPC overloads flagged by Supabase Security Advisors.
-- Run this in Supabase Dashboard -> SQL Editor before production launch.

DROP FUNCTION IF EXISTS public.admin_get_user_try_ons(uuid);
DROP FUNCTION IF EXISTS public.admin_update_profile(uuid, boolean, integer, text, text);
