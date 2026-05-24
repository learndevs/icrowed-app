"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { FormField } from "@/components/ui/FormField";

type Initial = { taxRatePercent: string | number; taxInclusive: boolean };

export function TaxTab({ initial }: { initial: Initial }) {
  const [taxRate, setTaxRate] = useState(Number(initial.taxRatePercent ?? 0));
  const [inclusive, setInclusive] = useState(Boolean(initial.taxInclusive));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taxRatePercent: taxRate,
          taxInclusive: inclusive,
        }),
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
        <FormField label="Tax rate (%)" hint="Set to 0 to disable tax calculations.">
          <Input
            type="number"
            step="0.01"
            min={0}
            max={100}
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
          />
        </FormField>
        <Switch
          checked={inclusive}
          onChange={setInclusive}
          label="Prices include tax"
          description="If enabled, displayed prices already include tax. Otherwise tax is added at checkout."
        />
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={save} loading={saving}>
            Save tax settings
          </Button>
          {msg && <span className="text-xs text-[var(--muted)]">{msg}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
