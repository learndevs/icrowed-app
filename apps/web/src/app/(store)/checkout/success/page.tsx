"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

function SuccessContent() {
  const params = useSearchParams();
  const orderNumber = params.get("orderNumber");
  const method = params.get("method");
  const isBankTransfer = method === "bank";

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-2">Order Placed!</h1>
      <p className="text-[var(--muted)] mb-8">
        {isBankTransfer
          ? "Your order has been received. Please complete your bank transfer to confirm it."
          : "Payment confirmed. We're preparing your order."}
      </p>

      {orderNumber && (
        <Card className="mb-6 text-left">
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--muted)]">Order Number</span>
              <span className="font-mono font-bold">{orderNumber}</span>
            </div>

            {isBankTransfer && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1.5">
                <p className="font-semibold text-sm">Complete your bank transfer</p>
                <p>Bank: <strong>Commercial Bank of Ceylon</strong></p>
                <p>Account Name: <strong>iCrowed (Pvt) Ltd</strong></p>
                <p>Account Number: <strong>8002-XXXXXXXX</strong></p>
                <p>Branch: <strong>Colombo 03</strong></p>
                <p className="mt-2">Use <strong>{orderNumber}</strong> as your payment reference. Your order will be confirmed within 24 hours.</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
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
