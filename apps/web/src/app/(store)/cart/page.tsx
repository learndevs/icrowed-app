"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Minus, Plus, Trash2, ShoppingBag, Tag, X,
  AlertTriangle, PackageX, Truck, ArrowRight, ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, coupon, applyCoupon, removeCoupon } = useCart();
  const [couponInput, setCouponInput]   = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError]   = useState<string | null>(null);
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [variantStockMap, setVariantStockMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const ids = [...new Set(items.map((i) => i.productId))];
    const variantIds = [...new Set(items.map((i) => i.variantId).filter(Boolean) as string[])];
    if (ids.length === 0 && variantIds.length === 0) return;
    const params = new URLSearchParams();
    if (ids.length > 0) params.set("ids", ids.join(","));
    if (variantIds.length > 0) params.set("variantIds", variantIds.join(","));
    fetch(`/api/products/batch?${params.toString()}`)
      .then((r) => r.ok ? r.json() : { products: [] })
      .then(({ products, variants }: {
        products: { id: string; stock: number }[];
        variants?: { id: string; stock: number }[];
      }) => {
        const productMap: Record<string, number> = {};
        for (const p of products) productMap[p.id] = p.stock;
        setStockMap(productMap);
        const vMap: Record<string, number> = {};
        for (const v of variants ?? []) vMap[v.id] = v.stock;
        setVariantStockMap(vMap);
      })
      .catch(() => {});
  }, [items]);

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    const result = await applyCoupon(couponInput.trim());
    if (!result.success) setCouponError(result.message);
    setCouponLoading(false);
    if (result.success) setCouponInput("");
  }

  /* ── Empty state ───────────────────────────────────────────────────── */
  if (items.length === 0) {
    return (
      <div className="bento-bg min-h-screen flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <ShoppingBag className="w-10 h-10 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-sm text-gray-400 mb-8 leading-relaxed">
            Looks like you haven&apos;t added anything yet. Browse our products and find something you love.
          </p>
          <Link href="/products">
            <Button size="lg" className="gap-2">
              Browse Products <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const FREE_SHIPPING_THRESHOLD = 500000;
  const shippingFee    = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 35000;
  const couponDiscount = coupon?.discount ?? 0;
  const total          = subtotal + shippingFee - couponDiscount;
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  const oosItems = items.filter((item) => {
    const live = item.variantId ? variantStockMap[item.variantId] : stockMap[item.productId];
    return live !== undefined && live < item.quantity;
  });
  const hasOOS = oosItems.length > 0;

  return (
    <div className="bento-bg min-h-screen">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-5 lg:px-8 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Shopping Cart</h1>
            <p className="text-xs text-gray-400">{items.length} {items.length === 1 ? "item" : "items"}</p>
          </div>
        </div>

        {/* OOS banner */}
        {hasOOS && (
          <div className="mb-5 flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-rose-50 border border-rose-200">
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-800">Some items are no longer available</p>
              <p className="text-xs text-rose-500 mt-0.5">
                Remove or reduce the quantity of out-of-stock items before checking out.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Cart items ───────────────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {items.map((item) => {
              const liveStock   = item.variantId ? variantStockMap[item.variantId] : stockMap[item.productId];
              const itemOOS     = liveStock !== undefined && liveStock === 0;
              const itemOverQty = liveStock !== undefined && liveStock > 0 && liveStock < item.quantity;
              return (
                <div
                  key={item.id}
                  className={`bento-card p-4 sm:p-5 flex gap-4 transition-colors ${
                    itemOOS || itemOverQty ? "border-rose-200 bg-rose-50/30" : ""
                  }`}
                >
                  {/* Image */}
                  <div
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden relative ${
                      itemOOS ? "opacity-40 grayscale" : ""
                    }`}
                  >
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    ) : (
                      <ShoppingBag className="w-8 h-8 text-gray-300" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <p className={`font-bold text-sm sm:text-base leading-snug line-clamp-2 ${
                      itemOOS ? "text-gray-400 line-through" : "text-gray-900"
                    }`}>
                      {item.name}
                    </p>

                    {item.variantName && (
                      <span className="inline-flex self-start text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                        {item.variantName}
                      </span>
                    )}

                    <p className="text-base font-black text-gray-900">{formatPrice(item.price)}</p>

                    {itemOOS && (
                      <div className="flex items-center gap-1.5">
                        <PackageX className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="text-xs font-semibold text-rose-600">Out of stock</span>
                      </div>
                    )}
                    {itemOverQty && (
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="text-xs font-semibold text-amber-700">
                          Only {liveStock} available — reduce quantity
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: quantity + remove + line total */}
                  <div className="flex flex-col items-end justify-between gap-3 shrink-0">
                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-rose-50 hover:text-rose-500 text-gray-400 flex items-center justify-center transition-all duration-200 border border-gray-100 hover:border-rose-200"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Quantity stepper */}
                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white hover:bg-indigo-50 hover:text-indigo-600 text-gray-500 transition-all duration-150 shadow-sm border border-gray-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white hover:bg-indigo-50 hover:text-indigo-600 text-gray-500 transition-all duration-150 shadow-sm border border-gray-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Line total */}
                    <p className="text-sm font-black text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              );
            })}

            {/* Continue shopping link */}
            <Link
              href="/products"
              className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 px-1 mt-1 group w-fit"
            >
              <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
              Continue Shopping
            </Link>
          </div>

          {/* ── Order summary sidebar ─────────────────────────────────── */}
          <div className="self-start sticky top-24">
            <div className="bento-card p-5 sm:p-6 flex flex-col gap-5">
              <h2 className="text-lg font-black text-gray-900">Order Summary</h2>

              {/* Free shipping progress */}
              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Truck className={`w-4 h-4 shrink-0 ${shippingFee === 0 ? "text-emerald-500" : "text-indigo-500"}`} />
                  <p className={`text-xs font-bold ${shippingFee === 0 ? "text-emerald-700" : "text-gray-700"}`}>
                    {shippingFee === 0
                      ? "You've unlocked free shipping!"
                      : `Add ${formatPrice(amountToFreeShipping)} more for free shipping`}
                  </p>
                </div>
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      shippingFee === 0
                        ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                        : "bg-gradient-to-r from-indigo-400 to-indigo-500"
                    }`}
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Line items */}
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-semibold text-gray-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Shipping</span>
                  <span className={`font-semibold ${shippingFee === 0 ? "text-emerald-600" : "text-gray-800"}`}>
                    {shippingFee === 0 ? "Free" : formatPrice(shippingFee)}
                  </span>
                </div>
                {coupon && (
                  <div className="flex justify-between items-center text-emerald-600">
                    <span className="flex items-center gap-1 text-xs font-semibold">
                      <Tag className="w-3 h-3" />{coupon.code}
                    </span>
                    <span className="font-bold">− {formatPrice(coupon.discount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-2.5 flex justify-between items-center">
                  <span className="font-black text-gray-900">Total</span>
                  <span className="text-xl font-black text-gray-900">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Coupon */}
              {coupon ? (
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    {coupon.message}
                  </span>
                  <button
                    onClick={removeCoupon}
                    className="w-6 h-6 rounded-full bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center text-emerald-600 transition-colors"
                    aria-label="Remove coupon"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value); setCouponError(null); }}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      placeholder="Coupon code"
                      className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent uppercase placeholder:normal-case placeholder:font-normal"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="rounded-xl"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-rose-600 font-semibold px-1">{couponError}</p>
                  )}
                </div>
              )}

              {/* CTA */}
              {hasOOS ? (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-rose-50 border border-rose-200">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <p className="text-xs font-semibold text-rose-700">
                      Resolve out-of-stock items to continue
                    </p>
                  </div>
                  <Button size="lg" className="w-full" disabled>Proceed to Checkout</Button>
                </div>
              ) : (
                <Link href="/checkout" className="block">
                  <Button size="lg" className="w-full gap-2">
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
