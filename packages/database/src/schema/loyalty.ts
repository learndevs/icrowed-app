import {
  pgTable,
  varchar,
  integer,
  decimal,
  boolean,
  timestamp,
  uuid,
  text,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { profiles } from "./users";
import { orders } from "./orders";

// ─── Settings (single row, id = 1) ────────────────────────────────────────────
export const loyaltySettings = pgTable("loyalty_settings", {
  id: integer("id").primaryKey().default(1),
  enabled: boolean("enabled").default(true).notNull(),
  /** percentage: points from earn rate/mode. fixed: `fixedPoints` per order. */
  earnType: varchar("earn_type", { length: 20 }).default("percentage").notNull(),
  /** Flat points awarded per qualifying order when earnType = fixed. */
  fixedPoints: integer("fixed_points").default(100).notNull(),
  /** Points earned per currency unit (0.01 → 1 point per LKR 100). */
  earnRate: decimal("earn_rate", { precision: 8, scale: 4 }).default("0.01").notNull(),
  /** Minimum order total (LKR) before points are earned; also the block size in `per_block` mode. */
  earnThreshold: decimal("earn_threshold", { precision: 10, scale: 2 })
    .default("5000")
    .notNull(),
  /** whole_order: total × rate once total ≥ threshold. per_block: floor(total / threshold) × threshold × rate. */
  earnMode: varchar("earn_mode", { length: 20 }).default("whole_order").notNull(),
  /** LKR discount granted by one point when redeeming. */
  pointValue: decimal("point_value", { precision: 10, scale: 2 }).default("1").notNull(),
  minRedeemPoints: integer("min_redeem_points").default(100).notNull(),
  /** Max share of the order subtotal that points can pay for (0–100). */
  maxRedeemPercent: integer("max_redeem_percent").default(50).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Tiers ────────────────────────────────────────────────────────────────────
export const loyaltyTiers = pgTable("loyalty_tiers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 60 }).notNull(),
  /** Lifetime spend (LKR) required to reach this tier. */
  minSpend: decimal("min_spend", { precision: 12, scale: 2 }).default("0").notNull(),
  /** Multiplies the earned points for members of this tier. */
  earnMultiplier: decimal("earn_multiplier", { precision: 5, scale: 2 }).default("1").notNull(),
  perks: text("perks"),
  color: varchar("color", { length: 20 }),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Accounts (one per customer) ──────────────────────────────────────────────
export const loyaltyAccounts = pgTable("loyalty_accounts", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => profiles.id, { onDelete: "cascade" }),
  pointsBalance: integer("points_balance").default(0).notNull(),
  lifetimePoints: integer("lifetime_points").default(0).notNull(),
  lifetimeSpend: decimal("lifetime_spend", { precision: 12, scale: 2 }).default("0").notNull(),
  tierId: uuid("tier_id").references(() => loyaltyTiers.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Ledger ───────────────────────────────────────────────────────────────────
// type: earn | earn_reversal | redeem | redeem_reversal | adjust | expire
export const loyaltyTransactions = pgTable(
  "loyalty_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
    type: varchar("type", { length: 30 }).notNull(),
    /** Signed: positive adds to the balance, negative removes. */
    points: integer("points").notNull(),
    balanceAfter: integer("balance_after").notNull(),
    note: text("note"),
    createdBy: uuid("created_by").references(() => profiles.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("loyalty_tx_user_idx").on(t.userId, t.createdAt),
    // One earn / reversal / redeem per order → webhook retries cannot double-award.
    uniqueIndex("loyalty_tx_order_type_uq").on(t.orderId, t.type),
  ],
);

export const loyaltyAccountsRelations = relations(loyaltyAccounts, ({ one }) => ({
  user: one(profiles, { fields: [loyaltyAccounts.userId], references: [profiles.id] }),
  tier: one(loyaltyTiers, { fields: [loyaltyAccounts.tierId], references: [loyaltyTiers.id] }),
}));

export const loyaltyTransactionsRelations = relations(loyaltyTransactions, ({ one }) => ({
  user: one(profiles, { fields: [loyaltyTransactions.userId], references: [profiles.id] }),
  order: one(orders, { fields: [loyaltyTransactions.orderId], references: [orders.id] }),
}));
