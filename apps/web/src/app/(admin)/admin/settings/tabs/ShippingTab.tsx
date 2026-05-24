"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { formatPrice } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

export interface DeliveryTypeForm {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceLkr: number;
  eligibleForFreeShipping: boolean;
  sortOrder: number;
  isActive: boolean;
}

interface Props {
  initialFreeShippingMin: number;
  initialDeliveryTypes: DeliveryTypeForm[];
}

const EMPTY_NEW = {
  name: "",
  description: "",
  priceLkr: 0,
  eligibleForFreeShipping: false,
  sortOrder: 0,
};

export function ShippingTab({ initialFreeShippingMin, initialDeliveryTypes }: Props) {
  const [freeShippingMinSubtotal, setFreeShippingMinSubtotal] = useState(initialFreeShippingMin);
  const [types, setTypes] = useState<DeliveryTypeForm[]>(initialDeliveryTypes);
  const [newType, setNewType] = useState(EMPTY_NEW);
  const [savingThreshold, setSavingThreshold] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function saveThreshold() {
    setSavingThreshold(true);
    setMsg(null);
    try {
      const res = await fetch("/api/shipping-rates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ freeShippingMinSubtotal }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      setMsg("Free shipping threshold saved.");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setSavingThreshold(false);
    }
  }

  async function saveType(type: DeliveryTypeForm) {
    setSavingId(type.id);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/delivery-types/${type.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: type.name,
          slug: type.slug,
          description: type.description || null,
          priceLkr: type.priceLkr,
          eligibleForFreeShipping: type.eligibleForFreeShipping,
          sortOrder: type.sortOrder,
          isActive: type.isActive,
        }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      const updated = await res.json();
      setTypes((prev) =>
        prev.map((t) =>
          t.id === type.id
            ? {
                ...t,
                ...updated,
                description: updated.description ?? "",
              }
            : t
        )
      );
      setMsg(`Saved "${type.name}".`);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setSavingId(null);
    }
  }

  async function addType() {
    if (!newType.name.trim()) return;
    setAdding(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/delivery-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newType.name,
          description: newType.description || null,
          priceLkr: newType.priceLkr,
          eligibleForFreeShipping: newType.eligibleForFreeShipping,
          sortOrder: newType.sortOrder || types.length,
        }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      const created = await res.json();
      setTypes((prev) => [
        ...prev,
        {
          id: created.id,
          name: created.name,
          slug: created.slug,
          description: created.description ?? "",
          priceLkr: created.priceLkr,
          eligibleForFreeShipping: created.eligibleForFreeShipping,
          sortOrder: created.sortOrder,
          isActive: created.isActive,
        },
      ]);
      setNewType(EMPTY_NEW);
      setMsg(`Added "${created.name}".`);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setAdding(false);
    }
  }

  async function deactivateType(id: string) {
    setSavingId(id);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/delivery-types/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
      setTypes((prev) => prev.filter((t) => t.id !== id));
      setMsg("Delivery type removed from checkout.");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setSavingId(null);
    }
  }

  function patchType(id: string, patch: Partial<DeliveryTypeForm>) {
    setTypes((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <h3 className="text-sm font-semibold">Free shipping threshold</h3>
            <p className="text-xs text-[var(--muted)] mt-1">
              Delivery types marked &quot;eligible for free shipping&quot; become free when the
              cart subtotal reaches this amount.
            </p>
          </div>
          <FormField
            label="Minimum subtotal for free shipping (LKR)"
            hint={`Example: ${formatPrice(freeShippingMinSubtotal)} or above.`}
          >
            <Input
              type="number"
              min={0}
              value={freeShippingMinSubtotal}
              onChange={(e) => setFreeShippingMinSubtotal(Number(e.target.value))}
            />
          </FormField>
          <Button onClick={saveThreshold} loading={savingThreshold}>
            Save threshold
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <h3 className="text-sm font-semibold">Delivery types</h3>
            <p className="text-xs text-[var(--muted)] mt-1">
              Shown on checkout. Prices are in whole LKR. Changes apply to new orders only.
            </p>
          </div>

          <div className="space-y-4">
            {types.map((type) => (
              <div
                key={type.id}
                className="rounded-lg border border-[var(--border)] p-4 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="Name">
                    <Input
                      value={type.name}
                      onChange={(e) => patchType(type.id, { name: e.target.value })}
                    />
                  </FormField>
                  <FormField label="Price (LKR)">
                    <Input
                      type="number"
                      min={0}
                      value={type.priceLkr}
                      onChange={(e) =>
                        patchType(type.id, { priceLkr: Number(e.target.value) })
                      }
                    />
                  </FormField>
                  <FormField label="Description" className="sm:col-span-2">
                    <Input
                      value={type.description}
                      placeholder="e.g. 1–3 business days"
                      onChange={(e) => patchType(type.id, { description: e.target.value })}
                    />
                  </FormField>
                  <FormField label="Sort order">
                    <Input
                      type="number"
                      value={type.sortOrder}
                      onChange={(e) =>
                        patchType(type.id, { sortOrder: Number(e.target.value) })
                      }
                    />
                  </FormField>
                  <label className="flex items-center gap-2 text-sm pt-6">
                    <input
                      type="checkbox"
                      checked={type.eligibleForFreeShipping}
                      onChange={(e) =>
                        patchType(type.id, { eligibleForFreeShipping: e.target.checked })
                      }
                    />
                    Eligible for free shipping
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => saveType(type)}
                    loading={savingId === type.id}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deactivateType(type.id)}
                    disabled={savingId === type.id}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-dashed border-[var(--border)] p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Add delivery type
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Name">
                <Input
                  value={newType.name}
                  placeholder="Standard Delivery"
                  onChange={(e) => setNewType((t) => ({ ...t, name: e.target.value }))}
                />
              </FormField>
              <FormField label="Price (LKR)">
                <Input
                  type="number"
                  min={0}
                  value={newType.priceLkr}
                  onChange={(e) =>
                    setNewType((t) => ({ ...t, priceLkr: Number(e.target.value) }))
                  }
                />
              </FormField>
              <FormField label="Description" className="sm:col-span-2">
                <Input
                  value={newType.description}
                  placeholder="Delivery timeframe or notes"
                  onChange={(e) => setNewType((t) => ({ ...t, description: e.target.value }))}
                />
              </FormField>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={newType.eligibleForFreeShipping}
                  onChange={(e) =>
                    setNewType((t) => ({ ...t, eligibleForFreeShipping: e.target.checked }))
                  }
                />
                Eligible for free shipping
              </label>
            </div>
            <Button size="sm" onClick={addType} loading={adding}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add type
            </Button>
          </div>

          {msg && <p className="text-xs text-[var(--muted)]">{msg}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
