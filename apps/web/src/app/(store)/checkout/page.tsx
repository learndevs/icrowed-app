"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { BankDetailsCard } from "@/components/checkout/BankDetailsCard";
import { BankSlipUpload } from "@/components/checkout/BankSlipUpload";
import {
  DEFAULT_BANK_DETAILS,
  type BankDetails,
} from "@/lib/bank-details";
import {
  CreditCard,
  Banknote,
  Truck,
  ChevronRight,
  Tag,
  X,
  MapPin,
  Check,
  ShoppingBag,
  ChevronDown,
} from "lucide-react";

type PaymentMethod = "payhere" | "bank_transfer" | "cash_on_delivery";

interface DeliveryTypeOption {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceLkr: number;
  eligibleForFreeShipping: boolean;
}

function computeDeliveryFee(
  type: DeliveryTypeOption,
  cartSubtotal: number,
  freeShippingMinSubtotal: number,
): number {
  if (type.eligibleForFreeShipping && cartSubtotal >= freeShippingMinSubtotal) {
    return 0;
  }
  return type.priceLkr;
}

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
  const [deliveryTypes, setDeliveryTypes] = useState<DeliveryTypeOption[]>([]);
  const [freeShippingMinSubtotal, setFreeShippingMinSubtotal] = useState(0);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [customerNote, setCustomerNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails>(DEFAULT_BANK_DETAILS);
  const [bankSlipFile, setBankSlipFile] = useState<File | null>(null);
  const [customerEmail, setCustomerEmail] = useState("");

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (user?.email) setCustomerEmail(user.email);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/bank-details")
      .then(async (res) => {
        if (!res.ok) return;
        const data: BankDetails = await res.json();
        setBankDetails(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/delivery-types")
      .then(async (res) => {
        if (!res.ok) return;
        const data: {
          freeShippingMinSubtotal: number;
          types: DeliveryTypeOption[];
        } = await res.json();
        setDeliveryTypes(data.types);
        setFreeShippingMinSubtotal(data.freeShippingMinSubtotal);
        if (data.types.length > 0) {
          setSelectedDeliveryId(data.types[0].id);
        }
      })
      .catch(() => {});
  }, []);

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

  const selectedDelivery = deliveryTypes.find((t) => t.id === selectedDeliveryId) ?? null;
  const shippingFee = selectedDelivery
    ? computeDeliveryFee(selectedDelivery, subtotal, freeShippingMinSubtotal)
    : 0;
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

  function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function validateAddress(): boolean {
    return !!(
      address.fullName.trim() &&
      address.phone.trim() &&
      isValidEmail(customerEmail) &&
      address.addressLine1.trim() &&
      address.district.trim()
    );
  }

  async function handlePlaceOrder() {
    if (items.length === 0) return;
    if (!selectedDeliveryId) {
      setError("Please select a delivery type");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id ?? null,
          customerName: address.fullName,
          customerEmail: customerEmail.trim(),
          customerPhone: address.phone,
          shippingAddressLine1: address.addressLine1,
          shippingAddressLine2: address.addressLine2 || null,
          shippingCity: address.city,
          shippingDistrict: address.district,
          shippingProvince: address.province || null,
          shippingPostalCode: address.postalCode || null,
          paymentMethod,
          deliveryTypeId: selectedDeliveryId,
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
        const initiateRes = await fetch("/api/payhere/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderNumber,
            total,
            customerName: address.fullName,
            customerEmail: customerEmail.trim(),
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
        const form = document.createElement("form");
        form.method = "POST";
        form.action = checkoutUrl;
        form.style.display = "none";
        for (const [key, value] of Object.entries(
          params as Record<string, string>
        )) {
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
        router.push(
          `/checkout/success?orderNumber=${orderNumber}&method=cod`
        );
      } else {
        if (paymentMethod === "bank_transfer" && bankSlipFile) {
          const slipForm = new FormData();
          slipForm.append("orderNumber", orderNumber);
          slipForm.append("file", bankSlipFile);
          await fetch("/api/orders/bank-transfer-proof", {
            method: "POST",
            body: slipForm,
          });
        }
        clearCart();
        removeCoupon();
        router.push(
          `/checkout/success?orderNumber=${orderNumber}&method=bank`
        );
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
    if (paymentMethod === "payhere") return "Pay with Card";
    if (paymentMethod === "cash_on_delivery") return "Place Order (COD)";
    return "Place Order";
  };

  const currentStepIndex = STEPS.findIndex((x) => x.key === step);

  /* ── Input style shared across fields ── */
  const inputCls =
    "w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-all";

  const selectedCardCls =
    "border-gray-900 bg-gray-100";
  const unselectedCardCls =
    "border-gray-100 bg-gray-50/50 hover:border-gray-300";

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

        {/* ── Page header ── */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-sm text-gray-500 mt-1">
            {items.length} item{items.length !== 1 ? "s" : ""} in your order
          </p>
        </div>

        {/* ── Step indicator ── */}
        <div className="mb-6 sm:mb-10">
          {/* Mobile: progress bar */}
          <div className="sm:hidden mb-2">
            <div className="flex gap-1.5 mb-2">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                    i <= currentStepIndex ? "bg-gray-900" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">
                Step {currentStepIndex + 1} of {STEPS.length}
              </span>
              <span className="font-semibold text-gray-900">
                {STEPS[currentStepIndex].label}
              </span>
            </div>
          </div>

          {/* Desktop: step bubbles */}
          <div className="hidden sm:flex items-center">
            {STEPS.map((s, i) => {
              const isDone = currentStepIndex > i;
              const isActive = step === s.key;
              return (
                <div
                  key={s.key}
                  className="flex items-center flex-1 last:flex-none"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold shrink-0 transition-all duration-300 ${
                        isActive
                          ? "bg-gray-900 text-white shadow-lg shadow-gray-200 scale-110"
                          : isDone
                          ? "bg-gray-900 text-white"
                          : "bg-white text-gray-400 border-2 border-gray-200"
                      }`}
                    >
                      {isDone ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    <span
                      className={`text-sm font-semibold transition-colors ${
                        isActive
                          ? "text-gray-900"
                          : isDone
                          ? "text-gray-700"
                          : "text-gray-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 mx-4 h-0.5 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className={`h-full bg-gray-900 transition-all duration-500 ${
                          isDone ? "w-full" : "w-0"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Main column ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Mobile: collapsible order summary */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setSummaryOpen(!summaryOpen)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm text-sm"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-gray-900" />
                  <span className="font-semibold text-gray-900">
                    Order Summary
                  </span>
                  <span className="text-gray-400">— {formatPrice(total)}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    summaryOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {summaryOpen && (
                <div className="mt-2 bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3 text-sm">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        {item.variantName && (
                          <p className="text-xs text-gray-400">
                            {item.variantName}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900 shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Shipping</span>
                      <span>
                        {shippingFee === 0 ? (
                          <span className="text-gray-900 font-medium">
                            Free
                          </span>
                        ) : (
                          formatPrice(shippingFee)
                        )}
                      </span>
                    </div>
                    {coupon && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Coupon ({coupon.code})</span>
                        <span>− {formatPrice(coupon.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── STEP 1: Address ── */}
            {step === "address" && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="font-semibold text-gray-900">
                    Shipping Address
                  </h2>
                </div>

                <div className="p-6 space-y-6">
                  {/* Saved addresses */}
                  {savedAddresses.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Saved Addresses
                      </p>
                      <div className="space-y-2">
                        {savedAddresses.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => {
                              setSelectedSavedId(a.id);
                              applyAddress(a);
                            }}
                            className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 ${
                              selectedSavedId === a.id
                                ? selectedCardCls
                                : unselectedCardCls
                            }`}
                          >
                            <MapPin
                              className={`w-4 h-4 mt-0.5 shrink-0 ${
                                selectedSavedId === a.id
                                  ? "text-gray-900"
                                  : "text-gray-400"
                              }`}
                            />
                            <div className="flex-1 min-w-0 text-sm">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900">
                                  {a.label} — {a.recipientName}
                                </p>
                                {a.isDefault && (
                                  <span className="text-[10px] bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded-md font-semibold">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-400 text-xs mt-0.5 truncate">
                                {a.addressLine1}, {a.city}, {a.district}
                              </p>
                            </div>
                            {selectedSavedId === a.id && (
                              <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSavedId(null);
                            setAddress(EMPTY_ADDRESS);
                          }}
                          className={`w-full text-left p-3.5 rounded-xl border-2 transition-all text-sm font-medium ${
                            selectedSavedId === null
                              ? `${selectedCardCls} text-gray-900`
                              : "border-dashed border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900"
                          }`}
                        >
                          + Enter a new address
                        </button>
                      </div>
                      <div className="border-t border-gray-100" />
                    </div>
                  )}

                  {/* Address fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(
                      [
                        {
                          label: "Full Name",
                          key: "fullName",
                          placeholder: "Jane Doe",
                          col: 2,
                          required: true,
                        },
                        {
                          label: "Phone Number",
                          key: "phone",
                          placeholder: "+94 77 123 4567",
                          col: 2,
                          required: true,
                        },
                        {
                          label: "Email",
                          key: "email",
                          placeholder: "you@example.com",
                          col: 2,
                          required: true,
                          type: "email",
                        },
                        {
                          label: "Address",
                          key: "addressLine1",
                          placeholder: "123 Main Street",
                          col: 2,
                          required: true,
                        },
                        {
                          label: "District",
                          key: "district",
                          placeholder: "Colombo",
                          col: 1,
                          required: true,
                        },
                        {
                          label: "Province",
                          key: "province",
                          placeholder: "Western",
                          col: 1,
                          required: false,
                        },
                      ] as {
                        label: string;
                        key: keyof AddressForm | "email";
                        placeholder: string;
                        col: 1 | 2;
                        required: boolean;
                        type?: string;
                      }[]
                    ).map((f) => (
                      <div
                        key={f.key}
                        className={f.col === 2 ? "sm:col-span-2" : ""}
                      >
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                          {f.label}
                          {f.required && (
                            <span className="text-red-400 ml-0.5">*</span>
                          )}
                        </label>
                        {f.key === "email" ? (
                          <input
                            type="email"
                            placeholder={f.placeholder}
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            className={inputCls}
                            autoComplete="email"
                          />
                        ) : (
                          <input
                            type={f.type ?? "text"}
                            placeholder={f.placeholder}
                            {...field(f.key as keyof AddressForm)}
                            className={inputCls}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Delivery type */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Delivery Type
                    </p>
                    {deliveryTypes.length === 0 ? (
                      <p className="text-sm text-gray-400">
                        Loading delivery options…
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {deliveryTypes.map((opt) => {
                          const fee = computeDeliveryFee(
                            opt,
                            subtotal,
                            freeShippingMinSubtotal,
                          );
                          const priceLabel =
                            fee === 0 ? "Free" : formatPrice(fee);
                          const isSelected = selectedDeliveryId === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setSelectedDeliveryId(opt.id)}
                              className={`text-left p-4 rounded-xl border-2 transition-all ${
                                isSelected ? selectedCardCls : unselectedCardCls
                              }`}
                            >
                              <div className="flex justify-between items-start mb-1.5">
                                <span className="font-semibold text-sm text-gray-900">
                                  {opt.name}
                                </span>
                                {isSelected && (
                                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                {opt.description && (
                                  <p className="text-xs text-gray-400">
                                    {opt.description}
                                  </p>
                                )}
                                <span className="text-xs font-bold text-gray-900 shrink-0">
                                  {priceLabel}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <Button
                    size="lg"
                    className="w-full rounded-xl bg-gray-900 text-white hover:bg-gray-800"
                    disabled={!validateAddress() || !selectedDeliveryId}
                    onClick={() => setStep("payment")}
                  >
                    Continue to Payment{" "}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Payment ── */}
            {step === "payment" && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="font-semibold text-gray-900">
                    Payment Method
                  </h2>
                </div>

                <div className="p-6 space-y-5">
                  <div className="space-y-3">
                    {(
                      [
                        {
                          key: "bank_transfer" as PaymentMethod,
                          Icon: Banknote,
                          title: "Bank Deposit / Transfer",
                          desc: "Pay via bank transfer — order confirmed within 24 hours of verification",
                          badge: null,
                        },
                        {
                          key: "cash_on_delivery" as PaymentMethod,
                          Icon: Truck,
                          title: "Cash on Delivery",
                          desc: "Pay in cash when your order arrives — available for selected areas",
                          badge: null,
                        },
                      ] as {
                        key: PaymentMethod;
                        Icon: React.ElementType;
                        title: string;
                        desc: string;
                        badge: string | null;
                      }[]
                    ).map(({ key, Icon, title, desc, badge }) => (
                      <button
                        key={key}
                        onClick={() => setPaymentMethod(key)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 ${
                          paymentMethod === key
                            ? selectedCardCls
                            : unselectedCardCls
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            paymentMethod === key
                              ? "bg-gray-900"
                              : "bg-gray-100"
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${
                              paymentMethod === key
                                ? "text-white"
                                : "text-gray-500"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm text-gray-900">
                              {title}
                            </p>
                            {badge && (
                              <span className="text-[10px] bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded-md font-semibold">
                                {badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {desc}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                            paymentMethod === key
                              ? "border-gray-900 bg-gray-900"
                              : "border-gray-300"
                          }`}
                        >
                          {paymentMethod === key && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Bank transfer details */}
                  {paymentMethod === "bank_transfer" && (
                    <div className="space-y-4">
                      <BankDetailsCard details={bankDetails} />
                      <BankSlipUpload
                        file={bankSlipFile}
                        onFileChange={setBankSlipFile}
                        hint="Optional now — you can also upload after placing your order."
                      />
                    </div>
                  )}

                  {/* COD notice */}
                  {paymentMethod === "cash_on_delivery" && (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                      <p className="text-sm font-semibold text-gray-900">
                        Cash on Delivery
                      </p>
                      <p className="text-xs text-gray-600">
                        Have the exact amount ready when our delivery partner
                        arrives. A confirmation call may be made before
                        dispatch.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-1">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
                      onClick={() => setStep("address")}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
                      onClick={() => setStep("review")}
                    >
                      Review Order <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: Review ── */}
            {step === "review" && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="font-semibold text-gray-900">
                    Review & Place Order
                  </h2>
                </div>

                <div className="p-6 space-y-5">
                  {/* Address summary */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-900 shrink-0 mt-0.5" />
                    <div className="text-sm space-y-0.5 flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">
                        {address.fullName}
                      </p>
                      <p className="text-gray-500">{customerEmail}</p>
                      <p className="text-gray-500">{address.phone}</p>
                      <p className="text-gray-500">{address.addressLine1}</p>
                      <p className="text-gray-500">
                        {address.district}
                        {address.province ? `, ${address.province}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => setStep("address")}
                      className="text-xs text-gray-900 hover:underline shrink-0"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Delivery summary */}
                  {selectedDelivery && (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                      <Truck className="w-4 h-4 text-gray-900 shrink-0" />
                      <span className="text-sm font-medium text-gray-700 flex-1">
                        {selectedDelivery.name}
                        {shippingFee === 0
                          ? " — Free"
                          : ` — ${formatPrice(shippingFee)}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setStep("address")}
                        className="text-xs text-gray-900 hover:underline shrink-0"
                      >
                        Edit
                      </button>
                    </div>
                  )}

                  {/* Payment summary */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-gray-900 shrink-0" />
                    <span className="text-sm font-medium text-gray-700 flex-1">
                      {paymentBadgeLabel[paymentMethod]}
                    </span>
                    <button
                      onClick={() => setStep("payment")}
                      className="text-xs text-gray-900 hover:underline shrink-0"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Items
                    </p>
                    <div className="divide-y divide-gray-50">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between py-3 text-sm"
                        >
                          <div className="flex-1 min-w-0 pr-3">
                            <p className="font-medium text-gray-900">
                              {item.name}
                            </p>
                            {item.variantName && (
                              <p className="text-xs text-gray-400">
                                {item.variantName}
                              </p>
                            )}
                            <p className="text-xs text-gray-400">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900 shrink-0">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer note */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Order Note{" "}
                      <span className="font-normal normal-case text-gray-400">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Any special instructions..."
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-all resize-none"
                    />
                  </div>

                  {error && (
                    <div className="flex items-start gap-2.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      <X className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-1">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
                      onClick={() => setStep("payment")}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
                      loading={loading}
                      onClick={handlePlaceOrder}
                    >
                      {placeBtnLabel()}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Order summary sidebar (desktop only) ── */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm sticky top-24 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-gray-900" />
                <h2 className="font-semibold text-gray-900">Order Summary</h2>
              </div>

              <div className="p-5 space-y-4">
                {coupon && (
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      {coupon.message}
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-emerald-600 hover:text-emerald-800 ml-2"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Item list */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-2 text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        {item.variantName && (
                          <p className="text-xs text-gray-400 truncate">
                            {item.variantName}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900 shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Price breakdown */}
                <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal ({items.length} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span>
                      {shippingFee === 0 ? (
                        <span className="text-gray-900 font-medium">
                          Free
                        </span>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
                  </div>
                  {coupon && (
                    <div className="flex justify-between text-emerald-600">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {coupon.code}
                      </span>
                      <span>− {formatPrice(coupon.discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900 text-base">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="border-t border-gray-100 pt-3 space-y-2">
                  {[
                    { emoji: "🔒", text: "Secure checkout" },
                    { emoji: "✅", text: "100% genuine products" },
                    { emoji: "↩️", text: "7-day easy returns" },
                  ].map((t) => (
                    <div
                      key={t.text}
                      className="flex items-center gap-2 text-xs text-gray-400"
                    >
                      <span>{t.emoji}</span>
                      <span>{t.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
