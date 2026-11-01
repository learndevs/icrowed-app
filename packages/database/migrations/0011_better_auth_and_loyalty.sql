-- Better Auth (replaces Supabase Auth) + loyalty programme.
-- Safe to run on a database that already has the profiles table.

BEGIN;

-- ─── profiles becomes the Better Auth "user" table ───────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false;
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Remove the old link to Supabase's auth schema if one was ever created.
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

CREATE TABLE IF NOT EXISTS auth_sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL,
  token       text NOT NULL,
  expires_at  timestamp NOT NULL,
  ip_address  text,
  user_agent  text,
  created_at  timestamp NOT NULL DEFAULT now(),
  updated_at  timestamp NOT NULL DEFAULT now(),
  CONSTRAINT auth_sessions_token_unique UNIQUE (token),
  CONSTRAINT auth_sessions_user_id_profiles_id_fk FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS auth_sessions_user_idx ON auth_sessions (user_id);

CREATE TABLE IF NOT EXISTS auth_accounts (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   uuid NOT NULL,
  account_id                text NOT NULL,
  provider_id               text NOT NULL,
  access_token              text,
  refresh_token             text,
  id_token                  text,
  access_token_expires_at   timestamp,
  refresh_token_expires_at  timestamp,
  scope                     text,
  password                  text,
  created_at                timestamp NOT NULL DEFAULT now(),
  updated_at                timestamp NOT NULL DEFAULT now(),
  CONSTRAINT auth_accounts_user_id_profiles_id_fk FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS auth_accounts_user_idx ON auth_accounts (user_id);

CREATE TABLE IF NOT EXISTS auth_verifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier  text NOT NULL,
  value       text NOT NULL,
  expires_at  timestamp NOT NULL,
  created_at  timestamp NOT NULL DEFAULT now(),
  updated_at  timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS auth_verifications_identifier_idx ON auth_verifications (identifier);

-- ─── Loyalty ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS loyalty_settings (
  id                  integer PRIMARY KEY DEFAULT 1,
  enabled             boolean NOT NULL DEFAULT true,
  earn_rate           numeric(8,4) NOT NULL DEFAULT 0.01,
  earn_threshold      numeric(10,2) NOT NULL DEFAULT 5000,
  earn_mode           varchar(20) NOT NULL DEFAULT 'whole_order',
  point_value         numeric(10,2) NOT NULL DEFAULT 1,
  min_redeem_points   integer NOT NULL DEFAULT 100,
  max_redeem_percent  integer NOT NULL DEFAULT 50,
  updated_at          timestamp NOT NULL DEFAULT now()
);
INSERT INTO loyalty_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             varchar(60) NOT NULL,
  min_spend        numeric(12,2) NOT NULL DEFAULT 0,
  earn_multiplier  numeric(5,2) NOT NULL DEFAULT 1,
  perks            text,
  color            varchar(20),
  sort_order       integer NOT NULL DEFAULT 0,
  created_at       timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loyalty_accounts (
  user_id          uuid PRIMARY KEY,
  points_balance   integer NOT NULL DEFAULT 0,
  lifetime_points  integer NOT NULL DEFAULT 0,
  lifetime_spend   numeric(12,2) NOT NULL DEFAULT 0,
  tier_id          uuid,
  created_at       timestamp NOT NULL DEFAULT now(),
  updated_at       timestamp NOT NULL DEFAULT now(),
  CONSTRAINT loyalty_accounts_user_id_profiles_id_fk FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT loyalty_accounts_tier_id_loyalty_tiers_id_fk FOREIGN KEY (tier_id) REFERENCES loyalty_tiers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL,
  order_id       uuid,
  type           varchar(30) NOT NULL,
  points         integer NOT NULL,
  balance_after  integer NOT NULL,
  note           text,
  created_by     uuid,
  created_at     timestamp NOT NULL DEFAULT now(),
  CONSTRAINT loyalty_transactions_user_id_profiles_id_fk FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT loyalty_transactions_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  CONSTRAINT loyalty_transactions_created_by_profiles_id_fk FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS loyalty_tx_user_idx ON loyalty_transactions (user_id, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS loyalty_tx_order_type_uq ON loyalty_transactions (order_id, type);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS loyalty_points_redeemed integer NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS loyalty_discount numeric(10,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS loyalty_points_earned integer NOT NULL DEFAULT 0;

COMMIT;
