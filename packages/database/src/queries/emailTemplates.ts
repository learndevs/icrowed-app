import { asc, eq } from "drizzle-orm";
import { db } from "../db";
import { emailTemplates } from "../schema";

export type EmailTemplateRow = typeof emailTemplates.$inferSelect;
export type EmailTemplateInput = typeof emailTemplates.$inferInsert;

export async function listEmailTemplates() {
  return db
    .select()
    .from(emailTemplates)
    .orderBy(asc(emailTemplates.label));
}

export async function getEmailTemplateByKey(key: string) {
  const [row] = await db
    .select()
    .from(emailTemplates)
    .where(eq(emailTemplates.key, key))
    .limit(1);
  return row ?? null;
}

export async function upsertEmailTemplate(data: EmailTemplateInput) {
  const existing = await getEmailTemplateByKey(data.key);
  if (!existing) {
    const [row] = await db.insert(emailTemplates).values(data).returning();
    return row;
  }
  const [row] = await db
    .update(emailTemplates)
    .set({
      label: data.label,
      subject: data.subject,
      bodyHtml: data.bodyHtml,
      bodyText: data.bodyText,
      variables: data.variables,
      isActive: data.isActive,
      updatedBy: data.updatedBy,
      updatedAt: new Date(),
    })
    .where(eq(emailTemplates.key, data.key))
    .returning();
  return row;
}
