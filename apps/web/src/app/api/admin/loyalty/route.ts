import { NextRequest, NextResponse } from "next/server";
import {
  getLoyaltyOverview,
  getLoyaltySettings,
  listLoyaltyTiers,
  saveLoyaltyTiers,
  updateLoyaltySettings,
} from "@icrowd/database/queries";
import { requireAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const [settings, tiers, overview] = await Promise.all([
    getLoyaltySettings(),
    listLoyaltyTiers(),
    getLoyaltyOverview(),
  ]);
  return NextResponse.json({ settings, tiers, overview });
}

function num(v: unknown, min: number, max: number, label: string): number {
  const n = Number(v);
  if (!Number.isFinite(n) || n < min || n > max) {
    throw new Error(`${label} must be between ${min} and ${max}`);
  }
  return n;
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const s = body.settings ?? {};
    const mode = s.earnMode === "per_block" ? "per_block" : "whole_order";

    const before = await getLoyaltySettings();
    const settings = await updateLoyaltySettings({
      enabled: Boolean(s.enabled),
      earnType: s.earnType === "fixed" ? "fixed" : "percentage",
      fixedPoints: Math.floor(num(s.fixedPoints, 0, 1_000_000, "Fixed points")),
      earnRate: String(num(s.earnRate, 0, 1, "Earn rate")),
      earnThreshold: String(num(s.earnThreshold, 0, 100_000_000, "Earn threshold")),
      earnMode: mode,
      pointValue: String(num(s.pointValue, 0, 100_000, "Point value")),
      minRedeemPoints: Math.floor(num(s.minRedeemPoints, 0, 1_000_000, "Minimum redeem points")),
      maxRedeemPercent: Math.floor(num(s.maxRedeemPercent, 0, 100, "Max redeem percent")),
    });

    let tiers = await listLoyaltyTiers();
    if (Array.isArray(body.tiers)) {
      tiers = await saveLoyaltyTiers(
        body.tiers.map((t: Record<string, unknown>) => ({
          id: typeof t.id === "string" && t.id ? t.id : undefined,
          name: String(t.name ?? "").trim() || "Tier",
          minSpend: num(t.minSpend, 0, 1_000_000_000, "Tier spend"),
          earnMultiplier: num(t.earnMultiplier, 0, 100, "Tier multiplier"),
          perks: t.perks ? String(t.perks) : null,
          color: t.color ? String(t.color) : null,
        })),
      );
    }

    await logAudit({
      actor: { userId: auth.userId, email: auth.email },
      entityType: "loyalty",
      entityId: "settings",
      action: "update",
      summary: "iAxis loyalty settings updated",
      before: before as unknown as Record<string, unknown>,
      after: { ...settings, tiers: tiers.map((t) => t.name) } as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ settings, tiers });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
