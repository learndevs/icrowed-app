"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

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

const EMPTY_FORM: FormState = { name: "", description: "", sortOrder: "0", isActive: true };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
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

  async function loadCategories() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/categories?all=true");
      if (!res.ok) throw new Error("Failed to load");
      setCategories(await res.json());
    } catch {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCategories(); }, []);

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
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create");
      }
      setAddForm(EMPTY_FORM);
      setShowAdd(false);
      await loadCategories();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAddSaving(false);
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditForm({
      name: cat.name,
      description: cat.description ?? "",
      sortOrder: String(cat.sortOrder),
      isActive: cat.isActive,
    });
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/categories/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description || null,
          sortOrder: Number(editForm.sortOrder),
          isActive: editForm.isActive,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update");
      }
      setEditingId(null);
      await loadCategories();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete");
      }
      await loadCategories();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Categories</h2>
        <Button onClick={() => { setShowAdd(!showAdd); setError(null); }}>
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {error && (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Add Form */}
      {showAdd && (
        <Card>
          <form onSubmit={handleAdd} className="p-4 space-y-4">
            <h3 className="font-semibold">New Category</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Name *</label>
                <input
                  required
                  className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="Smartphones"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Sort Order</label>
                <input
                  type="number"
                  className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  value={addForm.sortOrder}
                  onChange={(e) => setAddForm({ ...addForm, sortOrder: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium mb-1 block">Description</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                  placeholder="Optional description"
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
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
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" disabled={addSaving}>{addSaving ? "Saving..." : "Save Category"}</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Categories Table */}
      <Card>
        {loading ? (
          <div className="p-8 text-center text-[var(--muted)] text-sm">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-[var(--muted)] text-sm">No categories yet. Add one above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--surface)]">
                <tr className="text-left text-xs text-[var(--muted)] border-b border-[var(--border)]">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {categories.map((cat) =>
                  editingId === cat.id ? (
                    <tr key={cat.id} className="bg-[var(--surface)]">
                      <td className="px-4 py-2" colSpan={5}>
                        <form onSubmit={handleEdit}>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
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
                              <label className="text-xs font-medium mb-1 block">Description</label>
                              <input
                                className="w-full h-9 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium mb-1 block">Sort Order</label>
                              <input
                                type="number"
                                className="w-full h-9 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                value={editForm.sortOrder}
                                onChange={(e) => setEditForm({ ...editForm, sortOrder: e.target.value })}
                              />
                            </div>
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editForm.isActive}
                                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                                />
                                Active
                              </label>
                              <Button type="submit" size="sm" disabled={editSaving}>
                                <Check className="w-3 h-3" /> {editSaving ? "..." : "Save"}
                              </Button>
                              <Button type="button" size="sm" variant="outline" onClick={() => setEditingId(null)}>
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ) : (
                    <tr key={cat.id} className="hover:bg-[var(--surface)]">
                      <td className="px-4 py-3 font-medium">{cat.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{cat.slug}</td>
                      <td className="px-4 py-3 text-[var(--muted)]">{cat.sortOrder}</td>
                      <td className="px-4 py-3">
                        <Badge variant={cat.isActive ? "success" : "error"}>
                          {cat.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => { startEdit(cat); setError(null); }}>
                            <Pencil className="w-3 h-3" /> Edit
                          </Button>
                          {confirmDeleteId === cat.id ? (
                            <div className="flex items-center gap-1.5 text-sm">
                              <span className="text-red-600 font-medium">Delete?</span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                                disabled={deletingId === cat.id}
                                onClick={() => handleDelete(cat.id)}
                              >
                                {deletingId === cat.id ? "..." : "Yes"}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setConfirmDeleteId(null)}>No</Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => setConfirmDeleteId(cat.id)}
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
