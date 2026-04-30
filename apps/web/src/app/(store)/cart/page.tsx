"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Minus, Plus, Trash2, ShoppingBag, Tag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, coupon, applyCoupon, removeCoupon } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-[var(--border)] mx-auto mb-5" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-[var(--muted)] mb-8">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link href="/products">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const shippingFee = subtotal >= 500000 ? 0 : 35000;
  const couponDiscount = coupon?.discount ?? 0;
  const total = subtotal + shippingFee - couponDiscount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart ({items.length} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex gap-4">
                {/* Image */}
                <div className="w-20 h-20 rounded-xl bg-[var(--surface)] flex items-center justify-center text-3xl shrink-0 overflow-hidden relative">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  ) : (
                    "📱"
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--foreground)] truncate">{item.name}</p>
                  {item.variantName && (
                    <p className="text-xs text-[var(--muted)] mt-0.5">{item.variantName}</p>
                  )}
                  <p className="font-bold text-[var(--foreground)] mt-1">{formatPrice(item.price)}</p>
                </div>

                {/* Quantity + Remove */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-[var(--muted)] hover:text-[var(--color-error)] transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2 border border-[var(--border)] rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="h-8 w-8 flex items-center justify-center hover:bg-[var(--surface)] rounded-l-lg transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8 flex items-center justify-center hover:bg-[var(--surface)] rounded-r-lg transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <div>
          <Card className="sticky top-24">
            <CardContent className="space-y-4">
              <h2 className="font-semibold text-lg">Order Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Shipping</span>
                  <span>{shippingFee === 0 ? <span className="text-green-600">Free</span> : formatPrice(shippingFee)}</span>
                </div>
                {shippingFee > 0 && (
                  <p className="text-xs text-[var(--muted)]">
                    Add {formatPrice(500000 - subtotal)} more for free shipping
                  </p>
                )}
                {coupon && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {coupon.code}
                    </span>
                    <span>− {formatPrice(coupon.discount)}</span>
                  </div>
                )}
                <div className="border-t border-[var(--border)] pt-2 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Coupon input */}
              {coupon ? (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-sm">
                  <span className="text-green-700 font-medium flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    {coupon.message}
                  </span>
                  <button onClick={removeCoupon} className="text-green-600 hover:text-green-800">
                    <X className="w-4 h-4" />
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
                      className="flex-1 h-9 px-3 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent uppercase placeholder:normal-case"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                    >
                      {couponLoading ? "..." : "Apply"}
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-600">{couponError}</p>
                  )}
                </div>
              )}

              <Link href="/checkout" className="block">
                <Button size="lg" className="w-full">Proceed to Checkout</Button>
              </Link>
              <Link href="/products" className="block">
                <Button size="md" variant="outline" className="w-full">Continue Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
