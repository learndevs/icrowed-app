"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/ui/FormField";
import { parseContactPage } from "@/lib/contact-page";

type Initial = {
  storeEmail: string | null;
  supportPhone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  country: string | null;
  socialLinks: unknown;
  contactPage: unknown;
};

export function ContactTab({ initial }: { initial: Initial }) {
  const page = parseContactPage(initial.contactPage);
  const social = (initial.socialLinks ?? {}) as Record<string, string>;

  const [form, setForm] = useState({
    heading: page.heading,
    subtitle: page.subtitle,
    storeEmail: initial.storeEmail ?? "",
    supportPhone: initial.supportPhone ?? "",
    phone2: page.phone2,
    addressLine1: initial.addressLine1 ?? "",
    addressLine2: initial.addressLine2 ?? "",
    city: initial.city ?? "",
    country: initial.country ?? "Sri Lanka",
  });
  const [socials, setSocials] = useState({
    facebook: social.facebook ?? "",
    instagram: social.instagram ?? "",
    whatsapp: social.whatsapp ?? "",
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
        body: JSON.stringify({
          storeEmail: form.storeEmail,
          supportPhone: form.supportPhone,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2,
          city: form.city,
          country: form.country,
          socialLinks: socials,
          contactPage: {
            heading: form.heading,
            subtitle: form.subtitle,
            phone2: form.phone2,
          },
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
        <p className="text-sm text-[var(--muted)]">
          Configure the public Contact Us page. Changes appear on{" "}
          <span className="font-medium text-[var(--foreground)]">/contact</span>{" "}
          and in the site footer.
        </p>

        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Page content</h3>
          <FormField label="Heading">
            <Input
              value={form.heading}
              onChange={(e) => update("heading", e.target.value)}
            />
          </FormField>
          <FormField label="Subtitle">
            <Textarea
              value={form.subtitle}
              onChange={(e) => update("subtitle", e.target.value)}
              rows={3}
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
          <h3 className="font-semibold text-sm">Contact numbers</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Primary phone">
              <Input
                value={form.supportPhone}
                onChange={(e) => update("supportPhone", e.target.value)}
                placeholder="+94 77 123 4567"
              />
            </FormField>
            <FormField label="Secondary phone">
              <Input
                value={form.phone2}
                onChange={(e) => update("phone2", e.target.value)}
                placeholder="+94 11 234 5678"
              />
            </FormField>
          </div>
          <FormField label="Email">
            <Input
              type="email"
              value={form.storeEmail}
              onChange={(e) => update("storeEmail", e.target.value)}
            />
          </FormField>
        </div>

        <div className="pt-4 border-t border-[var(--border)] space-y-3">
          <h3 className="font-semibold text-sm">Social links</h3>
          {(["facebook", "instagram", "whatsapp"] as const).map((k) => (
            <FormField
              key={k}
              label={k.charAt(0).toUpperCase() + k.slice(1)}
              hint={k === "whatsapp" ? "Phone number or wa.me link" : "https://…"}
            >
              <Input
                value={socials[k]}
                onChange={(e) =>
                  setSocials((s) => ({ ...s, [k]: e.target.value }))
                }
              />
            </FormField>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]">
          <Button onClick={save} loading={saving}>
            Save contact page
          </Button>
          {msg && <span className="text-xs text-[var(--muted)]">{msg}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
