import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db, orders, orderStatusHistory } from "@icrowed/database";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  const body = await req.text();

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderNumber = session.metadata?.orderNumber;
        if (orderNumber) {
          await db
            .update(orders)
            .set({ paymentStatus: "paid", status: "confirmed" })
            .where(eq(orders.orderNumber, orderNumber));
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const orderRef = intent.metadata?.orderNumber;
        if (orderRef) {
          await db
            .update(orders)
            .set({ paymentStatus: "failed" })
            .where(eq(orders.orderNumber, orderRef));
        }
        break;
      }
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
