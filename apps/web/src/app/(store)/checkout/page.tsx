"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CreditCard, Building2, ChevronRight } from "lucide-react";

type PaymentMethod = "stripe" | "bank_transfer";
type DeliveryType = "standard" | "express";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [step, setStep] = useState<"address" | "payment" | "review">("address");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [delivery, setDelivery] = useState<DeliveryType>("standard");
  const [loading, setLoading] = useState(false);

  const shippingFee = delivery === "express" ? 75000 : subtotal >= 500000 ? 0 : 35000;
  const total = subtotal + shippingFee;

  const STEPS = [
    { key: "address", label: "Address" },
    { key: "payment", label: "Payment" },
    { key: "review", label: "Review" },
  ] as const;

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
          {step === "address" && (
            <Card>
              <CardContent className="space-y-4">
                <h2 className="font-semibold">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Full Name", placeholder: "Sandun Perera", col: 2 },
                    { label: "Phone Number", placeholder: "+94 77 123 4567", col: 2 },
                    { label: "Address Line 1", placeholder: "123 Main Street", col: 2 },
                    { label: "Address Line 2 (optional)", placeholder: "Apartment, Suite, etc.", col: 2 },
                    { label: "City", placeholder: "Colombo", col: 1 },
                    { label: "District", placeholder: "Colombo", col: 1 },
                    { label: "Province", placeholder: "Western", col: 1 },
                    { label: "Postal Code", placeholder: "00100", col: 1 },
                  ].map((field) => (
                    <div key={field.label} className={field.col === 2 ? "sm:col-span-2" : ""}>
                      <label className="block text-sm font-medium mb-1">{field.label}</label>
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>

                {/* Delivery */}
                <div className="pt-2">
                  <h3 className="text-sm font-semibold mb-3">Delivery Type</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: "standard" as const, label: "Standard", sub: "1-3 business days", price: subtotal >= 500000 ? "Free" : "LKR 350" },
                      { key: "express" as const, label: "Express", sub: "Same / next day", price: "LKR 750" },
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

                <Button size="lg" className="w-full" onClick={() => setStep("payment")}>
                  Continue to Payment <ChevronRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {step === "payment" && (
            <Card>
              <CardContent className="space-y-5">
                <h2 className="font-semibold">Payment Method</h2>

                {/* Payment options */}
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
                      <p className="text-xs text-[var(--muted)]">Visa, Mastercard, Amex — secured by Stripe</p>
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
                        Pay via bank transfer and upload your deposit slip
                      </p>
                    </div>
                  </button>
                </div>

                {paymentMethod === "stripe" && (
                  <div className="space-y-3 p-4 bg-[var(--surface)] rounded-xl">
                    <div>
                      <label className="text-xs font-medium mb-1 block">Card Number</label>
                      <input
                        className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        placeholder="4242 4242 4242 4242"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium mb-1 block">Expiry</label>
                        <input
                          className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                          placeholder="MM / YY"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block">CVV</label>
                        <input
                          className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </div>
                )}

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
                      After placing your order, upload your deposit slip. Orders are confirmed once payment is verified (within 24 hours).
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

          {step === "review" && (
            <Card>
              <CardContent className="space-y-5">
                <h2 className="font-semibold">Review & Place Order</h2>

                <div className="divide-y divide-[var(--border)]">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between py-3 text-sm">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.variantName && <p className="text-xs text-[var(--muted)]">{item.variantName}</p>}
                        <p className="text-xs text-[var(--muted)]">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep("payment")}>
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    loading={loading}
                    onClick={() => {
                      setLoading(true);
                      // TODO: call /api/orders or /api/stripe/checkout
                      setTimeout(() => setLoading(false), 2000);
                    }}
                  >
                    Place Order — {formatPrice(total)}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary */}
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
                  {shippingFee === 0
                    ? <span className="text-green-600">Free</span>
                    : formatPrice(shippingFee)}
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
