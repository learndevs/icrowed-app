import { NextResponse } from "next/server";
import { parseBankDetails } from "@/lib/bank-details";
import {
  getCachedStoreSettings,
  STOREFRONT_CACHE_HEADERS,
} from "@/lib/cached-storefront";

export async function GET() {
  try {
    const settings = await getCachedStoreSettings();
    return NextResponse.json(parseBankDetails(settings.bankDetails), {
      headers: STOREFRONT_CACHE_HEADERS,
    });
  } catch (err) {
    console.error("[GET /api/bank-details]", err);
    return NextResponse.json({ error: "Failed to load bank details" }, { status: 500 });
  }
}
