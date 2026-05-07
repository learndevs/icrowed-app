import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { DateRangePicker, rangeToDates } from "@/components/ui/DateRangePicker";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { StatusDonut } from "@/components/admin/StatusDonut";
import { PaymentSplit } from "@/components/admin/PaymentSplit";
import {
  Download,
  TrendingUp,
  Receipt,
  Users,
  AlertTriangle,
  Package,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  getKpis,
  getRevenueDaily,
  getOrdersByStatus,
  getPaymentMethodSplit,
  getTopProducts,
  getTopCustomers,
  getLowStockProducts,
} from "@/lib/admin-queries";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const range = rangeToDates(sp.range, sp.from, sp.to);

  const [
    kpis,
    daily,
    statusBreakdown,
    paymentSplit,
    topProducts,
    topCustomers,
    lowStock,
  ] = await Promise.all([
    getKpis(range),
    getRevenueDaily(range),
    getOrdersByStatus(range),
    getPaymentMethodSplit(range),
    getTopProducts(range, 10),
    getTopCustomers(range, 10),
    getLowStockProducts(10),
  ]);

  const exportHref = `/api/admin/analytics/export?range=${
    sp.range ?? "30d"
  }&from=${sp.from ?? ""}&to=${sp.to ?? ""}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Analytics</h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            {range.from.toLocaleDateString("en-LK")} —{" "}
            {range.to.toLocaleDateString("en-LK")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker />
          <Link
            href={exportHref}
            className="inline-flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-medium bg-white border border-[var(--border)] hover:bg-[var(--surface)]"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Revenue"
          value={formatPrice(kpis.revenue)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="text-green-600 bg-green-50"
        />
        <StatCard
          label="Orders"
          value={String(kpis.ordersCount)}
          icon={<Receipt className="w-5 h-5" />}
          color="text-blue-600 bg-blue-50"
        />
        <StatCard
          label="Avg Order Value"
          value={formatPrice(kpis.aov)}
          icon={<Receipt className="w-5 h-5" />}
          color="text-indigo-600 bg-indigo-50"
        />
        <StatCard
          label="New Customers"
          value={String(kpis.newCustomers)}
          icon={<Users className="w-5 h-5" />}
          color="text-purple-600 bg-purple-50"
        />
        <StatCard
          label="Refunds"
          value={String(kpis.refundCount)}
          sub={`${kpis.refundRate.toFixed(1)}% rate`}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="text-amber-600 bg-amber-50"
        />
        <StatCard
          label="Active products low on stock"
          value={String(lowStock.length)}
          icon={<Package className="w-5 h-5" />}
          color="text-red-600 bg-red-50"
        />
      </div>

      <Card>
        <CardContent>
          <h3 className="font-semibold text-sm mb-3">Revenue & orders</h3>
          <RevenueChart data={daily} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardContent>
            <h3 className="font-semibold text-sm mb-3">Orders by status</h3>
            <StatusDonut data={statusBreakdown} />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h3 className="font-semibold text-sm mb-3">Payment method split</h3>
            <PaymentSplit data={paymentSplit} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardContent>
            <h3 className="font-semibold text-sm mb-3">Top 10 products</h3>
            {topProducts.length === 0 ? (
              <p className="text-sm text-[var(--muted)] py-4 text-center">
                No sales in this range.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {topProducts.map((p, i) => (
                  <li
                    key={p.productId ?? i}
                    className="flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded bg-[var(--surface)] text-xs flex items-center justify-center font-medium shrink-0">
                        {i + 1}
                      </span>
                      <span className="truncate">{p.productName}</span>
                    </span>
                    <span className="text-xs font-medium shrink-0 ml-2">
                      {formatPrice(p.revenue)}
                      <span className="text-[var(--muted)] ml-1">· {p.qty} sold</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 className="font-semibold text-sm mb-3">Top 10 customers</h3>
            {topCustomers.length === 0 ? (
              <p className="text-sm text-[var(--muted)] py-4 text-center">
                No customers in this range.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {topCustomers.map((c, i) => (
                  <li
                    key={(c.userId ?? "guest") + i}
                    className="flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded bg-[var(--surface)] text-xs flex items-center justify-center font-medium shrink-0">
                        {i + 1}
                      </span>
                      <span className="truncate">
                        {c.customerName}
                        <span className="text-[var(--muted)] ml-2 text-xs">
                          {c.customerEmail}
                        </span>
                      </span>
                    </span>
                    <span className="text-xs font-medium shrink-0 ml-2">
                      {formatPrice(c.revenue)}
                      <span className="text-[var(--muted)] ml-1">
                        · {c.orderCount}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Low-stock products</h3>
            <Link
              href="/admin/inventory"
              className="text-xs text-[var(--color-primary)] hover:underline"
            >
              Inventory →
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-[var(--muted)] py-4 text-center">
              All products above their threshold.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-[var(--muted)] border-b border-[var(--border)]">
                    <th className="pb-3 pr-4 font-medium">Product</th>
                    <th className="pb-3 pr-4 font-medium">SKU</th>
                    <th className="pb-3 pr-4 font-medium">Stock</th>
                    <th className="pb-3 pr-4 font-medium">Threshold</th>
                    <th className="pb-3 pr-4 font-medium">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {lowStock.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2 pr-4">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="text-[var(--color-primary)] hover:underline"
                        >
                          {p.name}
                        </Link>
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs">{p.sku}</td>
                      <td className="py-2 pr-4 font-medium">{p.stock}</td>
                      <td className="py-2 pr-4 text-[var(--muted)]">{p.threshold}</td>
                      <td className="py-2 pr-4">{formatPrice(Number(p.price))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
