import { NextRequest, NextResponse } from "next/server";
import { generatePayHereHash, formatPayHereAmount, PAYHERE_SANDBOX_URL, PAYHERE_LIVE_URL } from "@/lib/payhere";

export async function POST(req: NextRequest) {
  try {
    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const isLive = process.env.PAYHERE_ENV === "live";

    const isPlaceholder = (v: string) =>
      v.startsWith("your-") || v === "" || v.includes("placeholder");

    if (!merchantId || !merchantSecret || isPlaceholder(merchantId) || isPlaceholder(merchantSecret)) {
      return NextResponse.json(
        { error: "PayHere credentials are not configured. Set PAYHERE_MERCHANT_ID and PAYHERE_MERCHANT_SECRET in .env.local." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const {
      orderNumber,
      total,
      customerName,
      customerEmail,
      customerPhone,
      address,
      city,
    } = body as {
      orderNumber: string;
      total: number;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      address: string;
      city: string;
    };

    if (!orderNumber || !total || !customerName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const currency = "LKR";
    const amount = formatPayHereAmount(total);
    const hash = generatePayHereHash(merchantId, orderNumber, amount, currency, merchantSecret);

    const nameParts = customerName.trim().split(" ");
    const firstName = nameParts[0] ?? customerName;
    const lastName = nameParts.slice(1).join(" ") || "-";

    return NextResponse.json({
      checkoutUrl: isLive ? PAYHERE_LIVE_URL : PAYHERE_SANDBOX_URL,
      params: {
        merchant_id: merchantId,
        return_url: `${appUrl}/checkout/success?orderNumber=${orderNumber}&method=payhere`,
        cancel_url: `${appUrl}/checkout?cancelled=1`,
        notify_url: `${appUrl}/api/payhere/notify`,
        order_id: orderNumber,
        items: `iCrowed Order ${orderNumber}`,
        currency,
        amount,
        first_name: firstName,
        last_name: lastName,
        email: customerEmail ?? "",
        phone: customerPhone ?? "",
        address: address ?? "",
        city: city ?? "",
        country: "Sri Lanka",
        hash,
      },
    });
  } catch (err) {
    console.error("PayHere initiate error:", err);
    return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 });
  }
}
