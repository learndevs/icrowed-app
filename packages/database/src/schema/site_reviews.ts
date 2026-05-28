import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/** Storefront testimonials on the home page (not tied to a product). */
export const siteReviews = pgTable("site_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  reviewerName: varchar("reviewer_name", { length: 255 }).notNull(),
  rating: integer("rating").notNull(),
  body: text("body").notNull(),
  isApproved: boolean("is_approved").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
