import { headers } from "next/headers";
import { insertAuditLog } from "@icrowed/database";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "status_change"
  | "refund"
  | "role_change"
  | "deactivate"
  | "reactivate"
  | "stock_adjust"
  | "bulk_update"
  | "login";

export type AuditEntity =
  | "product"
  | "category"
  | "brand"
  | "order"
  | "review"
  | "coupon"
  | "offer"
  | "customer"
  | "admin"
  | "settings"
  | "shipping_rates"
  | "email_template"
  | "notification_prefs";

export type LogAuditOpts = {
  actor?: { userId: string; email?: string | null } | null;
  entityType: AuditEntity | string;
  entityId?: string | number | null;
  action: AuditAction | string;
  summary?: string;
  before?: unknown;
  after?: unknown;
  metadata?: Record<string, unknown>;
};

async function getIp(): Promise<string | null> {
  try {
    const h = await headers();
    return (
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      null
    );
  } catch {
    return null;
  }
}

/**
 * Fire-and-forget audit log writer. Never throws — logs to console on failure
 * so it cannot break the parent operation.
 */
export async function logAudit(opts: LogAuditOpts) {
  try {
    const ip = await getIp();
    await insertAuditLog({
      actorId: opts.actor?.userId ?? null,
      actorEmail: opts.actor?.email ?? null,
      entityType: String(opts.entityType),
      entityId: opts.entityId != null ? String(opts.entityId) : null,
      action: String(opts.action),
      summary: opts.summary ?? null,
      before: (opts.before as object) ?? null,
      after: (opts.after as object) ?? null,
      metadata: (opts.metadata as object) ?? null,
      ipAddress: ip,
    });
  } catch (err) {
    console.error("audit:log failed", err);
  }
}
