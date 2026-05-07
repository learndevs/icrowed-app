import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Activity } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { listAuditLogs } from "@icrowed/database";
import { AuditDiffButton } from "./AuditDiffDialog";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

const ENTITY_OPTS = [
  "",
  "order",
  "product",
  "category",
  "brand",
  "review",
  "coupon",
  "offer",
  "customer",
  "admin",
  "settings",
  "shipping_rates",
  "email_template",
];

const ACTION_OPTS = [
  "",
  "create",
  "update",
  "delete",
  "status_change",
  "refund",
  "role_change",
  "deactivate",
  "reactivate",
  "stock_adjust",
];

const ACTION_VARIANT: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  create: "success",
  update: "primary",
  delete: "error",
  status_change: "primary",
  refund: "warning",
  role_change: "warning",
  deactivate: "error",
  reactivate: "success",
  stock_adjust: "default",
};

type SP = {
  entityType?: string;
  action?: string;
  q?: string;
  page?: string;
};

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));

  const { rows, total } = await listAuditLogs({
    entityType: sp.entityType || undefined,
    action: sp.action || undefined,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Audit Log</h2>
        <p className="text-sm text-[var(--muted)] mt-1">
          {total} recorded {total === 1 ? "event" : "events"}
        </p>
      </div>

      <Card>
        <CardContent>
          <form action="/admin/audit-log" className="flex flex-wrap gap-3 mb-4">
            <select
              name="entityType"
              defaultValue={sp.entityType ?? ""}
              className="h-10 px-3 rounded-lg border border-[var(--border)] text-sm bg-white"
            >
              {ENTITY_OPTS.map((e) => (
                <option key={e} value={e}>
                  {e || "All entities"}
                </option>
              ))}
            </select>
            <select
              name="action"
              defaultValue={sp.action ?? ""}
              className="h-10 px-3 rounded-lg border border-[var(--border)] text-sm bg-white"
            >
              {ACTION_OPTS.map((a) => (
                <option key={a} value={a}>
                  {a || "All actions"}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="h-10 px-4 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium"
            >
              Filter
            </button>
          </form>

          {rows.length === 0 ? (
            <EmptyState
              icon={<Activity className="w-5 h-5" />}
              title="No audit entries"
              description="Activity will appear here as admin actions are performed."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-[var(--muted)] border-b border-[var(--border)]">
                    <th className="pb-3 pr-4 font-medium">When</th>
                    <th className="pb-3 pr-4 font-medium">Actor</th>
                    <th className="pb-3 pr-4 font-medium">Entity</th>
                    <th className="pb-3 pr-4 font-medium">Action</th>
                    <th className="pb-3 pr-4 font-medium">Summary</th>
                    <th className="pb-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-[var(--surface)]">
                      <td className="py-3 pr-4 text-xs text-[var(--muted)]">
                        {formatDate(r.createdAt)}
                      </td>
                      <td className="py-3 pr-4 text-xs">
                        <p>{r.actorName ?? r.actorEmail ?? "system"}</p>
                        {r.actorEmail && r.actorName && (
                          <p className="text-[var(--muted)]">{r.actorEmail}</p>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="font-mono text-xs">{r.entityType}</span>
                        {r.entityId && (
                          <p className="text-[10px] text-[var(--muted)] font-mono truncate max-w-[160px]">
                            {r.entityId}
                          </p>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={ACTION_VARIANT[r.action] ?? "default"}>
                          {r.action}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-xs max-w-[320px] truncate">
                        {r.summary ?? "—"}
                      </td>
                      <td className="py-3">
                        <AuditDiffButton row={r} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                page={page}
                pageSize={PAGE_SIZE}
                total={total}
                basePath="/admin/audit-log"
                searchParams={{
                  entityType: sp.entityType,
                  action: sp.action,
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
