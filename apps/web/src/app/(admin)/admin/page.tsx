import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Package, ShoppingBag, BarChart3, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import { db, orders, products } from "@icrowed/database";
import { eq, count, sum, and, lte, gt, sql } from "drizzle-orm";

const STATUS_BADGE: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  pending: "warning",
  confirmed: "primary",
  processing: "primary",
  shipped: "default",
  delivered: "success",
  cancelled: "error",
};

async function getDashboardStats() {
  const [
    totalOrdersRes,
    revenueRes,
    pendingRes,
    productsRes,
    lowStockRes,
    recentOrders,
  ] = await Promise.all([
    db.select({ count: count() }).from(orders),
    db
      .select({ total: sum(orders.total) })
      .from(orders)
      .where(sql`${orders.status} NOT IN ('cancelled', 'refunded')`),
    db.select({ count: count() }).from(orders).where(eq(orders.status, "pending")),
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
    db.query.orders.findMany({
      orderBy: (o, { desc }) => [desc(o.createdAt)],
      limit: 5,
    }),
  ]);

  return {
    totalOrders: totalOrdersRes[0]?.count ?? 0,
    totalRevenue: Number(revenueRes[0]?.total ?? 0),
    pendingOrders: pendingRes[0]?.count ?? 0,
    totalProducts: productsRes[0]?.count ?? 0,
    lowStockProducts: lowStockRes[0]?.count ?? 0,
    recentOrders,
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const STATS = [
    {
      label: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      sub: `${stats.totalOrders} total orders`,
      icon: TrendingUp,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Total Orders",
      value: String(stats.totalOrders),
      sub: `${stats.pendingOrders} pending`,
      icon: ShoppingBag,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Products",
      value: String(stats.totalProducts),
      sub: `${stats.lowStockProducts} low stock`,
      icon: Package,
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "Pending Orders",
      value: String(stats.pendingOrders),
      sub: "Needs attention",
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Dashboard</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">{stat.label}</p>
                <p className="text-xs text-[var(--muted)] mt-1">{stat.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Orders</h3>
            <Link href="/admin/orders" className="text-sm text-[var(--color-primary)] hover:underline">
              View all
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-[var(--muted)] py-4 text-center">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-[var(--muted)] border-b border-[var(--border)]">
                    <th className="pb-3 pr-4 font-medium">Order #</th>
                    <th className="pb-3 pr-4 font-medium">Customer</th>
                    <th className="pb-3 pr-4 font-medium">Total</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[var(--surface)]">
                      <td className="py-3 pr-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-[var(--color-primary)] hover:underline font-mono text-xs"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 pr-4">{order.customerName}</td>
                      <td className="py-3 pr-4 font-medium">{formatPrice(Number(order.total))}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={STATUS_BADGE[order.status] ?? "default"}>{order.status}</Badge>
                      </td>
                      <td className="py-3 text-[var(--muted)]">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Add Product", href: "/admin/products/new", emoji: "➕" },
          { label: "Add Category", href: "/admin/categories", emoji: "🗂️" },
          { label: "Add Offer", href: "/admin/offers", emoji: "🎉" },
          { label: "Check Inventory", href: "/admin/inventory", emoji: "📦" },
        ].map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[var(--border)] hover:border-[var(--color-primary)] hover:shadow-sm transition-all text-sm font-medium"
          >
            <span className="text-xl">{a.emoji}</span>
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
