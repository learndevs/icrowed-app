import { NextRequest, NextResponse } from "next/server";
import { verifyPayHereNotify } from "@/lib/payhere";
import { db, orders } from "@icrowed/database";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/email";
import { paymentConfirmedTemplate } from "@/lib/email-templates/paymentConfirmed";

// PayHere sends a server-to-server POST with application/x-www-form-urlencoded
export async function POST(req: NextRequest) {
  try {
    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    if (!merchantId || !merchantSecret) {
      return new NextResponse("PayHere not configured", { status: 503 });
    }

    const form = await req.formData();
    const get = (key: string) => (form.get(key) as string) ?? "";

    const merchant_id = get("merchant_id");
    const order_id = get("order_id");
    const payhere_amount = get("payhere_amount");
    const payhere_currency = get("payhere_currency");
    const status_code = get("status_code");
    const md5sig = get("md5sig");

    // Verify the signature
    const valid = verifyPayHereNotify({
      merchantId: merchant_id,
      orderId: order_id,
      payhereAmount: payhere_amount,
      payhereCurrency: payhere_currency,
      statusCode: status_code,
      md5sig,
      merchantSecret,
    });

    if (!valid) {
      console.error("PayHere notify: invalid signature for order", order_id);
      return new NextResponse("Invalid signature", { status: 400 });
    }

    // status_code 2 = Success
    if (status_code === "2") {
      const [updated] = await db
        .update(orders)
        .set({
          paymentStatus: "paid",
          status: "confirmed",
          paidAt: new Date(),
        })
        .where(eq(orders.orderNumber, order_id))
        .returning();

      if (updated?.customerEmail) {
        sendEmail({
          to: updated.customerEmail,
          subject: `Payment Confirmed — ${order_id}`,
          html: paymentConfirmedTemplate({
            customerName: updated.customerName ?? "Customer",
            orderNumber: order_id,
            total: updated.total,
            appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
          }),
        });
      }
    } else if (status_code === "-1" || status_code === "-2") {
      // Canceled or Failed
      await db
        .update(orders)
        .set({ paymentStatus: "failed" })
        .where(eq(orders.orderNumber, order_id));
    }

    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    console.error("PayHere notify error:", err);
    return new NextResponse("Internal error", { status: 500 });
  }
}
