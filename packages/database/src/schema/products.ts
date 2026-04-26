import {
  pgTable,
  text,
  varchar,
  integer,
  decimal,
  boolean,
  timestamp,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { categories, brands } from "./categories";

// ─── Products ─────────────────────────────────────────────────────────────────
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  shortDescription: text("short_description"),
  categoryId: uuid("category_id").references(() => categories.id),
  brandId: uuid("brand_id").references(() => brands.id),
  sku: varchar("sku", { length: 100 }).unique(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  comparePrice: decimal("compare_price", { precision: 10, scale: 2 }),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  stock: integer("stock").default(0).notNull(),
  lowStockThreshold: integer("low_stock_threshold").default(5),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  specifications: jsonb("specifications"),
  tags: text("tags").array(),
  weight: decimal("weight", { precision: 8, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Product Images ───────────────────────────────────────────────────────────
export const productImages = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  altText: text("alt_text"),
  isPrimary: boolean("is_primary").default(false).notNull(),
  sortOrder: integer("sort_order").default(0),
});

// ─── Product Variants ─────────────────────────────────────────────────────────
export const productVariants = pgTable("product_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  sku: varchar("sku", { length: 100 }).unique(),
  price: decimal("price", { precision: 10, scale: 2 }),
  stock: integer("stock").default(0).notNull(),
  options: jsonb("options"),
  isActive: boolean("is_active").default(true).notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  brand: one(brands, { fields: [products.brandId], references: [brands.id] }),
  images: many(productImages),
  variants: many(productVariants),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
  })
);
