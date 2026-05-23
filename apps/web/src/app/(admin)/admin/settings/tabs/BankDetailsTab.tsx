"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import type { BankDetails } from "@/lib/bank-details";
import { DEFAULT_BANK_DETAILS } from "@/lib/bank-details";

interface Props {
  initial: BankDetails;
}

export function BankDetailsTab({ initial }: Props) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function update<K extends keyof BankDetails>(key: K, value: BankDetails[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankDetails: form }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      setMsg("Bank details saved.");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  function resetDefaults() {
    setForm(DEFAULT_BANK_DETAILS);
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div>
          <h3 className="text-sm font-semibold">Bank deposit details</h3>
          <p className="text-xs text-[var(--muted)] mt-1">
            Shown to customers who choose bank transfer at checkout and on the order
            confirmation page.
          </p>
        </div>

        <FormField label="Bank name">
          <Input
            value={form.bankName}
            onChange={(e) => update("bankName", e.target.value)}
          />
        </FormField>
        <FormField label="Account name">
          <Input
            value={form.accountName}
            onChange={(e) => update("accountName", e.target.value)}
          />
        </FormField>
        <FormField label="Account number">
          <Input
            value={form.accountNumber}
            onChange={(e) => update("accountNumber", e.target.value)}
          />
        </FormField>
        <FormField label="Branch">
          <Input value={form.branch} onChange={(e) => update("branch", e.target.value)} />
        </FormField>
        <FormField label="Instructions for customers">
          <textarea
            rows={3}
            value={form.instructions}
            onChange={(e) => update("instructions", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
          />
        </FormField>

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={save} loading={saving}>
            Save bank details
          </Button>
          <Button type="button" variant="outline" onClick={resetDefaults}>
            Reset to defaults
          </Button>
          {msg && <span className="text-xs text-[var(--muted)]">{msg}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
