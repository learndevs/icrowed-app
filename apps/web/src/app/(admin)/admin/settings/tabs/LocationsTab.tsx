"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

type LocationRow = {
  id: string;
  name: string;
  slug: string;
  type: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string;
  country: string;
  phone: string | null;
  hours: string | null;
  description: string | null;
  latitude: string | null;
  longitude: string | null;
  mapEmbedUrl: string | null;
  isActive: boolean;
  sortOrder: number;
};

type FormState = {
  name: string;
  slug: string;
  type: "store" | "pickup";
  addressLine1: string;
  addressLine2: string;
  city: string;
  country: string;
  phone: string;
  hours: string;
  description: string;
  latitude: string;
  longitude: string;
  mapEmbedUrl: string;
  isActive: boolean;
  sortOrder: number;
};

const EMPTY: FormState = {
  name: "",
  slug: "",
  type: "pickup",
  addressLine1: "",
  addressLine2: "",
  city: "",
  country: "Sri Lanka",
  phone: "",
  hours: "",
  description: "",
  latitude: "",
  longitude: "",
  mapEmbedUrl: "",
  isActive: true,
  sortOrder: 0,
};

function toForm(row: LocationRow): FormState {
  return {
    name: row.name ?? "",
    slug: row.slug ?? "",
    type: row.type === "store" ? "store" : "pickup",
    addressLine1: row.addressLine1 ?? "",
    addressLine2: row.addressLine2 ?? "",
    city: row.city ?? "",
    country: row.country ?? "Sri Lanka",
    phone: row.phone ?? "",
    hours: row.hours ?? "",
    description: row.description ?? "",
    latitude: row.latitude ?? "",
    longitude: row.longitude ?? "",
    mapEmbedUrl: row.mapEmbedUrl ?? "",
    isActive: row.isActive,
    sortOrder: row.sortOrder ?? 0,
  };
}

const INPUT =
  "w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20";

export function LocationsTab() {
  const [rows, setRows] = useState<LocationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/locations");
      if (!res.ok) throw new Error("Failed to load");
      setRows(await res.json());
    } catch {
      setError("Failed to load locations. Run migration 0002 if the table is missing.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        editingId ? `/api/admin/locations/${editingId}` : "/api/admin/locations",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Save failed");
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this location?")) return;
    const res = await fetch(`/api/admin/locations/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Delete failed");
      return;
    }
    await load();
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] py-8">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading locations…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold">Store & pickup locations</h3>
          <p className="text-sm text-[var(--muted)] mt-1">
            Powers /locations pages, LocalBusiness schema, and Google Business alignment.
            Fill full addresses for Kandy, Kottawa, and Matara.
          </p>
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 space-y-1">
            <p className="font-semibold">Google ops checklist (do after deploy)</p>
            <ol className="list-decimal pl-4 space-y-0.5">
              <li>Search Console → verify icrowd.lk → submit /sitemap.xml</li>
              <li>Create 3 Google Business Profiles (Kandy shop, Kottawa & Matara pickup)</li>
              <li>Set each GBP website to the matching /locations/… URL</li>
              <li>Match NAP on Facebook/Instagram to these addresses + phone</li>
              <li>Ask Kandy customers for GBP reviews</li>
            </ol>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] text-white text-sm px-3 py-2"
          onClick={() => {
            setEditingId(null);
            setForm(EMPTY);
            setShowForm(true);
          }}
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-4 py-3"
          >
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">
                {row.name}{" "}
                <span className="text-[var(--muted)] font-normal">
                  · {row.type} · /locations/{row.slug}
                </span>
              </p>
              <p className="text-xs text-[var(--muted)] truncate">
                {[row.addressLine1, row.city].filter(Boolean).join(", ")}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-[var(--muted)]/20"
                onClick={() => {
                  setEditingId(row.id);
                  setForm(toForm(row));
                  setShowForm(true);
                }}
                aria-label="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                onClick={() => void remove(row.id)}
                aria-label="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm ? (
        <form onSubmit={save} className="space-y-3 rounded-xl border border-[var(--border)] p-4">
          <h4 className="font-semibold text-sm">
            {editingId ? "Edit location" : "New location"}
          </h4>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-sm space-y-1">
              <span className="font-medium">Name</span>
              <input
                className={INPUT}
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </label>
            <label className="text-sm space-y-1">
              <span className="font-medium">Slug</span>
              <input
                className={INPUT}
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
                placeholder="kandy"
              />
            </label>
            <label className="text-sm space-y-1">
              <span className="font-medium">Type</span>
              <select
                className={INPUT}
                value={form.type}
                onChange={(e) => update("type", e.target.value as "store" | "pickup")}
              >
                <option value="store">Full shop</option>
                <option value="pickup">Pickup point</option>
              </select>
            </label>
            <label className="text-sm space-y-1">
              <span className="font-medium">City</span>
              <input
                className={INPUT}
                required
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
              />
            </label>
            <label className="text-sm space-y-1 sm:col-span-2">
              <span className="font-medium">Address line 1</span>
              <input
                className={INPUT}
                value={form.addressLine1}
                onChange={(e) => update("addressLine1", e.target.value)}
              />
            </label>
            <label className="text-sm space-y-1 sm:col-span-2">
              <span className="font-medium">Address line 2</span>
              <input
                className={INPUT}
                value={form.addressLine2}
                onChange={(e) => update("addressLine2", e.target.value)}
              />
            </label>
            <label className="text-sm space-y-1">
              <span className="font-medium">Phone</span>
              <input
                className={INPUT}
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </label>
            <label className="text-sm space-y-1">
              <span className="font-medium">Hours</span>
              <input
                className={INPUT}
                value={form.hours}
                onChange={(e) => update("hours", e.target.value)}
              />
            </label>
            <label className="text-sm space-y-1 sm:col-span-2">
              <span className="font-medium">SEO description</span>
              <textarea
                className={`${INPUT} h-24 py-2`}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </label>
            <label className="text-sm space-y-1">
              <span className="font-medium">Latitude</span>
              <input
                className={INPUT}
                value={form.latitude}
                onChange={(e) => update("latitude", e.target.value)}
              />
            </label>
            <label className="text-sm space-y-1">
              <span className="font-medium">Longitude</span>
              <input
                className={INPUT}
                value={form.longitude}
                onChange={(e) => update("longitude", e.target.value)}
              />
            </label>
            <label className="text-sm space-y-1 sm:col-span-2">
              <span className="font-medium">Google Maps embed URL</span>
              <input
                className={INPUT}
                value={form.mapEmbedUrl}
                onChange={(e) => update("mapEmbedUrl", e.target.value)}
                placeholder="https://www.google.com/maps/embed?..."
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => update("isActive", e.target.checked)}
            />
            Active (shown on storefront)
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[var(--color-primary)] text-white text-sm px-4 py-2 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className="rounded-lg border border-[var(--border)] text-sm px-4 py-2"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
