import { and, desc, eq, gte, lte, sql, SQL } from "drizzle-orm";
import { db } from "../db";
import { auditLogs, profiles } from "../schema";

export type AuditLogRow = typeof auditLogs.$inferSelect;
export type AuditLogInput = typeof auditLogs.$inferInsert;

export async function insertAuditLog(data: AuditLogInput) {
  const [row] = await db.insert(auditLogs).values(data).returning();
  return row;
}

export type AuditFilter = {
  entityType?: string;
  entityId?: string;
  action?: string;
  actorId?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
};

export async function listAuditLogs(filter: AuditFilter = {}) {
  const conds: SQL[] = [];
  if (filter.entityType) conds.push(eq(auditLogs.entityType, filter.entityType));
  if (filter.entityId) conds.push(eq(auditLogs.entityId, filter.entityId));
  if (filter.action) conds.push(eq(auditLogs.action, filter.action));
  if (filter.actorId) conds.push(eq(auditLogs.actorId, filter.actorId));
  if (filter.from) conds.push(gte(auditLogs.createdAt, filter.from));
  if (filter.to) conds.push(lte(auditLogs.createdAt, filter.to));

  const limit = filter.limit ?? 50;
  const offset = filter.offset ?? 0;
  const where = conds.length ? and(...conds) : undefined;

  const rows = await db
    .select({
      id: auditLogs.id,
      actorId: auditLogs.actorId,
      actorEmail: auditLogs.actorEmail,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      action: auditLogs.action,
      summary: auditLogs.summary,
      before: auditLogs.before,
      after: auditLogs.after,
      metadata: auditLogs.metadata,
      ipAddress: auditLogs.ipAddress,
      createdAt: auditLogs.createdAt,
      actorName: profiles.fullName,
    })
    .from(auditLogs)
    .leftJoin(profiles, eq(profiles.id, auditLogs.actorId))
    .where(where)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(auditLogs)
    .where(where);

  return { rows, total: count };
}
