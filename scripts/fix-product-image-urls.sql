-- Convert absolute product image URLs to same-origin paths (/uploads/products/...).
-- Run on VPS after deploying local disk uploads, e.g.:
--   psql "$DATABASE_URL" -f scripts/fix-product-image-urls.sql

BEGIN;

UPDATE product_images
SET url = substring(url FROM '/uploads/products/.*')
WHERE url ~ '^https?://.*/uploads/products/'
  AND substring(url FROM '/uploads/products/.*') IS NOT NULL;

COMMIT;

-- Verify:
-- SELECT id, url FROM product_images ORDER BY created_at DESC LIMIT 10;
