export { db, type DB } from "./db";

export * from "./schema";
export {
  getOrCreateShippingRates,
  upsertShippingRates,
  computeShippingLkr,
} from "./queries/shippingRates";
export {
  getOrCreateStoreSettings,
  upsertStoreSettings,
  type StoreSettingsRow,
  type StoreSettingsInput,
} from "./queries/storeSettings";
export {
  getOrCreateNotificationPrefs,
  upsertNotificationPrefs,
  parseRecipients,
  type NotificationPrefsRow,
  type NotificationPrefsInput,
} from "./queries/notifications";
export {
  insertAuditLog,
  listAuditLogs,
  type AuditLogRow,
  type AuditLogInput,
  type AuditFilter,
} from "./queries/auditLogs";
export {
  listEmailTemplates,
  getEmailTemplateByKey,
  upsertEmailTemplate,
  type EmailTemplateRow,
  type EmailTemplateInput,
} from "./queries/emailTemplates";
