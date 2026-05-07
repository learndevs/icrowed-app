import { NextRequest, NextResponse } from "next/server";
import { db, orders, orderStatusHistory } from "@icrowed/database";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { stripe } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";
import { orderRefundedTemplate } from "@/lib/email-templates/orderRefunded";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const { reason, adminNote } = await req.json().catch(() => ({}));

    const order = await db.query.orders.findFirst({ where: eq(orders.id, id) });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentStatus === "refunded") {
      return NextResponse.json({ error: "Order has already been refunded" }, { status: 409 });
    }

    if (order.paymentStatus !== "paid") {
      return NextResponse.json(
        { error: "Only paid orders can be refunded" },
        { status: 400 }
      );
    }

    let stripeRefundId: string | null = null;

    // Issue Stripe refund if the order was paid via card
    if (order.paymentMethod === "stripe" && order.stripePaymentIntentId) {
      const refund = await stripe.refunds.create({
        payment_intent: order.stripePaymentIntentId,
        reason: (reason as "duplicate" | "fraudulent" | "requested_by_customer") ?? "requested_by_customer",
      });
      stripeRefundId = refund.id;
    }

    // Mark order as refunded in DB
    const [updated] = await db
      .update(orders)
      .set({
        paymentStatus: "refunded",
        status: "refunded",
        adminNote: adminNote ?? order.adminNote,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();

    // Record in status history
    await db.insert(orderStatusHistory).values({
      orderId: id,
      status: "refunded",
      note: adminNote ?? (stripeRefundId ? `Stripe refund ${stripeRefundId}` : "Manual refund processed"),
    });

    // Send refund confirmation email (non-blocking)
    if (updated.customerEmail) {
      sendEmail({
        to: updated.customerEmail,
        subject: `Refund Processed — ${updated.orderNumber}`,
        html: orderRefundedTemplate({
          customerName: updated.customerName,
          orderNumber: updated.orderNumber,
          refundAmount: updated.total,
          paymentMethod: updated.paymentMethod,
          appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
        }),
      });
    }

    await logAudit({
      actor: { userId: auth.userId, email: auth.email },
      entityType: "order",
      entityId: id,
      action: "refund",
      summary: `Refund issued for ${updated.orderNumber} (${updated.total})`,
      metadata: { stripeRefundId, reason, paymentMethod: order.paymentMethod },
    });

    return NextResponse.json({
      success: true,
      stripeRefundId,
      order: updated,
    });
  } catch (err: unknown) {
    console.error("[POST /api/orders/[id]/refund]", err);
    const message = err instanceof Error ? err.message : "Failed to process refund";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
