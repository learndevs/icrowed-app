"use client";

import { LOYALTY_NAME } from "@/lib/loyalty-brand";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { FormField } from "@/components/ui/FormField";

type Settings = {
  enabled: boolean;
  earnType: "percentage" | "fixed";
  fixedPoints: number;
  earnRate: number;
  earnThreshold: number;
  earnMode: "whole_order" | "per_block";
  pointValue: number;
  minRedeemPoints: number;
  maxRedeemPercent: number;
};

type Tier = {
  id?: string;
  name: string;
  minSpend: number;
  earnMultiplier: number;
  perks: string;
  color: string;
};

export function LoyaltyAdmin({
  initialSettings,
  initialTiers,
}: {
  initialSettings: Settings;
  initialTiers: Tier[];
}) {
  const [s, setS] = useState(initialSettings);
  const [tiers, setTiers] = useState(initialTiers);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [adjUser, setAdjUser] = useState("");
  const [adjPoints, setAdjPoints] = useState(0);
  const [adjNote, setAdjNote] = useState("");
  const [adjMsg, setAdjMsg] = useState<string | null>(null);

  const num = (v: string) => (v === "" ? 0 : Number(v));
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((p) => ({ ...p, [k]: v }));

  function patchTier(i: number, patch: Partial<Tier>) {
    setTiers((p) => p.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/loyalty", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: s, tiers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed");
      setTiers(
        data.tiers.map((t: Record<string, unknown>) => ({
          id: t.id as string,
          name: t.name as string,
          minSpend: Number(t.minSpend),
          earnMultiplier: Number(t.earnMultiplier),
          perks: (t.perks as string) ?? "",
          color: (t.color as string) ?? "",
        })),
      );
      setMsg("Saved.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function adjust() {
    setAdjMsg(null);
    const res = await fetch("/api/admin/loyalty/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: adjUser.trim(), points: adjPoints, note: adjNote }),
    });
    const data = await res.json();
    setAdjMsg(
      res.ok
        ? `Done. New balance: ${data.balance.toLocaleString()} points (${data.tier ?? "no tier"}).`
        : (data?.error ?? "Failed"),
    );
  }

  const example = 12_000;
  const exampleBase =
    s.earnMode === "per_block" && s.earnThreshold > 0
      ? Math.floor(example / s.earnThreshold) * s.earnThreshold
      : example;
  const fixed = s.earnType === "fixed";
  const examplePoints =
    example < s.earnThreshold ? 0 : fixed ? s.fixedPoints : Math.floor(exampleBase * s.earnRate);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Switch
            checked={s.enabled}
            onChange={(v) => set("enabled", v)}
            label={`${LOYALTY_NAME} programme enabled`}
            description="When off, no points are earned or redeemed. Existing balances are kept."
          />

          <FormField label="Earning method">
            <select
              className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm"
              value={s.earnType}
              onChange={(e) => set("earnType", e.target.value as Settings["earnType"])}
            >
              <option value="percentage">Percentage of order total (earn rate)</option>
              <option value="fixed">Fixed points per transaction</option>
            </select>
          </FormField>

          {fixed ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Fixed points per order" hint="Every qualifying order earns exactly this many points. Tier multipliers do not apply.">
                <Input type="number" min={0} value={s.fixedPoints}
                  onChange={(e) => set("fixedPoints", num(e.target.value))} />
              </FormField>
              <FormField label="Minimum order (LKR)" hint="Orders below this earn nothing. Set 0 to reward every order.">
                <Input type="number" min={0} value={s.earnThreshold}
                  onChange={(e) => set("earnThreshold", num(e.target.value))} />
              </FormField>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Earn rate" hint="Points per LKR 1 spent. 0.01 = 1 point per LKR 100.">
                  <Input type="number" step="0.0001" min={0} max={1} value={s.earnRate}
                    onChange={(e) => set("earnRate", num(e.target.value))} />
                </FormField>
                <FormField label="Earn threshold (LKR)" hint="Orders below this earn nothing.">
                  <Input type="number" min={0} value={s.earnThreshold}
                    onChange={(e) => set("earnThreshold", num(e.target.value))} />
                </FormField>
              </div>

              <FormField label="How points are calculated">
                <select
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm"
                  value={s.earnMode}
                  onChange={(e) => set("earnMode", e.target.value as Settings["earnMode"])}
                >
                  <option value="whole_order">Whole order total × rate (once the threshold is reached)</option>
                  <option value="per_block">Each full threshold block × rate</option>
                </select>
              </FormField>
            </>
          )}
          <p className="text-xs text-gray-500">
            Example: an order of LKR {example.toLocaleString()} earns <strong>{examplePoints}</strong> points
            {fixed ? "(fixed)." : "at the base tier."}
          </p>

          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            <FormField label="Point value (LKR)" hint="Discount per point.">
              <Input type="number" step="0.01" min={0} value={s.pointValue}
                onChange={(e) => set("pointValue", num(e.target.value))} />
            </FormField>
            <FormField label="Minimum to redeem" hint="Points. Cannot be lower than 500.">
              <Input type="number" min={500} value={s.minRedeemPoints}
                onChange={(e) => set("minRedeemPoints", num(e.target.value))} />
            </FormField>
            <FormField label="Max % of order" hint="Share of subtotal points can pay.">
              <Input type="number" min={0} max={100} value={s.maxRedeemPercent}
                onChange={(e) => set("maxRedeemPercent", num(e.target.value))} />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Tiers</h2>
              <p className="text-xs text-gray-500">
                Based on lifetime spend. The multiplier scales the points earned on each order.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                setTiers((p) => [...p, { name: "New tier", minSpend: 0, earnMultiplier: 1, perks: "", color: "" }])
              }
            >
              Add tier
            </Button>
          </div>

          {tiers.map((t, i) => (
            <div key={t.id ?? i} className="grid grid-cols-2 sm:grid-cols-12 gap-3 items-end border-t border-gray-100 pt-4">
              <div className="col-span-2 sm:col-span-3">
                <FormField label="Name">
                  <Input value={t.name} onChange={(e) => patchTier(i, { name: e.target.value })} />
                </FormField>
              </div>
              <div className="sm:col-span-3">
                <FormField label="Min spend (LKR)">
                  <Input type="number" min={0} value={t.minSpend}
                    onChange={(e) => patchTier(i, { minSpend: num(e.target.value) })} />
                </FormField>
              </div>
              <div className="sm:col-span-2">
                <FormField label="Multiplier">
                  <Input type="number" step="0.05" min={0} value={t.earnMultiplier}
                    onChange={(e) => patchTier(i, { earnMultiplier: num(e.target.value) })} />
                </FormField>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <FormField label="Perks">
                  <Input value={t.perks} onChange={(e) => patchTier(i, { perks: e.target.value })} />
                </FormField>
              </div>
              <div className="sm:col-span-1">
                <Button
                  variant="outline"
                  disabled={tiers.length <= 1}
                  onClick={() => setTiers((p) => p.filter((_, idx) => idx !== i))}
                >
                  ✕
                </Button>
              </div>
            </div>
          ))}

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={save} loading={saving}>Save {LOYALTY_NAME} settings</Button>
            {msg && <span className="text-sm text-gray-600">{msg}</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="font-semibold text-gray-900">Manual adjustment</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <FormField label="Customer ID" hint="Copy it from the customer page URL.">
              <Input value={adjUser} onChange={(e) => setAdjUser(e.target.value)} />
            </FormField>
            <FormField label="Points (+/−)">
              <Input type="number" value={adjPoints} onChange={(e) => setAdjPoints(num(e.target.value))} />
            </FormField>
            <FormField label="Reason">
              <Input value={adjNote} onChange={(e) => setAdjNote(e.target.value)} />
            </FormField>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={adjust}>Apply adjustment</Button>
            {adjMsg && <span className="text-sm text-gray-600">{adjMsg}</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
