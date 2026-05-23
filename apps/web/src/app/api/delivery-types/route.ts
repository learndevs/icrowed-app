import { NextResponse } from "next/server";
import { getCheckoutDeliveryOptions } from "@icrowd/database";

export async function GET() {
  try {
    const data = await getCheckoutDeliveryOptions();
    return NextResponse.json(data);
  } catch (err) {
    console.error("delivery-types GET:", err);
    return NextResponse.json({ error: "Failed to load delivery types" }, { status: 500 });
  }
}
