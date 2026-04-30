import { pgTable, serial, decimal, timestamp } from "drizzle-orm/pg-core";

/** Single-row table: id = 1. Amounts in whole LKR (not cents). */
export const shopShippingRates = pgTable("shop_shipping_rates", {
  id: serial("id").primaryKey(),
  standardLkr: decimal("standard_lkr", { precision: 10, scale: 2 }).notNull().default("350"),
  expressLkr: decimal("express_lkr", { precision: 10, scale: 2 }).notNull().default("750"),
  /** Standard shipping is free when cart subtotal is >= this (LKR). */
  freeShippingMinSubtotal: decimal("free_shipping_min_subtotal", {
    precision: 12,
    scale: 2,
  })
    .notNull()
    .default("500000"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
