-- Configurable delivery types for checkout (admin-managed).
CREATE TABLE IF NOT EXISTS delivery_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(120) NOT NULL,
  slug varchar(120) NOT NULL UNIQUE,
  description text,
  price_lkr numeric(10, 2) NOT NULL DEFAULT 0,
  eligible_for_free_shipping boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type_id uuid REFERENCES delivery_types(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type_name varchar(120);

INSERT INTO delivery_types (name, slug, description, price_lkr, eligible_for_free_shipping, sort_order, is_active)
SELECT 'Standard Delivery', 'standard', '1–3 business days', 350, true, 0, true
WHERE NOT EXISTS (SELECT 1 FROM delivery_types WHERE slug = 'standard');

INSERT INTO delivery_types (name, slug, description, price_lkr, eligible_for_free_shipping, sort_order, is_active)
SELECT 'Express Delivery', 'express', 'Same / next day', 750, false, 1, true
WHERE NOT EXISTS (SELECT 1 FROM delivery_types WHERE slug = 'express');
