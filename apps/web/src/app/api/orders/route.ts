import { NextRequest, NextResponse } from "next/server";
import { db, orders, orderItems, coupons, computeDeliveryFeeForType } from "@icrowd/database";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { generateOrderNumber } from "@/lib/utils";
import { sendEmail } from "@/lib/email";
import { orderConfirmationTemplate } from "@/lib/email-templates/orderConfirmation";
import { paymentMethodLabel } from "@/lib/invoice";
import { notifyAdmins } from "@/lib/notify";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber");

  if (orderNumber) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.orderNumber, orderNumber),
      with: { items: true, statusHistory: true },
    });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(order);
  }

  // Listing all orders is admin-only
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const allOrders = await db.query.orders.findMany({
    orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    limit: 50,
  });
  return NextResponse.json(allOrders);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddressLine1,
      shippingAddressLine2,
      shippingCity,
      shippingDistrict,
      shippingProvince,
      items,
      paymentMethod,
      deliveryTypeId,
      shippingCost = 0,
      discount = 0,
      couponCode,
      customerNote,
    } = body;

    if (!deliveryTypeId) {
      return NextResponse.json({ error: "deliveryTypeId is required" }, { status: 400 });
    }

    const email = String(customerEmail ?? "").trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }

    const subtotal = items.reduce(
      (sum: number, item: { unitPrice: number; quantity: number }) =>
        sum + item.unitPrice * item.quantity,
      0
    );

    const deliveryResult = await computeDeliveryFeeForType(deliveryTypeId, subtotal);
    if (!deliveryResult) {
      return NextResponse.json({ error: "Invalid delivery type" }, { status: 400 });
    }

    const { fee: validatedShippingCost, type: deliveryType } = deliveryResult;
    if (Math.abs(Number(shippingCost) - validatedShippingCost) > 0.01) {
      return NextResponse.json({ error: "Shipping cost mismatch" }, { status: 400 });
    }

    const total = subtotal + validatedShippingCost - Number(discount);
    const orderNumber = generateOrderNumber();

    let order: typeof orders.$inferSelect;
    try {
      const [inserted] = await db
        .insert(orders)
        .values({
          orderNumber,
          userId: userId ?? null,
          customerName,
          customerEmail: email,
          customerPhone,
          shippingAddressLine1,
          shippingAddressLine2: shippingAddressLine2 ?? null,
          shippingCity,
          shippingDistrict,
          shippingProvince: shippingProvince ?? null,
          subtotal: String(subtotal),
          shippingCost: String(validatedShippingCost),
          discount: String(discount),
          couponCode: couponCode ?? null,
          total: String(total),
          paymentMethod,
          deliveryTypeId: deliveryType.id,
          deliveryTypeName: deliveryType.name,
          customerNote: customerNote ?? null,
        })
        .returning();
      order = inserted;
    } catch (insertErr) {
      const msg = insertErr instanceof Error ? insertErr.message : String(insertErr);
      console.error("Order insert failed:", msg, insertErr);
      return NextResponse.json({ error: "Failed to create order", detail: msg, step: "insert_order" }, { status: 500 });
    }

    // Increment coupon usedCount if a coupon was applied
    if (couponCode) {
      await db
        .update(coupons)
        .set({ usedCount: sql`${coupons.usedCount} + 1` })
        .where(eq(coupons.code, couponCode));
    }

    // Insert order items
    if (items.length > 0) {
      await db.insert(orderItems).values(
        items.map((item: {
          productId?: string;
          variantId?: string;
          productName: string;
          variantName?: string;
          sku?: string;
          quantity: number;
          unitPrice: number;
          imageUrl?: string;
        }) => ({
          orderId: order.id,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          variantName: item.variantName,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: String(item.unitPrice),
          subtotal: String(item.unitPrice * item.quantity),
          imageUrl: item.imageUrl,
        }))
      );
    }

    // Send order confirmation email (non-blocking)
    if (customerEmail) {
      sendEmail({
        to: customerEmail,
        subject: `Order Confirmed — ${orderNumber}`,
        html: orderConfirmationTemplate({
          customerName,
          orderNumber,
          items: items.map((i: { productName: string; variantName?: string; quantity: number; unitPrice: number }) => ({
            productName: i.productName,
            variantName: i.variantName,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
          subtotal,
          shippingCost: validatedShippingCost,
          discount,
          total,
          shippingAddress: [shippingAddressLine1, shippingAddressLine2, shippingCity, shippingDistrict, shippingProvince]
            .filter(Boolean)
            .join(", "),
          paymentMethod,
          appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
        }),
      });
    }

    notifyAdmins("new_order", {
      subject: `New order received — ${orderNumber}`,
      html: `<p>A new order has been placed.</p>
        <p><strong>Order:</strong> ${orderNumber}<br/>
        <strong>Customer:</strong> ${customerName} (${customerEmail ?? "no email"})<br/>
        <strong>Total:</strong> LKR ${Number(total).toLocaleString()}<br/>
        <strong>Payment:</strong> ${paymentMethodLabel(paymentMethod)}</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/admin/orders/${order.id}">View order</a></p>`,
    });

    return NextResponse.json({ order, orderNumber }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Create order error:", err);
    return NextResponse.json({ error: "Failed to create order", detail: message }, { status: 500 });
  }
}
