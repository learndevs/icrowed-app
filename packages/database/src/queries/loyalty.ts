import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "../db";
import {
  loyaltyAccounts,
  loyaltySettings,
  loyaltyTiers,
  loyaltyTransactions,
  orders,
} from "../schema";

type DbExecutor = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Executor = DbExecutor | typeof db;

export type LoyaltySettingsRow = typeof loyaltySettings.$inferSelect;
export type LoyaltySettingsInput = Partial<
  Omit<typeof loyaltySettings.$inferInsert, "id" | "updatedAt">
>;
export type LoyaltyTierRow = typeof loyaltyTiers.$inferSelect;
export type LoyaltyTierInput = {
  id?: string;
  name: string;
  minSpend: number;
  earnMultiplier: number;
  perks?: string | null;
  color?: string | null;
};

const DEFAULT_TIERS: LoyaltyTierInput[] = [
  { name: "Bronze", minSpend: 0, earnMultiplier: 1, color: "#b45309", perks: "Earn points on every qualifying order" },
  { name: "Silver", minSpend: 50_000, earnMultiplier: 1.25, color: "#64748b", perks: "25% bonus points" },
  { name: "Gold", minSpend: 150_000, earnMultiplier: 1.5, color: "#ca8a04", perks: "50% bonus points" },
  { name: "Platinum", minSpend: 400_000, earnMultiplier: 2, color: "#0f172a", perks: "Double points" },
];

// ─── Settings ─────────────────────────────────────────────────────────────────
export async function getLoyaltySettings(ex: Executor = db): Promise<LoyaltySettingsRow> {
  const [row] = await ex.select().from(loyaltySettings).where(eq(loyaltySettings.id, 1));
  if (row) return row;
  const [created] = await ex
    .insert(loyaltySettings)
    .values({ id: 1 })
    .onConflictDoNothing()
    .returning();
  if (created) return created;
  const [again] = await ex.select().from(loyaltySettings).where(eq(loyaltySettings.id, 1));
  return again;
}

export async function updateLoyaltySettings(data: LoyaltySettingsInput) {
  await getLoyaltySettings();
  const [row] = await db
    .update(loyaltySettings)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(loyaltySettings.id, 1))
    .returning();
  return row;
}

// ─── Tiers ────────────────────────────────────────────────────────────────────
export async function listLoyaltyTiers(ex: Executor = db): Promise<LoyaltyTierRow[]> {
  const rows = await ex.select().from(loyaltyTiers).orderBy(asc(loyaltyTiers.minSpend));
  if (rows.length > 0) return rows;
  await ex.insert(loyaltyTiers).values(
    DEFAULT_TIERS.map((t, i) => ({
      name: t.name,
      minSpend: String(t.minSpend),
      earnMultiplier: String(t.earnMultiplier),
      perks: t.perks ?? null,
      color: t.color ?? null,
      sortOrder: i,
    })),
  );
  return ex.select().from(loyaltyTiers).orderBy(asc(loyaltyTiers.minSpend));
}

/** Replace the tier list. Tiers keep their id when supplied, so accounts stay linked. */
export async function saveLoyaltyTiers(input: LoyaltyTierInput[]) {
  if (input.length === 0) throw new Error("At least one tier is required");
  const sorted = [...input].sort((a, b) => a.minSpend - b.minSpend);
  if (sorted[0].minSpend !== 0) {
    throw new Error("The lowest tier must start at a spend of 0");
  }
  await db.transaction(async (tx) => {
    const existing = await tx.select({ id: loyaltyTiers.id }).from(loyaltyTiers);
    const keep = new Set(sorted.map((t) => t.id).filter(Boolean) as string[]);
    for (const row of existing) {
      if (!keep.has(row.id)) {
        await tx.delete(loyaltyTiers).where(eq(loyaltyTiers.id, row.id));
      }
    }
    for (const [i, t] of sorted.entries()) {
      const values = {
        name: t.name.trim(),
        minSpend: String(t.minSpend),
        earnMultiplier: String(t.earnMultiplier),
        perks: t.perks?.trim() || null,
        color: t.color?.trim() || null,
        sortOrder: i,
      };
      if (t.id && existing.some((e) => e.id === t.id)) {
        await tx.update(loyaltyTiers).set(values).where(eq(loyaltyTiers.id, t.id));
      } else {
        await tx.insert(loyaltyTiers).values(values);
      }
    }
    const tiers = await listLoyaltyTiers(tx);
    const accounts = await tx.select().from(loyaltyAccounts);
    for (const acc of accounts) {
      const tier = tierForSpend(tiers, Number(acc.lifetimeSpend));
      if (tier?.id !== acc.tierId) {
        await tx
          .update(loyaltyAccounts)
          .set({ tierId: tier?.id ?? null, updatedAt: new Date() })
          .where(eq(loyaltyAccounts.userId, acc.userId));
      }
    }
  });
  return listLoyaltyTiers();
}

