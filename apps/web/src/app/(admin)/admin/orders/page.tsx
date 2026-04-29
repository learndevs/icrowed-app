import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";
import { db, orders } from "@icrowed/database";
import { eq, desc } from "drizzle-orm";

const STATUS_BADGE: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  pending: "warning",
  confirmed: "primary",
  processing: "primary",
  shipped: "default",
  delivered: "success",
  cancelled: "error",
  refunded: "error",
};

const ALL_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;
type OrderStatus = (typeof ALL_STATUSES)[number];

function isValidStatus(s: string): s is OrderStatus {
  return (ALL_STATUSES as readonly string[]).includes(s);
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: rawStatus } = await searchParams;
  const statusFilter = rawStatus && isValidStatus(rawStatus) ? rawStatus : undefined;

  const rows = await db.query.orders.findMany({
    where: statusFilter ? eq(orders.status, statusFilter) : undefined,
    orderBy: [desc(orders.createdAt)],
    limit: 100,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold">
          Orders{" "}
          <span className="text-sm font-normal text-[var(--muted)]">({rows.length})</span>
        </h2>

        {/* Status filter links */}
        <div className="flex flex-wrap gap-2">
          {(["All", ...ALL_STATUSES] as const).map((s) => {
            const active = s === "All" ? !statusFilter : statusFilter === s;
            const href = s === "All" ? "/admin/orders" : `/admin/orders?status=${s}`;
            return (
              <Link
                key={s}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${
                  active
                    ? "bg-[var(--color-primary)] text-white border-transparent"
                    : "border-[var(--border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                }`}
              >
                {s}
              </Link>
            );
          })}
        </div>
      </div>

      <Card>
        {rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-[var(--muted)]">No orders found.</div>
        ) : (
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
                {rows.map((o) => (
                  <tr key={o.id} className="hover:bg-[var(--surface)]">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="text-[var(--color-primary)] hover:underline font-mono text-xs"
                      >
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.customerName}</p>
                      <p className="text-xs text-[var(--muted)]">{o.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatPrice(Number(o.total))}</td>
                    <td className="px-4 py-3">
                      <Badge variant={o.paymentMethod === "stripe" ? "primary" : "warning"}>
                        {o.paymentMethod === "stripe" ? "Card" : "Bank"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">
                      {o.trackingNumber || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_BADGE[o.status] ?? "default"}>{o.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)]">{formatDate(o.createdAt)}</td>
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
        )}
      </Card>
    </div>
  );
}
