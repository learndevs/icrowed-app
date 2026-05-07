import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateNotificationPrefs,
  upsertNotificationPrefs,
} from "@icrowed/database";
import { requireAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const row = await getOrCreateNotificationPrefs();
  return NextResponse.json(row);
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const before = await getOrCreateNotificationPrefs();
    const body = (await req.json()) as Record<string, unknown>;

    const safe: Record<string, unknown> = {};
    const allowed = [
      "notifyOnNewOrder",
      "notifyOnLowStock",
      "notifyOnRefund",
      "notifyOnReview",
      "recipientEmails",
    ];
    for (const k of allowed) if (k in body) safe[k] = body[k];

    const row = await upsertNotificationPrefs(safe);

    await logAudit({
      actor: { userId: auth.userId, email: auth.email },
      entityType: "notification_prefs",
      action: "update",
      summary: "Notification preferences updated",
      before,
      after: row,
    });

    return NextResponse.json(row);
  } catch (err) {
    console.error("[PUT /api/admin/settings/notifications]", err);
    return NextResponse.json(
      { error: "Failed to save notifications" },
      { status: 500 }
    );
  }
}
