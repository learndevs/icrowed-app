import { NextResponse } from "next/server";
import { getLoyaltySummary } from "@icrowd/database/queries";
import { getSessionUser } from "@/lib/session";

/** Signed-in customer's points balance, tier and redemption rules (used by checkout). */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const s = await getLoyaltySummary(user.id);
  return NextResponse.json({
    enabled: s.settings.enabled,
    balance: s.balance,
    tier: s.tier ? { name: s.tier.name, earnMultiplier: Number(s.tier.earnMultiplier) } : null,
    pointValue: Number(s.settings.pointValue),
    minRedeemPoints: Math.max(500, s.settings.minRedeemPoints),
    maxRedeemPercent: s.settings.maxRedeemPercent,
    earnRate: Number(s.settings.earnRate),
    earnThreshold: Number(s.settings.earnThreshold),
  });
}
