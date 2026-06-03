import { db, getOrCreateStoreSettings, orders } from "@icrowd/database";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/email";
import { TEMPLATE_DEFAULTS } from "@/lib/email-templates/defaults";
import { renderCustomTemplate, renderTemplate } from "@/lib/email-templates/loader";
import { buildInvoicePdfBuffer, invoiceFilename } from "@/lib/invoice-pdf";
import { paymentMethodLabel, type OrderWithItems } from "@/lib/invoice";

function formatTotal(total: string | number) {
  return Number(total).toLocaleString("en-LK");
}

async function resolveConfirmationEmail(vars: Record<string, unknown>) {
  const custom = await renderCustomTemplate("order_confirmation", vars);
  if (custom) return custom;

  const defaults = TEMPLATE_DEFAULTS.order_confirmation;
  return {
    subject: renderTemplate(defaults.subject, vars),
    html: renderTemplate(defaults.bodyHtml, vars),
  };
}

/**
 * Sends the configurable order-confirmation email with an invoice PDF attachment.
 * Intended when an admin sets order status to "confirmed".
 */
export async function sendOrderConfirmedEmail(orderId: string): Promise<void> {
  try {
    const [order, store] = await Promise.all([
      db.query.orders.findFirst({
        where: eq(orders.id, orderId),
        with: { items: true },
      }),
      getOrCreateStoreSettings(),
    ]);

    if (!order?.customerEmail) return;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const vars = {
      customerName: order.customerName ?? "Customer",
      orderNumber: order.orderNumber,
      total: formatTotal(order.total),
      appUrl,
      paymentMethod: paymentMethodLabel(order.paymentMethod),
    };

    const { subject, html } = await resolveConfirmationEmail(vars);

    const pdf = buildInvoicePdfBuffer(order as OrderWithItems, store);

    const result = await sendEmail({
      to: order.customerEmail,
      subject,
      html,
      attachments: [
        {
          filename: invoiceFilename(order.orderNumber, "pdf"),
          content: pdf,
        },
      ],
    });

    if (!result.ok) {
      console.error("[sendOrderConfirmedEmail] Resend:", result.error);
    }
  } catch (err) {
    console.error("[sendOrderConfirmedEmail]", orderId, err);
  }
}
