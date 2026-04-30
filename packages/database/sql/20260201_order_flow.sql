-- Run after drizzle-kit push or manually against your Postgres database.

ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "bank_transfer_payer_name" varchar(255),
  ADD COLUMN IF NOT EXISTS "bank_transfer_proof_url" text;

CREATE TABLE IF NOT EXISTS "shop_shipping_rates" (
  "id" serial PRIMARY KEY NOT NULL,
  "standard_lkr" numeric(10, 2) DEFAULT '350' NOT NULL,
  "express_lkr" numeric(10, 2) DEFAULT '750' NOT NULL,
  "free_shipping_min_subtotal" numeric(12, 2) DEFAULT '500000' NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

INSERT INTO "shop_shipping_rates" ("id", "standard_lkr", "express_lkr", "free_shipping_min_subtotal")
VALUES (1, 350, 750, 500000)
ON CONFLICT ("id") DO NOTHING;
