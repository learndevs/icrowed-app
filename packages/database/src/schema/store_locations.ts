import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  uuid,
  integer,
  decimal,
} from "drizzle-orm/pg-core";

/** Physical shop / pickup points for local SEO and contact pages. */
export const storeLocations = pgTable("store_locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 150 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  /** `store` = full shop; `pickup` = pickup point */
  type: varchar("type", { length: 20 }).notNull().default("pickup"),
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  city: varchar("city", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull().default("Sri Lanka"),
  phone: varchar("phone", { length: 30 }),
  hours: text("hours"),
  /** SEO / landing intro */
  description: text("description"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  mapEmbedUrl: text("map_embed_url"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type StoreLocationRow = typeof storeLocations.$inferSelect;
export type StoreLocationInsert = typeof storeLocations.$inferInsert;
