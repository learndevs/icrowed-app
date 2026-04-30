import {
  pgTable,
  text,
  varchar,
  integer,
  decimal,
  boolean,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  orderStatusEnum,
  paymentMethodEnum,
  paymentStatusEnum,
} from "./enums";
import { profiles } from "./users";
import { products, productVariants } from "./products";

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  userId: uuid("user_id").references(() => profiles.id),

  // Status
  status: orderStatusEnum("status").default("pending").notNull(),

  // Customer (denormalized snapshot for record-keeping)
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 30 }).notNull(),

  // Shipping address (snapshot)
  shippingAddressLine1: text("shipping_address_line1").notNull(),
  shippingAddressLine2: text("shipping_address_line2"),
  shippingCity: varchar("shipping_city", { length: 100 }).notNull(),
  shippingDistrict: varchar("shipping_district", { length: 100 }).notNull(),
  shippingProvince: varchar("shipping_province", { length: 100 }),
  shippingPostalCode: varchar("shipping_postal_code", { length: 20 }),

  // Amounts
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).default("0").notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0").notNull(),
  couponCode: varchar("coupon_code", { length: 50 }),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),

  // Payment
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").default("pending").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  bankTransferReference: text("bank_transfer_reference"),
  paidAt: timestamp("paid_at"),

  // Delivery
  courierName: varchar("courier_name", { length: 100 }),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  estimatedDeliveryDate: timestamp("estimated_delivery_date"),
  deliveredAt: timestamp("delivered_at"),

  // Notes
  customerNote: text("customer_note"),
  adminNote: text("admin_note"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Order Items ──────────────────────────────────────────────────────────────
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id),
  variantId: uuid("variant_id").references(() => productVariants.id),

  // Snapshot at time of purchase
  productName: varchar("product_name", { length: 255 }).notNull(),
  variantName: varchar("variant_name", { length: 100 }),
  sku: varchar("sku", { length: 100 }),
  imageUrl: text("image_url"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
});

// ─── Order Status History ─────────────────────────────────────────────────────
export const orderStatusHistory = pgTable("order_status_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  status: orderStatusEnum("status").notNull(),
  note: text("note"),
  changedBy: uuid("changed_by").references(() => profiles.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(profiles, { fields: [orders.userId], references: [profiles.id] }),
  items: many(orderItems),
  statusHistory: many(orderStatusHistory),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}));

export const orderStatusHistoryRelations = relations(
  orderStatusHistory,
  ({ one }) => ({
    order: one(orders, {
      fields: [orderStatusHistory.orderId],
      references: [orders.id],
    }),
    changedBy: one(profiles, {
      fields: [orderStatusHistory.changedBy],
      references: [profiles.id],
    }),
  })
);
