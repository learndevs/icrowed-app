"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Minus, Plus, Trash2, ShoppingBag, Tag, X,
  AlertTriangle, PackageX, ArrowRight, ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import { isLocalProductUploadUrl, normalizeProductImageUrl } from "@/lib/product-image-url";
import Link from "next/link";

const CART_CARD =
  "bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-colors";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, coupon, applyCoupon, removeCoupon } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
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

  if (items.length === 0) {
    return (
      <div className="font-inter checkout-flow-bg min-h-screen flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 rounded-xl bg-gray-900 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-sm text-gray-400 mb-8 leading-relaxed">
            Looks like you haven&apos;t added anything yet. Browse our products and find something you love.
          </p>
          <Link href="/products">
            <Button
              size="lg"
              className="gap-2 bg-gray-900 text-white hover:bg-gray-800 rounded-xl"
            >
              Browse Products <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const couponDiscount = coupon?.discount ?? 0;
  const total = subtotal - couponDiscount;

  const oosItems = items.filter((item) => {
    const live = item.variantId ? variantStockMap[item.variantId] : stockMap[item.productId];
    return live !== undefined && live < item.quantity;
  });
  const hasOOS = oosItems.length > 0;

  return (
    <div className="font-inter checkout-flow-bg min-h-screen">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-5 lg:px-8 py-6">

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Shopping Cart</h1>
            <p className="text-xs text-gray-400">{items.length} {items.length === 1 ? "item" : "items"}</p>
          </div>
        </div>

        {hasOOS && (
          <div className="mb-5 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-rose-50 border border-rose-200">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
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

          <div className="lg:col-span-2 flex flex-col gap-3">
            {items.map((item) => {
              const liveStock = item.variantId ? variantStockMap[item.variantId] : stockMap[item.productId];
              const itemOOS = liveStock !== undefined && liveStock === 0;
              const itemOverQty = liveStock !== undefined && liveStock > 0 && liveStock < item.quantity;
              return (
                <div
                  key={item.id}
                  className={`${CART_CARD} p-4 sm:p-5 flex gap-4 ${
                    itemOOS || itemOverQty ? "border-rose-200 bg-rose-50/30" : ""
                  }`}
                >
                  <div
                    className={`w-28 h-28 sm:w-36 sm:h-36 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden relative ${
                      itemOOS ? "opacity-40 grayscale" : ""
                    }`}
                  >
                    {item.imageUrl ? (
                      <Image
                        src={normalizeProductImageUrl(item.imageUrl)}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="144px"
                        unoptimized={isLocalProductUploadUrl(item.imageUrl)}
                      />
                    ) : (
                      <ShoppingBag className="w-10 h-10 text-gray-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <p className={`font-bold text-sm sm:text-base leading-snug line-clamp-2 ${
                      itemOOS ? "text-gray-400 line-through" : "text-gray-900"
                    }`}>
                      {item.name}
                    </p>

                    {item.variantName && (
                      <span className="inline-flex self-start text-[10px] font-semibold text-gray-700 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
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

                  <div className="flex flex-col items-end justify-between gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="w-8 h-8 rounded-lg bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-900 hover:bg-gray-800 text-white transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-900 hover:bg-gray-800 text-white transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <Link
              href="/products"
              className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-gray-700 px-1 mt-1 group w-fit"
            >
              <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
              Continue Shopping
            </Link>
          </div>

          <div className="self-start sticky top-24">
            <div className={`${CART_CARD} p-5 sm:p-6 flex flex-col gap-5`}>
              <h2 className="text-lg font-black text-gray-900">Order Summary</h2>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-semibold text-gray-800">{formatPrice(subtotal)}</span>
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

              {coupon ? (
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    {coupon.message}
                  </span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="w-6 h-6 rounded-md bg-gray-900 hover:bg-gray-800 flex items-center justify-center text-white transition-colors"
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
                      className="flex-1 h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent uppercase placeholder:normal-case placeholder:font-normal"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="rounded-lg border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-rose-600 font-semibold px-1">{couponError}</p>
                  )}
                </div>
              )}

              {hasOOS ? (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <p className="text-xs font-semibold text-rose-700">
                      Resolve out-of-stock items to continue
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="w-full rounded-xl bg-gray-900 text-white hover:bg-gray-800"
                    disabled
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              ) : (
                <Link href="/checkout" className="block">
                  <Button
                    size="lg"
                    className="w-full gap-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
                  >
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
