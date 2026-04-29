import { NextRequest, NextResponse } from "next/server";
import { db, orders, orderStatusHistory } from "@icrowed/database";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: { items: true, statusHistory: { orderBy: (h, { desc }) => [desc(h.createdAt)] } },
    });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch (err) {
    console.error("[GET /api/orders/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, trackingNumber, courierName, adminNote, changedBy } = body;

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (status !== undefined)         updateData.status = status;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber || null;
    if (courierName !== undefined)    updateData.courierName = courierName || null;
    if (adminNote !== undefined)      updateData.adminNote = adminNote || null;
    if (status === "delivered")       updateData.deliveredAt = new Date();

    const [updated] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Record status change in history when status actually changed
    if (status !== undefined) {
      await db.insert(orderStatusHistory).values({
        orderId: id,
        status,
        note: adminNote ?? null,
        changedBy: changedBy ?? null,
      });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH /api/orders/[id]]", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
