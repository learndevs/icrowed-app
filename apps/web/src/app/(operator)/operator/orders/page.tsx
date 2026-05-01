"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { formatPrice, formatDate } from "@/lib/utils";

type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

interface OrderItem {
  id: string;
  productName: string;
  variantName: string | null;
  quantity: number;
  unitPrice: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shippingAddressLine1: string;
  shippingCity: string;
  shippingDistrict: string;
  total: string;
  status: OrderStatus;
  trackingNumber: string | null;
  courierName: string | null;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_BADGE: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  pending: "warning",
  confirmed: "primary",
  processing: "primary",
  shipped: "default",
  delivered: "success",
  cancelled: "error",
};

const STATUSES: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const COURIERS = ["Domex", "Kapruka", "Lanka Sathosa Express", "Sendbiz", "PickMe Delivery"];

export default function OperatorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ status: OrderStatus; tracking: string; courier: string }>({
    status: "pending",
    tracking: "",
    courier: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function loadOrders() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders?limit=100");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadOrders(); }, []);

  function startEdit(order: Order) {
    setEditId(order.id);
    setSaveError(null);
    setDraft({
      status: order.status,
      tracking: order.trackingNumber ?? "",
      courier: order.courierName ?? "",
    });
  }

  async function saveEdit(orderId: string) {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: draft.status,
          trackingNumber: draft.tracking,
          courierName: draft.courier,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }
      setEditId(null);
      await loadOrders();
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-sm text-[var(--muted)]">
        Loading orders…
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 text-sm text-[var(--muted)]">No orders yet.</div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          Orders <span className="text-sm font-normal text-[var(--muted)]">({orders.length})</span>
        </h2>
        <Button size="sm" variant="outline" onClick={loadOrders}>Refresh</Button>
      </div>

      <div className="space-y-4">
        {orders.map((o) => (
          <Card key={o.id}>
            <CardContent className="space-y-3">
              {/* Header row */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-[var(--muted)]">{o.orderNumber}</p>
                  <p className="font-semibold">{o.customerName}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {o.customerPhone} · {o.shippingAddressLine1}, {o.shippingCity}
                  </p>
                  <p className="text-xs text-[var(--muted)]">{formatDate(o.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={STATUS_BADGE[o.status] ?? "default"}>{o.status}</Badge>
                  <Badge variant={o.paymentStatus === "paid" ? "success" : "warning"}>
                    {o.paymentStatus}
                  </Badge>
                  <span className="font-bold text-sm">{formatPrice(Number(o.total))}</span>
                </div>
              </div>

              {/* Items summary */}
              <div className="text-xs text-[var(--muted)] space-y-0.5">
                {o.items.map((item) => (
                  <p key={item.id}>
                    {item.quantity}× {item.productName}
                    {item.variantName ? ` (${item.variantName})` : ""}
                  </p>
                ))}
              </div>

              {/* Existing tracking */}
              {o.trackingNumber && editId !== o.id && (
                <p className="text-xs text-[var(--muted)]">
                  Tracking:{" "}
                  <span className="font-mono font-medium text-[var(--foreground)]">{o.trackingNumber}</span>
                  {o.courierName ? ` via ${o.courierName}` : ""}
                </p>
              )}

              {/* Edit panel */}
              {editId === o.id ? (
                <div className="border border-[var(--border)] rounded-xl p-4 space-y-3 bg-[var(--surface)]">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium mb-1 block">Status</label>
                      <select
                        className="w-full h-9 px-3 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        value={draft.status}
                        onChange={(e) => setDraft({ ...draft, status: e.target.value as OrderStatus })}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Tracking #</label>
                      <input
                        className="w-full h-9 px-3 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        value={draft.tracking}
                        onChange={(e) => setDraft({ ...draft, tracking: e.target.value })}
                        placeholder="DOMEX-XXXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Courier</label>
                      <select
                        className="w-full h-9 px-3 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        value={draft.courier}
                        onChange={(e) => setDraft({ ...draft, courier: e.target.value })}
                      >
                        <option value="">— Select —</option>
                        {COURIERS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  {saveError && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      {saveError}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" disabled={saving} onClick={() => saveEdit(o.id)}>
                      {saving ? "Saving…" : "Save"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => startEdit(o)}>
                  Update Status / Tracking
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
