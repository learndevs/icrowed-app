import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db, orders } from "@icrowed/database";
import { eq } from "drizzle-orm";

/**
 * Creates a Checkout Session from the persisted order so the charged amount
 * always matches `orders.total` (items + shipping − discount).
 */
export async function POST(req: NextRequest) {
  try {
    const { orderNumber, successUrl, cancelUrl } = await req.json();

    if (!orderNumber) {
      return NextResponse.json({ error: "Missing order number" }, { status: 400 });
    }

    const order = await db.query.orders.findFirst({
      where: eq(orders.orderNumber, orderNumber),
      with: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentMethod !== "stripe") {
      return NextResponse.json({ error: "Order is not a card payment" }, { status: 400 });
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json({ error: "Order already paid" }, { status: 400 });
    }

    const description = order.items
      .slice(0, 5)
      .map((i) => `${i.productName} ×${i.quantity}`)
      .join(", ")
      .slice(0, 450);

    const totalLkr = Number(order.total);
    if (!Number.isFinite(totalLkr) || totalLkr <= 0) {
      return NextResponse.json({ error: "Invalid order total" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "lkr",
            product_data: {
              name: `Order ${order.orderNumber}`,
              description: description || "iCrowed store order",
            },
            unit_amount: Math.round(totalLkr * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url:
        successUrl ??
        `${process.env.NEXT_PUBLIC_APP_URL}/track?orderNumber=${encodeURIComponent(order.orderNumber)}`,
      cancel_url: cancelUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
      shipping_address_collection: {
        allowed_countries: ["LK"],
      },
      metadata: {
        source: "icrowed-store",
        orderNumber: order.orderNumber,
      },
      payment_intent_data: {
        metadata: {
          orderNumber: order.orderNumber,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
