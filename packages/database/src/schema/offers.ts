import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  uuid,
  decimal,
} from "drizzle-orm/pg-core";

// ─── Offers / Banners ─────────────────────────────────────────────────────────
export const offers = pgTable("offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  linkUrl: text("link_url"),
  badgeText: varchar("badge_text", { length: 50 }),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }),
  isActive: boolean("is_active").default(true).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
