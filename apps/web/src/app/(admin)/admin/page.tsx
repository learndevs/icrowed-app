import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Package, ShoppingBag, BarChart3, TrendingUp, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

const STATS = [
  { label: "Total Revenue", value: formatPrice(18920000), sub: "+12% this month", icon: TrendingUp, color: "text-green-600 bg-green-50" },
  { label: "Total Orders", value: "342", sub: "28 new today", icon: ShoppingBag, color: "text-blue-600 bg-blue-50" },
  { label: "Products", value: "214", sub: "8 low stock", icon: Package, color: "text-purple-600 bg-purple-50" },
  { label: "Pending Orders", value: "17", sub: "Needs attention", icon: Clock, color: "text-amber-600 bg-amber-50" },
];

const RECENT_ORDERS = [
  { id: "ICR-260329-4823", customer: "Sandun Perera", total: 419900, status: "shipped", date: "Mar 29" },
  { id: "ICR-260329-4822", customer: "Nimal Silva", total: 89900, status: "processing", date: "Mar 29" },
  { id: "ICR-260329-4821", customer: "Kamala Fernando", total: 249900, status: "pending", date: "Mar 28" },
  { id: "ICR-260328-4820", customer: "Sunil Mendis", total: 15900, status: "delivered", date: "Mar 28" },
  { id: "ICR-260328-4819", customer: "Priya Jayawardena", total: 189900, status: "confirmed", date: "Mar 27" },
];

const STATUS_BADGE: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  pending: "warning",
  confirmed: "primary",
  processing: "primary",
  shipped: "default",
  delivered: "success",
  cancelled: "error",
};

export default function AdminDashboard() {
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
                <p className="text-xs text-green-600 mt-1">{stat.sub}</p>
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
                {RECENT_ORDERS.map((order) => (
                  <tr key={order.id} className="hover:bg-[var(--surface)]">
                    <td className="py-3 pr-4">
                      <Link href={`/admin/orders/${order.id}`} className="text-[var(--color-primary)] hover:underline font-mono text-xs">
                        {order.id}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">{order.customer}</td>
                    <td className="py-3 pr-4 font-medium">{formatPrice(order.total)}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={STATUS_BADGE[order.status] ?? "default"}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-[var(--muted)]">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Add Product", href: "/admin/products/new", emoji: "➕" },
          { label: "Add Category", href: "/admin/categories/new", emoji: "🗂️" },
          { label: "Add Offer", href: "/admin/offers/new", emoji: "🎉" },
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
