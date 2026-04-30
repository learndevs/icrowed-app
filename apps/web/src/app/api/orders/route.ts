import { NextRequest, NextResponse } from "next/server";
import { db, orders, orderItems, coupons } from "@icrowed/database";
import { eq, sql } from "drizzle-orm";
import { generateOrderNumber } from "@/lib/utils";
import { sendEmail } from "@/lib/email";
import { orderConfirmationTemplate } from "@/lib/email-templates/orderConfirmation";

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
      shippingCost = 0,
      discount = 0,
      couponCode,
      customerNote,
    } = body;

    const subtotal = items.reduce(
      (sum: number, item: { unitPrice: number; quantity: number }) =>
        sum + item.unitPrice * item.quantity,
      0
    );
    const total = subtotal + Number(shippingCost) - Number(discount);
    const orderNumber = generateOrderNumber();

    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        userId,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddressLine1,
        shippingAddressLine2,
        shippingCity,
        shippingDistrict,
        shippingProvince,
        subtotal: String(subtotal),
        shippingCost: String(shippingCost),
        discount: String(discount),
        couponCode: couponCode ?? null,
        total: String(total),
        paymentMethod,
        customerNote,
      })
      .returning();

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
          shippingCost,
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

    return NextResponse.json({ order, orderNumber }, { status: 201 });
  } catch (err) {
    console.error("Create order error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
