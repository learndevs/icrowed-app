import { NextRequest, NextResponse } from "next/server";
import { db, orders, orderItems, orderStatusHistory } from "@icrowed/database";
import { eq } from "drizzle-orm";
import { generateOrderNumber } from "@/lib/utils";

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
        total: String(total),
        paymentMethod,
        customerNote,
      })
      .returning();

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

    return NextResponse.json({ order, orderNumber }, { status: 201 });
  } catch (err) {
    console.error("Create order error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
