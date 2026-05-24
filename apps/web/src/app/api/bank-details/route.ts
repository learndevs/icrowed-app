import { NextResponse } from "next/server";
import { getOrCreateStoreSettings } from "@icrowd/database";
import { parseBankDetails } from "@/lib/bank-details";

export async function GET() {
  try {
    const settings = await getOrCreateStoreSettings();
    return NextResponse.json(parseBankDetails(settings.bankDetails));
  } catch (err) {
    console.error("[GET /api/bank-details]", err);
    return NextResponse.json({ error: "Failed to load bank details" }, { status: 500 });
  }
}
