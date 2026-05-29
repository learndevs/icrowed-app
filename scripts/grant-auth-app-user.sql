-- Creates auth schema (if missing) + grants for app user icrowd.
-- Run on VPS (one command):
--   sudo -u postgres psql -d icrowd -f /var/www/icrowed-app/scripts/grant-auth-app-user.sql
-- Then create admin:
--   sudo -u postgres psql -d icrowd -f /var/www/icrowed-app/scripts/create-admin-user.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
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

CREATE TABLE IF NOT EXISTS auth.identities (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  identity_data jsonb NOT NULL,
  provider text NOT NULL,
  provider_id text NOT NULL,
  last_sign_in_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
);

CREATE INDEX IF NOT EXISTS users_email_idx ON auth.users (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS identities_provider_uidx
  ON auth.identities (provider, provider_id);

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'icrowd') THEN
    GRANT USAGE ON SCHEMA auth TO icrowd;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth TO icrowd;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA auth TO icrowd;
    ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON TABLES TO icrowd;
    RAISE NOTICE 'Granted auth schema to icrowd';
  ELSE
    RAISE NOTICE 'Role icrowd not found — skip grants (create role first or adjust script)';
  END IF;
END $$;
