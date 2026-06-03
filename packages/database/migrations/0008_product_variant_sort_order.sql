-- Preserve admin "stock configuration" row order on the storefront (colors, storage, RAM, etc.)
ALTER TABLE product_variants
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

-- Backfill existing rows per product (stable name order until re-saved in admin)
UPDATE product_variants pv
SET sort_order = sub.rn - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY name) AS rn
  FROM product_variants
) sub
WHERE pv.id = sub.id;
