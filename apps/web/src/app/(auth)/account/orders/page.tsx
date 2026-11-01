"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ChevronDown,
  ShoppingBag,
  ArrowRight,
  RotateCcw,
  Clock,
  CheckCircle2,
  Cog,
  Truck,
  PackageCheck,
  XCircle,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";

interface OrderItem {
  id: string;
  productName: string;
  variantName?: string | null;
  variantId?: string | null;
  sku?: string | null;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  productId?: string | null;
  imageUrl?: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: string;
  subtotal: string;
  shippingCost: string;
  discount: string;
  createdAt: string;
  trackingNumber?: string | null;
  courierName?: string | null;
  items: OrderItem[];
}

const STATUS_CHIP: Record<string, string> = {
  pending: "acct-chip-neutral",
  confirmed: "acct-chip-blue",
  processing: "acct-chip-blue",
  shipped: "acct-chip-solid",
  delivered: "acct-chip-dark",
  cancelled: "acct-chip-outline",
  refunded: "acct-chip-outline",
};

const STATUS_ICON: Record<string, LucideIcon> = {
  pending: Clock,
  confirmed: CheckCircle2,
  processing: Cog,
  shipped: Truck,
  delivered: PackageCheck,
  cancelled: XCircle,
  refunded: Undo2,
};

const PAYMENT_CHIP: Record<string, string> = {
  paid: "acct-chip-blue",
  pending: "acct-chip-neutral",
  failed: "acct-chip-outline",
  refunded: "acct-chip-outline",
};

function fmt(n: string | number) {
  return "LKR " + Number(n).toLocaleString("en-LK");
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-LK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AccountOrdersPage() {
  const { addItem } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/account/orders")
      .then((r) => r.ok ? r.json() : Promise.reject(new Error("Failed to load")))
      .then(({ orders: o }) => setOrders(o ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleReorder(order: Order) {
    for (const item of order.items) {
      addItem({
        id: item.variantId ?? item.productId ?? item.id,
        productId: item.productId ?? item.id,
        variantId: item.variantId ?? undefined,
        name: item.productName,
        variantName: item.variantName ?? undefined,
        price: Number(item.unitPrice),
        sku: item.sku ?? undefined,
        imageUrl: item.imageUrl ?? undefined,
      });
    }
  }

  return (
    <div>
      <AccountPageHeader
        eyebrow="Order history"
        title="My orders"
        subtitle="Track, review and reorder your purchases"
        icon={Package}
      />

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="acct-glass p-5 animate-pulse">
              <div className="flex justify-between items-start mb-3">
                <div className="h-4 bg-black/5 rounded-full w-32" />
                <div className="h-5 bg-black/5 rounded-full w-20" />
              </div>
              <div className="h-3 bg-black/5 rounded-full w-48 mb-2" />
              <div className="h-3 bg-black/5 rounded-full w-24" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="acct-glass p-10 text-center">
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <Link
            href="/login?next=/account/orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 text-white text-sm font-bold hover:bg-[var(--brand-600)] transition-colors"
          >
            Sign in to view orders
          </Link>
        </div>
      ) : orders.length === 0 ? (
        <div className="acct-glass flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-3xl bg-sky-50 border border-sky-100 flex items-center justify-center mb-5">
            <ShoppingBag className="w-10 h-10 text-[var(--brand-600)]" />
          </div>
          <h2 className="text-xl font-black text-neutral-900 mb-2">No orders yet</h2>
          <p className="text-sm text-neutral-500 mb-6 max-w-xs">
            When you place an order it will show up here with full tracking info.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 text-white text-sm font-bold hover:bg-[var(--brand-600)] transition-colors"
          >
            Start shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => {
            const isOpen = expanded.has(order.id);
            const StatusIcon = STATUS_ICON[order.status] ?? Package;
            return (
              <div
                key={order.id}
                className="acct-glass overflow-hidden acct-rise"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <button
                  className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-white/50 transition-colors"
                  onClick={() => toggleExpand(order.id)}
                  aria-expanded={isOpen}
                >
                  <div className="w-11 h-11 rounded-2xl bg-neutral-900 flex items-center justify-center shrink-0">
                    <StatusIcon className="w-5 h-5 text-sky-300" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-black text-sm font-mono text-neutral-900">{order.orderNumber}</span>
                      <span className={`acct-chip ${STATUS_CHIP[order.status] ?? "acct-chip-neutral"}`}>
                        {order.status}
                      </span>
                      <span className={`acct-chip ${PAYMENT_CHIP[order.paymentStatus] ?? "acct-chip-neutral"}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      {fmtDate(order.createdAt)} · {order.items.length} {order.items.length === 1 ? "item" : "items"}
                    </p>
                    {order.trackingNumber && (
                      <p className="text-xs text-neutral-500 mt-0.5 font-mono">
                        {order.courierName && `${order.courierName} · `}
                        {order.trackingNumber}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                    <span className="font-black text-sm text-neutral-900">{fmt(order.total)}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-black/5 bg-white/30">
                    <div className="pt-4 divide-y divide-black/5">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-start py-3 text-sm">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-neutral-900 truncate">{item.productName}</p>
                            {item.variantName && (
                              <p className="text-xs text-neutral-500">{item.variantName}</p>
                            )}
                            {item.sku && (
                              <p className="text-[10px] font-mono text-neutral-400">{item.sku}</p>
                            )}
                            <p className="text-xs text-neutral-500">
                              {fmt(item.unitPrice)} × {item.quantity}
                            </p>
                          </div>
                          <p className="font-bold text-neutral-900 ml-4">{fmt(item.subtotal)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 mt-1 border-t border-black/5 space-y-1 text-sm">
                      <div className="flex justify-between text-neutral-500">
                        <span>Subtotal</span>
                        <span>{fmt(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-neutral-500">
                        <span>Shipping</span>
                        <span>{Number(order.shippingCost) === 0 ? "Free" : fmt(order.shippingCost)}</span>
                      </div>
                      {Number(order.discount) > 0 && (
                        <div className="flex justify-between text-[var(--brand-600)] font-semibold">
                          <span>Discount</span>
                          <span>−{fmt(order.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-black text-base pt-2 border-t border-black/5 text-neutral-900">
                        <span>Total</span>
                        <span>{fmt(order.total)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      {["delivered", "cancelled", "refunded"].includes(order.status) && (
                        <button
                          onClick={() => handleReorder(order)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-900 hover:bg-[var(--brand-600)] text-white text-xs font-bold transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Reorder
                        </button>
                      )}
                      {order.trackingNumber && (
                        <Link
                          href={`/track?order=${order.orderNumber}`}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-black/10 bg-white/60 text-xs font-bold text-neutral-800 hover:border-[var(--brand-500)] hover:text-[var(--brand-600)] transition-colors"
                        >
                          <Package className="w-3.5 h-3.5" />
                          Track
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
