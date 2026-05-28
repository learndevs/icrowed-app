import { NextResponse } from "next/server";
import {
  getCachedCheckoutDeliveryOptions,
  STOREFRONT_CACHE_HEADERS,
} from "@/lib/cached-storefront";

export async function GET() {
  try {
    const data = await getCachedCheckoutDeliveryOptions();
    return NextResponse.json(data, { headers: STOREFRONT_CACHE_HEADERS });
  } catch (err) {
    console.error("delivery-types GET:", err);
    return NextResponse.json({ error: "Failed to load delivery types" }, { status: 500 });
  }
}
