"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CreditCard, Building2, ChevronRight } from "lucide-react";

type PaymentMethod = "stripe" | "bank_transfer";
type DeliveryType = "standard" | "express";

type ShippingRates = {
  standardLkr: number;
  expressLkr: number;
  freeShippingMinSubtotal: number;
};

function shippingFor(
  delivery: DeliveryType,
  subtotal: number,
  rates: ShippingRates | null
): number {
  const r = rates ?? {
    standardLkr: 350,
    expressLkr: 750,
    freeShippingMinSubtotal: 500000,
  };
  if (delivery === "express") return r.expressLkr;
  if (subtotal >= r.freeShippingMinSubtotal) return 0;
  return r.standardLkr;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [step, setStep] = useState<"address" | "payment" | "review">("address");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [delivery, setDelivery] = useState<DeliveryType>("standard");
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState<ShippingRates | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddressLine1: "",
    shippingAddressLine2: "",
    shippingCity: "",
    shippingDistrict: "",
    shippingProvince: "",
    shippingPostalCode: "",
    customerNote: "",
    bankTransferReference: "",
    bankTransferPayerName: "",
    bankTransferProofUrl: "",
  });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/shipping-rates")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.standardLkr != null) {
          setRates({
            standardLkr: data.standardLkr,
            expressLkr: data.expressLkr,
            freeShippingMinSubtotal: data.freeShippingMinSubtotal,
          });
        }
      })
      .catch(() => {
        /* keep null — fallback constants in shippingFor */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const shippingFee = useMemo(
    () => shippingFor(delivery, subtotal, rates),
    [delivery, subtotal, rates]
  );
  const total = subtotal + shippingFee;

  const STEPS = [
    { key: "address", label: "Address" },
    { key: "payment", label: "Payment" },
    { key: "review", label: "Review" },
  ] as const;

  const requiredAddressFields = [
    form.customerName,
    form.customerEmail,
    form.customerPhone,
    form.shippingAddressLine1,
    form.shippingCity,
    form.shippingDistrict,
  ];
  const isAddressValid = requiredAddressFields.every((v) => v.trim().length > 0);

  const bankRefOk =
    paymentMethod !== "bank_transfer" || form.bankTransferReference.trim().length > 0;

  async function placeOrder() {
    if (items.length === 0) return;
    if (!bankRefOk) {
      alert("Please enter your bank transfer / deposit reference.");
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        productName: item.name,
        variantName: item.variantName,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.price,
        imageUrl: item.imageUrl,
      }));

      const createRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone,
          shippingAddressLine1: form.shippingAddressLine1,
          shippingAddressLine2: form.shippingAddressLine2 || undefined,
          shippingCity: form.shippingCity,
          shippingDistrict: form.shippingDistrict,
          shippingProvince: form.shippingProvince || undefined,
          shippingPostalCode: form.shippingPostalCode || undefined,
          customerNote: form.customerNote || undefined,
          items: orderItems,
          paymentMethod,
          delivery,
          discount: 0,
          bankTransferReference:
            paymentMethod === "bank_transfer" ? form.bankTransferReference.trim() : undefined,
          bankTransferPayerName:
            paymentMethod === "bank_transfer"
              ? form.bankTransferPayerName.trim() || undefined
              : undefined,
          bankTransferProofUrl:
            paymentMethod === "bank_transfer"
              ? form.bankTransferProofUrl.trim() || undefined
              : undefined,
        }),
      });
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Failed to create order");
      }

      const { orderNumber } = await createRes.json();

      if (paymentMethod === "stripe") {
        const stripeRes = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderNumber,
            successUrl: `${window.location.origin}/track?orderNumber=${encodeURIComponent(orderNumber)}`,
            cancelUrl: `${window.location.origin}/checkout`,
          }),
        });
        if (!stripeRes.ok) throw new Error("Failed to create Stripe session");

        const { url } = await stripeRes.json();
        if (url) {
          window.location.href = url;
          return;
        }
      }

      clearCart();
      router.push(`/track?orderNumber=${encodeURIComponent(orderNumber)}`);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error ? error.message : "Unable to place order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const standardLabel =
    rates && subtotal >= rates.freeShippingMinSubtotal
      ? "Free"
      : formatPrice(rates?.standardLkr ?? 350);
  const expressLabel = formatPrice(rates?.expressLkr ?? 750);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

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
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-[var(--border)] mx-3" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === "address" && (
            <Card>
              <CardContent className="space-y-4">
                <h2 className="font-semibold">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "customerName", label: "Full Name", placeholder: "Sandun Perera", col: 2 },
                    { key: "customerEmail", label: "Email", placeholder: "you@example.com", col: 2 },
                    { key: "customerPhone", label: "Phone Number", placeholder: "+94 77 123 4567", col: 2 },
                    { key: "shippingAddressLine1", label: "Address Line 1", placeholder: "123 Main Street", col: 2 },
                    { key: "shippingAddressLine2", label: "Address Line 2 (optional)", placeholder: "Apartment, Suite, etc.", col: 2 },
                    { key: "shippingCity", label: "City", placeholder: "Colombo", col: 1 },
                    { key: "shippingDistrict", label: "District", placeholder: "Colombo", col: 1 },
                    { key: "shippingProvince", label: "Province", placeholder: "Western", col: 1 },
                    { key: "shippingPostalCode", label: "Postal Code", placeholder: "00100", col: 1 },
                  ].map((field) => (
                    <div key={field.label} className={field.col === 2 ? "sm:col-span-2" : ""}>
                      <label className="block text-sm font-medium mb-1">{field.label}</label>
                      <input
                        type={field.key === "customerEmail" ? "email" : "text"}
                        placeholder={field.placeholder}
                        value={form[field.key as keyof typeof form]}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                        className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <h3 className="text-sm font-semibold mb-3">Delivery Type</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        key: "standard" as const,
                        label: "Standard",
                        sub: "1–3 business days",
                        price: standardLabel,
                      },
                      {
                        key: "express" as const,
                        label: "Express",
                        sub: "Same / next day",
                        price: expressLabel,
                      },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
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
                  {rates ? (
                    <p className="text-xs text-[var(--muted)] mt-2">
                      Standard shipping is free when your items subtotal is at least{" "}
                      {formatPrice(rates.freeShippingMinSubtotal)} (before shipping).
                    </p>
                  ) : null}
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => setStep("payment")}
                  disabled={!isAddressValid}
                >
                  Continue to Payment <ChevronRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {step === "payment" && (
            <Card>
              <CardContent className="space-y-5">
                <h2 className="font-semibold">Payment Method</h2>

                <div className="space-y-3">
                  <button
                    type="button"
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
                      <p className="text-xs text-[var(--muted)]">Secured by Stripe — you will redirect to pay</p>
                    </div>
                  </button>

                  <button
                    type="button"
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
                        Transfer the order total and enter the details below
                      </p>
                    </div>
                  </button>
                </div>

                {paymentMethod === "stripe" && (
                  <div className="p-4 bg-[var(--surface)] rounded-xl text-sm text-[var(--muted)]">
                    After you review your order, you will be taken to Stripe Checkout to complete
                    payment for <strong>{formatPrice(total)}</strong> (items + shipping shown in the
                    summary).
                  </div>
                )}

                {paymentMethod === "bank_transfer" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-sm space-y-2">
                      <p className="font-semibold">Bank Account Details</p>
                      <div className="space-y-1 text-xs text-amber-900">
                        <p>
                          Bank: <strong>Commercial Bank of Ceylon</strong>
                        </p>
                        <p>
                          Account Name: <strong>iCrowed (Pvt) Ltd</strong>
                        </p>
                        <p>
                          Account Number: <strong>8002-XXXXXXXX</strong>
                        </p>
                        <p>
                          Branch: <strong>Colombo 03</strong>
                        </p>
                      </div>
                      <p className="text-xs text-amber-700 font-medium">
                        Amount to transfer: {formatPrice(total)}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Transfer / deposit reference <span className="text-red-600">*</span>
                        </label>
                        <input
                          className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                          placeholder="e.g. transaction ref, slip number"
                          value={form.bankTransferReference}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, bankTransferReference: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Name on bank account (optional)</label>
                        <input
                          className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                          placeholder="As shown on your transfer"
                          value={form.bankTransferPayerName}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, bankTransferPayerName: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Deposit slip link (optional)</label>
                        <input
                          type="url"
                          className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                          placeholder="https://… (e.g. cloud link to your slip image)"
                          value={form.bankTransferProofUrl}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, bankTransferProofUrl: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep("address")}>
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setStep("review")}
                    disabled={paymentMethod === "bank_transfer" && !form.bankTransferReference.trim()}
                  >
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
                        {item.variantName && (
                          <p className="text-xs text-[var(--muted)]">{item.variantName}</p>
                        )}
                        <p className="text-xs text-[var(--muted)]">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Items subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Shipping ({delivery})</span>
                    <span className="font-medium">
                      {shippingFee === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[var(--border)] pt-2 font-bold">
                    <span>Total due</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--muted)] text-xs pt-1">
                    <span>Payment</span>
                    <Badge variant={paymentMethod === "stripe" ? "primary" : "warning"}>
                      {paymentMethod === "stripe" ? "Card (Stripe)" : "Bank transfer"}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep("payment")}>
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    loading={loading}
                    disabled={items.length === 0 || !bankRefOk}
                    onClick={placeOrder}
                  >
                    Place Order — {formatPrice(total)}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

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
