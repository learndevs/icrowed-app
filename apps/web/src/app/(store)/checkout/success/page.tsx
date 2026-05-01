"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight, Send, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

function SuccessContent() {
  const params = useSearchParams();
  const orderNumber = params.get("orderNumber");
  const method = params.get("method");

  const isBankTransfer = method === "bank";
  const isCOD = method === "cod";
  const isPayHere = method === "payhere";

  const [reference, setReference] = useState("");
  const [refSaving, setRefSaving] = useState(false);
  const [refSaved, setRefSaved] = useState(false);
  const [refError, setRefError] = useState<string | null>(null);

  async function submitReference() {
    if (!reference.trim() || !orderNumber) return;
    setRefSaving(true);
    setRefError(null);
    try {
      const res = await fetch(`/api/orders?orderNumber=${encodeURIComponent(orderNumber)}`);
      if (!res.ok) throw new Error("Order not found");
      const order = await res.json();
      if (!order?.id) throw new Error("Order not found");

      const patch = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankTransferReference: reference.trim() }),
      });
      if (!patch.ok) throw new Error("Failed to save reference");
      setRefSaved(true);
    } catch (err: unknown) {
      setRefError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setRefSaving(false);
    }
  }

  const headline = () => {
    if (isCOD) return "Order Placed!";
    if (isPayHere) return "Payment Successful!";
    return "Order Placed!";
  };

  const subtitle = () => {
    if (isCOD) return "Your order is confirmed. Pay in cash when your delivery arrives.";
    if (isPayHere) return "Your payment was processed. We're preparing your order now.";
    if (isBankTransfer) return "Your order has been received. Please complete your bank transfer to confirm it.";
    return "Payment confirmed. We're preparing your order.";
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="flex justify-center mb-6">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isCOD ? "bg-blue-50" : "bg-green-50"}`}>
          {isCOD ? (
            <Truck className="w-10 h-10 text-blue-500" />
          ) : (
            <CheckCircle className="w-10 h-10 text-green-500" />
          )}
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-2">{headline()}</h1>
      <p className="text-muted mb-8">{subtitle()}</p>

      {orderNumber && (
        <Card className="mb-6 text-left">
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Order Number</span>
              <span className="font-mono font-bold">{orderNumber}</span>
            </div>

            {/* Bank transfer instructions */}
            {isBankTransfer && (
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1.5">
                  <p className="font-semibold text-sm">Complete your bank transfer</p>
                  <p>Bank: <strong>Commercial Bank of Ceylon</strong></p>
                  <p>Account Name: <strong>iCrowed (Pvt) Ltd</strong></p>
                  <p>Account Number: <strong>8002-XXXXXXXX</strong></p>
                  <p>Branch: <strong>Colombo 03</strong></p>
                  <p className="mt-2">Use <strong>{orderNumber}</strong> as your payment reference. Your order will be confirmed within 24 hours.</p>
                </div>

                {refSaved ? (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    Reference saved — our team will verify your payment shortly.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted">
                      Already transferred? Share your bank reference number:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && submitReference()}
                        placeholder="e.g. TXN-20260428-001"
                        className="flex-1 h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <Button
                        size="sm"
                        disabled={refSaving || !reference.trim()}
                        onClick={submitReference}
                      >
                        <Send className="w-4 h-4" />
                        {refSaving ? "Saving…" : "Submit"}
                      </Button>
                    </div>
                    {refError && (
                      <p className="text-xs text-red-600">{refError}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* COD info */}
            {isCOD && (
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-800 space-y-1.5">
                <p className="font-semibold text-sm">Cash on Delivery</p>
                <p>Please have <strong>exact change</strong> ready when our delivery partner arrives.</p>
                <p>Our team may contact you to confirm delivery details before dispatch.</p>
              </div>
            )}

            {/* PayHere success note */}
            {isPayHere && (
              <div className="p-3 bg-green-50 rounded-xl border border-green-200 text-xs text-green-800">
                <p>Your card payment was processed successfully via PayHere. You will receive an email confirmation shortly.</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted">
              <Package className="w-4 h-4 shrink-0" />
              <span>You can track your order using the order number above.</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {orderNumber && (
          <Link href={`/track?orderNumber=${orderNumber}`}>
            <Button variant="outline">Track Order</Button>
          </Link>
        )}
        <Link href="/products">
          <Button>
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
