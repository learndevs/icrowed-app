"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  MapPin, Plus, Pencil, Trash2, Star, X, Check, ChevronLeft,
} from "lucide-react";

interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  district: string;
  province: string | null;
  postalCode: string | null;
  isDefault: boolean;
}

interface FormState {
  label: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  district: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

const EMPTY_FORM: FormState = {
  label: "Home", recipientName: "", phone: "",
  addressLine1: "", addressLine2: "", city: "",
  district: "", province: "", postalCode: "", isDefault: false,
};

const LABEL_OPTIONS = ["Home", "Work", "Other"];

function AddressForm({
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
          <label className="text-sm font-medium mb-1 block">Label</label>
          <select
            className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
          >
            {LABEL_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Recipient Name *</label>
          <input
            required
            className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="Sandun Perera"
            value={form.recipientName}
            onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium mb-1 block">Phone *</label>
          <input
            required
            type="tel"
            className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="+94 77 123 4567"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium mb-1 block">Address Line 1 *</label>
          <input
            required
            className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="123 Main Street"
            value={form.addressLine1}
            onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium mb-1 block">Address Line 2 (optional)</label>
          <input
            className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="Apartment, Suite, etc."
            value={form.addressLine2}
            onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">City *</label>
          <input
            required
            className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="Colombo"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">District *</label>
          <input
            required
            className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="Colombo"
            value={form.district}
            onChange={(e) => setForm({ ...form, district: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Province</label>
          <input
            className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="Western"
            value={form.province}
            onChange={(e) => setForm({ ...form, province: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Postal Code</label>
          <input
            className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="00100"
            value={form.postalCode}
            onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2 sm:col-span-2 pt-1">
          <input
            type="checkbox"
            id="isDefault"
            checked={form.isDefault}
            onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
          />
          <label htmlFor="isDefault" className="text-sm cursor-pointer">
            Set as default address
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : submitLabel}</Button>
      </div>
    </form>
  );
}

export default function AddressesPage() {
  const router = useRouter();
  const [addressList, setAddressList] = useState<Address[]>([]);
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
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/addresses");
      if (res.status === 401) { router.push("/login?next=/account/addresses"); return; }
      if (!res.ok) throw new Error("Failed to load");
      setAddressList(await res.json());
    } catch {
      setError("Failed to load addresses.");
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
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Failed"); }
      setAddForm(EMPTY_FORM);
      setShowAdd(false);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add address");
    } finally {
      setAddSaving(false);
    }
  }

  function startEdit(a: Address) {
    setEditingId(a.id);
    setEditForm({
      label: a.label,
      recipientName: a.recipientName,
      phone: a.phone,
      addressLine1: a.addressLine1,
      addressLine2: a.addressLine2 ?? "",
      city: a.city,
      district: a.district,
      province: a.province ?? "",
      postalCode: a.postalCode ?? "",
      isDefault: a.isDefault,
    });
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setEditSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/addresses/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
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
    try {
      await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      await load();
    } catch {
      setError("Failed to delete address");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSetDefault(id: string) {
    setSettingDefaultId(id);
    try {
      await fetch(`/api/addresses/${id}/set-default`, { method: "POST" });
      await load();
    } catch {
      setError("Failed to set default");
    } finally {
      setSettingDefaultId(null);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Button size="icon" variant="outline" onClick={() => router.push("/account")}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Saved Addresses</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Manage your delivery addresses</p>
        </div>
        <div className="ml-auto">
          <Button onClick={() => { setShowAdd(true); setError(null); }}>
            <Plus className="w-4 h-4" /> Add Address
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
          {error}
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {showAdd && (
        <Card className="mb-4">
          <CardContent className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[var(--color-primary)]" /> New Address
            </h3>
            <AddressForm
              form={addForm} setForm={setAddForm}
              onSubmit={handleAdd} saving={addSaving}
              onCancel={() => setShowAdd(false)} submitLabel="Save Address"
            />
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="py-16 text-center text-[var(--muted)] text-sm">Loading addresses…</div>
      ) : addressList.length === 0 && !showAdd ? (
        <div className="py-16 text-center">
          <MapPin className="w-12 h-12 text-[var(--border)] mx-auto mb-4" />
          <p className="font-semibold mb-1">No saved addresses yet</p>
          <p className="text-sm text-[var(--muted)] mb-6">Add an address to speed up checkout.</p>
          <Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Add Your First Address</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {addressList.map((a) => (
            <Card key={a.id} className={a.isDefault ? "border-[var(--color-primary)]" : ""}>
              <CardContent>
                {editingId === a.id ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Edit Address</h3>
                    <AddressForm
                      form={editForm} setForm={setEditForm}
                      onSubmit={handleEdit} saving={editSaving}
                      onCancel={() => setEditingId(null)} submitLabel="Update"
                    />
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{a.label}</span>
                        {a.isDefault && <Badge variant="primary">Default</Badge>}
                      </div>
                      <p className="font-medium text-[var(--foreground)]">{a.recipientName}</p>
                      <p className="text-[var(--muted)]">{a.phone}</p>
                      <p className="text-[var(--muted)]">
                        {a.addressLine1}
                        {a.addressLine2 ? `, ${a.addressLine2}` : ""}
                      </p>
                      <p className="text-[var(--muted)]">
                        {a.city}, {a.district}
                        {a.province ? `, ${a.province}` : ""}
                        {a.postalCode ? ` ${a.postalCode}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      {!a.isDefault && (
                        <Button
                          size="sm" variant="outline"
                          disabled={settingDefaultId === a.id}
                          onClick={() => handleSetDefault(a.id)}
                          title="Set as default"
                        >
                          <Star className="w-3 h-3" />
                          {settingDefaultId === a.id ? "…" : "Set Default"}
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => startEdit(a)}>
                        <Pencil className="w-3 h-3" /> Edit
                      </Button>
                      {confirmDeleteId === a.id ? (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="border-red-300 text-red-600" disabled={deletingId === a.id} onClick={() => handleDelete(a.id)}>
                            {deletingId === a.id ? "…" : <Check className="w-3 h-3" />}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setConfirmDeleteId(null)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => setConfirmDeleteId(a.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
