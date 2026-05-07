"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Switch } from "@/components/ui/Switch";
import { Badge } from "@/components/ui/Badge";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Loader2,
  Check,
  Award,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  isActive: boolean;
}

interface FormState {
  name: string;
  logoUrl: string;
  isActive: boolean;
}

const EMPTY: FormState = { name: "", logoUrl: "", isActive: true };

/* ─── Shared input style (matches product pages) ── */
const INPUT =
  "w-full h-11 px-4 rounded-xl border border-gray-200 text-sm bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all";

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

/* ─── Brand Form ─────────────────────────────────── */
function BrandForm({
  form,
  onChange,
  saving,
  onSubmit,
  onCancel,
  submitLabel,
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

      {/* Brand Name */}
      <div>
        <FieldLabel required>Brand Name</FieldLabel>
        <div className="relative">
          <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            required
            autoFocus
            className={cn(INPUT, "pl-10")}
            placeholder="e.g. Samsung"
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
          />
        </div>
      </div>

      {/* Logo URL */}
      <div>
        <FieldLabel>Logo URL</FieldLabel>
        <div className="relative">
          <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            className={cn(INPUT, "pl-10")}
            placeholder="https://example.com/logo.png"
            value={form.logoUrl}
            onChange={(e) => onChange({ ...form, logoUrl: e.target.value })}
          />
        </div>

        {/* Live logo preview */}
        {form.logoUrl && (
          <div className="mt-3 flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.logoUrl}
              alt="Logo preview"
              className="h-10 w-auto max-w-24 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <p className="text-xs text-gray-400">Logo preview</p>
          </div>
        )}
        <p className="mt-1.5 text-xs text-gray-400">Paste a direct image URL. Leave blank if no logo.</p>
      </div>

      {/* Active toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
        <div>
          <p className="text-sm font-semibold text-gray-700">Active</p>
          <p className="text-xs text-gray-400 mt-0.5">Visible to customers on the storefront</p>
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
export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<FormState>(EMPTY);
  const [addSaving, setAddSaving] = useState(false);

  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY);
  const [editSaving, setEditSaving] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/brands?all=true");
      if (!res.ok) throw new Error("Failed to load");
      setBrands(await res.json());
    } catch {
      setError("Failed to load brands.");
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
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name,
          logoUrl: addForm.logoUrl || null,
          isActive: addForm.isActive,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to create");
      setAddForm(EMPTY);
      setShowAdd(false);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create brand");
    } finally {
      setAddSaving(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingBrand) return;
    setEditSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/brands/${editingBrand.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          logoUrl: editForm.logoUrl || null,
          isActive: editForm.isActive,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to update");
      setEditingBrand(null);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update brand");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/brands/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to delete");
      setConfirmDeleteId(null);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete brand");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Brands</h1>
          <p className="text-sm text-gray-400 mt-0.5">{brands.length} brands total</p>
        </div>
        <button
          onClick={() => { setAddForm(EMPTY); setShowAdd(true); setError(null); }}
          className="h-10 px-4 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm shadow-indigo-200"
        >
          <Plus className="w-4 h-4" />
          Add Brand
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="hover:text-red-800 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-sm">Loading brands…</p>
          </div>
        ) : brands.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Award className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No brands yet</p>
            <p className="text-xs text-gray-400">Click &ldquo;Add Brand&rdquo; to create your first one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Brand</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Slug</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Logo</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-widest text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {brands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                          <Award className="w-3.5 h-3.5 text-indigo-500" />
                        </div>
                        <p className="font-semibold text-gray-900">{brand.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">{brand.slug}</span>
                    </td>
                    <td className="px-5 py-4">
                      {brand.logoUrl ? (
                        <div className="w-16 h-10 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden p-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={brand.logoUrl}
                            alt={brand.name}
                            className="h-full w-auto max-w-full object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300 font-medium">No logo</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={brand.isActive ? "success" : "error"}>
                        {brand.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingBrand(brand);
                            setEditForm({ name: brand.name, logoUrl: brand.logoUrl ?? "", isActive: brand.isActive });
                            setError(null);
                          }}
                          className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center gap-1.5"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </button>

                        {confirmDeleteId === brand.id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-red-500">Delete?</span>
                            <button
                              disabled={deletingId === brand.id}
                              onClick={() => handleDelete(brand.id)}
                              className="h-8 px-3 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-1"
                            >
                              {deletingId === brand.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
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
                            onClick={() => setConfirmDeleteId(brand.id)}
                            className="h-8 w-8 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors flex items-center justify-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add Brand Modal ── */}
      <Dialog open={showAdd} onClose={() => setShowAdd(false)} size="sm">
        <div className="p-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Plus className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Add Brand</h2>
              <p className="text-xs text-gray-400 mt-0.5">Create a new product brand</p>
            </div>
          </div>
          <BrandForm
            form={addForm}
            onChange={setAddForm}
            saving={addSaving}
            onSubmit={handleAdd}
            onCancel={() => setShowAdd(false)}
            submitLabel="Create Brand"
          />
        </div>
      </Dialog>

      {/* ── Edit Brand Modal ── */}
      <Dialog open={!!editingBrand} onClose={() => setEditingBrand(null)} size="sm">
        <div className="p-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Pencil className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Edit Brand</h2>
              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-50">{editingBrand?.name}</p>
            </div>
          </div>
          <BrandForm
            form={editForm}
            onChange={setEditForm}
            saving={editSaving}
            onSubmit={handleEdit}
            onCancel={() => setEditingBrand(null)}
            submitLabel="Save Changes"
          />
        </div>
      </Dialog>
    </div>
  );
}
