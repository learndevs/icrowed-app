import {
  db,
  orders,
  orderItems,
  products,
  profiles,
} from "@icrowed/database";
import { and, count, desc, eq, gt, gte, lte, sql, sum } from "drizzle-orm";

export type Range = { from: Date; to: Date };

export async function getKpis(range: Range) {
  const [revenueRow, orderCountRow, refundsRow, newCustomersRow] = await Promise.all([
    db
      .select({ total: sum(orders.total) })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, range.from),
          lte(orders.createdAt, range.to),
          sql`${orders.status} not in ('cancelled','refunded')`
        )
      ),
    db
      .select({ count: count() })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, range.from),
          lte(orders.createdAt, range.to)
        )
      ),
    db
      .select({ count: count(), total: sum(orders.total) })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, range.from),
          lte(orders.createdAt, range.to),
          eq(orders.status, "refunded")
        )
      ),
    db
      .select({ count: count() })
      .from(profiles)
      .where(
        and(
          gte(profiles.createdAt, range.from),
          lte(profiles.createdAt, range.to)
        )
      ),
  ]);

  const revenue = Number(revenueRow[0]?.total ?? 0);
  const ordersCount = Number(orderCountRow[0]?.count ?? 0);
  const refundCount = Number(refundsRow[0]?.count ?? 0);
  const newCustomers = Number(newCustomersRow[0]?.count ?? 0);
  const aov = ordersCount > 0 ? revenue / ordersCount : 0;
  const refundRate = ordersCount > 0 ? (refundCount / ordersCount) * 100 : 0;
  return { revenue, ordersCount, aov, refundCount, refundRate, newCustomers };
}

export async function getRevenueDaily(range: Range) {
  const rows = await db
    .select({
      day: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
      revenue: sql<string>`coalesce(sum(${orders.total}),0)`,
      orderCount: sql<number>`count(*)::int`,
    })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, range.from),
        lte(orders.createdAt, range.to),
        sql`${orders.status} not in ('cancelled','refunded')`
      )
    )
    .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`);

  return rows.map((r) => ({
    day: r.day,
    revenue: Number(r.revenue),
    orderCount: Number(r.orderCount),
  }));
}

export async function getOrdersByStatus(range: Range) {
  const rows = await db
    .select({
      status: orders.status,
      count: sql<number>`count(*)::int`,
    })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, range.from),
        lte(orders.createdAt, range.to)
      )
    )
    .groupBy(orders.status);
  return rows.map((r) => ({ status: r.status, count: Number(r.count) }));
}

export async function getPaymentMethodSplit(range: Range) {
  const rows = await db
    .select({
      method: orders.paymentMethod,
      count: sql<number>`count(*)::int`,
      total: sql<string>`coalesce(sum(${orders.total}),0)`,
    })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, range.from),
        lte(orders.createdAt, range.to),
        sql`${orders.status} not in ('cancelled','refunded')`
      )
    )
    .groupBy(orders.paymentMethod);
  return rows.map((r) => ({
    method: r.method,
    count: Number(r.count),
    total: Number(r.total),
  }));
}

export async function getTopProducts(range: Range, limit = 10) {
  const rows = await db
    .select({
      productId: orderItems.productId,
      productName: orderItems.productName,
      qty: sql<number>`sum(${orderItems.quantity})::int`,
      revenue: sql<string>`coalesce(sum(${orderItems.subtotal}),0)`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(
      and(
        gte(orders.createdAt, range.from),
        lte(orders.createdAt, range.to),
        sql`${orders.status} not in ('cancelled','refunded')`
      )
    )
    .groupBy(orderItems.productId, orderItems.productName)
    .orderBy(desc(sql`sum(${orderItems.subtotal})`))
    .limit(limit);
  return rows.map((r) => ({
    productId: r.productId,
    productName: r.productName,
    qty: Number(r.qty),
    revenue: Number(r.revenue),
  }));
}

export async function getTopCustomers(range: Range, limit = 10) {
  const rows = await db
    .select({
      userId: orders.userId,
      customerName: orders.customerName,
      customerEmail: orders.customerEmail,
      orderCount: sql<number>`count(*)::int`,
      revenue: sql<string>`coalesce(sum(${orders.total}),0)`,
    })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, range.from),
        lte(orders.createdAt, range.to),
        sql`${orders.status} not in ('cancelled','refunded')`
      )
    )
    .groupBy(orders.userId, orders.customerName, orders.customerEmail)
    .orderBy(desc(sql`sum(${orders.total})`))
    .limit(limit);
  return rows.map((r) => ({
    userId: r.userId,
    customerName: r.customerName,
    customerEmail: r.customerEmail,
    orderCount: Number(r.orderCount),
    revenue: Number(r.revenue),
  }));
}

export async function getLowStockProducts(limit = 20) {
  return db
    .select({
      id: products.id,
      name: products.name,
      sku: products.sku,
      stock: products.stock,
      threshold: products.lowStockThreshold,
      price: products.price,
    })
    .from(products)
    .where(
      and(
        eq(products.isActive, true),
        gt(products.stock, 0),
        lte(products.stock, products.lowStockThreshold)
      )
    )
    .orderBy(products.stock)
    .limit(limit);
}

export async function getOutOfStockCount() {
  const [r] = await db
    .select({ count: count() })
    .from(products)
    .where(and(eq(products.isActive, true), eq(products.stock, 0)));
  return Number(r?.count ?? 0);
}

export async function getRecentOrders(limit = 5) {
  return db.query.orders.findMany({
    orderBy: (o, { desc }) => [desc(o.createdAt)],
    limit,
  });
}
