import { getOrCreateNotificationPrefs, parseRecipients } from "@icrowd/database";
import { sendEmail } from "@/lib/email";
import { TEMPLATE_DEFAULTS } from "@/lib/email-templates/defaults";
import { renderCustomTemplate, renderTemplate } from "@/lib/email-templates/loader";
import { paymentMethodLabel } from "@/lib/invoice";

export type NewOrderAdminNotificationData = {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: string | number;
  paymentMethod: string;
};

async function resolveNewOrderAdminEmail(vars: Record<string, unknown>) {
  const custom = await renderCustomTemplate("new_order_admin", vars);
  if (custom) return custom;

  const defaults = TEMPLATE_DEFAULTS.new_order_admin;
  return {
    subject: renderTemplate(defaults.subject, vars),
    html: renderTemplate(defaults.bodyHtml, vars),
  };
}

/**
 * Sends a new-order alert to configured admin recipients when enabled in
 * Settings → Notifications. Fire-and-forget; never throws.
 */
export async function sendNewOrderAdminNotification(
  data: NewOrderAdminNotificationData
): Promise<void> {
  try {
    const prefs = await getOrCreateNotificationPrefs();
    if (!prefs.notifyOnNewOrder) return;

    const recipients = parseRecipients(prefs.recipientEmails);
    if (recipients.length === 0) return;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const vars = {
      orderNumber: data.orderNumber,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      total: Number(data.total).toLocaleString("en-LK"),
      paymentMethod: paymentMethodLabel(data.paymentMethod),
      appUrl,
      orderUrl: `${appUrl}/admin/orders/${data.orderId}`,
    };

    const { subject, html } = await resolveNewOrderAdminEmail(vars);

    await Promise.all(
      recipients.map((to) =>
        sendEmail({ to, subject, html }).catch((err) =>
          console.error("[sendNewOrderAdminNotification] send failed", to, err)
        )
      )
    );
  } catch (err) {
    console.error("[sendNewOrderAdminNotification]", err);
  }
}
