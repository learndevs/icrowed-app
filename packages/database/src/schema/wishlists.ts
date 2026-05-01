import { pgTable, uuid, timestamp, unique } from "drizzle-orm/pg-core";
import { profiles } from "./users";
import { products } from "./products";

export const wishlists = pgTable(
  "wishlists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique("wishlist_user_product").on(t.userId, t.productId)]
);
