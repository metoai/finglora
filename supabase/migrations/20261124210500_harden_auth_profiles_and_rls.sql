-- Security Hardening Migration: Auth, Profiles RLS, Billing Guards & Storage Isolation
-- Apply this in Supabase Dashboard -> SQL Editor (or via Supabase CLI / MCP)

-- 1. Private schema & server-only secret verification for admin RPCs
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS private.app_secrets (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);
REVOKE ALL ON TABLE private.app_secrets FROM PUBLIC, anon, authenticated;

-- NOTE: Before running in Supabase Dashboard -> SQL Editor, replace the placeholder below
-- with the exact ADMIN_RPC_SECRET value configured in your server environment (.env.local / Vercel).
INSERT INTO private.app_secrets (key, value)
VALUES ('admin_rpc_secret', '__REPLACE_WITH_ADMIN_RPC_SECRET__')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

CREATE OR REPLACE FUNCTION private.verify_admin_access(p_admin_secret text DEFAULT '')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public, pg_temp
AS $$
DECLARE
  v_expected text;
BEGIN
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') = 'service_role' THEN
    RETURN true;
  END IF;

  SELECT s.value INTO v_expected FROM private.app_secrets s WHERE s.key = 'admin_rpc_secret';
  IF v_expected IS NOT NULL AND NULLIF(p_admin_secret, '') IS NOT NULL AND p_admin_secret = v_expected THEN
    RETURN true;
  END IF;

  IF auth.uid() IS NOT NULL
     AND COALESCE((auth.jwt() ->> 'email_verified')::boolean, false) = true
     AND lower(COALESCE(auth.jwt() ->> 'email', '')) IN (
       'metoaipr@gmail.com',
       'alazartesema1@gmail.com',
       'finglora.vip.pro@gmail.com'
     ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;
REVOKE ALL ON FUNCTION private.verify_admin_access(text) FROM PUBLIC, anon, authenticated;

-- 2. Lock down public.profiles visibility & protect billing columns (is_pro, credits, email)
ALTER TABLE public.profiles ALTER COLUMN credits SET DEFAULT 10;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = id);

CREATE OR REPLACE FUNCTION public.protect_profile_billing_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') = 'service_role'
     OR COALESCE(current_setting('finglora.allow_billing_update', true), '') = 'true' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.is_pro := false;
    NEW.credits := 10;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.is_pro IS DISTINCT FROM OLD.is_pro OR NEW.credits IS DISTINCT FROM OLD.credits THEN
      RAISE EXCEPTION 'Forbidden: billing fields cannot be modified directly' USING ERRCODE = '42501';
    END IF;
    IF NEW.email IS DISTINCT FROM OLD.email THEN
      NEW.email := OLD.email;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_profile_billing_columns() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS protect_profiles_billing_trigger ON public.profiles;
CREATE TRIGGER protect_profiles_billing_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_billing_columns();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM set_config('finglora.allow_billing_update', 'true', true);
  INSERT INTO public.profiles (id, display_name, email, avatar_url, credits, is_pro)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'Elena'),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    10,
    false
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    display_name = COALESCE(NULLIF(public.profiles.display_name, ''), EXCLUDED.display_name),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url);
  RETURN NEW;
END;
$$;

-- 3. Make save_try_on_result enforce strict auth.uid() = p_user_id (SECURITY INVOKER)
DROP FUNCTION IF EXISTS public.save_try_on_result(uuid, text, text, text, text);
CREATE OR REPLACE FUNCTION public.save_try_on_result(
  p_user_id uuid,
  p_image_url text,
  p_mode text DEFAULT 'ai-synthesis',
  p_set_id text DEFAULT NULL,
  p_skin_tone_id text DEFAULT 'warm-ivory'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  new_row try_on_history%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: user mismatch' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.try_on_history (
    id, user_id, image_url, mode, set_id, skin_tone_id, created_at
  )
  VALUES (
    gen_random_uuid(), auth.uid(), p_image_url, p_mode, p_set_id, p_skin_tone_id, NOW()
  )
  RETURNING * INTO new_row;

  RETURN jsonb_build_object('success', true, 'try_on', to_jsonb(new_row));
END;
$$;
REVOKE ALL ON FUNCTION public.save_try_on_result(uuid, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_try_on_result(uuid, text, text, text, text) TO authenticated;

-- 4. Atomic server-enforced credit consumption RPC
CREATE OR REPLACE FUNCTION public.consume_tryon_credit()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_row profiles%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_row FROM public.profiles WHERE id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'is_pro', false, 'credits', 0);
  END IF;

  IF COALESCE(v_row.is_pro, false) THEN
    RETURN jsonb_build_object('allowed', true, 'is_pro', true, 'credits', COALESCE(v_row.credits, 999999));
  END IF;

  IF COALESCE(v_row.credits, 0) <= 0 THEN
    RETURN jsonb_build_object('allowed', false, 'is_pro', false, 'credits', 0);
  END IF;

  PERFORM set_config('finglora.allow_billing_update', 'true', true);
  UPDATE public.profiles
  SET credits = credits - 1, updated_at = NOW()
  WHERE id = auth.uid()
  RETURNING * INTO v_row;

  RETURN jsonb_build_object('allowed', true, 'is_pro', false, 'credits', v_row.credits);
