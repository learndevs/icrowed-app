-- Migration: brand SEO description + store locations (0002_seo_locations_brand_desc)
-- Run: psql "$DATABASE_URL" -f packages/database/drizzle/0002_seo_locations_brand_desc.sql

BEGIN;

ALTER TABLE "brands"
  ADD COLUMN IF NOT EXISTS "description" text;

CREATE TABLE IF NOT EXISTS "store_locations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(150) NOT NULL,
  "slug" varchar(100) NOT NULL UNIQUE,
  "type" varchar(20) DEFAULT 'pickup' NOT NULL,
  "address_line1" text,
  "address_line2" text,
  "city" varchar(100) NOT NULL,
  "country" varchar(100) DEFAULT 'Sri Lanka' NOT NULL,
  "phone" varchar(30),
  "hours" text,
  "description" text,
  "latitude" numeric(10, 7),
  "longitude" numeric(10, 7),
  "map_embed_url" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Seed default locations when empty
INSERT INTO "store_locations" (
  "name", "slug", "type", "city", "country", "hours", "description", "sort_order", "is_active"
)
SELECT * FROM (VALUES
  (
    'iCrowd Kandy',
    'kandy',
    'store',
    'Kandy',
    'Sri Lanka',
    'Open daily — confirm hours on Google or WhatsApp',
    'Visit our Kandy shop for Apple iPhones, Anker chargers and power banks, DJI drones, earbuds and accessories. Full showroom experience with expert advice, plus island-wide delivery.',
    0,
    true
  ),
  (
    'iCrowd Kottawa Pickup',
    'kottawa',
    'pickup',
    'Kottawa',
    'Sri Lanka',
    'Pickup by appointment — confirm via WhatsApp',
    'Order Anker products, earbuds, iPhones and accessories online and collect at our Kottawa pickup point. Island-wide delivery also available.',
    1,
    true
  ),
  (
    'iCrowd Matara Pickup',
    'matara',
    'pickup',
    'Matara',
    'Sri Lanka',
    'Pickup by appointment — confirm via WhatsApp',
    'Buy earbuds, Anker gear, Apple products and DJI accessories online and pick up in Matara. Fast island-wide delivery across Sri Lanka.',
    2,
    true
  )
) AS v(name, slug, type, city, country, hours, description, sort_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM "store_locations" LIMIT 1);

COMMIT;
