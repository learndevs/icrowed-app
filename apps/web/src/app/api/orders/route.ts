import { NextRequest, NextResponse } from "next/server";
import {
  db,
  orders,
  orderItems,
  coupons,
  computeDeliveryFeeForType,
  prepareAndReserveOrderItems,
  OrderItemError,
} from "@icrowd/database";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { generateOrderNumber } from "@/lib/utils";
import { sendEmail } from "@/lib/email";
import { orderConfirmationTemplate } from "@/lib/email-templates/orderConfirmation";
import { sendNewOrderAdminNotification } from "@/lib/send-new-order-admin-notification";

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
    with: { items: true },
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

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Order must include at least one item" }, { status: 400 });
    }

    const orderNumber = generateOrderNumber();

    const { order, preparedItems, subtotal, validatedShippingCost, deliveryType } =
      await db.transaction(async (tx) => {
        const preparedItems = await prepareAndReserveOrderItems(items, tx);

        const subtotal = preparedItems.reduce(
          (sum, item) => sum + Number(item.unitPrice) * item.quantity,
          0,
        );

        const deliveryResult = await computeDeliveryFeeForType(deliveryTypeId, subtotal);
        if (!deliveryResult) {
          throw new OrderItemError("Invalid delivery type");
        }

        const { fee: validatedShippingCost, type: deliveryType } = deliveryResult;
        if (Math.abs(Number(shippingCost) - validatedShippingCost) > 0.01) {
          throw new OrderItemError("Shipping cost mismatch");
        }

        const total = subtotal + validatedShippingCost - Number(discount);

        const [inserted] = await tx
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

        if (preparedItems.length > 0) {
          await tx.insert(orderItems).values(
            preparedItems.map((item) => ({
              orderId: inserted.id,
              productId: item.productId,
              variantId: item.variantId,
              productName: item.productName,
              variantName: item.variantName,
              sku: item.sku,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
              imageUrl: item.imageUrl,
            })),
          );
        }

        if (couponCode) {
          await tx
            .update(coupons)
            .set({ usedCount: sql`${coupons.usedCount} + 1` })
            .where(eq(coupons.code, couponCode));
        }

        return {
          order: inserted,
          preparedItems,
          subtotal,
          validatedShippingCost,
          deliveryType,
        };
      });

    const total = subtotal + validatedShippingCost - Number(discount);

    // Send order confirmation email (non-blocking)
    if (customerEmail) {
      sendEmail({
        to: customerEmail,
        subject: `Order Confirmed — ${orderNumber}`,
        html: orderConfirmationTemplate({
          customerName,
          orderNumber,
          items: preparedItems.map((i) => ({
            productName: i.productName,
            variantName: i.variantName,
            quantity: i.quantity,
            unitPrice: Number(i.unitPrice),
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

    sendNewOrderAdminNotification({
      orderId: order.id,
      orderNumber,
      customerName,
      customerEmail: email,
      total,
      paymentMethod,
    }).catch(() => {});

    return NextResponse.json({ order, orderNumber }, { status: 201 });
  } catch (err) {
    if (err instanceof OrderItemError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : String(err);
    console.error("Create order error:", err);
    return NextResponse.json({ error: "Failed to create order", detail: message }, { status: 500 });
  }
}
