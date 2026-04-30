"use client";

import { useState } from "react";
import { useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";

const STATUS_BADGE: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  pending: "warning",
  confirmed: "primary",
  processing: "primary",
  shipped: "default",
  delivered: "success",
  cancelled: "error",
};

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

type OperatorOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string | null;
  shippingCity: string;
  shippingDistrict: string;
  shippingProvince?: string | null;
  total: string;
  status: string;
  trackingNumber?: string | null;
  courierName?: string | null;
};

export default function OperatorOrdersPage() {
  const [orders, setOrders] = useState<OperatorOrder[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [updates, setUpdates] = useState<{ status: string; tracking: string; courier: string }>({ status: "", tracking: "", courier: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error("Failed to load orders");
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error(error);
      }
    }
    void loadOrders();
  }, []);

  function startEdit(order: OperatorOrder) {
    setEditId(order.id);
    setUpdates({
      status: order.status,
      tracking: order.trackingNumber ?? "",
      courier: order.courierName ?? "",
    });
  }

  async function saveEdit(id: string) {
    setSaving(true);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: id,
          status: updates.status,
          trackingNumber: updates.tracking,
          courierName: updates.courier,
          note: "Updated by operator dashboard",
        }),
      });
      if (!res.ok) throw new Error("Failed to save order update");

      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
                ...o,
                status: updates.status,
                trackingNumber: updates.tracking,
                courierName: updates.courier,
              }
            : o
        )
      );
      setEditId(null);
    } catch (error) {
      console.error(error);
      alert("Unable to update order.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">Orders</h2>
      <div className="space-y-4">
        {orders.map((o) => (
          <Card key={o.id}>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-[var(--muted)]">{o.orderNumber}</p>
                  <p className="font-semibold">{o.customerName}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {o.customerPhone} · {[o.shippingAddressLine1, o.shippingAddressLine2, o.shippingCity, o.shippingDistrict, o.shippingProvince].filter(Boolean).join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={STATUS_BADGE[o.status] ?? "default"}>{o.status}</Badge>
                  <span className="font-bold text-sm">{formatPrice(o.total)}</span>
                </div>
              </div>

              {o.trackingNumber && (
                <p className="text-xs text-[var(--muted)]">
                  Tracking: <span className="font-mono font-medium">{o.trackingNumber}</span> via {o.courierName}
                </p>
              )}

              {editId === o.id ? (
                <div className="border border-[var(--border)] rounded-xl p-4 space-y-3 bg-[var(--surface)]">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium mb-1 block">Status</label>
                      <select
                        className="w-full h-9 px-3 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none"
                        value={updates.status}
                        onChange={(e) => setUpdates({ ...updates, status: e.target.value })}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Tracking #</label>
                      <input
                        className="w-full h-9 px-3 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        value={updates.tracking}
                        onChange={(e) => setUpdates({ ...updates, tracking: e.target.value })}
                        placeholder="DOMEX-XXXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Courier</label>
                      <select
                        className="w-full h-9 px-3 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none"
                        value={updates.courier}
                        onChange={(e) => setUpdates({ ...updates, courier: e.target.value })}
                      >
                        <option value="">— Select —</option>
                        {["Domex", "Kapruka", "Lanka Sathosa Express", "Sendbiz", "PickMe Delivery"].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" loading={saving} onClick={() => saveEdit(o.id)}>Save</Button>
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