export function tierForSpend(tiers: LoyaltyTierRow[], spend: number): LoyaltyTierRow | null {
  let match: LoyaltyTierRow | null = null;
  for (const t of [...tiers].sort((a, b) => Number(a.minSpend) - Number(b.minSpend))) {
    if (spend >= Number(t.minSpend)) match = t;
  }
  return match;
}

// ─── Maths ────────────────────────────────────────────────────────────────────
export function calculateEarnedPoints(
  orderTotal: number,
  settings: Pick<LoyaltySettingsRow, "enabled" | "earnRate" | "earnThreshold" | "earnMode">,
  multiplier = 1,
): number {
  if (!settings.enabled) return 0;
  const rate = Number(settings.earnRate);
  const threshold = Number(settings.earnThreshold);
  if (!(rate > 0) || orderTotal <= 0 || orderTotal < threshold) return 0;
  const base =
    settings.earnMode === "per_block" && threshold > 0
      ? Math.floor(orderTotal / threshold) * threshold
      : orderTotal;
  return Math.floor(base * rate * multiplier);
}

export type Redemption = { points: number; discount: number };

/** Validates a redemption request against balance, minimum and the per-order cap. */
export function computeRedemption(
  requestedPoints: number,
  balance: number,
  subtotal: number,
  settings: LoyaltySettingsRow,
): Redemption {
  const points = Math.floor(Number(requestedPoints) || 0);
  if (!settings.enabled || points <= 0) return { points: 0, discount: 0 };
  const pointValue = Number(settings.pointValue);
  if (!(pointValue > 0)) return { points: 0, discount: 0 };
  if (points < settings.minRedeemPoints) {
    throw new LoyaltyError(`Minimum redemption is ${settings.minRedeemPoints} points`);
  }
  if (points > balance) throw new LoyaltyError("Not enough loyalty points");
  const maxDiscount = (subtotal * settings.maxRedeemPercent) / 100;
  const discount = points * pointValue;
  if (discount > maxDiscount + 0.001) {
    throw new LoyaltyError(
      `Points can cover at most ${settings.maxRedeemPercent}% of the order`,
    );
  }
  return { points, discount };
}

export class LoyaltyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LoyaltyError";
  }
}

// ─── Accounts ─────────────────────────────────────────────────────────────────
async function lockAccount(tx: DbExecutor, userId: string) {
  await tx.insert(loyaltyAccounts).values({ userId }).onConflictDoNothing();
  const [acc] = await tx
    .select()
    .from(loyaltyAccounts)
    .where(eq(loyaltyAccounts.userId, userId))
    .for("update");
  return acc;
}

export async function getLoyaltyBalance(userId: string, ex: Executor = db): Promise<number> {
  const [acc] = await ex
    .select({ balance: loyaltyAccounts.pointsBalance })
    .from(loyaltyAccounts)
    .where(eq(loyaltyAccounts.userId, userId));
  return acc?.balance ?? 0;
}

type LedgerEntry = {
  userId: string;
  orderId?: string | null;
  type: string;
  points: number;
  spendDelta?: number;
  lifetimeDelta?: number;
  note?: string | null;
  createdBy?: string | null;
};

/** Applies one ledger entry inside a transaction. Returns false if the (order, type) pair already exists. */
async function applyEntry(tx: DbExecutor, e: LedgerEntry): Promise<boolean> {
  const acc = await lockAccount(tx, e.userId);

  if (e.orderId) {
    const [dupe] = await tx
      .select({ id: loyaltyTransactions.id })
      .from(loyaltyTransactions)
      .where(and(eq(loyaltyTransactions.orderId, e.orderId), eq(loyaltyTransactions.type, e.type)));
    if (dupe) return false;
  }

  const newBalance = Math.max(0, acc.pointsBalance + e.points);
  const applied = newBalance - acc.pointsBalance;
  const newSpend = Math.max(0, Number(acc.lifetimeSpend) + (e.spendDelta ?? 0));
  const tiers = await listLoyaltyTiers(tx);
  const tier = tierForSpend(tiers, newSpend);

  await tx.insert(loyaltyTransactions).values({
    userId: e.userId,
    orderId: e.orderId ?? null,
    type: e.type,
    points: applied,
    balanceAfter: newBalance,
    note: e.note ?? null,
    createdBy: e.createdBy ?? null,
  });
  await tx
    .update(loyaltyAccounts)
    .set({
      pointsBalance: newBalance,
      lifetimePoints: Math.max(0, acc.lifetimePoints + (e.lifetimeDelta ?? 0)),
      lifetimeSpend: String(newSpend),
      tierId: tier?.id ?? null,
      updatedAt: new Date(),
    })
    .where(eq(loyaltyAccounts.userId, e.userId));
  return true;
}

