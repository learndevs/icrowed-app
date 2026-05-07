"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Switch } from "@/components/ui/Switch";
import { FormField } from "@/components/ui/FormField";

type Initial = {
  notifyOnNewOrder: boolean;
  notifyOnLowStock: boolean;
  notifyOnRefund: boolean;
  notifyOnReview: boolean;
  recipientEmails: string;
};

export function NotificationsTab({ initial }: { initial: Initial }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/settings/notifications", {
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
        <FormField
          label="Recipient emails"
          hint="Comma- or whitespace-separated list. These addresses receive admin alerts."
        >
          <Textarea
            rows={3}
            value={form.recipientEmails}
            onChange={(e) =>
              setForm((f) => ({ ...f, recipientEmails: e.target.value }))
            }
            placeholder="ops@icrowed.lk, owner@icrowed.lk"
          />
        </FormField>

        <div className="space-y-3 pt-2">
          <Switch
            checked={form.notifyOnNewOrder}
            onChange={(v) => setForm((f) => ({ ...f, notifyOnNewOrder: v }))}
            label="New order received"
            description="Email recipients when a customer places an order."
          />
          <Switch
            checked={form.notifyOnLowStock}
            onChange={(v) => setForm((f) => ({ ...f, notifyOnLowStock: v }))}
            label="Low stock alert"
            description="Notify when a product crosses its low-stock threshold."
          />
          <Switch
            checked={form.notifyOnRefund}
            onChange={(v) => setForm((f) => ({ ...f, notifyOnRefund: v }))}
            label="Refund issued"
            description="Notify when an admin issues a refund."
          />
          <Switch
            checked={form.notifyOnReview}
            onChange={(v) => setForm((f) => ({ ...f, notifyOnReview: v }))}
            label="New review submitted"
            description="Notify when a customer submits a review awaiting approval."
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={save} loading={saving}>
            Save notifications
          </Button>
          {msg && <span className="text-xs text-[var(--muted)]">{msg}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
