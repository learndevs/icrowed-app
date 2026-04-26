import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

const STATUS_BADGE: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  pending: "warning",
  confirmed: "primary",
  processing: "primary",
  shipped: "default",
  delivered: "success",
  cancelled: "error",
  refunded: "error",
};

const ORDERS = [
  { id: "ICR-260329-4823", customer: "Sandun Perera", phone: "077-1234567", total: 419900, status: "shipped", payment: "stripe", date: "Mar 29, 2026", tracking: "DOMEX-2603291234" },
  { id: "ICR-260329-4822", customer: "Nimal Silva", phone: "071-9876543", total: 89900, status: "processing", payment: "bank_transfer", date: "Mar 29, 2026", tracking: "" },
  { id: "ICR-260329-4821", customer: "Kamala Fernando", phone: "076-5556789", total: 249900, status: "pending", payment: "bank_transfer", date: "Mar 28, 2026", tracking: "" },
  { id: "ICR-260328-4820", customer: "Sunil Mendis", phone: "072-3334455", total: 15900, status: "delivered", payment: "stripe", date: "Mar 28, 2026", tracking: "LSE-2603281111" },
];

export default function AdminOrdersPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Orders</h2>
        <div className="flex gap-2">
          {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((s) => (
            <button
              key={s}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors first:bg-[var(--color-primary)] first:text-white first:border-transparent"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface)]">
              <tr className="text-left text-xs text-[var(--muted)] border-b border-[var(--border)]">
                <th className="px-4 py-3 font-medium">Order #</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Tracking</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {ORDERS.map((o) => (
                <tr key={o.id} className="hover:bg-[var(--surface)]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="text-[var(--color-primary)] hover:underline font-mono text-xs">
                      {o.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.customer}</p>
                    <p className="text-xs text-[var(--muted)]">{o.phone}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={o.payment === "stripe" ? "primary" : "warning"}>
                      {o.payment === "stripe" ? "Card" : "Bank"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">
                    {o.tracking || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_BADGE[o.status] ?? "default"}>{o.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{o.date}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`}>
                      <Button size="sm" variant="outline">View</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
