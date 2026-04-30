"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  MapPin, Plus, Pencil, Trash2, Star, X, Check, ChevronLeft, AlertCircle,
} from "lucide-react";
import Link from "next/link";

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

const inputCls =
  "w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white";
const selectCls =
  "w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white appearance-none";
const labelCls = "text-sm font-semibold text-gray-700 mb-1.5 block";

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
          <label className={labelCls}>Label</label>
          <select className={selectCls} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}>
            {LABEL_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Recipient Name <span className="text-red-400">*</span></label>
          <input required className={inputCls} placeholder="Sandun Perera" value={form.recipientName}
            onChange={(e) => setForm({ ...form, recipientName: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Phone <span className="text-red-400">*</span></label>
          <input required type="tel" className={inputCls} placeholder="+94 77 123 4567" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Address Line 1 <span className="text-red-400">*</span></label>
          <input required className={inputCls} placeholder="123 Main Street" value={form.addressLine1}
            onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>
            Address Line 2 <span className="text-xs font-normal text-gray-400">optional</span>
          </label>
          <input className={inputCls} placeholder="Apartment, Suite, etc." value={form.addressLine2}
            onChange={(e) => setForm({ ...form, addressLine2: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>City <span className="text-red-400">*</span></label>
          <input required className={inputCls} placeholder="Colombo" value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>District <span className="text-red-400">*</span></label>
          <input required className={inputCls} placeholder="Colombo" value={form.district}
            onChange={(e) => setForm({ ...form, district: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>
            Province <span className="text-xs font-normal text-gray-400">optional</span>
          </label>
          <input className={inputCls} placeholder="Western" value={form.province}
            onChange={(e) => setForm({ ...form, province: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>
            Postal Code <span className="text-xs font-normal text-gray-400">optional</span>
          </label>
          <input className={inputCls} placeholder="00100" value={form.postalCode}
            onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 rounded accent-indigo-600"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
              Set as default delivery address
            </span>
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
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
    setShowAdd(false);
    setEditForm({
      label: a.label, recipientName: a.recipientName, phone: a.phone,
      addressLine1: a.addressLine1, addressLine2: a.addressLine2 ?? "",
      city: a.city, district: a.district, province: a.province ?? "",
      postalCode: a.postalCode ?? "", isDefault: a.isDefault,
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
    <div className="bento-bg min-h-screen">
      <div className="px-3 sm:px-5 lg:px-8 py-6 max-w-350 mx-auto space-y-5">

        {/* ── Page header — matches Offers / Categories page pattern ── */}
        <div>
          {/* Breadcrumb */}
          <Link
            href="/account"
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors mb-3"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to Account
          </Link>

          {/* Title row */}
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-bold tracking-widest text-amber-500 uppercase">Delivery</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                Saved Addresses
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Manage your delivery addresses for faster checkout
              </p>
            </div>

            <Button
              onClick={() => { setShowAdd((v) => !v); setEditingId(null); setError(null); }}
              className="shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Address
            </Button>
          </div>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="shrink-0 hover:text-red-800 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Add form ── */}
        {showAdd && (
          <div className="bento-card p-6">
            <h3 className="font-bold text-gray-900 text-base mb-5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              </span>
              New Address
            </h3>
            <AddressForm
              form={addForm} setForm={setAddForm}
              onSubmit={handleAdd} saving={addSaving}
              onCancel={() => setShowAdd(false)} submitLabel="Save Address"
            />
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bento-card p-5 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
                  <div className="flex-1 space-y-2.5 pt-0.5">
                    <div className="h-3.5 w-20 bg-gray-100 rounded-full" />
                    <div className="h-3 w-32 bg-gray-100 rounded-full" />
                    <div className="h-3 w-28 bg-gray-100 rounded-full" />
                    <div className="h-3 w-40 bg-gray-100 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        ) : addressList.length === 0 && !showAdd ? (
          /* ── Empty state ── */
          <div className="bento-card p-16 text-center">
            <div className="w-20 h-20 rounded-3xl bg-amber-50 flex items-center justify-center mx-auto mb-5">
              <MapPin className="w-10 h-10 text-amber-400" />
            </div>
            <p className="font-black text-gray-900 text-lg mb-1">No saved addresses yet</p>
            <p className="text-sm text-gray-400 mb-7 max-w-xs mx-auto leading-relaxed">
              Save a delivery address to speed up your checkout experience.
            </p>
            <Button onClick={() => setShowAdd(true)}>
              <Plus className="w-4 h-4" /> Add Your First Address
            </Button>
          </div>

        ) : (
          /* ── Address grid ── */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {addressList.map((a) => (
              <div
                key={a.id}
                className={`bento-card overflow-hidden ${a.isDefault ? "ring-2 ring-indigo-500 ring-offset-2" : ""}`}
              >
                {editingId === a.id ? (
                  /* Edit form inside card */
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
                      <Pencil className="w-3.5 h-3.5 text-indigo-500" /> Edit Address
                    </h3>
                    <AddressForm
                      form={editForm} setForm={setEditForm}
                      onSubmit={handleEdit} saving={editSaving}
                      onCancel={() => setEditingId(null)} submitLabel="Update Address"
                    />
                  </div>
                ) : (
                  <div className="p-5 flex flex-col h-full">
                    {/* Card header: label + badge + actions */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${a.isDefault ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-400"}`}>
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm text-gray-900">{a.label}</span>
                        {a.isDefault && <Badge variant="primary">Default</Badge>}
                      </div>

                      {/* Action icons */}
                      <div className="flex items-center gap-1">
                        {!a.isDefault && (
                          <button
                            title="Set as default"
                            disabled={settingDefaultId === a.id}
                            onClick={() => handleSetDefault(a.id)}
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-amber-500 hover:bg-amber-50 transition-colors disabled:opacity-40"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          title="Edit"
                          onClick={() => { startEdit(a); setError(null); }}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {confirmDeleteId === a.id ? (
                          <div className="flex items-center gap-1 bg-red-50 border border-red-100 rounded-lg px-2 py-1">
                            <span className="text-xs text-red-600 font-semibold">Delete?</span>
                            <button
                              disabled={deletingId === a.id}
                              onClick={() => handleDelete(a.id)}
                              className="h-5 w-5 rounded flex items-center justify-center text-red-600 hover:bg-red-100 transition-colors disabled:opacity-40"
                            >
                              {deletingId === a.id ? (
                                <span className="w-2.5 h-2.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="h-5 w-5 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            title="Delete"
                            onClick={() => setConfirmDeleteId(a.id)}
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 mb-3" />

                    {/* Address body */}
                    <div className="space-y-0.5 flex-1">
                      <p className="text-sm font-semibold text-gray-900">{a.recipientName}</p>
                      <p className="text-sm text-gray-500">{a.phone}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {a.addressLine1}{a.addressLine2 ? `, ${a.addressLine2}` : ""}
                      </p>
                      <p className="text-sm text-gray-500">
                        {a.city}, {a.district}
                        {a.province ? `, ${a.province}` : ""}
                        {a.postalCode ? ` · ${a.postalCode}` : ""}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
