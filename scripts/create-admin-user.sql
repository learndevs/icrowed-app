-- Create or update admin@icrowed.local for Postgres admin login.
-- Run on VPS:
--   sudo -u postgres psql -d icrowd -v ON_ERROR_STOP=1 -f /var/www/icrowed-app/scripts/create-admin-user.sql
--
-- Edit the password on the line marked CHANGE PASSWORD below before running.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $admin$
DECLARE
  v_id uuid;
  v_email text := 'admin@icrowed.local';
  v_password text := 'j@*gn*QkPQHn6iNkf$cC';  -- CHANGE PASSWORD
  v_name text := 'Admin';
BEGIN
  SELECT id INTO v_id FROM auth.users WHERE lower(email) = lower(v_email) LIMIT 1;

  IF v_id IS NOT NULL THEN
    UPDATE auth.users
    SET encrypted_password = crypt(v_password, gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = v_id;
    RAISE NOTICE 'Updated password for existing user %', v_email;
  ELSE
    v_id := gen_random_uuid();
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
    RAISE NOTICE 'Created new user %', v_email;
  END IF;

  INSERT INTO profiles (id, email, full_name, role, is_active, created_at, updated_at)
  VALUES (v_id, v_email, v_name, 'admin', true, now(), now())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role = 'admin',
    is_active = true,
    updated_at = now();

  RAISE NOTICE 'Admin ready: % (id %)', v_email, v_id;
END $admin$;

-- App connects as icrowd — must read auth.users for login
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'icrowd') THEN
    GRANT USAGE ON SCHEMA auth TO icrowd;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth TO icrowd;
  END IF;
END $$;

COMMIT;