END;
$$;
REVOKE ALL ON FUNCTION public.consume_tryon_credit() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_tryon_credit() TO authenticated;

-- 5. Secret-gated Admin RPCs
DROP FUNCTION IF EXISTS public.admin_get_user_try_ons(uuid);
DROP FUNCTION IF EXISTS public.admin_update_profile(uuid, boolean, integer, text, text);

CREATE OR REPLACE FUNCTION public.admin_get_user_try_ons(
  p_user_id uuid,
  p_admin_secret text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  result_list jsonb;
BEGIN
  IF NOT private.verify_admin_access(p_admin_secret) THEN
    RAISE EXCEPTION 'Unauthorized admin access' USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_agg(to_jsonb(t) ORDER BY t.created_at DESC)
  INTO result_list
  FROM public.try_on_history t
  WHERE t.user_id = p_user_id;

  RETURN COALESCE(result_list, '[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_profile(
  target_user_id uuid,
  new_is_pro boolean,
  new_credits integer,
  new_shape text DEFAULT NULL,
  new_length text DEFAULT NULL,
  p_admin_secret text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  result_row profiles%ROWTYPE;
BEGIN
  IF NOT private.verify_admin_access(p_admin_secret) THEN
    RAISE EXCEPTION 'Unauthorized admin access' USING ERRCODE = '42501';
  END IF;

  PERFORM set_config('finglora.allow_billing_update', 'true', true);

  UPDATE public.profiles
  SET
    is_pro = COALESCE(new_is_pro, is_pro),
    credits = COALESCE(new_credits, credits),
    preferred_shape = COALESCE(new_shape, preferred_shape),
    preferred_length = COALESCE(new_length, preferred_length),
    updated_at = NOW()
  WHERE id = target_user_id
  RETURNING * INTO result_row;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User profile not found');
  END IF;

  RETURN jsonb_build_object('success', true, 'user', to_jsonb(result_row));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_profiles(p_admin_secret text DEFAULT '')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  result_list jsonb;
BEGIN
  IF NOT private.verify_admin_access(p_admin_secret) THEN
    RAISE EXCEPTION 'Unauthorized admin access' USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_agg(
    to_jsonb(p) || jsonb_build_object(
      'setsCount', COALESCE((SELECT count(*) FROM public.nail_sets s WHERE s.user_id = p.id), 0)
    )
    ORDER BY p.created_at DESC
  )
  INTO result_list
  FROM public.profiles p;

  RETURN COALESCE(result_list, '[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_user_detail(
  p_user_id uuid,
  p_admin_secret text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  v_profile profiles%ROWTYPE;
  v_sets jsonb;
  v_try_ons jsonb;
  v_favorites jsonb;
BEGIN
  IF NOT private.verify_admin_access(p_admin_secret) THEN
    RAISE EXCEPTION 'Unauthorized admin access' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  SELECT COALESCE(jsonb_agg(to_jsonb(s) ORDER BY s.created_at DESC), '[]'::jsonb)
  INTO v_sets FROM public.nail_sets s WHERE s.user_id = p_user_id;

  SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.created_at DESC), '[]'::jsonb)
  INTO v_try_ons FROM public.try_on_history t WHERE t.user_id = p_user_id;

  SELECT COALESCE(jsonb_agg(jsonb_build_object('set_id', f.set_id, 'created_at', f.created_at)), '[]'::jsonb)
  INTO v_favorites FROM public.user_favorites f WHERE f.user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'user', to_jsonb(v_profile) || jsonb_build_object(
      'setsCount', jsonb_array_length(v_sets),
      'sets', v_sets,
      'tryOnsCount', jsonb_array_length(v_try_ons),
      'tryOns', v_try_ons,
      'favoritesCount', jsonb_array_length(v_favorites),
      'favorites', v_favorites
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_stats(p_admin_secret text DEFAULT '')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  v_total_users integer;
  v_total_sets integer;
  v_curated_sets integer;
  v_total_try_ons integer;
  v_recent_users jsonb;
  v_categories jsonb;
BEGIN
  IF NOT private.verify_admin_access(p_admin_secret) THEN
    RAISE EXCEPTION 'Unauthorized admin access' USING ERRCODE = '42501';
  END IF;

  SELECT count(*) INTO v_total_users FROM public.profiles;
  SELECT count(*), count(*) FILTER (WHERE is_curated) INTO v_total_sets, v_curated_sets FROM public.nail_sets;
  SELECT count(*) INTO v_total_try_ons FROM public.try_on_history;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', p.id, 'display_name', p.display_name, 'email', p.email, 'created_at', p.created_at
  ) ORDER BY p.created_at DESC), '[]'::jsonb)
  INTO v_recent_users
  FROM (SELECT id, display_name, email, created_at FROM public.profiles ORDER BY created_at DESC LIMIT 5) p;

  SELECT COALESCE(jsonb_object_agg(cat, cnt), '{}'::jsonb)
  INTO v_categories
  FROM (SELECT COALESCE(category, 'other') AS cat, count(*) AS cnt FROM public.nail_sets GROUP BY 1) c;

  RETURN jsonb_build_object(
    'totalUsers', v_total_users,
    'totalSets', v_total_sets,
    'curatedSets', v_curated_sets,
    'customSets', GREATEST(0, v_total_sets - v_curated_sets),
    'totalTryOns', v_total_try_ons,
    'categoryCounts', v_categories,
    'recentUsers', v_recent_users
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_sets(
  p_category text DEFAULT NULL,
  p_search text DEFAULT NULL,
  p_admin_secret text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  v_sets jsonb;
BEGIN
  IF NOT private.verify_admin_access(p_admin_secret) THEN
    RAISE EXCEPTION 'Unauthorized admin access' USING ERRCODE = '42501';
  END IF;

  SELECT COALESCE(jsonb_agg(to_jsonb(s) ORDER BY s.created_at DESC), '[]'::jsonb)
  INTO v_sets
  FROM public.nail_sets s
  WHERE (p_category IS NULL OR p_category = '' OR p_category = 'all' OR s.category = p_category)
    AND (p_search IS NULL OR p_search = '' OR s.title ILIKE '%' || p_search || '%');

  RETURN v_sets;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_upsert_set(
  p_id text DEFAULT NULL,
  p_title text DEFAULT NULL,
  p_category text DEFAULT 'glazed',
  p_photo_url text DEFAULT NULL,
  p_passport_code text DEFAULT NULL,
  p_is_curated boolean DEFAULT true,
  p_likes_count integer DEFAULT 150,
  p_nails jsonb DEFAULT '{}'::jsonb,
  p_admin_secret text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  v_row nail_sets%ROWTYPE;
  v_code text;
BEGIN
  IF NOT private.verify_admin_access(p_admin_secret) THEN
    RAISE EXCEPTION 'Unauthorized admin access' USING ERRCODE = '42501';
  END IF;

  v_code := COALESCE(NULLIF(p_passport_code, ''), 'FGL-' || floor(1000 + random() * 9000)::int::text);

  IF p_id IS NOT NULL AND p_id <> '' THEN
    UPDATE public.nail_sets
    SET
      title = COALESCE(p_title, title),
      category = COALESCE(p_category, category),
      photo_url = COALESCE(p_photo_url, photo_url),
      passport_code = COALESCE(NULLIF(p_passport_code, ''), passport_code),
      is_curated = COALESCE(p_is_curated, is_curated),
      likes_count = COALESCE(p_likes_count, likes_count),
      nails = COALESCE(p_nails, nails),
      updated_at = NOW()
    WHERE id = p_id
    RETURNING * INTO v_row;
  ELSE
    INSERT INTO public.nail_sets (
      title, category, photo_url, passport_code, is_curated, is_public, likes_count, chair_minutes, nails
    )
    VALUES (
      p_title, p_category, p_photo_url, v_code, p_is_curated, true, p_likes_count, 60, p_nails
    )
    RETURNING * INTO v_row;
  END IF;

  RETURN to_jsonb(v_row);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_set(
  p_id text,
  p_admin_secret text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
BEGIN
  IF NOT private.verify_admin_access(p_admin_secret) THEN
    RAISE EXCEPTION 'Unauthorized admin access' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.nail_sets WHERE id = p_id;
  RETURN jsonb_build_object('success', true);
END;
$$;

-- 6. Tighten Storage RLS so users can only write inside their own auth.uid() folder
DROP POLICY IF EXISTS "Anyone can upload to user-hands" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update user-hands" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete user-hands" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to try-on-captures" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to hand-inspo-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to avatars" ON storage.objects;

CREATE POLICY "Authenticated users can upload own user-hands"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'user-hands' AND (storage.foldername(name))[1] = (SELECT auth.uid()::text));

CREATE POLICY "Authenticated users can update own user-hands"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'user-hands' AND (storage.foldername(name))[1] = (SELECT auth.uid()::text))
WITH CHECK (bucket_id = 'user-hands' AND (storage.foldername(name))[1] = (SELECT auth.uid()::text));

CREATE POLICY "Authenticated users can delete own user-hands"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'user-hands' AND (storage.foldername(name))[1] = (SELECT auth.uid()::text));

CREATE POLICY "Authenticated users can upload own try-on-captures"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'try-on-captures' AND (storage.foldername(name))[1] = (SELECT auth.uid()::text));

CREATE POLICY "Authenticated users can upload own avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid()::text));

CREATE POLICY "Users can upload hand-inspo-photos to own or guest folder"
ON storage.objects FOR INSERT TO public
WITH CHECK (
  bucket_id = 'hand-inspo-photos'
  AND (
    (auth.role() = 'authenticated' AND (storage.foldername(name))[1] = (SELECT auth.uid()::text))
    OR (auth.uid() IS NULL AND (storage.foldername(name))[1] = 'guest')
  )
);
