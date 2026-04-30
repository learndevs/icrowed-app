"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

export default function AdminSettingsPage() {
  const [standardLkr, setStandardLkr] = useState(350);
  const [expressLkr, setExpressLkr] = useState(750);
  const [freeShippingMinSubtotal, setFreeShippingMinSubtotal] = useState(500000);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/shipping-rates")
      .then((r) => r.json())
      .then((d) => {
        if (d.standardLkr != null) {
          setStandardLkr(d.standardLkr);
          setExpressLkr(d.expressLkr);
          setFreeShippingMinSubtotal(d.freeShippingMinSubtotal);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/shipping-rates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          standardLkr,
          expressLkr,
          freeShippingMinSubtotal,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      alert("Shipping rates saved. Checkout will use these values for new orders.");
    } catch (e) {
      console.error(e);
      alert("Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-xl font-bold">Settings</h2>
        <p className="text-sm text-[var(--muted)] mt-1">
          Shipping amounts apply to new checkouts. Existing orders keep their stored totals unless
          you edit them on the order page.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <h3 className="font-semibold text-sm">Shipping rates (LKR)</h3>

          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1">Standard delivery</label>
            <input
              type="number"
              min={0}
              className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm"
              value={standardLkr}
              onChange={(e) => setStandardLkr(Number(e.target.value))}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1">Express delivery</label>
            <input
              type="number"
              min={0}
              className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm"
              value={expressLkr}
              onChange={(e) => setExpressLkr(Number(e.target.value))}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1">
              Free standard shipping when items subtotal is at least
            </label>
            <input
              type="number"
              min={0}
              className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm"
              value={freeShippingMinSubtotal}
              onChange={(e) => setFreeShippingMinSubtotal(Number(e.target.value))}
              disabled={loading}
            />
            <p className="text-xs text-[var(--muted)] mt-1">
              Example: {formatPrice(freeShippingMinSubtotal)} — orders at or above this subtotal pay
              no standard shipping (express still uses the express rate).
            </p>
          </div>

          <Button onClick={save} loading={saving} disabled={loading}>
            Save shipping rates
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
