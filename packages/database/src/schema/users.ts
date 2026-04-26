import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { userRoleEnum } from "./enums";

// ─── Profiles ─────────────────────────────────────────────────────────────────
// Mirrors auth.users — id must match the Supabase Auth user id
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // same uuid as auth.users.id
  email: varchar("email", { length: 255 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }),
  phone: varchar("phone", { length: 30 }),
  avatarUrl: text("avatar_url"),
  role: userRoleEnum("role").default("customer").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Addresses ────────────────────────────────────────────────────────────────
export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 50 }).default("Home"),
  recipientName: varchar("recipient_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: varchar("city", { length: 100 }).notNull(),
  district: varchar("district", { length: 100 }).notNull(),
  province: varchar("province", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────
export const profilesRelations = relations(profiles, ({ many }) => ({
  addresses: many(addresses),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(profiles, {
    fields: [addresses.userId],
    references: [profiles.id],
  }),
}));
