"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { formatPrice, formatDate } from "@/lib/utils";

const STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

const COURIERS = ["Domex", "Kapruka", "Lanka Sathosa Express", "Sendbiz", "PickMe Delivery"];

type OrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string | null;
  shippingCity: string;
  shippingDistrict: string;
  shippingProvince?: string | null;
  shippingPostalCode?: string | null;
  subtotal: string;
  shippingCost: string;
  discount: string;
  total: string;
  trackingNumber?: string | null;
  courierName?: string | null;
  estimatedDeliveryDate?: string | null;
  bankTransferReference?: string | null;
  bankTransferPayerName?: string | null;
  bankTransferProofUrl?: string | null;
  customerNote?: string | null;
  adminNote?: string | null;
  createdAt: string;
  items: {
    id: string;
    productName: string;
    variantName?: string | null;
    quantity: number;
    unitPrice: string;
    subtotal: string;
  }[];
  statusHistory?: { status: string; note?: string | null; createdAt: string }[];
};

const STATUS_BADGE: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  pending: "warning",
  confirmed: "primary",
  processing: "primary",
  shipped: "default",
  delivered: "success",
  cancelled: "error",
  refunded: "error",
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = decodeURIComponent(String(params.orderNumber ?? ""));

  const [order, setOrder] = useState<OrderRow | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [status, setStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courierName, setCourierName] = useState("");
  const [shippingCostInput, setShippingCostInput] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");

  const load = useCallback(async () => {
    if (!orderNumber) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/orders?orderNumber=${encodeURIComponent(orderNumber)}`);
      if (!res.ok) {
        setOrder(null);
        setLoadError("Order not found");
        return;
      }
      const data: OrderRow = await res.json();
      setOrder(data);
      setStatus(data.status);
      setTrackingNumber(data.trackingNumber ?? "");
      setCourierName(data.courierName ?? "");
      setShippingCostInput(String(Number(data.shippingCost)));
      setAdminNote(data.adminNote ?? "");
      setEstimatedDeliveryDate(
        data.estimatedDeliveryDate ? data.estimatedDeliveryDate.slice(0, 10) : ""
      );
    } catch (e) {
      console.error(e);
      setLoadError("Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveFulfillment() {
    if (!order) return;
    setSaving(true);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          status,
          trackingNumber: trackingNumber.trim() || null,
          courierName: courierName.trim() || null,
          shippingCost: Number(shippingCostInput),
          adminNote: adminNote.trim() || null,
          estimatedDeliveryDate: estimatedDeliveryDate.trim() || null,
          note:
            status === "shipped" && trackingNumber.trim()
              ? `Shipped — tracking: ${trackingNumber.trim()}`
              : undefined,
        }),
      });
      if (!res.ok) throw new Error("patch failed");
      await load();
      alert("Order updated.");
    } catch (e) {
      console.error(e);
      alert("Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function markBankPaid() {
    if (!order) return;
    if (!confirm("Mark this bank transfer as paid and confirm the order?")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          paymentStatus: "paid",
        }),
      });
      if (!res.ok) throw new Error("patch failed");
      await load();
    } catch (e) {
      console.error(e);
      alert("Could not update payment.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Link href="/admin/orders" className="text-sm text-[var(--color-primary)] hover:underline">
          ← Back to orders
        </Link>
        <p className="text-[var(--muted)]">Loading…</p>
      </div>
    );
  }

  if (loadError || !order) {
    return (
      <div className="space-y-4">
        <Link href="/admin/orders" className="text-sm text-[var(--color-primary)] hover:underline">
          ← Back to orders
        </Link>
        <p className="text-[var(--muted)]">{loadError ?? "Order not found"}</p>
        <Button variant="outline" onClick={() => router.push("/admin/orders")}>
          All orders
        </Button>
      </div>
    );
  }

  const addr = [
    order.shippingAddressLine1,
    order.shippingAddressLine2,
    order.shippingCity,
    order.shippingDistrict,
    order.shippingProvince,
    order.shippingPostalCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/orders" className="text-sm text-[var(--color-primary)] hover:underline">
            ← Orders
          </Link>
          <h2 className="text-xl font-bold mt-1 font-mono">{order.orderNumber}</h2>
          <p className="text-xs text-[var(--muted)]">Placed {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={STATUS_BADGE[order.status] ?? "default"}>{order.status}</Badge>
          <Badge variant={order.paymentStatus === "paid" ? "success" : "warning"}>
            Payment: {order.paymentStatus}
          </Badge>
          <Badge variant="default">{order.paymentMethod}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="space-y-2 text-sm pt-6">
            <h3 className="font-semibold">Customer</h3>
            <p>{order.customerName}</p>
            <p className="text-[var(--muted)]">{order.customerEmail}</p>
            <p className="text-[var(--muted)]">{order.customerPhone}</p>
            <h3 className="font-semibold pt-2">Ship to</h3>
            <p className="text-[var(--muted)]">{addr}</p>
            {order.customerNote && (
              <p className="text-xs pt-2">
                <span className="font-medium">Customer note:</span> {order.customerNote}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 text-sm pt-6">
            <h3 className="font-semibold">Amounts</h3>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Shipping</span>
              <span>{formatPrice(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Discount</span>
              <span>{formatPrice(order.discount)}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-[var(--border)] pt-2">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {order.paymentMethod === "bank_transfer" && (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <h3 className="font-semibold">Bank transfer details (customer)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-[var(--muted)]">Reference</p>
                <p className="font-mono font-medium">{order.bankTransferReference ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted)]">Payer name</p>
                <p>{order.bankTransferPayerName ?? "—"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-[var(--muted)]">Deposit slip / proof link</p>
                {order.bankTransferProofUrl ? (
                  <a
                    href={order.bankTransferProofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-primary)] hover:underline break-all"
                  >
                    {order.bankTransferProofUrl}
                  </a>
                ) : (
                  <p>—</p>
                )}
              </div>
            </div>
            {order.paymentStatus !== "paid" && (
              <Button variant="outline" size="sm" onClick={markBankPaid} disabled={saving}>
                Mark bank payment received
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-4 pt-6">
          <h3 className="font-semibold">Order flow & fulfillment</h3>
          <p className="text-xs text-[var(--muted)]">
            Typical flow: pending → confirmed (payment) → processing → shipped (add tracking) →
            delivered.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Status</label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Shipping charge (LKR)</label>
              <input
                type="number"
                min={0}
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm"
                value={shippingCostInput}
                onChange={(e) => setShippingCostInput(e.target.value)}
              />
              <p className="text-[10px] text-[var(--muted)] mt-1">
                Total recalculates as subtotal + this shipping − discount.
              </p>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Tracking number</label>
              <input
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm font-mono"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Required when marking shipped"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Courier</label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm"
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
              >
                <option value="">—</option>
                {COURIERS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium mb-1 block">Estimated delivery (optional)</label>
              <input
                type="date"
                className="w-full max-w-xs h-10 px-3 rounded-lg border border-[var(--border)] text-sm"
                value={estimatedDeliveryDate}
                onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium mb-1 block">Admin note (internal)</label>
              <textarea
                className="w-full min-h-[72px] px-3 py-2 rounded-lg border border-[var(--border)] text-sm"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>
          </div>

          {status === "shipped" && !trackingNumber.trim() && (
            <p className="text-xs text-amber-700">Add a tracking number when the order is shipped.</p>
          )}

          <Button onClick={saveFulfillment} loading={saving}>
            Save changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3">Line items</h3>
          <div className="divide-y divide-[var(--border)] text-sm">
            {order.items.map((line) => (
              <div key={line.id} className="flex justify-between py-2">
                <div>
                  <p className="font-medium">{line.productName}</p>
                  {line.variantName && (
                    <p className="text-xs text-[var(--muted)]">{line.variantName}</p>
                  )}
                  <p className="text-xs text-[var(--muted)]">Qty {line.quantity}</p>
                </div>
                <p className="font-semibold">{formatPrice(line.subtotal)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {order.statusHistory && order.statusHistory.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Status history</h3>
            <ol className="space-y-2 text-sm">
              {[...order.statusHistory]
                .sort(
                  (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                )
                .map((h, i) => (
                  <li key={i} className="flex justify-between gap-4 border-b border-[var(--border)] pb-2">
                    <span>
                      <Badge variant={STATUS_BADGE[h.status] ?? "default"}>{h.status}</Badge>
                      {h.note && <span className="text-[var(--muted)] ml-2 text-xs">{h.note}</span>}
                    </span>
                    <span className="text-xs text-[var(--muted)] shrink-0">
                      {new Date(h.createdAt).toLocaleString("en-LK")}
                    </span>
                  </li>
                ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
