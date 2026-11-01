import { NextRequest, NextResponse } from "next/server";
import { adjustLoyaltyPoints, getLoyaltySummary } from "@icrowd/database/queries";
import { requireAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";

/** Manually add or remove points for a customer. */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { userId, points, note } = (await req.json().catch(() => ({}))) as {
    userId?: string;
    points?: number;
    note?: string;
  };
  const delta = Math.trunc(Number(points));
  if (!userId || !Number.isFinite(delta) || delta === 0 || Math.abs(delta) > 1_000_000) {
    return NextResponse.json({ error: "userId and a non-zero points value are required" }, { status: 400 });
  }
  if (!note?.trim()) {
    return NextResponse.json({ error: "A reason is required" }, { status: 400 });
  }

  await adjustLoyaltyPoints({ userId, points: delta, note: note.trim(), createdBy: auth.userId });
  await logAudit({
    actor: { userId: auth.userId, email: auth.email },
    entityType: "loyalty",
    entityId: userId,
    action: "update",
    summary: `Adjusted iAxis points by ${delta}: ${note.trim()}`,
  });

  const summary = await getLoyaltySummary(userId);
  return NextResponse.json({ balance: summary.balance, tier: summary.tier?.name ?? null });
}
