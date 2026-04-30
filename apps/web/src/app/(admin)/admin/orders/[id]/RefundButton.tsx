"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { RotateCcw, AlertTriangle, X } from "lucide-react";

interface Props {
  orderId: string;
  orderNumber: string;
  total: string;
  paymentMethod: string;
}

export function RefundButton({ orderId, orderNumber, total, paymentMethod }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRefund() {
    setProcessing(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNote: adminNote || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to process refund");
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to process refund");
    } finally {
      setProcessing(false);
    }
  }

  const isBankTransfer = paymentMethod === "bank_transfer";

  return (
    <>
      <Button
        variant="outline"
        className="border-red-200 text-red-600 hover:bg-red-50"
        onClick={() => { setOpen(true); setError(null); }}
      >
        <RotateCcw className="w-4 h-4" />
        Issue Refund
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-base">Confirm Refund</h2>
              </div>
              <button onClick={() => setOpen(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm space-y-1">
                <p className="font-semibold text-amber-900">Order {orderNumber}</p>
                <p className="text-amber-800">
                  Refund amount: <strong>LKR {Number(total).toLocaleString()}</strong>
                </p>
                {isBankTransfer ? (
                  <p className="text-amber-700 text-xs mt-1">
                    This is a bank transfer order. The refund will be marked in the system — you must manually transfer the funds back to the customer.
                  </p>
                ) : (
                  <p className="text-amber-700 text-xs mt-1">
                    This will immediately issue a full refund via Stripe. This action cannot be undone.
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Internal Note (optional)</label>
                <textarea
                  rows={2}
                  placeholder="Reason for refund..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 pb-5">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)} disabled={processing}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 border-red-600"
                onClick={handleRefund}
                disabled={processing}
              >
                {processing ? "Processing…" : isBankTransfer ? "Mark as Refunded" : "Issue Refund"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
