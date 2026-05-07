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
  Tag,
  Hash,
  AlignLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface FormState {
  name: string;
  description: string;
  sortOrder: string;
  isActive: boolean;
}

const EMPTY: FormState = { name: "", description: "", sortOrder: "0", isActive: true };

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

/* ─── Category Form (used inside both modals) ───── */
function CategoryForm({
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
      {/* Name */}
      <div>
        <FieldLabel required>Category Name</FieldLabel>
        <div className="relative">
          <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            required
            autoFocus
            className={cn(INPUT, "pl-10")}
            placeholder="e.g. Smartphones"
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <FieldLabel>Description</FieldLabel>
        <div className="relative">
          <AlignLeft className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
          <textarea
            rows={3}
            className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 text-sm bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none"
            placeholder="Brief description of this category…"
            value={form.description}
            onChange={(e) => onChange({ ...form, description: e.target.value })}
          />
        </div>
      </div>

      {/* Sort Order */}
      <div>
        <FieldLabel>Sort Order</FieldLabel>
        <div className="relative">
          <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="number"
            className={cn(INPUT, "pl-10")}
            placeholder="0"
            value={form.sortOrder}
            onChange={(e) => onChange({ ...form, sortOrder: e.target.value })}
          />
        </div>
        <p className="mt-1.5 text-xs text-gray-400">Lower numbers appear first in navigation.</p>
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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<FormState>(EMPTY);
  const [addSaving, setAddSaving] = useState(false);

  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY);
  const [editSaving, setEditSaving] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/categories?all=true");
      if (!res.ok) throw new Error("Failed to load");
      setCategories(await res.json());
    } catch {
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name,
          description: addForm.description || null,
          sortOrder: Number(addForm.sortOrder),
          isActive: addForm.isActive,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to create");
      setAddForm(EMPTY);
      setShowAdd(false);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setAddSaving(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCat) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/categories/${editingCat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description || null,
          sortOrder: Number(editForm.sortOrder),
          isActive: editForm.isActive,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to update");
      setEditingCat(null);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update category");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to delete");
      setConfirmDeleteId(null);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-400 mt-0.5">{categories.length} categories total</p>
        </div>
        <button
          onClick={() => { setAddForm(EMPTY); setShowAdd(true); setError(null); }}
          className="h-10 px-4 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm shadow-indigo-200"
        >
          <Plus className="w-4 h-4" />
          Add Category
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
            <p className="text-sm">Loading categories…</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Tag className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No categories yet</p>
            <p className="text-xs text-gray-400">Click &ldquo;Add Category&rdquo; to create your first one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Name</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Slug</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Order</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-widest text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                          <Tag className="w-3.5 h-3.5 text-indigo-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{cat.name}</p>
                          {cat.description && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{cat.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">{cat.slug}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 font-medium">{cat.sortOrder}</td>
                    <td className="px-5 py-4">
                      <Badge variant={cat.isActive ? "success" : "error"}>
                        {cat.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingCat(cat);
                            setEditForm({
                              name: cat.name,
                              description: cat.description ?? "",
                              sortOrder: String(cat.sortOrder),
                              isActive: cat.isActive,
                            });
                            setError(null);
                          }}
                          className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center gap-1.5"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </button>

                        {confirmDeleteId === cat.id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-red-500">Delete?</span>
                            <button
                              disabled={deletingId === cat.id}
                              onClick={() => handleDelete(cat.id)}
                              className="h-8 px-3 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-1"
                            >
                              {deletingId === cat.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
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
                            onClick={() => setConfirmDeleteId(cat.id)}
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

      {/* ── Add Category Modal ── */}
      <Dialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        size="sm"
      >
        <div className="p-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Plus className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Add Category</h2>
              <p className="text-xs text-gray-400 mt-0.5">Create a new product category</p>
            </div>
          </div>

          <CategoryForm
            form={addForm}
            onChange={setAddForm}
            saving={addSaving}
            onSubmit={handleAdd}
            onCancel={() => setShowAdd(false)}
            submitLabel="Create Category"
          />
        </div>
      </Dialog>

      {/* ── Edit Category Modal ── */}
      <Dialog
        open={!!editingCat}
        onClose={() => setEditingCat(null)}
        size="sm"
      >
        <div className="p-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Pencil className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Edit Category</h2>
              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-50">{editingCat?.name}</p>
            </div>
          </div>

          <CategoryForm
            form={editForm}
            onChange={setEditForm}
            saving={editSaving}
            onSubmit={handleEdit}
            onCancel={() => setEditingCat(null)}
            submitLabel="Save Changes"
          />
        </div>
      </Dialog>
    </div>
  );
}
