import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Users } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { db, profiles, orders } from "@icrowed/database";
import { and, desc, eq, ilike, or, sql, SQL } from "drizzle-orm";

export const dynamic = "force-dynamic";

type SP = {
  q?: string;
  role?: string;
  active?: string;
  page?: string;
};

const PAGE_SIZE = 20;

async function fetchCustomers(sp: SP) {
  const page = Math.max(1, Number(sp.page ?? 1));
  const conds: SQL[] = [];
  if (sp.q) {
    const term = `%${sp.q}%`;
    conds.push(
      or(
        ilike(profiles.fullName, term),
        ilike(profiles.email, term),
        ilike(profiles.phone, term)
      )!
    );
  }
  if (sp.role && sp.role !== "all") {
    conds.push(eq(profiles.role, sp.role as "customer" | "operator" | "admin"));
  }
  if (sp.active === "true") conds.push(eq(profiles.isActive, true));
  if (sp.active === "false") conds.push(eq(profiles.isActive, false));

  const where = conds.length ? and(...conds) : undefined;

  const rows = await db
    .select({
      id: profiles.id,
      email: profiles.email,
      fullName: profiles.fullName,
      phone: profiles.phone,
      role: profiles.role,
      isActive: profiles.isActive,
      createdAt: profiles.createdAt,
      orderCount: sql<number>`(select count(*)::int from ${orders} o where o.user_id = ${profiles.id})`,
      lifetimeValue: sql<string>`(select coalesce(sum(o.total),0) from ${orders} o where o.user_id = ${profiles.id} and o.status not in ('cancelled','refunded'))`,
    })
    .from(profiles)
    .where(where)
    .orderBy(desc(profiles.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(profiles)
    .where(where);

  return { rows, total: count, page };
}

const ROLE_BADGE: Record<string, "default" | "primary" | "success" | "warning"> = {
  customer: "default",
  operator: "primary",
  admin: "success",
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const { rows, total, page } = await fetchCustomers(sp);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Customers</h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            {total} total {total === 1 ? "user" : "users"}
          </p>
        </div>
      </div>

      <Card>
        <CardContent>
          <form className="flex flex-wrap gap-3 mb-4" action="/admin/customers">
            <input
              type="text"
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder="Search by name, email, phone…"
              className="flex-1 min-w-[220px] h-10 px-3 rounded-lg border border-[var(--border)] text-sm"
            />
            <select
              name="role"
              defaultValue={sp.role ?? "all"}
              className="h-10 px-3 rounded-lg border border-[var(--border)] text-sm bg-white"
            >
              <option value="all">All roles</option>
              <option value="customer">Customer</option>
              <option value="operator">Operator</option>
              <option value="admin">Admin</option>
            </select>
            <select
              name="active"
              defaultValue={sp.active ?? ""}
              className="h-10 px-3 rounded-lg border border-[var(--border)] text-sm bg-white"
            >
              <option value="">Active &amp; inactive</option>
              <option value="true">Active only</option>
              <option value="false">Inactive only</option>
            </select>
            <button
              type="submit"
              className="h-10 px-4 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium"
            >
              Search
            </button>
          </form>

          {rows.length === 0 ? (
            <EmptyState
              icon={<Users className="w-5 h-5" />}
              title="No customers match"
              description="Try adjusting your filters."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-[var(--muted)] border-b border-[var(--border)]">
                    <th className="pb-3 pr-4 font-medium">Name</th>
                    <th className="pb-3 pr-4 font-medium">Email</th>
                    <th className="pb-3 pr-4 font-medium">Phone</th>
                    <th className="pb-3 pr-4 font-medium">Role</th>
                    <th className="pb-3 pr-4 font-medium">Orders</th>
                    <th className="pb-3 pr-4 font-medium">LTV</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {rows.map((c) => (
                    <tr key={c.id} className="hover:bg-[var(--surface)]">
                      <td className="py-3 pr-4">
                        <Link
                          href={`/admin/customers/${c.id}`}
                          className="text-[var(--color-primary)] hover:underline font-medium"
                        >
                          {c.fullName ?? "—"}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-[var(--muted)]">{c.email}</td>
                      <td className="py-3 pr-4 text-[var(--muted)]">
                        {c.phone ?? "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={ROLE_BADGE[c.role] ?? "default"}>
                          {c.role}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">{c.orderCount}</td>
                      <td className="py-3 pr-4 font-medium">
                        {formatPrice(Number(c.lifetimeValue ?? 0))}
                      </td>
                      <td className="py-3 pr-4">
                        {c.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="error">Inactive</Badge>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-[var(--muted)]">
                        {formatDate(c.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                page={page}
                pageSize={PAGE_SIZE}
                total={total}
                basePath="/admin/customers"
                searchParams={{
                  q: sp.q,
                  role: sp.role,
                  active: sp.active,
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
