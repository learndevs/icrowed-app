import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateNotificationPrefs,
  upsertNotificationPrefs,
  parseRecipients,
} from "@icrowd/database";
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

    if (typeof safe.recipientEmails === "string") {
      const emails = parseRecipients(safe.recipientEmails);
      const invalid = emails.filter(
        (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      );
      if (invalid.length > 0) {
        return NextResponse.json(
          { error: `Invalid email address(es): ${invalid.join(", ")}` },
          { status: 400 }
        );
      }
      safe.recipientEmails = emails.join(", ");
    }

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
