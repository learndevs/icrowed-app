"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Switch } from "@/components/ui/Switch";
import { Badge } from "@/components/ui/Badge";
import {
  Plus, Pencil, Trash2, X, AlertCircle, Loader2,
  Check, Ticket, Percent, DollarSign, Shuffle,
  CalendarClock, Users, ShoppingCart, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: string;
  minOrderAmount: string | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

interface FormState {
  code: string;
  type: "percent" | "fixed";
  value: string;
  minOrderAmount: string;
  maxUses: string;
  isActive: boolean;
  expiresAt: string;
}

const EMPTY: FormState = {
  code: "", type: "percent", value: "",
  minOrderAmount: "", maxUses: "", isActive: true, expiresAt: "",
};

function formToBody(f: FormState) {
  return {
    code: f.code.toUpperCase(),
    type: f.type,
    value: f.value,
    minOrderAmount: f.minOrderAmount || null,
    maxUses: f.maxUses || null,
    isActive: f.isActive,
    expiresAt: f.expiresAt || null,
  };
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function formatValue(c: Coupon) {
  return c.type === "percent"
    ? `${c.value}% off`
    : `LKR ${Number(c.value).toLocaleString()} off`;
}

function isExpired(expiresAt: string | null) {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

/* ─── Shared input styles ────────────────────────── */
const INPUT =
  "w-full h-11 px-4 rounded-xl border border-gray-200 text-sm bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all";

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-2">
      <span className="text-sm font-semibold text-gray-700">{children}</span>
      {hint && <span className="ml-1.5 text-xs text-gray-400 font-normal">{hint}</span>}
    </div>
  );
}

/* ─── Coupon Form ─────────────────────────────────── */
function CouponForm({
  form, onChange, saving, onSubmit, onCancel, submitLabel,
}: {
  form: FormState;
  onChange: (f: FormState) => void;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">

      {/* Coupon Code */}
      <div>
        <FieldLabel>Coupon Code <span className="text-red-400">*</span></FieldLabel>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Ticket className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              required
              autoFocus
              className={cn(INPUT, "pl-10 font-mono tracking-widest uppercase font-bold text-gray-900 placeholder:font-normal placeholder:tracking-normal")}
              placeholder="SAVE20"
              value={form.code}
              onChange={(e) => onChange({ ...form, code: e.target.value.toUpperCase() })}
            />
          </div>
          <button
            type="button"
            onClick={() => onChange({ ...form, code: generateCode() })}
            title="Generate random code"
            className="h-11 px-3.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-colors shrink-0"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-1.5 text-xs text-gray-400">Customers enter this code at checkout. Uppercase letters only.</p>
      </div>

      {/* Discount Type */}
      <div>
        <FieldLabel>Discount Type <span className="text-red-400">*</span></FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          {(["percent", "fixed"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onChange({ ...form, type: t, value: "" })}
              className={cn(
                "flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all",
                form.type === t
                  ? t === "percent"
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {t === "percent"
                ? <Percent className="w-4 h-4" />
                : <DollarSign className="w-4 h-4" />}
              {t === "percent" ? "Percentage" : "Fixed Amount"}
            </button>
          ))}
        </div>
      </div>

      {/* Discount Value */}
      <div>
        <FieldLabel>
          {form.type === "percent" ? "Percentage Off" : "Amount Off (LKR)"}
          <span className="text-red-400 ml-0.5">*</span>
        </FieldLabel>
        <div className="relative">
          {form.type === "percent" ? (
            <Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          ) : (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400 pointer-events-none">LKR</span>
          )}
          <input
            required
            type="number"
            min="0"
            max={form.type === "percent" ? "100" : undefined}
            step="0.01"
            className={cn(INPUT, form.type === "percent" ? "pl-10" : "pl-11")}
            placeholder={form.type === "percent" ? "20" : "500"}
            value={form.value}
            onChange={(e) => onChange({ ...form, value: e.target.value })}
          />
          {form.type === "percent" && form.value && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-xs font-bold">
              {form.value}%
            </div>
          )}
        </div>
        {form.type === "percent" && <p className="mt-1.5 text-xs text-gray-400">Enter a value between 1 and 100.</p>}
      </div>

      {/* Min Order + Max Uses */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel hint="(optional)">Min Order</FieldLabel>
          <div className="relative">
            <ShoppingCart className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="number"
              min="0"
              className={cn(INPUT, "pl-10")}
              placeholder="No minimum"
              value={form.minOrderAmount}
              onChange={(e) => onChange({ ...form, minOrderAmount: e.target.value })}
            />
          </div>
          <p className="mt-1.5 text-xs text-gray-400">LKR min cart value</p>
        </div>
        <div>
          <FieldLabel hint="(optional)">Max Uses</FieldLabel>
          <div className="relative">
            <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="number"
              min="1"
              className={cn(INPUT, "pl-10")}
              placeholder="Unlimited"
              value={form.maxUses}
              onChange={(e) => onChange({ ...form, maxUses: e.target.value })}
            />
          </div>
          <p className="mt-1.5 text-xs text-gray-400">Total redemptions</p>
        </div>
      </div>

      {/* Expiry */}
      <div>
        <FieldLabel hint="(optional)">Expiry Date &amp; Time</FieldLabel>
        <div className="relative">
          <CalendarClock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="datetime-local"
            className={cn(INPUT, "pl-10")}
            value={form.expiresAt}
            onChange={(e) => onChange({ ...form, expiresAt: e.target.value })}
          />
        </div>
        <p className="mt-1.5 text-xs text-gray-400">Leave blank for no expiry.</p>
      </div>

      {/* Active */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
        <div>
          <p className="text-sm font-semibold text-gray-700">Active</p>
          <p className="text-xs text-gray-400 mt-0.5">Customers can redeem this coupon</p>
        </div>
        <Switch checked={form.isActive} onChange={(v) => onChange({ ...form, isActive: v })} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2.5 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 px-5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="h-10 px-5 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm shadow-indigo-200"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

/* ─── Page ──────────────────────────────────────── */
export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<FormState>(EMPTY);
  const [addSaving, setAddSaving] = useState(false);

  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY);
  const [editSaving, setEditSaving] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/coupons");
      if (!res.ok) throw new Error("Failed to load");
      setCoupons(await res.json());
    } catch { setError("Failed to load coupons."); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToBody(addForm)),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setAddForm(EMPTY);
      setShowAdd(false);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create coupon");
    } finally { setAddSaving(false); }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCoupon) return;
    setEditSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/coupons/${editingCoupon.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToBody(editForm)),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setEditingCoupon(null);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update coupon");
    } finally { setEditSaving(false); }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setConfirmDeleteId(null);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete coupon");
    } finally { setDeletingId(null); }
  }

  function openEdit(c: Coupon) {
    setEditingCoupon(c);
    setEditForm({
      code: c.code,
      type: c.type as "percent" | "fixed",
      value: c.value,
      minOrderAmount: c.minOrderAmount ?? "",
      maxUses: c.maxUses != null ? String(c.maxUses) : "",
      isActive: c.isActive,
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 16) : "",
    });
    setError(null);
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-400 mt-0.5">{coupons.length} coupon{coupons.length !== 1 ? "s" : ""} total</p>
        </div>
        <button
          onClick={() => { setAddForm(EMPTY); setShowAdd(true); setError(null); }}
          className="h-10 px-4 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm shadow-indigo-200"
        >
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="hover:text-red-800 shrink-0"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Coupon List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-sm">Loading coupons…</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Ticket className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No coupons yet</p>
            <p className="text-xs text-gray-400">Click &ldquo;Add Coupon&rdquo; to create your first discount code.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {coupons.map((c) => {
              const expired = isExpired(c.expiresAt);
              const usagePct = c.maxUses ? Math.min(100, (c.usedCount / c.maxUses) * 100) : null;

              return (
                <div key={c.id} className="px-5 py-4 hover:bg-gray-50/60 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-4">

                    {/* Left: code + details */}
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Discount type icon */}
                      <div className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                        c.type === "percent" ? "bg-indigo-50" : "bg-emerald-50"
                      )}>
                        {c.type === "percent"
                          ? <Percent className="w-5 h-5 text-indigo-500" />
                          : <DollarSign className="w-5 h-5 text-emerald-500" />}
                      </div>

                      <div className="min-w-0">
                        {/* Code + status row */}
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="font-mono font-bold text-sm tracking-widest bg-gray-100 text-gray-800 px-2.5 py-1 rounded-lg">
                            {c.code}
                          </span>
                          <span className={cn(
                            "text-xs font-bold px-2.5 py-1 rounded-full",
                            c.type === "percent"
                              ? "bg-indigo-50 text-indigo-700"
                              : "bg-emerald-50 text-emerald-700"
                          )}>
                            {formatValue(c)}
                          </span>
                          <Badge variant={!c.isActive || expired ? "error" : "success"}>
                            {expired ? "Expired" : c.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>

                        {/* Meta row */}
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Usage */}
                          <div className="flex items-center gap-1.5">
                            <Zap className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""} uses
                            </span>
                            {usagePct !== null && (
                              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={cn("h-full rounded-full transition-all", usagePct >= 80 ? "bg-red-400" : "bg-indigo-400")}
                                  style={{ width: `${usagePct}%` }}
                                />
                              </div>
                            )}
                          </div>

                          {c.minOrderAmount && (
                            <div className="flex items-center gap-1">
                              <ShoppingCart className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">Min LKR {Number(c.minOrderAmount).toLocaleString()}</span>
                            </div>
                          )}

                          {c.expiresAt && (
                            <div className="flex items-center gap-1">
                              <CalendarClock className="w-3 h-3 text-gray-400" />
                              <span className={cn("text-xs", expired ? "text-red-500 font-medium" : "text-gray-500")}>
                                {expired ? "Expired " : "Expires "}
                                {new Date(c.expiresAt).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openEdit(c)}
                        className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center gap-1.5"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>

                      {confirmDeleteId === c.id ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-red-500">Delete?</span>
                          <button
                            disabled={deletingId === c.id}
                            onClick={() => handleDelete(c.id)}
                            className="h-8 px-3 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-1"
                          >
                            {deletingId === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(c.id)}
                          className="h-8 w-8 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Add Coupon Modal ── */}
      <Dialog open={showAdd} onClose={() => setShowAdd(false)} size="sm">
        <div className="p-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Plus className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Add Coupon</h2>
              <p className="text-xs text-gray-400 mt-0.5">Create a new discount code</p>
            </div>
          </div>
          <CouponForm
            form={addForm}
            onChange={setAddForm}
            saving={addSaving}
            onSubmit={handleAdd}
            onCancel={() => setShowAdd(false)}
            submitLabel="Create Coupon"
          />
        </div>
      </Dialog>

      {/* ── Edit Coupon Modal ── */}
      <Dialog open={!!editingCoupon} onClose={() => setEditingCoupon(null)} size="sm">
        <div className="p-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Pencil className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Edit Coupon</h2>
              <p className="text-xs font-mono font-bold text-indigo-600 mt-0.5 tracking-widest">{editingCoupon?.code}</p>
            </div>
          </div>
          <CouponForm
            form={editForm}
            onChange={setEditForm}
            saving={editSaving}
            onSubmit={handleEdit}
            onCancel={() => setEditingCoupon(null)}
            submitLabel="Save Changes"
          />
        </div>
      </Dialog>
    </div>
  );
}
