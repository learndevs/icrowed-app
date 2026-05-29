-- Full reset of admin-login schema + admin@icrowed.local (safe for VPS local Postgres).
-- Only drops schema "auth" — does NOT touch public products/orders/etc.
--
-- Run:
--   sudo -u postgres psql -d icrowd -v ON_ERROR_STOP=1 -f scripts/setup-admin-login.sql
--
-- Optional psql variables (defaults shown):
--   -v admin_email='admin@icrowed.local'
--   -v admin_password='YourPassword'
--   -v admin_name='Admin'
--   -v app_db_user='icrowd'

\echo '==> Checking public.profiles exists...'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    RAISE EXCEPTION 'public.profiles missing — run: npm run db:migrate -w @icrowd/database';
  END IF;
END $$;

BEGIN;

\echo '==> Reset auth schema...'
DROP SCHEMA IF EXISTS auth CASCADE;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA auth;

CREATE TABLE auth.users (
  instance_id uuid,
  id uuid PRIMARY KEY,
  aud varchar(255),
  role varchar(255),
  email varchar(255),
  encrypted_password varchar(255),
  email_confirmed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  raw_app_meta_data jsonb,
  raw_user_meta_data jsonb,
  is_super_admin boolean,
  is_sso_user boolean,
  confirmation_token text,
  recovery_token text,
  email_change_token_new text,
  email_change_token_current text,
  email_change text,
  phone_change text,
  phone_change_token text,
  reauthentication_token text
);

CREATE TABLE auth.identities (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  identity_data jsonb NOT NULL,
  provider text NOT NULL,
  provider_id text NOT NULL,
  last_sign_in_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
);

CREATE INDEX users_email_idx ON auth.users (lower(email));
CREATE UNIQUE INDEX identities_provider_uidx ON auth.identities (provider, provider_id);

\echo '==> Remove orders and related data for existing admin profile...'
DO $cleanup$
DECLARE
  v_profile_id uuid;
  v_order_ids uuid[];
BEGIN
  SELECT id INTO v_profile_id
  FROM profiles
  WHERE lower(email) = lower(:'admin_email')
  LIMIT 1;

  IF v_profile_id IS NULL THEN
    RAISE NOTICE 'No existing profile for % — skip cleanup', :'admin_email';
    RETURN;
  END IF;

  SELECT array_agg(id) INTO v_order_ids
  FROM orders
  WHERE user_id = v_profile_id;

  IF v_order_ids IS NOT NULL THEN
    RAISE NOTICE 'Deleting % order(s) for admin profile', cardinality(v_order_ids);
    -- order_items + order_status_history cascade when orders are deleted
    DELETE FROM orders WHERE id = ANY (v_order_ids);
  END IF;

  UPDATE order_status_history SET changed_by = NULL WHERE changed_by = v_profile_id;
  DELETE FROM reviews WHERE user_id = v_profile_id;
  DELETE FROM wishlists WHERE user_id = v_profile_id;
  DELETE FROM addresses WHERE user_id = v_profile_id;

  DELETE FROM profiles WHERE id = v_profile_id;
  RAISE NOTICE 'Removed profile %', v_profile_id;
END $cleanup$;

\echo '==> Create admin@icrowed.local...'
DO $setup$
DECLARE
  v_id uuid := gen_random_uuid();
  v_email text := :'admin_email';
  v_password text := :'admin_password';
  v_name text := :'admin_name';
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin, is_sso_user,
    confirmation_token, recovery_token, email_change_token_new,
    email_change_token_current, email_change, phone_change,
    phone_change_token, reauthentication_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_id, 'authenticated', 'authenticated', v_email,
    crypt(v_password, gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false, false,
    '', '', '', '', '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    v_id,
    jsonb_build_object(
      'sub', v_id::text,
      'email', v_email,
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    v_id::text,
    now(), now(), now()
  );

  INSERT INTO profiles (id, email, full_name, role, is_active, created_at, updated_at)
  VALUES (v_id, v_email, v_name, 'admin', true, now(), now());

  RAISE NOTICE 'Admin created: % id=%', v_email, v_id;
END $setup$;

\echo '==> Grant auth to app user (icrowd)...'
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'icrowd') THEN
    GRANT USAGE ON SCHEMA auth TO icrowd;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth TO icrowd;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA auth TO icrowd;
    RAISE NOTICE 'Granted auth schema to icrowd';
  ELSE
    RAISE WARNING 'Role icrowd not found — create it with vps-postgres-setup.sh';
  END IF;
END $$;

COMMIT;

\echo '==> Verify (as postgres)...'
SELECT p.email, p.role::text, p.is_active, u.id AS auth_id,
       (u.encrypted_password = crypt(:'admin_password', u.encrypted_password)) AS password_ok
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE lower(p.email) = lower(:'admin_email');
