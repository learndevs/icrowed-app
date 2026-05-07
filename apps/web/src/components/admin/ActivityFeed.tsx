import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { listAuditLogs } from "@icrowed/database";

interface Props {
  entityType?: string;
  entityId?: string;
  title?: string;
  limit?: number;
}

const ACTION_VARIANT: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  create: "success",
  update: "primary",
  delete: "error",
  status_change: "primary",
  refund: "warning",
  role_change: "warning",
  deactivate: "error",
  reactivate: "success",
};

export async function ActivityFeed({
  entityType,
  entityId,
  title = "Activity",
  limit = 10,
}: Props) {
  const { rows } = await listAuditLogs({
    entityType,
    entityId,
    limit,
  });

  if (rows.length === 0) return null;

  return (
    <Card>
      <CardContent>
        <h3 className="font-semibold text-sm mb-3">{title}</h3>
        <ul className="space-y-2 text-xs">
          {rows.map((a) => (
            <li
              key={a.id}
              className="flex items-start gap-3 border-b border-[var(--border)] pb-2 last:border-0"
            >
              <span className="text-[var(--muted)] shrink-0 w-32">
                {formatDate(a.createdAt)}
              </span>
              <Badge variant={ACTION_VARIANT[a.action] ?? "default"}>
                {a.action}
              </Badge>
              <span className="text-[var(--muted)] truncate flex-1">
                {a.summary ?? `${a.entityType} ${a.entityId ?? ""}`}
              </span>
              <span className="text-[var(--muted)] shrink-0">
                {a.actorName ?? a.actorEmail ?? "system"}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
