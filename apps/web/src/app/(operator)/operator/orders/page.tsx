"use client";

import { useState } from "react";
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

const ORDERS = [
  { id: "ICR-260329-4823", customer: "Sandun Perera", phone: "077-1234567", address: "123 Main St, Colombo 03", total: 419900, status: "shipped", tracking: "DOMEX-2603291234", courier: "Domex" },
  { id: "ICR-260329-4822", customer: "Nimal Silva", phone: "071-9876543", address: "45 Galle Rd, Moratuwa", total: 89900, status: "processing", tracking: "", courier: "" },
  { id: "ICR-260329-4821", customer: "Kamala Fernando", phone: "076-5556789", address: "78 Kings St, Kandy", total: 249900, status: "pending", tracking: "", courier: "" },
];

export default function OperatorOrdersPage() {
  const [orders, setOrders] = useState(ORDERS);
  const [editId, setEditId] = useState<string | null>(null);
  const [updates, setUpdates] = useState<{ status: string; tracking: string; courier: string }>({ status: "", tracking: "", courier: "" });

  function startEdit(order: typeof ORDERS[0]) {
    setEditId(order.id);
    setUpdates({ status: order.status, tracking: order.tracking, courier: order.courier });
  }

  function saveEdit(id: string) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, ...updates } : o
      )
    );
    setEditId(null);
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
                  <p className="font-mono text-xs text-[var(--muted)]">{o.id}</p>
                  <p className="font-semibold">{o.customer}</p>
                  <p className="text-sm text-[var(--muted)]">{o.phone} · {o.address}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={STATUS_BADGE[o.status] ?? "default"}>{o.status}</Badge>
                  <span className="font-bold text-sm">{formatPrice(o.total)}</span>
                </div>
              </div>

              {o.tracking && (
                <p className="text-xs text-[var(--muted)]">
                  Tracking: <span className="font-mono font-medium">{o.tracking}</span> via {o.courier}
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
                    <Button size="sm" onClick={() => saveEdit(o.id)}>Save</Button>
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
