"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

interface Offer {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  badgeText: string | null;
  discountPercent: string | null;
  isActive: boolean;
  isFeatured: boolean;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
}

interface FormState {
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  badgeText: string;
  discountPercent: string;
  isActive: boolean;
  isFeatured: boolean;
  startsAt: string;
  endsAt: string;
  sortOrder: string;
}

const EMPTY_FORM: FormState = {
  title: "", description: "", imageUrl: "", linkUrl: "",
  badgeText: "", discountPercent: "", isActive: true, isFeatured: false,
  startsAt: "", endsAt: "", sortOrder: "0",
};

function formToBody(f: FormState) {
  return {
    title: f.title,
    description: f.description || null,
    imageUrl: f.imageUrl || null,
    linkUrl: f.linkUrl || null,
    badgeText: f.badgeText || null,
    discountPercent: f.discountPercent ? Number(f.discountPercent) : null,
    isActive: f.isActive,
    isFeatured: f.isFeatured,
    startsAt: f.startsAt || null,
    endsAt: f.endsAt || null,
    sortOrder: Number(f.sortOrder),
  };
}

function OfferForm({
  form,
  setForm,
  onSubmit,
  saving,
  onCancel,
  submitLabel,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  onCancel: () => void;
  submitLabel: string;
}) {
  const f = form;
  const s = setForm;
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium mb-1 block">Title *</label>
          <input
            required
            className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="Summer Sale — Up to 30% Off"
            value={f.title}
            onChange={(e) => s({ ...f, title: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium mb-1 block">Description</label>
          <textarea
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
            placeholder="Short description shown under the title"
            value={f.description}
            onChange={(e) => s({ ...f, description: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Image URL</label>
          <input
            className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="https://..."
            value={f.imageUrl}
            onChange={(e) => s({ ...f, imageUrl: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Link URL</label>
          <input
            className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="/products?category=..."
            value={f.linkUrl}
            onChange={(e) => s({ ...f, linkUrl: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Badge Text</label>
          <input
            className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="HOT DEAL"
            value={f.badgeText}
            onChange={(e) => s({ ...f, badgeText: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Discount %</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="30"
            value={f.discountPercent}
            onChange={(e) => s({ ...f, discountPercent: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Starts At</label>
          <input
            type="datetime-local"
            className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={f.startsAt}
            onChange={(e) => s({ ...f, startsAt: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Ends At</label>
          <input
            type="datetime-local"
            className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={f.endsAt}
            onChange={(e) => s({ ...f, endsAt: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Sort Order</label>
          <input
            type="number"
            className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={f.sortOrder}
            onChange={(e) => s({ ...f, sortOrder: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={f.isActive} onChange={(e) => s({ ...f, isActive: e.target.checked })} />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={f.isFeatured} onChange={(e) => s({ ...f, isFeatured: e.target.checked })} />
            Featured
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : submitLabel}</Button>
      </div>
    </form>
  );
}

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
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

  async function loadOffers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/offers?all=true");
      if (!res.ok) throw new Error("Failed to load");
      setOffers(await res.json());
    } catch {
      setError("Failed to load offers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadOffers(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToBody(addForm)),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create");
      }
      setAddForm(EMPTY_FORM);
      setShowAdd(false);
      await loadOffers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setAddSaving(false);
    }
  }

  function startEdit(offer: Offer) {
    setEditingId(offer.id);
    setEditForm({
      title: offer.title,
      description: offer.description ?? "",
      imageUrl: offer.imageUrl ?? "",
      linkUrl: offer.linkUrl ?? "",
      badgeText: offer.badgeText ?? "",
      discountPercent: offer.discountPercent ?? "",
      isActive: offer.isActive,
      isFeatured: offer.isFeatured,
      startsAt: offer.startsAt ? offer.startsAt.slice(0, 16) : "",
      endsAt: offer.endsAt ? offer.endsAt.slice(0, 16) : "",
      sortOrder: String(offer.sortOrder),
    });
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setEditSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/offers/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToBody(editForm)),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update");
      }
      setEditingId(null);
      await loadOffers();
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
      const res = await fetch(`/api/offers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete");
      }
      await loadOffers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Offers & Banners</h2>
        <Button onClick={() => { setShowAdd(!showAdd); setError(null); }}>
          <Plus className="w-4 h-4" />
          Add Offer
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
            <h3 className="font-semibold">New Offer</h3>
            <OfferForm
              form={addForm}
              setForm={setAddForm}
              onSubmit={handleAdd}
              saving={addSaving}
              onCancel={() => setShowAdd(false)}
              submitLabel="Save Offer"
            />
          </div>
        </Card>
      )}

      <Card>
        {loading ? (
          <div className="p-8 text-center text-[var(--muted)] text-sm">Loading offers...</div>
        ) : offers.length === 0 ? (
          <div className="p-8 text-center text-[var(--muted)] text-sm">No offers yet. Add one above.</div>
        ) : (
          <div className="space-y-0 divide-y divide-[var(--border)]">
            {offers.map((offer) => (
              <div key={offer.id}>
                {editingId === offer.id ? (
                  <div className="p-4 bg-[var(--surface)]">
                    <h3 className="font-semibold mb-4">Edit: {offer.title}</h3>
                    <OfferForm
                      form={editForm}
                      setForm={setEditForm}
                      onSubmit={handleEdit}
                      saving={editSaving}
                      onCancel={() => setEditingId(null)}
                      submitLabel="Update Offer"
                    />
                  </div>
                ) : (
                  <div className="px-4 py-3 flex flex-wrap items-start justify-between gap-3 hover:bg-[var(--surface)]">
                    <div className="flex items-start gap-4 min-w-0">
                      {offer.imageUrl && (
                        <img
                          src={offer.imageUrl}
                          alt={offer.title}
                          className="w-16 h-12 object-cover rounded-lg shrink-0 border border-[var(--border)]"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{offer.title}</p>
                        {offer.description && (
                          <p className="text-xs text-[var(--muted)] mt-0.5 truncate max-w-xs">{offer.description}</p>
                        )}
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <Badge variant={offer.isActive ? "success" : "error"}>
                            {offer.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {offer.isFeatured && <Badge variant="primary">Featured</Badge>}
                          {offer.badgeText && <Badge variant="warning">{offer.badgeText}</Badge>}
                          {offer.discountPercent && (
                            <Badge variant="default">{offer.discountPercent}% off</Badge>
                          )}
                        </div>
                        {(offer.startsAt || offer.endsAt) && (
                          <p className="text-xs text-[var(--muted)] mt-1">
                            {offer.startsAt && `From ${new Date(offer.startsAt).toLocaleDateString()}`}
                            {offer.startsAt && offer.endsAt && " · "}
                            {offer.endsAt && `Until ${new Date(offer.endsAt).toLocaleDateString()}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => { startEdit(offer); setError(null); }}>
                        <Pencil className="w-3 h-3" /> Edit
                      </Button>
                      {confirmDeleteId === offer.id ? (
                        <div className="flex items-center gap-1.5 text-sm">
                          <span className="text-red-600 font-medium">Delete?</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            disabled={deletingId === offer.id}
                            onClick={() => handleDelete(offer.id)}
                          >
                            {deletingId === offer.id ? "..." : <Check className="w-3 h-3" />}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setConfirmDeleteId(null)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => setConfirmDeleteId(offer.id)}
                        >
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
