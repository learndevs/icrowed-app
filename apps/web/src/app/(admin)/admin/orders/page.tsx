"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

const STATUS_BADGE: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  pending: "warning",
  confirmed: "primary",
  processing: "primary",
  shipped: "default",
  delivered: "success",
  cancelled: "error",
  refunded: "error",
};

type DashboardOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  total: string;
  status: string;
  paymentMethod: "stripe" | "bank_transfer";
  paymentStatus: string;
  trackingNumber?: string | null;
  createdAt: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const tabs = useMemo(
    () => ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    async function loadOrders() {
      setLoading(true);
      try {
        const query =
          statusFilter === "all"
            ? "/api/orders"
            : `/api/orders?status=${encodeURIComponent(statusFilter)}`;
        const res = await fetch(query, { signal: controller.signal });
        if (!res.ok) throw new Error("Failed to load orders");
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error(error);
        }
      } finally {
        setLoading(false);
      }
    }
    void loadOrders();
    return () => controller.abort();
  }, [statusFilter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Orders</h2>
          <p className="text-xs text-[var(--muted)] mt-1">
            Shipping rates for checkout:{" "}
            <Link href="/admin/settings" className="text-[var(--color-primary)] hover:underline">
              Settings
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tabs.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                statusFilter === s
                  ? "bg-[var(--color-primary)] text-white border-transparent"
                  : "border-[var(--border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              }`}
            >
              {s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface)]">
              <tr className="text-left text-xs text-[var(--muted)] border-b border-[var(--border)]">
                <th className="px-4 py-3 font-medium">Order #</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Pay method</th>
                <th className="px-4 py-3 font-medium">Pay status</th>
                <th className="px-4 py-3 font-medium">Tracking</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-[var(--surface)]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.orderNumber}`} className="text-[var(--color-primary)] hover:underline font-mono text-xs">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.customerName}</p>
                    <p className="text-xs text-[var(--muted)]">{o.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={o.paymentMethod === "stripe" ? "primary" : "warning"}>
                      {o.paymentMethod === "stripe" ? "Card" : "Bank"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={o.paymentStatus === "paid" ? "success" : "warning"}>
                      {o.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">
                    {o.trackingNumber || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_BADGE[o.status] ?? "default"}>{o.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {new Date(o.createdAt).toLocaleDateString("en-LK")}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.orderNumber}`}>
                      <Button size="sm" variant="outline">View</Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {!loading && orders.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-sm text-[var(--muted)]" colSpan={9}>
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