/** Spend points on an order. Call inside the order-creation transaction. */
export async function redeemPointsForOrder(
  tx: DbExecutor,
  args: { userId: string; orderId: string; points: number; orderNumber: string },
) {
  const acc = await lockAccount(tx, args.userId);
  if (args.points > acc.pointsBalance) throw new LoyaltyError("Not enough loyalty points");
  await applyEntry(tx, {
    userId: args.userId,
    orderId: args.orderId,
    type: "redeem",
    points: -args.points,
    note: `Redeemed on order ${args.orderNumber}`,
  });
}

/** Awards points once for a delivered order. Safe to call repeatedly. */
export async function awardPointsForOrder(orderId: string): Promise<number> {
  return db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId));
    if (!order?.userId || order.status !== "delivered") return 0;
    const settings = await getLoyaltySettings(tx);
    const acc = await lockAccount(tx, order.userId);
    const tiers = await listLoyaltyTiers(tx);
    const tier = tiers.find((t) => t.id === acc.tierId) ?? tierForSpend(tiers, Number(acc.lifetimeSpend));
    const total = Number(order.total);
    const points = calculateEarnedPoints(total, settings, tier ? Number(tier.earnMultiplier) : 1);

    const ok = await applyEntry(tx, {
      userId: order.userId,
      orderId,
      type: "earn",
      points,
      lifetimeDelta: points,
      spendDelta: total,
      note: `Order ${order.orderNumber}`,
    });
    if (!ok) return 0;
    await tx.update(orders).set({ loyaltyPointsEarned: points }).where(eq(orders.id, orderId));
    return points;
  });
}

/** Undo an order's earn and give back redeemed points (refund / cancellation). Idempotent. */
export async function reverseOrderLoyalty(orderId: string) {
  await db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId));
    if (!order?.userId) return;
    const txs = await tx
      .select()
      .from(loyaltyTransactions)
      .where(eq(loyaltyTransactions.orderId, orderId));
    const earn = txs.find((t) => t.type === "earn");
    const redeem = txs.find((t) => t.type === "redeem");

    if (earn) {
      await applyEntry(tx, {
        userId: order.userId,
        orderId,
        type: "earn_reversal",
        points: -earn.points,
        lifetimeDelta: -earn.points,
        spendDelta: -Number(order.total),
        note: `Order ${order.orderNumber} refunded or cancelled`,
      });
    }
    if (redeem) {
      await applyEntry(tx, {
        userId: order.userId,
        orderId,
        type: "redeem_reversal",
        points: -redeem.points,
        note: `Points returned for order ${order.orderNumber}`,
      });
    }
  });
}

export async function adjustLoyaltyPoints(args: {
  userId: string;
  points: number;
  note: string;
  createdBy: string;
}) {
  await db.transaction(async (tx) => {
    await applyEntry(tx, {
      userId: args.userId,
      type: "adjust",
      points: args.points,
      lifetimeDelta: args.points > 0 ? args.points : 0,
      note: args.note,
      createdBy: args.createdBy,
    });
  });
}

// ─── Read models ──────────────────────────────────────────────────────────────
export async function getLoyaltySummary(userId: string) {
  const [settings, tiers] = await Promise.all([getLoyaltySettings(), listLoyaltyTiers()]);
  const [acc] = await db
    .select()
    .from(loyaltyAccounts)
    .where(eq(loyaltyAccounts.userId, userId));
  const spend = Number(acc?.lifetimeSpend ?? 0);
  const tier = tierForSpend(tiers, spend);
  const next = tiers.find((t) => Number(t.minSpend) > spend) ?? null;
  const history = await db
    .select()
    .from(loyaltyTransactions)
    .where(eq(loyaltyTransactions.userId, userId))
    .orderBy(desc(loyaltyTransactions.createdAt))
    .limit(50);
  return {
    settings,
    tiers,
    balance: acc?.pointsBalance ?? 0,
    lifetimePoints: acc?.lifetimePoints ?? 0,
    lifetimeSpend: spend,
    tier,
    nextTier: next,
    spendToNextTier: next ? Math.max(0, Number(next.minSpend) - spend) : 0,
    history,
  };
}

export async function getLoyaltyOverview() {
  const [row] = await db
    .select({
      members: sql<number>`count(*)::int`,
      outstanding: sql<number>`coalesce(sum(${loyaltyAccounts.pointsBalance}), 0)::int`,
      issued: sql<number>`coalesce(sum(${loyaltyAccounts.lifetimePoints}), 0)::int`,
    })
    .from(loyaltyAccounts);
  return row;
}
