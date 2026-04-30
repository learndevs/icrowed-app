"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

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

const EMPTY_FORM: FormState = {
  code: "", type: "percent", value: "", minOrderAmount: "",
  maxUses: "", isActive: true, expiresAt: "",
};

function formToBody(f: FormState) {
  return {
    code: f.code,
    type: f.type,
    value: f.value,
    minOrderAmount: f.minOrderAmount || null,
    maxUses: f.maxUses || null,
    isActive: f.isActive,
    expiresAt: f.expiresAt || null,
  };
}

function CouponForm({
  form, setForm, onSubmit, saving, onCancel, submitLabel,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Code *</label>
          <input
            required
            className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="SAVE20"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Type *</label>
          <select
            className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as "percent" | "fixed" })}
          >
            <option value="percent">Percentage (%)</option>
            <option value="fixed">Fixed Amount (LKR)</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">
            Value * {form.type === "percent" ? "(0–100%)" : "(LKR)"}
          </label>
          <input
            required
            type="number"
            min="0"
            max={form.type === "percent" ? "100" : undefined}
            step="0.01"
            className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder={form.type === "percent" ? "20" : "500"}
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Min Order Amount (LKR)</label>
          <input
            type="number"
            min="0"
            className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="Optional"
            value={form.minOrderAmount}
            onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Max Uses</label>
          <input
            type="number"
            min="1"
            className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="Unlimited"
            value={form.maxUses}
            onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Expires At</label>
          <input
            type="datetime-local"
            className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={form.expiresAt}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2 pt-5">
          <input
            type="checkbox"
            id="isActive"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          <label htmlFor="isActive" className="text-sm cursor-pointer">Active</label>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : submitLabel}</Button>
      </div>
    </form>
  );
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<FormState>(EMPTY_FORM);
  const [addSaving, setAddSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [editSaving, setEditSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/coupons");
      if (!res.ok) throw new Error("Failed to load");
      setCoupons(await res.json());
    } catch {
      setError("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToBody(addForm)),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Failed"); }
      setAddForm(EMPTY_FORM);
      setShowAdd(false);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setAddSaving(false);
    }
  }

  function startEdit(c: Coupon) {
    setEditingId(c.id);
    setEditForm({
      code: c.code,
      type: c.type as "percent" | "fixed",
      value: c.value,
      minOrderAmount: c.minOrderAmount ?? "",
      maxUses: c.maxUses != null ? String(c.maxUses) : "",
      isActive: c.isActive,
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 16) : "",
    });
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setEditSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/coupons/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToBody(editForm)),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Failed"); }
      setEditingId(null);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setConfirmDeleteId(null);
    setError(null);
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Failed"); }
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  function formatValue(c: Coupon) {
    return c.type === "percent" ? `${c.value}% off` : `LKR ${Number(c.value).toLocaleString()} off`;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Coupons</h2>
        <Button onClick={() => { setShowAdd(!showAdd); setError(null); }}>
          <Plus className="w-4 h-4" /> Add Coupon
        </Button>
      </div>

      {error && (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {showAdd && (
        <Card>
          <div className="p-4 space-y-4">
            <h3 className="font-semibold">New Coupon</h3>
            <CouponForm form={addForm} setForm={setAddForm} onSubmit={handleAdd} saving={addSaving} onCancel={() => setShowAdd(false)} submitLabel="Create Coupon" />
          </div>
        </Card>
      )}

      <Card>
        {loading ? (
          <div className="p-8 text-center text-[var(--muted)] text-sm">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="p-8 text-center text-[var(--muted)] text-sm">No coupons yet. Create one above.</div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {coupons.map((c) => (
              <div key={c.id}>
                {editingId === c.id ? (
                  <div className="p-4 bg-[var(--surface)]">
                    <h3 className="font-semibold mb-4">Edit: {c.code}</h3>
                    <CouponForm form={editForm} setForm={setEditForm} onSubmit={handleEdit} saving={editSaving} onCancel={() => setEditingId(null)} submitLabel="Update Coupon" />
                  </div>
                ) : (
                  <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-[var(--surface)]">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="font-mono font-bold text-sm bg-gray-100 px-2.5 py-1 rounded-lg tracking-wider">
                        {c.code}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant={c.isActive ? "success" : "error"}>
                            {c.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="primary">{formatValue(c)}</Badge>
                          {c.minOrderAmount && (
                            <Badge variant="default">Min LKR {Number(c.minOrderAmount).toLocaleString()}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-[var(--muted)] mt-1">
                          Used {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""} times
                          {c.expiresAt && ` · Expires ${new Date(c.expiresAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => { startEdit(c); setError(null); }}>
                        <Pencil className="w-3 h-3" /> Edit
                      </Button>
                      {confirmDeleteId === c.id ? (
                        <div className="flex items-center gap-1.5 text-sm">
                          <span className="text-red-600 font-medium">Delete?</span>
                          <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" disabled={deletingId === c.id} onClick={() => handleDelete(c.id)}>
                            {deletingId === c.id ? "..." : <Check className="w-3 h-3" />}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setConfirmDeleteId(null)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => setConfirmDeleteId(c.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
