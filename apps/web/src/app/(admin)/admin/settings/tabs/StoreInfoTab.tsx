"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";

type Initial = {
  storeName: string;
  storeEmail: string | null;
  supportPhone: string | null;
  currency: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  country: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  socialLinks: unknown;
};

export function StoreInfoTab({ initial }: { initial: Initial }) {
  const [form, setForm] = useState({
    storeName: initial.storeName ?? "iCrowed",
    storeEmail: initial.storeEmail ?? "",
    supportPhone: initial.supportPhone ?? "",
    currency: initial.currency ?? "LKR",
    addressLine1: initial.addressLine1 ?? "",
    addressLine2: initial.addressLine2 ?? "",
    city: initial.city ?? "",
    country: initial.country ?? "Sri Lanka",
    logoUrl: initial.logoUrl ?? "",
    faviconUrl: initial.faviconUrl ?? "",
  });
  const social = (initial.socialLinks ?? {}) as Record<string, string>;
  const [socials, setSocials] = useState({
    facebook: social.facebook ?? "",
    instagram: social.instagram ?? "",
    twitter: social.twitter ?? "",
    tiktok: social.tiktok ?? "",
    youtube: social.youtube ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, socialLinks: socials }),
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Store name" required>
            <Input
              value={form.storeName}
              onChange={(e) => update("storeName", e.target.value)}
            />
          </FormField>
          <FormField label="Currency">
            <Input
              value={form.currency}
              onChange={(e) => update("currency", e.target.value)}
              maxLength={8}
            />
          </FormField>
          <FormField label="Contact email">
            <Input
              type="email"
              value={form.storeEmail}
              onChange={(e) => update("storeEmail", e.target.value)}
            />
          </FormField>
          <FormField label="Support phone">
            <Input
              value={form.supportPhone}
              onChange={(e) => update("supportPhone", e.target.value)}
            />
          </FormField>
        </div>

        <div className="pt-4 border-t border-[var(--border)] space-y-3">
          <h3 className="font-semibold text-sm">Address</h3>
          <FormField label="Address line 1">
            <Input
              value={form.addressLine1}
              onChange={(e) => update("addressLine1", e.target.value)}
            />
          </FormField>
          <FormField label="Address line 2">
            <Input
              value={form.addressLine2}
              onChange={(e) => update("addressLine2", e.target.value)}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="City">
              <Input
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
              />
            </FormField>
            <FormField label="Country">
              <Input
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
              />
            </FormField>
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--border)] space-y-3">
          <h3 className="font-semibold text-sm">Branding</h3>
          <FormField label="Logo URL" hint="https://…">
            <Input
              value={form.logoUrl}
              onChange={(e) => update("logoUrl", e.target.value)}
            />
          </FormField>
          <FormField label="Favicon URL">
            <Input
              value={form.faviconUrl}
              onChange={(e) => update("faviconUrl", e.target.value)}
            />
          </FormField>
        </div>

        <div className="pt-4 border-t border-[var(--border)] space-y-3">
          <h3 className="font-semibold text-sm">Social links</h3>
          {(["facebook", "instagram", "twitter", "tiktok", "youtube"] as const).map(
            (k) => (
              <FormField key={k} label={k.charAt(0).toUpperCase() + k.slice(1)}>
                <Input
                  value={socials[k]}
                  onChange={(e) =>
                    setSocials((s) => ({ ...s, [k]: e.target.value }))
                  }
                />
              </FormField>
            )
          )}
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]">
          <Button onClick={save} loading={saving}>
            Save store info
          </Button>
          {msg && <span className="text-xs text-[var(--muted)]">{msg}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
