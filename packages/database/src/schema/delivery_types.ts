import {
  pgTable,
  text,
  varchar,
  integer,
  decimal,
  boolean,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const deliveryTypes = pgTable("delivery_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  description: text("description"),
  priceLkr: decimal("price_lkr", { precision: 10, scale: 2 }).notNull().default("0"),
  /** When true, shipping is free if cart subtotal >= shop free-shipping threshold. */
  eligibleForFreeShipping: boolean("eligible_for_free_shipping").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
