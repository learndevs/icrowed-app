import {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  decimal,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

/** Single-row table: id = 1. Holds high-level store-wide settings. */
export const storeSettings = pgTable("store_settings", {
  id: serial("id").primaryKey(),
  storeName: varchar("store_name", { length: 255 }).notNull().default("iCrowd"),
  storeEmail: varchar("store_email", { length: 255 }),
  supportPhone: varchar("support_phone", { length: 30 }),
  currency: varchar("currency", { length: 8 }).notNull().default("LKR"),

  // Tax
  taxRatePercent: decimal("tax_rate_percent", { precision: 5, scale: 2 })
    .notNull()
    .default("0"),
  taxInclusive: boolean("tax_inclusive").notNull().default(false),

  // Address
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }).default("Sri Lanka"),

  // Branding
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),

  // Socials  { facebook, instagram, twitter, tiktok, youtube }
  socialLinks: jsonb("social_links"),

  // Policies  { refund, shipping, privacy, terms } as HTML strings
  policies: jsonb("policies"),

  /** Bank deposit details shown at checkout { bankName, accountName, accountNumber, branch, instructions } */
  bankDetails: jsonb("bank_details"),

  /** Contact page content { heading, subtitle, phone2 } */
  contactPage: jsonb("contact_page"),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
