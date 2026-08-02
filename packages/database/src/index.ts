export { db, type DB } from "./db";
export * from "./variant-options";

export * from "./schema";
export {
  getOrCreateShippingRates,
  upsertShippingRates,
  computeShippingLkr,
} from "./queries/shippingRates";
export {
  getActiveDeliveryTypes,
  getAllDeliveryTypes,
  getDeliveryTypeById,
  getCheckoutDeliveryOptions,
  computeDeliveryFee,
  computeDeliveryFeeForType,
  createDeliveryType,
  updateDeliveryType,
  deleteDeliveryType,
  type DeliveryTypeRow,
} from "./queries/deliveryTypes";
export {
  getOrCreateStoreSettings,
  upsertStoreSettings,
  type StoreSettingsRow,
  type StoreSettingsInput,
} from "./queries/storeSettings";
export {
  getActiveStoreLocations,
  getAllStoreLocations,
  getStoreLocationBySlug,
  getStoreLocationById,
  createStoreLocation,
  updateStoreLocation,
  deleteStoreLocation,
  ensureDefaultStoreLocations,
} from "./queries/storeLocations";
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
export {
  prepareAndReserveOrderItems,
  OrderItemError,
  type IncomingOrderItem,
  type PreparedOrderItem,
} from "./queries/orderInventory";
