import {
  pgTable,
  serial,
  boolean,
  timestamp,
  text,
} from "drizzle-orm/pg-core";

/** Single-row table: id = 1. Admin notification preferences. */
export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  notifyOnNewOrder: boolean("notify_on_new_order").notNull().default(true),
  notifyOnLowStock: boolean("notify_on_low_stock").notNull().default(true),
  notifyOnRefund: boolean("notify_on_refund").notNull().default(true),
  notifyOnReview: boolean("notify_on_review").notNull().default(false),
  /** Comma-separated email list (kept simple as text for now). */
  recipientEmails: text("recipient_emails").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
