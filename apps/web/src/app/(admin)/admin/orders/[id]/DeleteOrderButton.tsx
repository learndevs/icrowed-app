"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";

interface Props {
  orderId: string;
  orderNumber: string;
}

export function DeleteOrderButton({ orderId, orderNumber }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete order");
      }
      router.push("/admin/orders");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete order");
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-red-600 font-medium">
          Delete {orderNumber}?
        </span>
        <Button
          size="sm"
          variant="outline"
          className="border-red-300 text-red-600 hover:bg-red-50"
          disabled={deleting}
          onClick={handleDelete}
        >
          {deleting ? "Deleting…" : "Yes, delete"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={deleting}
          onClick={() => {
            setConfirming(false);
            setError(null);
          }}
        >
          Cancel
        </Button>
        {error && (
          <p className="w-full text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="border-red-200 text-red-600 hover:bg-red-50"
      onClick={() => setConfirming(true)}
    >
      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
      Delete Order
    </Button>
  );
}
