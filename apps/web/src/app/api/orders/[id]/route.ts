import { NextRequest, NextResponse } from "next/server";
import { db, orders, orderStatusHistory } from "@icrowed/database";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { sendEmail } from "@/lib/email";
import { orderShippedTemplate } from "@/lib/email-templates/orderShipped";
import { orderDeliveredTemplate } from "@/lib/email-templates/orderDelivered";

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
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, trackingNumber, courierName, adminNote, changedBy } = body;

    const before = await db.query.orders.findFirst({ where: eq(orders.id, id) });

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

    // Send status-driven emails (non-blocking)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    if (updated.customerEmail) {
      if (status === "shipped") {
        sendEmail({
          to: updated.customerEmail,
          subject: `Your order ${updated.orderNumber} has been shipped!`,
          html: orderShippedTemplate({
            customerName: updated.customerName ?? "Customer",
            orderNumber: updated.orderNumber,
            courierName: updated.courierName,
            trackingNumber: updated.trackingNumber,
            estimatedDelivery: updated.estimatedDeliveryDate
              ? new Date(updated.estimatedDeliveryDate).toLocaleDateString("en-LK", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : null,
            appUrl,
          }),
        });
      } else if (status === "delivered") {
        sendEmail({
          to: updated.customerEmail,
          subject: `Your order ${updated.orderNumber} has been delivered!`,
          html: orderDeliveredTemplate({
            customerName: updated.customerName ?? "Customer",
            orderNumber: updated.orderNumber,
            appUrl,
          }),
        });
      }
    }

    await logAudit({
      actor: { userId: auth.userId, email: auth.email },
      entityType: "order",
      entityId: id,
      action: status !== undefined ? "status_change" : "update",
      summary:
        status !== undefined
          ? `Order ${updated.orderNumber} → ${status}`
          : `Order ${updated.orderNumber} updated`,
      before: before
        ? {
            status: before.status,
            trackingNumber: before.trackingNumber,
            courierName: before.courierName,
            adminNote: before.adminNote,
          }
        : null,
      after: {
        status: updated.status,
        trackingNumber: updated.trackingNumber,
        courierName: updated.courierName,
        adminNote: updated.adminNote,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH /api/orders/[id]]", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
