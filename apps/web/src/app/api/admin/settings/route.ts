import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateStoreSettings,
  upsertStoreSettings,
} from "@icrowed/database";
import { requireAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const row = await getOrCreateStoreSettings();
  return NextResponse.json(row);
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const before = await getOrCreateStoreSettings();
    const body = (await req.json()) as Record<string, unknown>;

    // Allow only known columns through
    const safe: Record<string, unknown> = {};
    const allowed = [
      "storeName",
      "storeEmail",
      "supportPhone",
      "currency",
      "taxRatePercent",
      "taxInclusive",
      "addressLine1",
      "addressLine2",
      "city",
      "country",
      "logoUrl",
      "faviconUrl",
      "socialLinks",
      "policies",
    ];
    for (const k of allowed) {
      if (k in body) safe[k] = body[k];
    }
    if ("taxRatePercent" in safe && safe.taxRatePercent != null) {
      safe.taxRatePercent = String(safe.taxRatePercent);
    }

    const row = await upsertStoreSettings(safe);

    await logAudit({
      actor: { userId: auth.userId, email: auth.email },
      entityType: "settings",
      action: "update",
      summary: "Store settings updated",
      before,
      after: row,
    });

    return NextResponse.json(row);
  } catch (err) {
    console.error("[PUT /api/admin/settings]", err);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
