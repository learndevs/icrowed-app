"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight, Send, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { BankDetailsCard } from "@/components/checkout/BankDetailsCard";
import { BankSlipUpload } from "@/components/checkout/BankSlipUpload";
import {
  DEFAULT_BANK_DETAILS,
  type BankDetails,
} from "@/lib/bank-details";

function SuccessContent() {
  const params = useSearchParams();
  const orderNumber = params.get("orderNumber");
  const method = params.get("method");

  const isBankTransfer = method === "bank";
  const isCOD = method === "cod";
  const isPayHere = method === "payhere";

  const [bankDetails, setBankDetails] = useState<BankDetails>(DEFAULT_BANK_DETAILS);
  const [reference, setReference] = useState("");
  const [bankSlipFile, setBankSlipFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/bank-details")
      .then(async (res) => {
        if (!res.ok) return;
        setBankDetails(await res.json());
      })
      .catch(() => {});
  }, []);

  async function submitBankProof() {
    if (!orderNumber) return;
    if (!reference.trim() && !bankSlipFile) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const form = new FormData();
      form.append("orderNumber", orderNumber);
      if (reference.trim()) form.append("reference", reference.trim());
      if (bankSlipFile) form.append("file", bankSlipFile);

      const res = await fetch("/api/orders/bank-transfer-proof", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to submit");
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
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
    if (isBankTransfer) {
      return "Your order has been received. Complete your bank transfer and upload your deposit slip below.";
    }
    return "Payment confirmed. We're preparing your order.";
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center font-inter">
      <div className="flex justify-center mb-6">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center ${
            isCOD ? "bg-gray-100" : "bg-gray-100"
          }`}
        >
          {isCOD ? (
            <Truck className="w-10 h-10 text-gray-900" />
          ) : (
            <CheckCircle className="w-10 h-10 text-gray-900" />
          )}
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-2 text-gray-900">{headline()}</h1>
      <p className="text-gray-500 mb-8">{subtitle()}</p>

      {orderNumber && (
        <Card className="mb-6 text-left">
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Order Number</span>
              <span className="font-mono font-bold text-gray-900">{orderNumber}</span>
            </div>

            {isBankTransfer && (
              <div className="space-y-4">
                <BankDetailsCard details={bankDetails} orderNumber={orderNumber} compact />

                {submitted ? (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-100 border border-gray-200 text-sm text-gray-800">
                    <CheckCircle className="w-4 h-4 shrink-0 text-gray-900" />
                    Payment details submitted — our team will verify your deposit shortly.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <BankSlipUpload
                      file={bankSlipFile}
                      onFileChange={setBankSlipFile}
                      label="Upload deposit slip"
                    />

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500">
                        Transfer reference (optional)
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={reference}
                          onChange={(e) => setReference(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && submitBankProof()}
                          placeholder="e.g. TXN-20260428-001"
                          className="flex-1 h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                      </div>
                    </div>

                    <Button
                      className="w-full rounded-xl bg-gray-900 text-white hover:bg-gray-800"
                      disabled={submitting || (!reference.trim() && !bankSlipFile)}
                      onClick={submitBankProof}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {submitting ? "Submitting…" : "Submit payment proof"}
                    </Button>

                    {submitError && (
                      <p className="text-xs text-red-600 font-medium">{submitError}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {isCOD && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 space-y-1.5 text-left">
                <p className="font-semibold text-sm text-gray-900">Cash on Delivery</p>
                <p>Please have exact change ready when our delivery partner arrives.</p>
                <p>Our team may contact you to confirm delivery details before dispatch.</p>
              </div>
            )}

            {isPayHere && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 text-left">
                <p>
                  Your card payment was processed successfully via PayHere. You will receive
                  an email confirmation shortly.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Package className="w-4 h-4 shrink-0" />
              <span>You can track your order using the order number above.</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {orderNumber && (
          <Link href={`/track?orderNumber=${orderNumber}`}>
            <Button
              variant="outline"
              className="rounded-xl border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
            >
              Track Order
            </Button>
          </Link>
        )}
        <Link href="/products">
          <Button className="rounded-xl bg-gray-900 text-white hover:bg-gray-800">
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
