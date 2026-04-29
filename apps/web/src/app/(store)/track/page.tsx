"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Package, Truck, CheckCircle, Clock,
  Search, MapPin, ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

const COURIERS = [
  { name: "Domex",                  url: "https://domex.lk/track" },
  { name: "Kapruka",                url: "https://www.kapruka.com/track" },
  { name: "Lanka Sathosa Express",  url: "https://express.lankasathosa.lk" },
  { name: "Sendbiz",                url: "https://sendbiz.lk/track" },
  { name: "PickMe Delivery",        url: "https://delivery.pickme.lk" },
];

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

type OrderStatus = (typeof ORDER_STATUSES)[number];

const STATUS_BADGE: Record<OrderStatus, "default" | "primary" | "success" | "warning" | "error"> = {
  pending:    "warning",
  confirmed:  "primary",
  processing: "primary",
  shipped:    "default",
  delivered:  "success",
  cancelled:  "error",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:    "Order Placed",
  confirmed:  "Payment Confirmed",
  processing: "Processing & Packing",
  shipped:    "Shipped — Handed to Courier",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
};

interface StatusHistoryEntry {
  id: string;
  status: OrderStatus;
  note: string | null;
  createdAt: string;
}

interface TrackingResult {
  orderNumber: string;
  status: OrderStatus;
  courierName: string | null;
  trackingNumber: string | null;
  estimatedDeliveryDate: string | null;
  deliveredAt: string | null;
  customerName: string;
  shippingAddressLine1: string;
  shippingCity: string;
  shippingDistrict: string;
  statusHistory: StatusHistoryEntry[];
}

function buildTimeline(result: TrackingResult) {
  const doneStatuses = new Set(result.statusHistory.map((h) => h.status));

  // Build timeline steps from status history (deduplicated, in order)
  const seen = new Set<string>();
  const steps: { label: string; time: string; done: boolean; note: string | null }[] = [];

  for (const entry of [...result.statusHistory].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )) {
    if (seen.has(entry.status)) continue;
    seen.add(entry.status);
    steps.push({
      label: STATUS_LABEL[entry.status] ?? entry.status,
      time: formatDate(entry.createdAt),
      done: true,
      note: entry.note,
    });
  }

  // Append pending future steps
  const futureSteps: OrderStatus[] = ["shipped", "delivered"];
  for (const s of futureSteps) {
    if (!seen.has(s) && result.status !== "cancelled") {
      steps.push({
        label: STATUS_LABEL[s],
        time: s === "delivered" && result.estimatedDeliveryDate
          ? `Est. ${formatDate(result.estimatedDeliveryDate)}`
          : "Pending",
        done: false,
        note: null,
      });
    }
  }

  return steps;
}

function TrackContent() {
  const params = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get("orderNumber") ?? "");
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-search if orderNumber came from URL
  useEffect(() => {
    if (params.get("orderNumber")) handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearch() {
    if (!orderNumber.trim()) return;
    setLoading(true);
    setNotFound(false);
    setResult(null);
    try {
      const res = await fetch(
        `/api/orders?orderNumber=${encodeURIComponent(orderNumber.trim())}`
      );
      if (res.status === 404) { setNotFound(true); return; }
      const data = await res.json();
      if (!data || data.error) { setNotFound(true); return; }
      setResult(data as TrackingResult);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  const courier = result?.courierName
    ? COURIERS.find((c) => c.name === result.courierName)
    : null;

  const timeline = result ? buildTimeline(result) : [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold mb-2">Track Your Order</h1>
      <p className="text-muted text-sm mb-8">
        Enter your order number to get live delivery updates.
      </p>

      {/* Search */}
      <Card className="mb-8">
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="e.g. ICR-260329-4823"
            className="flex-1 h-11 px-4 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
          <Button onClick={handleSearch} size="lg" className="shrink-0" disabled={loading}>
            <Search className="w-4 h-4" />
            {loading ? "Searching…" : "Track Order"}
          </Button>
        </CardContent>
      </Card>

      {/* Supported couriers */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
          Supported Couriers
        </p>
        <div className="flex flex-wrap gap-2">
          {COURIERS.map((c) => (
            <Badge key={c.name} variant="default">{c.name}</Badge>
          ))}
        </div>
      </div>

      {/* Not found */}
      {notFound && (
        <Card>
          <CardContent className="text-center py-10">
            <Package className="w-12 h-12 text-[var(--border)] mx-auto mb-4" />
            <p className="font-medium">Order not found</p>
            <p className="text-sm text-[var(--muted)] mt-1">
              Double-check your order number or contact our support.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-5">
          {/* Status card */}
          <Card>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-[var(--muted)] font-medium uppercase tracking-wide">Order</p>
                  <p className="font-bold text-lg">{result.orderNumber}</p>
                </div>
                <Badge variant={STATUS_BADGE[result.status] ?? "default"} className="capitalize">
                  {result.status === "shipped" ? "In Transit" : result.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {result.courierName && (
                  <div className="flex items-start gap-2">
                    <Truck className="w-4 h-4 mt-0.5 text-[var(--muted)] shrink-0" />
                    <div>
                      <p className="text-xs text-[var(--muted)]">Courier</p>
                      <p className="font-medium">{result.courierName}</p>
                    </div>
                  </div>
                )}
                {result.trackingNumber && (
                  <div className="flex items-start gap-2">
                    <Package className="w-4 h-4 mt-0.5 text-[var(--muted)] shrink-0" />
                    <div>
                      <p className="text-xs text-[var(--muted)]">Tracking #</p>
                      <p className="font-medium font-mono text-xs">{result.trackingNumber}</p>
                    </div>
                  </div>
                )}
                {result.estimatedDeliveryDate && (
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 mt-0.5 text-[var(--muted)] shrink-0" />
                    <div>
                      <p className="text-xs text-[var(--muted)]">Est. Delivery</p>
                      <p className="font-medium">{formatDate(result.estimatedDeliveryDate)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-[var(--muted)] shrink-0" />
                  <div>
                    <p className="text-xs text-[var(--muted)]">Deliver to</p>
                    <p className="font-medium text-xs">
                      {result.shippingAddressLine1}, {result.shippingCity}
                    </p>
                  </div>
                </div>
              </div>

              {courier && result.trackingNumber && (
                <a
                  href={`${courier.url}?no=${result.trackingNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[var(--color-primary)] hover:underline font-medium"
                >
                  Track on {courier.name} website <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardContent>
              <h2 className="font-semibold mb-5">Delivery Timeline</h2>
              <ol className="relative ml-3">
                {timeline.map((step, i) => (
                  <li
                    key={i}
                    className={`relative pl-8 pb-6 ${i === timeline.length - 1 ? "" : "border-l-2"} ${
                      step.done
                        ? "border-[var(--color-primary)]"
                        : "border-[var(--border)]"
                    }`}
                  >
                    <div
                      className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        step.done
                          ? "bg-[var(--color-primary)]"
                          : "bg-white border-2 border-[var(--border)]"
                      }`}
                    >
                      {step.done && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <p className={`text-sm font-medium ${step.done ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">{step.time}</p>
                    {step.note && (
                      <p className="text-xs text-[var(--muted)] mt-0.5 italic">{step.note}</p>
                    )}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense>
      <TrackContent />
    </Suspense>
  );
}
