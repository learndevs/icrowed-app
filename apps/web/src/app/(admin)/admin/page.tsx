import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { rangeToDates } from "@/lib/date-range";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { StatusDonut } from "@/components/admin/StatusDonut";
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Clock,
  Users,
  Receipt,
  AlertTriangle,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  getKpis,
  getRevenueDaily,
  getOrdersByStatus,
  getRecentOrders,
  getTopProducts,
} from "@/lib/admin-queries";
import { db, products, listAuditLogs } from "@icrowed/database";
import { eq, and, gt, lte, count } from "drizzle-orm";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  pending: "warning",
  confirmed: "primary",
  processing: "primary",
  shipped: "default",
  delivered: "success",
  cancelled: "error",
  refunded: "error",
};

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const range = rangeToDates(sp.range, sp.from, sp.to);

  const [
    kpis,
    revenueSeries,
    statusBreakdown,
    recentOrders,
    topProducts,
    [{ count: productsCount }] ,
    [{ count: lowStockCount }],
    auditFeed,
  ] = await Promise.all([
    getKpis(range),
    getRevenueDaily(range),
    getOrdersByStatus(range),
    getRecentOrders(5),
    getTopProducts(range, 5),
    db.select({ count: count() }).from(products).where(eq(products.isActive, true)),
    db
      .select({ count: count() })
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          gt(products.stock, 0),
          lte(products.stock, products.lowStockThreshold)
        )
      ),
    listAuditLogs({ limit: 8 }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Dashboard</h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            {range.from.toLocaleDateString("en-LK")} —{" "}
            {range.to.toLocaleDateString("en-LK")}
          </p>
        </div>
        <DateRangePicker />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Revenue"
          value={formatPrice(kpis.revenue)}
          sub={`${kpis.ordersCount} orders`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="text-green-600 bg-green-50"
        />
        <StatCard
          label="Avg Order Value"
          value={formatPrice(kpis.aov)}
          icon={<Receipt className="w-5 h-5" />}
          color="text-blue-600 bg-blue-50"
        />
        <StatCard
          label="New Customers"
          value={String(kpis.newCustomers)}
          icon={<Users className="w-5 h-5" />}
          color="text-purple-600 bg-purple-50"
        />
        <StatCard
          label="Refund Rate"
          value={`${kpis.refundRate.toFixed(1)}%`}
          sub={`${kpis.refundCount} refunds`}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="text-amber-600 bg-amber-50"
        />
        <StatCard
          label="Active Products"
          value={String(productsCount)}
          sub={`${lowStockCount} low stock`}
          icon={<Package className="w-5 h-5" />}
          color="text-indigo-600 bg-indigo-50"
        />
        <StatCard
          label="Pending Orders"
          value={String(
            statusBreakdown.find((s) => s.status === "pending")?.count ?? 0
          )}
          sub="Needs attention"
          icon={<Clock className="w-5 h-5" />}
          color="text-yellow-600 bg-yellow-50"
        />
        <StatCard
          label="Total Orders"
          value={String(kpis.ordersCount)}
          icon={<ShoppingBag className="w-5 h-5" />}
          color="text-teal-600 bg-teal-50"
        />
        <StatCard
          label="Activity (logs)"
          value={String(auditFeed.total)}
          sub="recent events"
          icon={<Activity className="w-5 h-5" />}
          color="text-pink-600 bg-pink-50"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardContent>
            <h3 className="font-semibold text-sm mb-3">Revenue & orders</h3>
            <RevenueChart data={revenueSeries} />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h3 className="font-semibold text-sm mb-3">Orders by status</h3>
            <StatusDonut data={statusBreakdown} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Recent orders</h3>
              <Link
                href="/admin/orders"
                className="text-xs text-[var(--color-primary)] hover:underline"
              >
                View all
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-[var(--muted)] py-4 text-center">
                No orders yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-[var(--border)]">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-[var(--surface)]">
                        <td className="py-2 pr-3">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-[var(--color-primary)] hover:underline font-mono text-xs"
                          >
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="py-2 pr-3 text-xs">
                          {order.customerName}
                        </td>
                        <td className="py-2 pr-3 text-xs font-medium">
                          {formatPrice(Number(order.total))}
                        </td>
                        <td className="py-2 pr-3">
                          <Badge variant={STATUS_BADGE[order.status] ?? "default"}>
                            {order.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Top products</h3>
              <Link
                href="/admin/analytics"
                className="text-xs text-[var(--color-primary)] hover:underline"
              >
                Analytics
              </Link>
            </div>
            {topProducts.length === 0 ? (
              <p className="text-sm text-[var(--muted)] py-4 text-center">
                No sales in this range.
              </p>
            ) : (
              <ul className="space-y-2">
                {topProducts.map((p, i) => (
                  <li
                    key={p.productId ?? i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded bg-[var(--surface)] text-xs flex items-center justify-center font-medium shrink-0">
                        {i + 1}
                      </span>
                      <span className="truncate">{p.productName}</span>
                    </span>
                    <span className="text-xs font-medium shrink-0 ml-2">
                      {formatPrice(p.revenue)}{" "}
                      <span className="text-[var(--muted)]">· {p.qty}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {auditFeed.rows.length > 0 && (
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Recent activity</h3>
              <Link
                href="/admin/audit-log"
                className="text-xs text-[var(--color-primary)] hover:underline"
              >
                Audit log
              </Link>
            </div>
            <ul className="space-y-2 text-xs">
              {auditFeed.rows.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start gap-3 border-b border-[var(--border)] pb-2 last:border-0"
                >
                  <span className="text-[var(--muted)] shrink-0 w-32">
                    {formatDate(a.createdAt)}
                  </span>
                  <span className="font-medium">{a.action}</span>
                  <span className="text-[var(--muted)] truncate">
                    {a.summary ?? `${a.entityType} ${a.entityId ?? ""}`}
                  </span>
                  <span className="ml-auto text-[var(--muted)] shrink-0">
                    {a.actorEmail ?? "system"}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
