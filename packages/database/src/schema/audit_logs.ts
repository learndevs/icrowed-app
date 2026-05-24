import {
  pgTable,
  text,
  varchar,
  uuid,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { profiles } from "./users";

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    actorEmail: varchar("actor_email", { length: 255 }),
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: varchar("entity_id", { length: 100 }),
    action: varchar("action", { length: 50 }).notNull(),
    summary: text("summary"),
    before: jsonb("before"),
    after: jsonb("after"),
    metadata: jsonb("metadata"),
    ipAddress: varchar("ip_address", { length: 64 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    entityIdx: index("audit_logs_entity_idx").on(t.entityType, t.entityId),
    actorIdx: index("audit_logs_actor_idx").on(t.actorId),
    createdIdx: index("audit_logs_created_idx").on(t.createdAt),
  })
);

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(profiles, {
    fields: [auditLogs.actorId],
    references: [profiles.id],
  }),
}));
