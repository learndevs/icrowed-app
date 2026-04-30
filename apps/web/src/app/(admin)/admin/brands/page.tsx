"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  isActive: boolean;
}

interface FormState {
  name: string;
  slug: string;
  logoUrl: string;
  isActive: boolean;
}

const EMPTY_FORM: FormState = { name: "", slug: "", logoUrl: "", isActive: true };

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "");
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
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

  async function loadBrands() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/brands?all=true");
      if (!res.ok) throw new Error("Failed to load");
      setBrands(await res.json());
    } catch {
      setError("Failed to load brands");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBrands();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddSaving(true);
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name,
          slug: addForm.slug.trim() || undefined,
          logoUrl: addForm.logoUrl.trim() || null,
          isActive: addForm.isActive,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create");
      }
      setAddForm(EMPTY_FORM);
      setShowAdd(false);
      await loadBrands();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create brand");
    } finally {
      setAddSaving(false);
    }
  }

  function startEdit(b: Brand) {
    setEditingId(b.id);
    setEditForm({
      name: b.name,
      slug: b.slug,
      logoUrl: b.logoUrl ?? "",
      isActive: b.isActive,
    });
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/brands/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          slug: editForm.slug.trim() || slugify(editForm.name),
          logoUrl: editForm.logoUrl.trim() || null,
          isActive: editForm.isActive,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update");
      }
      setEditingId(null);
      await loadBrands();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`/api/brands/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete");
      }
      await loadBrands();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Brands</h2>
          <p className="text-sm text-[var(--muted)]">
            Brands are stored in the database and linked from each product. Storefront categories page
            lists active brands automatically.
          </p>
        </div>
        <Button
          onClick={() => {
            setShowAdd(!showAdd);
            setError(null);
          }}
        >
          <Plus className="w-4 h-4" />
          Add brand
        </Button>
      </div>

      {error && (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
          <button type="button" onClick={() => setError(null)} aria-label="Dismiss">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {showAdd && (
        <Card>
          <form onSubmit={handleAdd} className="p-4 space-y-4">
            <h3 className="font-semibold">New brand</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Name *</label>
                <input
                  required
                  className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="Samsung"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Slug (optional)</label>
                <input
                  className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-mono text-xs"
                  placeholder="samsung — auto from name if empty"
                  value={addForm.slug}
                  onChange={(e) => setAddForm({ ...addForm, slug: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium mb-1 block">Logo URL</label>
                <input
                  className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="https://…"
                  value={addForm.logoUrl}
                  onChange={(e) => setAddForm({ ...addForm, logoUrl: e.target.value })}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addForm.isActive}
                    onChange={(e) => setAddForm({ ...addForm, isActive: e.target.checked })}
                  />
                  Active
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addSaving}>
                {addSaving ? "Saving…" : "Save brand"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {loading ? (
          <div className="p-8 text-center text-[var(--muted)] text-sm">Loading brands…</div>
        ) : brands.length === 0 ? (
          <div className="p-8 text-center text-[var(--muted)] text-sm">No brands yet. Add one above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--surface)]">
                <tr className="text-left text-xs text-[var(--muted)] border-b border-[var(--border)]">
                  <th className="px-4 py-3 font-medium w-16">Logo</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {brands.map((b) =>
                  editingId === b.id ? (
                    <tr key={b.id} className="bg-[var(--surface)]">
                      <td className="px-4 py-2" colSpan={5}>
                        <form onSubmit={handleEdit}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                            <div>
                              <label className="text-xs font-medium mb-1 block">Name *</label>
                              <input
                                required
                                className="w-full h-9 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium mb-1 block">Slug *</label>
                              <input
                                required
                                className="w-full h-9 px-3 rounded-lg border border-[var(--border)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                value={editForm.slug}
                                onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                              />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-1">
                              <label className="text-xs font-medium mb-1 block">Logo URL</label>
                              <input
                                className="w-full h-9 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                value={editForm.logoUrl}
                                onChange={(e) => setEditForm({ ...editForm, logoUrl: e.target.value })}
                              />
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editForm.isActive}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, isActive: e.target.checked })
                                  }
                                />
                                Active
                              </label>
                              <Button type="submit" size="sm" disabled={editSaving}>
                                <Check className="w-3 h-3" /> {editSaving ? "…" : "Save"}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingId(null)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ) : (
                    <tr key={b.id} className="hover:bg-[var(--surface)]">
                      <td className="px-4 py-3">
                        <div className="h-10 w-10 rounded-lg bg-[var(--surface)] border border-[var(--border)] overflow-hidden flex items-center justify-center text-[10px] font-bold text-[var(--muted)]">
                          {b.logoUrl ? (
                            <img
                              src={b.logoUrl}
                              alt={b.name}
                              className="h-full w-full object-contain p-0.5"
                            />
                          ) : (
                            b.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{b.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{b.slug}</td>
                      <td className="px-4 py-3">
                        <Badge variant={b.isActive ? "success" : "error"}>
                          {b.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              startEdit(b);
                              setError(null);
                            }}
                          >
                            <Pencil className="w-3 h-3" /> Edit
                          </Button>
                          {confirmDeleteId === b.id ? (
                            <div className="flex items-center gap-1.5 text-sm">
                              <span className="text-red-600 font-medium">Deactivate?</span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                                disabled={deletingId === b.id}
                                onClick={() => handleDelete(b.id)}
                              >
                                {deletingId === b.id ? "…" : "Yes"}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setConfirmDeleteId(null)}>
                                No
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => setConfirmDeleteId(b.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
