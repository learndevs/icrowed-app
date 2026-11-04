import { LOYALTY_NAME } from "@/lib/loyalty-brand";
import {
  getLoyaltyOverview,
  getLoyaltySettings,
  listLoyaltyTiers,
} from "@icrowd/database/queries";
import { LoyaltyAdmin } from "./LoyaltyAdmin";

export const dynamic = "force-dynamic";

export default async function AdminLoyaltyPage() {
  const [settings, tiers, overview] = await Promise.all([
    getLoyaltySettings(),
    listLoyaltyTiers(),
    getLoyaltyOverview(),
  ]);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{LOYALTY_NAME} Loyalty</h1>
        <p className="text-sm text-gray-500 mt-1">
          Points are credited when an order is marked delivered and removed again on refund or cancellation.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          ["Members", overview.members],
          ["Points outstanding", overview.outstanding],
          ["Points issued (lifetime)", overview.issued],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{(value as number).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <LoyaltyAdmin
        initialSettings={{
          enabled: settings.enabled,
          earnType: settings.earnType === "fixed" ? "fixed" : "percentage",
          fixedPoints: settings.fixedPoints,
          earnRate: Number(settings.earnRate),
          earnThreshold: Number(settings.earnThreshold),
          earnMode: settings.earnMode === "per_block" ? "per_block" : "whole_order",
          pointValue: Number(settings.pointValue),
          minRedeemPoints: settings.minRedeemPoints,
          maxRedeemPercent: settings.maxRedeemPercent,
        }}
        initialTiers={tiers.map((t) => ({
          id: t.id,
          name: t.name,
          minSpend: Number(t.minSpend),
          earnMultiplier: Number(t.earnMultiplier),
          perks: t.perks ?? "",
          color: t.color ?? "",
        }))}
      />
    </div>
  );
}
