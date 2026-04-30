"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ShoppingBag,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useCart } from "@/context/CartContext";

interface OrderItem {
  id: string;
  productName: string;
  variantName?: string | null;
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

const STATUS_BADGE: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  pending: "warning",
  confirmed: "primary",
  processing: "primary",
  shipped: "default",
  delivered: "success",
  cancelled: "error",
  refunded: "error",
};

const STATUS_ICON: Record<string, string> = {
  pending: "⏳",
  confirmed: "✅",
  processing: "⚙️",
  shipped: "🚚",
  delivered: "📦",
  cancelled: "❌",
  refunded: "💸",
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
        id: item.productId ?? item.id,
        productId: item.productId ?? item.id,
        name: item.productName,
        variantName: item.variantName ?? undefined,
        price: Number(item.unitPrice),
        sku: item.sku ?? undefined,
        imageUrl: item.imageUrl ?? undefined,
      });
    }
  }

  return (
    <div className="bento-bg min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-[var(--muted)] hover:text-[var(--foreground)] text-sm mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Account
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">
              Order History
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-[var(--color-primary)]" />
            My Orders
          </h1>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bento-card p-5 animate-pulse">
                <div className="flex justify-between items-start mb-3">
                  <div className="h-4 bg-gray-100 rounded-full w-32" />
                  <div className="h-5 bg-gray-100 rounded-full w-20" />
                </div>
                <div className="h-3 bg-gray-100 rounded-full w-48 mb-2" />
                <div className="h-3 bg-gray-100 rounded-full w-24" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bento-card p-8 text-center animate-fade-in">
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <Link
              href="/login?next=/account/orders"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm font-bold hover:bg-indigo-600 transition-colors"
            >
              Sign In to View Orders
            </Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="bento-card flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-[var(--brand-50)] flex items-center justify-center mb-5">
              <ShoppingBag className="w-10 h-10 text-[var(--color-primary)]" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">No orders yet</h2>
            <p className="text-sm text-[var(--muted)] mb-6 max-w-xs">
              When you place an order it will show up here with full tracking info.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm font-bold hover:bg-indigo-600 transition-colors"
            >
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, i) => {
              const isOpen = expanded.has(order.id);
              return (
                <div
                  key={order.id}
                  className="bento-card overflow-hidden animate-slide-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {/* Order summary row */}
                  <button
                    className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-gray-50/60 transition-colors"
                    onClick={() => toggleExpand(order.id)}
                  >
                    {/* Status emoji */}
                    <div className="w-10 h-10 rounded-2xl bg-[var(--brand-50)] flex items-center justify-center text-xl shrink-0">
                      {STATUS_ICON[order.status] ?? "📦"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-black text-sm font-mono text-gray-900">{order.orderNumber}</span>
                        <Badge variant={STATUS_BADGE[order.status] ?? "default"} className="capitalize text-[10px]">
                          {order.status}
                        </Badge>
                        <Badge
                          variant={order.paymentStatus === "paid" ? "success" : order.paymentStatus === "failed" ? "error" : "warning"}
                          className="text-[10px]"
                        >
                          {order.paymentStatus}
                        </Badge>
                      </div>
                      <p className="text-xs text-[var(--muted)]">
                        {fmtDate(order.createdAt)} · {order.items.length} {order.items.length === 1 ? "item" : "items"}
                      </p>
                      {order.trackingNumber && (
                        <p className="text-xs text-[var(--muted)] mt-0.5 font-mono">
                          {order.courierName && `${order.courierName} · `}
                          {order.trackingNumber}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                      <span className="font-black text-sm text-gray-900">{fmt(order.total)}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[var(--muted)]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[var(--muted)]" />
                      )}
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-[var(--border)]">
                      {/* Items */}
                      <div className="pt-4 space-y-0 divide-y divide-[var(--border)]">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-start py-3 text-sm">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{item.productName}</p>
                              {item.variantName && (
                                <p className="text-xs text-[var(--muted)]">{item.variantName}</p>
                              )}
                              {item.sku && (
                                <p className="text-[10px] font-mono text-[var(--muted)]">{item.sku}</p>
                              )}
                              <p className="text-xs text-[var(--muted)]">
                                {fmt(item.unitPrice)} × {item.quantity}
                              </p>
                            </div>
                            <p className="font-bold text-gray-900 ml-4">{fmt(item.subtotal)}</p>
                          </div>
                        ))}
                      </div>

                      {/* Totals */}
                      <div className="pt-3 mt-1 border-t border-[var(--border)] space-y-1 text-sm">
                        <div className="flex justify-between text-[var(--muted)]">
                          <span>Subtotal</span>
                          <span>{fmt(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-[var(--muted)]">
                          <span>Shipping</span>
                          <span>{Number(order.shippingCost) === 0 ? "Free" : fmt(order.shippingCost)}</span>
                        </div>
                        {Number(order.discount) > 0 && (
                          <div className="flex justify-between text-emerald-600">
                            <span>Discount</span>
                            <span>−{fmt(order.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-black text-base pt-2 border-t border-[var(--border)]">
                          <span>Total</span>
                          <span>{fmt(order.total)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        {["delivered", "cancelled", "refunded"].includes(order.status) && (
                          <button
                            onClick={() => handleReorder(order)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 hover:bg-indigo-600 text-white text-xs font-bold transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reorder
                          </button>
                        )}
                        {order.trackingNumber && (
                          <Link
                            href={`/track?order=${order.orderNumber}`}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-bold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
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
    </div>
  );
}
