"use client";

import { useMemo, useState } from "react";
import { Switch } from "@/components/ui/Switch";
import {
  Save,
  Send,
  Eye,
  Code2,
  RotateCcw,
  Check,
  Loader2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TemplateDefault } from "@/lib/email-templates/defaults";

interface Props {
  templateKey: string;
  label: string;
  variables: string[];
  defaultContent: TemplateDefault;
  initial: {
    subject: string;
    bodyHtml: string;
    bodyText: string;
    isActive: boolean;
  };
}

const SAMPLE_VARS: Record<string, string> = {
  customerName: "Jane Perera",
  orderNumber: "ICR-260507-1234",
  total: "12,450",
  refundAmount: "12,450",
  productName: "Samsung Galaxy S25 Ultra",
  variantName: "Phantom Black",
  rating: "5",
  reviewerName: "Kamal Silva",
  trackingNumber: "TRK1234567890",
  courierName: "Pronto Lanka",
  paymentMethod: "Credit / Debit Card (Stripe)",
  currentStock: "3",
  threshold: "10",
  appUrl: "https://icrowed.lk",
};

function renderTpl(tpl: string, vars: Record<string, string>) {
  return tpl.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);
}

const INPUT =
  "w-full h-11 px-4 rounded-xl border border-gray-200 text-sm bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all";

export function TemplateEditor({ templateKey, label: _label, variables, defaultContent, initial }: Props) {
  const [form, setForm] = useState(initial);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showVars, setShowVars] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const previewHtml = useMemo(() => renderTpl(form.bodyHtml, SAMPLE_VARS), [form.bodyHtml]);
  const previewSubject = useMemo(() => renderTpl(form.subject, SAMPLE_VARS), [form.subject]);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/email-templates/${templateKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      setMsg({ type: "success", text: "Template saved successfully." });
    } catch (e: unknown) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "Failed to save." });
    } finally {
      setSaving(false);
    }
  }

  async function sendTest() {
    if (!testTo) { setMsg({ type: "error", text: "Enter a test recipient email." }); return; }
    setTesting(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/email-templates/${templateKey}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testTo, vars: SAMPLE_VARS }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      setMsg({ type: "success", text: `Test email sent to ${testTo}.` });
    } catch (e: unknown) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "Failed to send test." });
    } finally {
      setTesting(false);
    }
  }

  function resetToDefault() {
    setForm((f) => ({
      ...f,
      subject: defaultContent.subject,
      bodyHtml: defaultContent.bodyHtml,
      bodyText: defaultContent.bodyText,
    }));
    setShowReset(false);
    setMsg({ type: "success", text: "Reset to default content. Remember to save." });
  }

  return (
    <div className="space-y-5">

      {/* ── Status message ── */}
      {msg && (
        <div className={cn(
          "flex items-start gap-3 px-4 py-3.5 rounded-xl border text-sm",
          msg.type === "success"
            ? "bg-green-50 border-green-100 text-green-700"
            : "bg-red-50 border-red-100 text-red-600"
        )}>
          {msg.type === "success"
            ? <Check className="w-4 h-4 mt-0.5 shrink-0" />
            : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
          <span className="flex-1">{msg.text}</span>
          <button onClick={() => setMsg(null)} className="shrink-0 opacity-60 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_480px] gap-6 items-start">

        {/* ── Left: Editor ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setTab("edit")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  tab === "edit"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Code2 className="w-3.5 h-3.5" /> Editor
              </button>
              <button
                type="button"
                onClick={() => setTab("preview")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  tab === "preview"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Reset to default */}
              {showReset ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-orange-600">Reset to default?</span>
                  <button
                    type="button"
                    onClick={resetToDefault}
                    className="h-8 px-3 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition-colors"
                  >
                    Yes, reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReset(false)}
                    className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowReset(true)}
                  className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" /> Reset to default
                </button>
              )}

              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="h-8 px-4 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Save
              </button>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Active toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-700">Use custom template</p>
                <p className="text-xs text-gray-400 mt-0.5">When off, the built-in default is used instead</p>
              </div>
              <Switch
                checked={form.isActive}
                onChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              />
            </div>

            {tab === "edit" ? (
              <>
                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject <span className="text-red-400">*</span>
                  </label>
                  <input
                    className={INPUT}
                    placeholder="Your order {{orderNumber}} has been confirmed!"
                    value={form.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  />
                </div>

                {/* HTML Body */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">
                      HTML Body <span className="text-red-400">*</span>
                    </label>
                    <span className="text-xs text-gray-400">Use {"{{variable}}"} placeholders</span>
                  </div>
                  <textarea
                    rows={18}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs bg-white font-mono placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-y"
                    value={form.bodyHtml}
                    onChange={(e) => setForm((f) => ({ ...f, bodyHtml: e.target.value }))}
                  />
                </div>

                {/* Plain text */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Plain-text fallback
                    <span className="ml-2 text-xs font-normal text-gray-400">for clients that don&apos;t render HTML</span>
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none"
                    value={form.bodyText}
                    onChange={(e) => setForm((f) => ({ ...f, bodyText: e.target.value }))}
                  />
                </div>

                {/* Variables */}
                {variables.length > 0 && (
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowVars((v) => !v)}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Available variables ({variables.length})
                      {showVars ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                    {showVars && (
                      <div className="px-4 pb-4 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                        {variables.map((v) => (
                          <button
                            key={v}
                            type="button"
                            title="Click to copy"
                            onClick={() => navigator.clipboard.writeText(`{{${v}}}`)}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-mono border border-indigo-100 hover:bg-indigo-100 transition-colors"
                          >
                            {`{{${v}}}`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Preview tab — shown inside the editor card */
              <div className="rounded-xl border border-gray-100 overflow-hidden bg-gray-50">
                <div className="px-4 py-3 border-b border-gray-100 bg-white">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Subject</p>
                  <p className="text-sm font-semibold text-gray-900">{previewSubject || "—"}</p>
                </div>
                <iframe
                  srcDoc={previewHtml || "<p style='font-family:sans-serif;color:#9ca3af;text-align:center;padding:40px'>No HTML body yet</p>"}
                  className="w-full border-0"
                  style={{ height: 520 }}
                  title="Email preview"
                  sandbox="allow-same-origin"
                />
              </div>
            )}

            {/* Send test */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
              <input
                className={cn(INPUT, "flex-1")}
                placeholder="test@example.com"
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); sendTest(); } }}
              />
              <button
                type="button"
                onClick={sendTest}
                disabled={testing}
                className="h-11 px-5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-2 shrink-0"
              >
                {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Send test
              </button>
            </div>
          </div>
        </div>

        {/* ── Right: Live preview pane (always visible on xl) ── */}
        <div className="hidden xl:block sticky top-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-semibold text-gray-800">Live Preview</span>
              </div>
              <span className="text-xs text-gray-400">Sample data</span>
            </div>

            {/* Subject strip */}
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Subject</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{previewSubject || "—"}</p>
            </div>

            {/* iframe preview */}
            <iframe
              srcDoc={previewHtml || "<p style='font-family:sans-serif;color:#9ca3af;text-align:center;padding:60px 20px'>No HTML body yet.<br/>Start editing to see a preview.</p>"}
              className="w-full border-0"
              style={{ height: 600 }}
              title="Email live preview"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
