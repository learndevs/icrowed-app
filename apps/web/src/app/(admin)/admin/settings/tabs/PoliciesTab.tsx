"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/ui/FormField";

type PolicyKey = "refund" | "shipping" | "privacy" | "terms";

const POLICY_LABELS: Record<PolicyKey, string> = {
  refund: "Refund policy",
  shipping: "Shipping policy",
  privacy: "Privacy policy",
  terms: "Terms of service",
};

export function PoliciesTab({
  initial,
}: {
  initial: { policies: unknown };
}) {
  const init = (initial.policies ?? {}) as Partial<Record<PolicyKey, string>>;
  const [policies, setPolicies] = useState<Record<PolicyKey, string>>({
    refund: init.refund ?? "",
    shipping: init.shipping ?? "",
    privacy: init.privacy ?? "",
    terms: init.terms ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policies }),
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
          Plain text or HTML. These are surfaced on storefront pages.
        </p>
        {(Object.keys(POLICY_LABELS) as PolicyKey[]).map((k) => (
          <FormField key={k} label={POLICY_LABELS[k]}>
            <Textarea
              rows={5}
              value={policies[k]}
              onChange={(e) =>
                setPolicies((p) => ({ ...p, [k]: e.target.value }))
              }
            />
          </FormField>
        ))}
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={save} loading={saving}>
            Save policies
          </Button>
          {msg && <span className="text-xs text-[var(--muted)]">{msg}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
