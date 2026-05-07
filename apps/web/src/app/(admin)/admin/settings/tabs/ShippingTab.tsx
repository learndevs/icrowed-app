"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { formatPrice } from "@/lib/utils";

interface Props {
  initial: {
    standardLkr: number;
    expressLkr: number;
    freeShippingMinSubtotal: number;
  };
}

export function ShippingTab({ initial }: Props) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/shipping-rates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      setMsg("Saved.");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <p className="text-xs text-[var(--muted)]">
          Applies to new checkouts. Existing orders keep their stored totals.
        </p>
        <FormField label="Standard delivery (LKR)">
          <Input
            type="number"
            min={0}
            value={form.standardLkr}
            onChange={(e) =>
              setForm((f) => ({ ...f, standardLkr: Number(e.target.value) }))
            }
          />
        </FormField>
        <FormField label="Express delivery (LKR)">
          <Input
            type="number"
            min={0}
            value={form.expressLkr}
            onChange={(e) =>
              setForm((f) => ({ ...f, expressLkr: Number(e.target.value) }))
            }
          />
        </FormField>
        <FormField
          label="Free standard shipping when items subtotal ≥"
          hint={`Example: ${formatPrice(form.freeShippingMinSubtotal)} or above pays no standard shipping.`}
        >
          <Input
            type="number"
            min={0}
            value={form.freeShippingMinSubtotal}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                freeShippingMinSubtotal: Number(e.target.value),
              }))
            }
          />
        </FormField>
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={save} loading={saving}>
            Save shipping rates
          </Button>
          {msg && <span className="text-xs text-[var(--muted)]">{msg}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
