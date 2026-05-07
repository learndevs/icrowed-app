"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CreditCard, Building2, Truck, ChevronRight, Tag, X, MapPin } from "lucide-react";

type PaymentMethod = "payhere" | "bank_transfer" | "cash_on_delivery";
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

interface SavedAddress {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  district: string;
  province: string | null;
  postalCode: string | null;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, coupon, removeCoupon, clearCart } = useCart();

  const [step, setStep] = useState<"address" | "payment" | "review">("address");
  const [address, setAddress] = useState<AddressForm>(EMPTY_ADDRESS);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [delivery, setDelivery] = useState<DeliveryType>("standard");
  const [customerNote, setCustomerNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);

  // Load saved addresses on mount
  useEffect(() => {
    fetch("/api/addresses")
      .then(async (res) => {
        if (!res.ok) return;
        const data: SavedAddress[] = await res.json();
        setSavedAddresses(data);
        const def = data.find((a) => a.isDefault) ?? data[0];
        if (def) {
          setSelectedSavedId(def.id);
          applyAddress(def);
        }
      })
      .catch(() => {});
  }, []);

  function applyAddress(a: SavedAddress) {
    setAddress({
      fullName: a.recipientName,
      phone: a.phone,
      addressLine1: a.addressLine1,
      addressLine2: a.addressLine2 ?? "",
      city: a.city,
      district: a.district,
      province: a.province ?? "",
      postalCode: a.postalCode ?? "",
    });
  }

  const shippingFee =
    delivery === "express" ? 75000 : subtotal >= 500000 ? 0 : 35000;
  const couponDiscount = coupon?.discount ?? 0;
  const total = subtotal + shippingFee - couponDiscount;

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

      // Create order in DB
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
          discount: couponDiscount,
          couponCode: coupon?.code ?? null,
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

      if (paymentMethod === "payhere") {
        // Get PayHere form params from server (hash computed server-side)
        const initiateRes = await fetch("/api/payhere/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderNumber,
            total,
            customerName: address.fullName,
            customerEmail: user?.email ?? "",
            customerPhone: address.phone,
            address: address.addressLine1,
            city: address.city,
          }),
        });

        if (!initiateRes.ok) {
          const data = await initiateRes.json();
          throw new Error(data.error ?? "Failed to initiate PayHere payment");
        }

        const { checkoutUrl, params } = await initiateRes.json();
        clearCart();
        removeCoupon();
        // Dynamically build and submit the form — avoids React render timing issues
        const form = document.createElement("form");
        form.method = "POST";
        form.action = checkoutUrl;
        form.style.display = "none";
        for (const [key, value] of Object.entries(params as Record<string, string>)) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value;
          form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();

      } else if (paymentMethod === "cash_on_delivery") {
        clearCart();
        removeCoupon();
        router.push(`/checkout/success?orderNumber=${orderNumber}&method=cod`);

      } else {
        // bank_transfer
        clearCart();
        removeCoupon();
        router.push(`/checkout/success?orderNumber=${orderNumber}&method=bank`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  const paymentBadgeLabel: Record<PaymentMethod, string> = {
    payhere: "Card / Online",
    bank_transfer: "Bank Transfer",
    cash_on_delivery: "Cash on Delivery",
  };

  const placeBtnLabel = () => {
    if (paymentMethod === "payhere") return `Pay with Card — ${formatPrice(total)}`;
    if (paymentMethod === "cash_on_delivery") return `Place Order (COD) — ${formatPrice(total)}`;
    return `Place Order — ${formatPrice(total)}`;
  };

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

                {savedAddresses.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Saved Addresses</p>
                    <div className="space-y-2">
                      {savedAddresses.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => { setSelectedSavedId(a.id); applyAddress(a); }}
                          className={`w-full text-left p-3 rounded-xl border-2 transition-colors flex items-start gap-3 ${
                            selectedSavedId === a.id
                              ? "border-[var(--color-primary)] bg-[var(--brand-50)]"
                              : "border-[var(--border)] hover:border-[var(--color-primary)]"
                          }`}
                        >
                          <MapPin className="w-4 h-4 mt-0.5 text-[var(--color-primary)] shrink-0" />
                          <div className="text-sm">
                            <p className="font-medium">{a.label} — {a.recipientName}</p>
                            <p className="text-[var(--muted)] text-xs mt-0.5">
                              {a.addressLine1}, {a.city}, {a.district}
                            </p>
                          </div>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => { setSelectedSavedId(null); setAddress(EMPTY_ADDRESS); }}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-colors text-sm ${
                          selectedSavedId === null
                            ? "border-[var(--color-primary)] bg-[var(--brand-50)]"
                            : "border-[var(--border)] hover:border-[var(--color-primary)]"
                        }`}
                      >
                        + Enter a new address
                      </button>
                    </div>
                    <div className="border-t border-[var(--border)] pt-2" />
                  </div>
                )}

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
                  {/* PayHere — Card / Online */}
                  <button
                    onClick={() => setPaymentMethod("payhere")}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-colors flex items-start gap-3 ${
                      paymentMethod === "payhere"
                        ? "border-[var(--color-primary)] bg-[var(--brand-50)]"
                        : "border-[var(--border)]"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mt-0.5 text-[var(--color-primary)] shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Card / Online Payment</p>
                      <p className="text-xs text-[var(--muted)]">
                        Visa, Mastercard, and more — powered by PayHere secure checkout
                      </p>
                    </div>
                  </button>

                  {/* Bank Transfer */}
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

                  {/* Cash on Delivery */}
                  <button
                    onClick={() => setPaymentMethod("cash_on_delivery")}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-colors flex items-start gap-3 ${
                      paymentMethod === "cash_on_delivery"
                        ? "border-[var(--color-primary)] bg-[var(--brand-50)]"
                        : "border-[var(--border)]"
                    }`}
                  >
                    <Truck className="w-5 h-5 mt-0.5 text-[var(--color-primary)] shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Cash on Delivery</p>
                      <p className="text-xs text-[var(--muted)]">
                        Pay in cash when your order arrives — available for selected areas
                      </p>
                    </div>
                  </button>
                </div>

                {/* Bank transfer details */}
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

                {/* COD notice */}
                {paymentMethod === "cash_on_delivery" && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-sm space-y-1">
                    <p className="font-semibold text-blue-900">Cash on Delivery</p>
                    <p className="text-xs text-blue-800">
                      Have the exact amount ready when our delivery partner arrives. A confirmation call may be made before dispatch.
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
                    {placeBtnLabel()}
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
            {coupon && (
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-xs">
                <span className="text-green-700 font-medium flex items-center gap-1">
                  <Tag className="w-3 h-3" />{coupon.message}
                </span>
                <button onClick={removeCoupon} className="text-green-600 hover:text-green-800 ml-2">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
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
                <Badge variant={paymentMethod === "payhere" ? "primary" : "warning"}>
                  {paymentBadgeLabel[paymentMethod]}
                </Badge>
              </div>
              {coupon && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1 text-xs">
                    <Tag className="w-3 h-3" />{coupon.code}
                  </span>
                  <span>− {formatPrice(coupon.discount)}</span>
                </div>
              )}
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
