import { eq, desc, and } from "drizzle-orm";
import { db } from "../index";
import { orders, orderItems, orderStatusHistory } from "../schema";

export async function createOrder(
  data: Omit<typeof orders.$inferInsert, "id" | "createdAt" | "updatedAt">,
  items: Omit<typeof orderItems.$inferInsert, "id" | "orderId">[]
) {
  return db.transaction(async (tx) => {
    const [order] = await tx.insert(orders).values(data).returning();
    await tx
      .insert(orderItems)
      .values(items.map((item) => ({ ...item, orderId: order.id })));
    await tx.insert(orderStatusHistory).values({
      orderId: order.id,
      status: order.status,
      note: "Order placed",
    });
    return order;
  });
}

export async function getOrderByNumber(orderNumber: string) {
  return db.query.orders.findFirst({
    where: eq(orders.orderNumber, orderNumber),
    with: { items: true, statusHistory: true, user: true },
  });
}

export async function getOrders(opts?: {
  status?: typeof orders.$inferSelect["status"];
  userId?: string;
  limit?: number;
  offset?: number;
}) {
  const conditions = [];
  if (opts?.status) conditions.push(eq(orders.status, opts.status));
  if (opts?.userId) conditions.push(eq(orders.userId, opts.userId));

  return db.query.orders.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    with: { items: true },
    orderBy: [desc(orders.createdAt)],
    limit: opts?.limit ?? 50,
    offset: opts?.offset ?? 0,
  });
}

export async function updateOrderStatus(
  orderId: string,
  status: typeof orders.$inferSelect["status"],
  opts?: { note?: string; changedBy?: string; trackingNumber?: string; courierName?: string }
) {
  return db.transaction(async (tx) => {
    const updateData: Partial<typeof orders.$inferInsert> = {
      status,
      updatedAt: new Date(),
    };
    if (opts?.trackingNumber) updateData.trackingNumber = opts.trackingNumber;
    if (opts?.courierName) updateData.courierName = opts.courierName;
    if (status === "delivered") updateData.deliveredAt = new Date();

    const [order] = await tx
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning();

    await tx.insert(orderStatusHistory).values({
      orderId,
      status,
      note: opts?.note,
      changedBy: opts?.changedBy,
    });

    return order;
  });
}
