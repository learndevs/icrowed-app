import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { products } from "./products";
import { profiles } from "./users";

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => profiles.id),
  rating: integer("rating").notNull(), // 1-5
  title: varchar("title", { length: 255 }),
  body: text("body"),
  isVerifiedPurchase: boolean("is_verified_purchase").default(false).notNull(),
  isApproved: boolean("is_approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────
export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(profiles, { fields: [reviews.userId], references: [profiles.id] }),
}));
