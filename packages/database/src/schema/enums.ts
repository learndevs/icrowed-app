import { pgEnum } from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "stripe",
  "bank_transfer",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const userRoleEnum = pgEnum("user_role", [
  "customer",
  "operator",
  "admin",
]);
