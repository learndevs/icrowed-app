"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Package, Truck, CheckCircle, Clock, Search, MapPin, ExternalLink } from "lucide-react";

const COURIERS = [
  { name: "Domex", url: "https://domex.lk/track", prefix: "DOMEX" },
  { name: "Kapruka", url: "https://www.kapruka.com/track", prefix: "KAP" },
  { name: "Lanka Sathosa Express", url: "https://express.lankasathosa.lk", prefix: "LSE" },
  { name: "Sendbiz", url: "https://sendbiz.lk/track", prefix: "SBZ" },
  { name: "PickMe Delivery", url: "https://delivery.pickme.lk", prefix: "PMD" },
];

const DEMO_TRACKING = {
  orderNumber: "ICR-260329-4823",
  status: "shipped",
  courierName: "Domex",
  trackingNumber: "DOMEX-2603291234",
  estimatedDelivery: "2026-03-31",
  shippingName: "Sandun Perera",
  shippingAddress: "123 Main Street, Colombo 03",
  history: [
    { status: "Order Placed", time: "2026-03-29 10:00", done: true },
    { status: "Payment Confirmed", time: "2026-03-29 10:45", done: true },
    { status: "Processing & Packed", time: "2026-03-29 14:00", done: true },
    { status: "Shipped — Handed to Courier", time: "2026-03-29 18:00", done: true },
    { status: "Out for Delivery", time: "2026-03-31 (estimated)", done: false },
    { status: "Delivered", time: "—", done: false },
  ],
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [tracking, setTracking] = useState<typeof DEMO_TRACKING | null>(null);
  const [searched, setSearched] = useState(false);

  function handleSearch() {
    setSearched(true);
    // TODO: query API /api/orders/track?orderNumber=...
    if (orderNumber.startsWith("ICR-")) {
      setTracking(DEMO_TRACKING);
    } else {
      setTracking(null);
    }
  }

  const courier = tracking
    ? COURIERS.find((c) => c.name === tracking.courierName)
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold mb-2">Track Your Order</h1>
      <p className="text-[var(--muted)] text-sm mb-8">
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
          <Button onClick={handleSearch} size="lg" className="shrink-0">
            <Search className="w-4 h-4" /> Track Order
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

      {/* Result */}
      {searched && !tracking && (
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

      {tracking && (
        <div className="space-y-5">
          {/* Status card */}
          <Card>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-[var(--muted)] font-medium uppercase tracking-wide">Order</p>
                  <p className="font-bold text-lg">{tracking.orderNumber}</p>
                </div>
                <Badge variant={tracking.status === "delivered" ? "success" : "primary"}>
                  {tracking.status === "shipped" ? "In Transit" : tracking.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <Truck className="w-4 h-4 mt-0.5 text-[var(--muted)] shrink-0" />
                  <div>
                    <p className="text-xs text-[var(--muted)]">Courier</p>
                    <p className="font-medium">{tracking.courierName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Package className="w-4 h-4 mt-0.5 text-[var(--muted)] shrink-0" />
                  <div>
                    <p className="text-xs text-[var(--muted)]">Tracking #</p>
                    <p className="font-medium font-mono text-xs">{tracking.trackingNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 text-[var(--muted)] shrink-0" />
                  <div>
                    <p className="text-xs text-[var(--muted)]">Est. Delivery</p>
                    <p className="font-medium">{tracking.estimatedDelivery}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-[var(--muted)] shrink-0" />
                  <div>
                    <p className="text-xs text-[var(--muted)]">Deliver to</p>
                    <p className="font-medium text-xs">{tracking.shippingAddress}</p>
                  </div>
                </div>
              </div>

              {courier && (
                <a
                  href={`${courier.url}?no=${tracking.trackingNumber}`}
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
                {tracking.history.map((step, i) => (
                  <li key={i} className={`relative pl-8 pb-6 ${i === tracking.history.length - 1 ? "" : "border-l-2"} ${step.done ? "border-[var(--color-primary)]" : "border-[var(--border)]"}`}>
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
                      {step.status}
                    </p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">{step.time}</p>
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
