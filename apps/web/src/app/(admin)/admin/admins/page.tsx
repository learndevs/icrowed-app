import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { db, profiles } from "@icrowed/database";
import { inArray, desc } from "drizzle-orm";
import { InviteAdminForm } from "./InviteAdminForm";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const rows = await db
    .select()
    .from(profiles)
    .where(inArray(profiles.role, ["admin", "operator"]))
    .orderBy(desc(profiles.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Admin Users</h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            {rows.length} {rows.length === 1 ? "user" : "users"} with admin or
            operator access
          </p>
        </div>
        <InviteAdminForm />
      </div>

      <Card>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-[var(--muted)] py-8 text-center">
              No admin users yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-[var(--muted)] border-b border-[var(--border)]">
                    <th className="pb-3 pr-4 font-medium">Name</th>
                    <th className="pb-3 pr-4 font-medium">Email</th>
                    <th className="pb-3 pr-4 font-medium">Role</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Created</th>
                    <th className="pb-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {rows.map((p) => (
                    <tr key={p.id} className="hover:bg-[var(--surface)]">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[var(--brand-100)] text-[var(--brand-700)] flex items-center justify-center text-xs font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </div>
                          <span>{p.fullName ?? "—"}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-[var(--muted)]">{p.email}</td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={p.role === "admin" ? "success" : "primary"}
                        >
                          {p.role}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        {p.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="error">Inactive</Badge>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-[var(--muted)]">
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="py-3">
                        <Link
                          href={`/admin/customers/${p.id}`}
                          className="text-xs text-[var(--color-primary)] hover:underline"
                        >
                          Manage →
                        </Link>
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
        <CardContent className="text-xs text-[var(--muted)] space-y-2 pt-6">
          <p className="font-medium text-[var(--foreground)]">About roles</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>admin</strong> — full access to the admin panel,
              including settings, payments, and other admins.
            </li>
            <li>
              <strong>operator</strong> — staff role for day-to-day order
              fulfilment. Operators have access via the existing operator
              area; admin-only routes still require the admin role.
            </li>
            <li>Use the customer detail page (Manage →) to change roles or deactivate users.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
