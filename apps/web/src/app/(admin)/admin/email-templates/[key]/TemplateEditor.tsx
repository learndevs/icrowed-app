"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Switch } from "@/components/ui/Switch";
import { FormField } from "@/components/ui/FormField";

interface Props {
  templateKey: string;
  label: string;
  variables: string[];
  initial: {
    subject: string;
    bodyHtml: string;
    bodyText: string;
    isActive: boolean;
  };
}

const SAMPLE_VARS: Record<string, string> = {
  customerName: "Jane Doe",
  orderNumber: "ICR-260507-1234",
  total: "12,450",
  refundAmount: "12,450",
  productName: "Nova Airbuds Pro",
  variantName: "Black",
  rating: "5",
  reviewerName: "John Smith",
  trackingNumber: "TRK1234567",
  courierName: "Pronto Lanka",
  paymentMethod: "Credit / Debit Card (Stripe)",
  currentStock: "3",
  threshold: "10",
  appUrl: "https://icrowed.lk",
};

function renderTpl(tpl: string, vars: Record<string, string>) {
  return tpl.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k) => vars[k] ?? "");
}

export function TemplateEditor({ templateKey, label, variables, initial }: Props) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const previewSubject = useMemo(
    () => renderTpl(form.subject, SAMPLE_VARS),
    [form.subject]
  );
  const previewHtml = useMemo(
    () => renderTpl(form.bodyHtml, SAMPLE_VARS),
    [form.bodyHtml]
  );

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/email-templates/${templateKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, label }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      setMsg("Saved.");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function sendTest() {
    if (!testTo) {
      setMsg("Enter a test recipient email.");
      return;
    }
    setTesting(true);
    setMsg(null);
    try {
      const res = await fetch(
        `/api/admin/email-templates/${templateKey}/test`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: testTo, vars: SAMPLE_VARS }),
        }
      );
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      setMsg(`Test sent to ${testTo}.`);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Switch
            checked={form.isActive}
            onChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
            label="Use this custom template"
            description="When disabled, the built-in default template is used instead."
          />

          <FormField label="Subject" required>
            <Input
              value={form.subject}
              onChange={(e) =>
                setForm((f) => ({ ...f, subject: e.target.value }))
              }
              placeholder="Your order {{orderNumber}} has been confirmed!"
            />
          </FormField>

          <FormField
            label="HTML body"
            required
            hint="Use {{variableName}} placeholders. Available below."
          >
            <Textarea
              rows={16}
              value={form.bodyHtml}
              onChange={(e) =>
                setForm((f) => ({ ...f, bodyHtml: e.target.value }))
              }
              className="font-mono text-xs"
            />
          </FormField>

          <FormField
            label="Plain-text body (optional)"
            hint="Fallback for clients that don't render HTML."
          >
            <Textarea
              rows={4}
              value={form.bodyText}
              onChange={(e) =>
                setForm((f) => ({ ...f, bodyText: e.target.value }))
              }
            />
          </FormField>

          {variables.length > 0 && (
            <div>
              <p className="text-xs font-medium text-[var(--muted)] mb-2">
                Available variables
              </p>
              <div className="flex flex-wrap gap-1.5">
                {variables.map((v) => (
                  <code
                    key={v}
                    className="text-[11px] px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)]"
                  >
                    {`{{${v}}}`}
                  </code>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[var(--border)]">
            <Button onClick={save} loading={saving}>
              Save template
            </Button>
            <div className="flex items-center gap-2 ml-auto">
              <Input
                placeholder="test@example.com"
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                className="w-56"
              />
              <Button variant="outline" onClick={sendTest} loading={testing}>
                Send test
              </Button>
            </div>
          </div>
          {msg && <p className="text-xs text-[var(--muted)]">{msg}</p>}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <p className="text-xs text-[var(--muted)]">
          Preview (sample data):
        </p>
        <Card>
          <CardContent className="pt-6">
            <div className="border-b border-[var(--border)] pb-3 mb-3">
              <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                Subject
              </p>
              <p className="text-sm font-medium">{previewSubject || "—"}</p>
            </div>
            <div
              className="text-sm prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: previewHtml || "<em>No body</em>" }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
