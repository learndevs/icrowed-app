-- Template: do not run directly. Use:
--   ADMIN_PASSWORD='your-password' bash scripts/setup-admin-login.sh

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
UPDATE order_status_history
SET changed_by = NULL
WHERE changed_by IN (
  SELECT id FROM profiles WHERE lower(email) = lower('__ADMIN_EMAIL__')
);

DELETE FROM orders
WHERE user_id IN (
  SELECT id FROM profiles WHERE lower(email) = lower('__ADMIN_EMAIL__')
);

DELETE FROM reviews
WHERE user_id IN (
  SELECT id FROM profiles WHERE lower(email) = lower('__ADMIN_EMAIL__')
);

DELETE FROM wishlists
WHERE user_id IN (
  SELECT id FROM profiles WHERE lower(email) = lower('__ADMIN_EMAIL__')
);

DELETE FROM addresses
WHERE user_id IN (
  SELECT id FROM profiles WHERE lower(email) = lower('__ADMIN_EMAIL__')
);

DELETE FROM profiles
WHERE lower(email) = lower('__ADMIN_EMAIL__');

\echo '==> Create admin user...'
WITH new_id AS (
  SELECT gen_random_uuid() AS id
),
ins_user AS (
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin, is_sso_user,
    confirmation_token, recovery_token, email_change_token_new,
    email_change_token_current, email_change, phone_change,
    phone_change_token, reauthentication_token
  )
  SELECT
    '00000000-0000-0000-0000-000000000000'::uuid,
    new_id.id,
    'authenticated',
    'authenticated',
    '__ADMIN_EMAIL__',
    crypt('__ADMIN_PASSWORD__', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    false,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  FROM new_id
  RETURNING id
),
ins_identity AS (
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  )
  SELECT
    gen_random_uuid(),
    ins_user.id,
    jsonb_build_object(
      'sub', ins_user.id::text,
      'email', '__ADMIN_EMAIL__',
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    ins_user.id::text,
    now(),
    now(),
    now()
  FROM ins_user
)
INSERT INTO profiles (id, email, full_name, role, is_active, created_at, updated_at)
SELECT ins_user.id, '__ADMIN_EMAIL__', '__ADMIN_NAME__', 'admin', true, now(), now()
FROM ins_user;

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

\echo '==> Verify...'
SELECT p.email, p.role::text, p.is_active, u.id AS auth_id,
       (u.encrypted_password = crypt('__ADMIN_PASSWORD__', u.encrypted_password)) AS password_ok
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE lower(p.email) = lower('__ADMIN_EMAIL__');
