import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";
import { products } from "./products";

export type BlogGalleryImage = {
  url: string;
  alt?: string;
  caption?: string;
};

export type BlogVideo = {
  url: string;
  title?: string;
};

export type BlogLink = {
  label: string;
  href: string;
};

export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  excerpt: text("excerpt"),
  body: text("body"),
  postType: varchar("post_type", { length: 20 }).notNull().default("article"),
  coverImageUrl: text("cover_image_url"),
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  productName: varchar("product_name", { length: 255 }),
  brandName: varchar("brand_name", { length: 255 }),
  rating: integer("rating"),
  galleryImages: jsonb("gallery_images").$type<BlogGalleryImage[]>().notNull().default([]),
  videoUrls: jsonb("video_urls").$type<BlogVideo[]>().notNull().default([]),
  pros: jsonb("pros").$type<string[]>().notNull().default([]),
  cons: jsonb("cons").$type<string[]>().notNull().default([]),
  relatedLinks: jsonb("related_links").$type<BlogLink[]>().notNull().default([]),
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
