import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ChevronLeft, Mail, Phone, MapPin, ShoppingBag } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { db, profiles, orders, addresses, listAuditLogs } from "@icrowed/database";
import { eq, sql, desc } from "drizzle-orm";
import { CustomerActions } from "./CustomerActions";

export const dynamic = "force-dynamic";

const ORDER_STATUS_BADGE: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  pending: "warning",
  confirmed: "primary",
  processing: "primary",
  shipped: "default",
  delivered: "success",
  cancelled: "error",
  refunded: "error",
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, id),
    with: { addresses: true },
  });
  if (!profile) notFound();

  const customerOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      total: orders.total,
      paymentMethod: orders.paymentMethod,
      paymentStatus: orders.paymentStatus,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.userId, id))
    .orderBy(desc(orders.createdAt))
    .limit(50);

  const [stats] = await db
    .select({
      orderCount: sql<number>`count(*)::int`,
      ltv: sql<string>`coalesce(sum(${orders.total}),0)`,
      avgOrder: sql<string>`coalesce(avg(${orders.total}),0)`,
    })
    .from(orders)
    .where(
      sql`${orders.userId} = ${id} and ${orders.status} not in ('cancelled','refunded')`
    );

  const audits = await listAuditLogs({
    entityType: "customer",
    entityId: id,
    limit: 10,
  });

  return (
    <div className="space-y-6">
      <Link
        href="/admin/customers"
        className="inline-flex items-center text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        <ChevronLeft className="w-4 h-4" /> Back to customers
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{profile.fullName ?? profile.email}</h2>
          <p className="text-sm text-[var(--muted)]">
            Customer since {formatDate(profile.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={profile.role === "admin" ? "success" : profile.role === "operator" ? "primary" : "default"}
          >
            {profile.role}
          </Badge>
          {profile.isActive ? (
            <Badge variant="success">Active</Badge>
          ) : (
            <Badge variant="error">Inactive</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent>
                <p className="text-2xl font-bold">{stats.orderCount}</p>
                <p className="text-xs text-[var(--muted)]">Orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatPrice(Number(stats.ltv ?? 0))}
                </p>
                <p className="text-xs text-[var(--muted)]">Lifetime value</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatPrice(Number(stats.avgOrder ?? 0))}
                </p>
                <p className="text-xs text-[var(--muted)]">Avg order value</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" /> Orders
                </h3>
                <span className="text-xs text-[var(--muted)]">
                  {customerOrders.length} shown
                </span>
              </div>
              {customerOrders.length === 0 ? (
                <p className="text-sm text-[var(--muted)] py-4 text-center">
                  No orders yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-[var(--muted)] border-b border-[var(--border)]">
                        <th className="pb-3 pr-4 font-medium">Order #</th>
                        <th className="pb-3 pr-4 font-medium">Total</th>
                        <th className="pb-3 pr-4 font-medium">Payment</th>
                        <th className="pb-3 pr-4 font-medium">Status</th>
                        <th className="pb-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {customerOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-[var(--surface)]">
                          <td className="py-3 pr-4">
                            <Link
                              href={`/admin/orders/${o.id}`}
                              className="text-[var(--color-primary)] hover:underline font-mono text-xs"
                            >
                              {o.orderNumber}
                            </Link>
                          </td>
                          <td className="py-3 pr-4 font-medium">
                            {formatPrice(Number(o.total))}
                          </td>
                          <td className="py-3 pr-4 text-xs text-[var(--muted)]">
                            {o.paymentMethod} · {o.paymentStatus}
                          </td>
                          <td className="py-3 pr-4">
                            <Badge variant={ORDER_STATUS_BADGE[o.status] ?? "default"}>
                              {o.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-[var(--muted)]">
                            {formatDate(o.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {audits.rows.length > 0 && (
            <Card>
              <CardContent>
                <h3 className="font-semibold mb-3">Activity</h3>
                <ul className="space-y-2 text-sm">
                  {audits.rows.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-start gap-3 text-xs border-b border-[var(--border)] pb-2 last:border-0"
                    >
                      <span className="text-[var(--muted)] shrink-0">
                        {formatDate(a.createdAt)}
                      </span>
                      <span className="font-medium">{a.action}</span>
                      <span className="text-[var(--muted)] flex-1">
                        {a.summary ?? a.actorEmail}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-3 pt-6">
              <h3 className="font-semibold text-sm">Profile</h3>
              <div className="flex items-start gap-2 text-sm">
                <Mail className="w-4 h-4 text-[var(--muted)] mt-0.5" />
                <span>{profile.email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-start gap-2 text-sm">
                  <Phone className="w-4 h-4 text-[var(--muted)] mt-0.5" />
                  <span>{profile.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {profile.addresses.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Addresses
                </h3>
                <ul className="space-y-3">
                  {profile.addresses.map((a) => (
                    <li
                      key={a.id}
                      className="text-xs text-[var(--muted)] border-b border-[var(--border)] pb-2 last:border-0"
                    >
                      <p className="font-medium text-[var(--foreground)]">
                        {a.label} · {a.recipientName}
                        {a.isDefault && (
                          <Badge variant="primary" className="ml-2">
                            Default
                          </Badge>
                        )}
                      </p>
                      <p>
                        {a.addressLine1}
                        {a.addressLine2 ? `, ${a.addressLine2}` : ""}
                      </p>
                      <p>
                        {a.city}, {a.district}
                        {a.postalCode ? ` ${a.postalCode}` : ""}
                      </p>
                      <p>{a.phone}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <CustomerActions
            userId={profile.id}
            currentRole={profile.role}
            isActive={profile.isActive}
          />
        </div>
      </div>
    </div>
  );
}
