"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CreditCard, Building2, ChevronRight } from "lucide-react";

type PaymentMethod = "stripe" | "bank_transfer";
type DeliveryType = "standard" | "express";

interface AddressForm {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  district: string;
  province: string;
  postalCode: string;
}

const EMPTY_ADDRESS: AddressForm = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  district: "",
  province: "",
  postalCode: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [step, setStep] = useState<"address" | "payment" | "review">("address");
  const [address, setAddress] = useState<AddressForm>(EMPTY_ADDRESS);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [delivery, setDelivery] = useState<DeliveryType>("standard");
  const [customerNote, setCustomerNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shippingFee =
    delivery === "express" ? 75000 : subtotal >= 500000 ? 0 : 35000;
  const total = subtotal + shippingFee;

  const STEPS = [
    { key: "address", label: "Address" },
    { key: "payment", label: "Payment" },
    { key: "review", label: "Review" },
  ] as const;

  function field(key: keyof AddressForm) {
    return {
      value: address[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setAddress((prev) => ({ ...prev, [key]: e.target.value })),
    };
  }

  function validateAddress(): boolean {
    return !!(
      address.fullName.trim() &&
      address.phone.trim() &&
      address.addressLine1.trim() &&
      address.city.trim() &&
      address.district.trim()
    );
  }

  async function handlePlaceOrder() {
    if (items.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Create the order in DB first (always, both payment methods)
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id ?? null,
          customerName: address.fullName,
          customerEmail: user?.email ?? "",
          customerPhone: address.phone,
          shippingAddressLine1: address.addressLine1,
          shippingAddressLine2: address.addressLine2 || null,
          shippingCity: address.city,
          shippingDistrict: address.district,
          shippingProvince: address.province || null,
          shippingPostalCode: address.postalCode || null,
          paymentMethod,
          shippingCost: shippingFee,
          customerNote: customerNote || null,
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId ?? null,
            productName: i.name,
            variantName: i.variantName ?? null,
            sku: i.sku ?? null,
            quantity: i.quantity,
            unitPrice: i.price,
            imageUrl: i.imageUrl ?? null,
          })),
        }),
      });

      if (!orderRes.ok) {
        const data = await orderRes.json();
        throw new Error(data.error ?? "Failed to create order");
      }

      const { orderNumber } = await orderRes.json();

      // 2. Route by payment method
      if (paymentMethod === "stripe") {
        const sessionRes = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderNumber,
            items: items.map((i) => ({
              name: i.variantName ? `${i.name} — ${i.variantName}` : i.name,
              price: i.price,
              quantity: i.quantity,
              imageUrl: i.imageUrl,
            })),
          }),
        });

        if (!sessionRes.ok) {
          const data = await sessionRes.json();
          throw new Error(data.error ?? "Failed to create payment session");
        }

        const { url } = await sessionRes.json();
        clearCart();
        window.location.href = url;
      } else {
        // bank transfer — go straight to success page
        clearCart();
        router.push(`/checkout/success?orderNumber=${orderNumber}&method=bank`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 ${
                step === s.key
                  ? "bg-[var(--color-primary)] text-white"
                  : STEPS.findIndex((x) => x.key === step) > i
                  ? "bg-green-500 text-white"
                  : "bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)]"
              }`}
            >
              {i + 1}
            </div>
            <span className="ml-2 text-sm font-medium hidden sm:block">{s.label}</span>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px bg-[var(--border)] mx-3" />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main form */}
        <div className="lg:col-span-2">

          {/* ── STEP 1: Address ─────────────────────────────── */}
          {step === "address" && (
            <Card>
              <CardContent className="space-y-4">
                <h2 className="font-semibold">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(
                    [
                      { label: "Full Name *", key: "fullName", placeholder: "Sandun Perera", col: 2 },
                      { label: "Phone Number *", key: "phone", placeholder: "+94 77 123 4567", col: 2 },
                      { label: "Address Line 1 *", key: "addressLine1", placeholder: "123 Main Street", col: 2 },
                      { label: "Address Line 2 (optional)", key: "addressLine2", placeholder: "Apartment, Suite, etc.", col: 2 },
                      { label: "City *", key: "city", placeholder: "Colombo", col: 1 },
                      { label: "District *", key: "district", placeholder: "Colombo", col: 1 },
                      { label: "Province", key: "province", placeholder: "Western", col: 1 },
                      { label: "Postal Code", key: "postalCode", placeholder: "00100", col: 1 },
                    ] as { label: string; key: keyof AddressForm; placeholder: string; col: 1 | 2 }[]
                  ).map((f) => (
                    <div key={f.key} className={f.col === 2 ? "sm:col-span-2" : ""}>
                      <label className="block text-sm font-medium mb-1">{f.label}</label>
                      <input
                        type="text"
                        placeholder={f.placeholder}
                        {...field(f.key)}
                        className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>

                {/* Delivery type */}
                <div className="pt-2">
                  <h3 className="text-sm font-semibold mb-3">Delivery Type</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        key: "standard" as const,
                        label: "Standard",
                        sub: "1–3 business days",
                        price: subtotal >= 500000 ? "Free" : "LKR 350",
                      },
                      {
                        key: "express" as const,
                        label: "Express",
                        sub: "Same / next day",
                        price: "LKR 750",
                      },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setDelivery(opt.key)}
                        className={`text-left p-3 rounded-xl border-2 transition-colors ${
                          delivery === opt.key
                            ? "border-[var(--color-primary)] bg-[var(--brand-50)]"
                            : "border-[var(--border)] hover:border-[var(--color-primary)]"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-sm">{opt.label}</span>
                          <span className="text-xs font-bold text-[var(--color-primary)]">{opt.price}</span>
                        </div>
                        <p className="text-xs text-[var(--muted)] mt-1">{opt.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  disabled={!validateAddress()}
                  onClick={() => setStep("payment")}
                >
                  Continue to Payment <ChevronRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ── STEP 2: Payment ─────────────────────────────── */}
          {step === "payment" && (
            <Card>
              <CardContent className="space-y-5">
                <h2 className="font-semibold">Payment Method</h2>

                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod("stripe")}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-colors flex items-start gap-3 ${
                      paymentMethod === "stripe"
                        ? "border-[var(--color-primary)] bg-[var(--brand-50)]"
                        : "border-[var(--border)]"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mt-0.5 text-[var(--color-primary)] shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Credit / Debit Card</p>
                      <p className="text-xs text-[var(--muted)]">
                        Visa, Mastercard, Amex — you'll be redirected to Stripe's secure checkout
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("bank_transfer")}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-colors flex items-start gap-3 ${
                      paymentMethod === "bank_transfer"
                        ? "border-[var(--color-primary)] bg-[var(--brand-50)]"
                        : "border-[var(--border)]"
                    }`}
                  >
                    <Building2 className="w-5 h-5 mt-0.5 text-[var(--color-primary)] shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Bank Deposit / Transfer</p>
                      <p className="text-xs text-[var(--muted)]">
                        Pay via bank transfer — order confirmed within 24 hours of verification
                      </p>
                    </div>
                  </button>
                </div>

                {paymentMethod === "bank_transfer" && (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-sm space-y-2">
                    <p className="font-semibold">Bank Account Details</p>
                    <div className="space-y-1 text-xs text-amber-900">
                      <p>Bank: <strong>Commercial Bank of Ceylon</strong></p>
                      <p>Account Name: <strong>iCrowed (Pvt) Ltd</strong></p>
                      <p>Account Number: <strong>8002-XXXXXXXX</strong></p>
                      <p>Branch: <strong>Colombo 03</strong></p>
                    </div>
                    <p className="text-xs text-amber-700">
                      After placing your order, note your order number and use it as the transfer reference.
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep("address")}>
                    Back
                  </Button>
                  <Button className="flex-1" onClick={() => setStep("review")}>
                    Review Order <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── STEP 3: Review ──────────────────────────────── */}
          {step === "review" && (
            <Card>
              <CardContent className="space-y-5">
                <h2 className="font-semibold">Review & Place Order</h2>

                {/* Address summary */}
                <div className="p-3 bg-[var(--surface)] rounded-xl text-sm space-y-0.5">
                  <p className="font-medium">{address.fullName}</p>
                  <p className="text-[var(--muted)]">{address.phone}</p>
                  <p className="text-[var(--muted)]">
                    {address.addressLine1}
                    {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                  </p>
                  <p className="text-[var(--muted)]">
                    {address.city}, {address.district}
                    {address.province ? `, ${address.province}` : ""}
                    {address.postalCode ? ` ${address.postalCode}` : ""}
                  </p>
                </div>

                {/* Items */}
                <div className="divide-y divide-[var(--border)]">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between py-3 text-sm">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.variantName && (
                          <p className="text-xs text-[var(--muted)]">{item.variantName}</p>
                        )}
                        <p className="text-xs text-[var(--muted)]">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                {/* Customer note */}
                <div>
                  <label className="block text-sm font-medium mb-1">Order Note (optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Any special instructions..."
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep("payment")}>
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    loading={loading}
                    onClick={handlePlaceOrder}
                  >
                    {paymentMethod === "stripe"
                      ? `Pay with Card — ${formatPrice(total)}`
                      : `Place Order — ${formatPrice(total)}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order summary sidebar */}
        <Card className="self-start sticky top-24">
          <CardContent className="space-y-3">
            <h2 className="font-semibold">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Items ({items.length})</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Shipping</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-[var(--muted)]">
                <span>Payment</span>
                <Badge variant={paymentMethod === "stripe" ? "primary" : "warning"}>
                  {paymentMethod === "stripe" ? "Card" : "Bank Transfer"}
                </Badge>
              </div>
              <div className="border-t border-[var(--border)] pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
