-- Migration: add Instagram link to offers (0001_offer_instagram_url)
-- Run against your local iCrowd database, e.g.:
--   psql "$DATABASE_URL" -f packages/database/drizzle/0001_offer_instagram_url.sql
-- Or:
--   psql -U postgres -d icrowed -f packages/database/drizzle/0001_offer_instagram_url.sql

BEGIN;

ALTER TABLE "offers"
  ADD COLUMN IF NOT EXISTS "instagram_url" text;

COMMENT ON COLUMN "offers"."instagram_url" IS 'Instagram profile or post URL shown in the offer popup';

COMMIT;

-- Verify (optional — run after migration)
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'offers' AND column_name = 'instagram_url';
