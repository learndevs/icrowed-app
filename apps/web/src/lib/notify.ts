import {
  getOrCreateNotificationPrefs,
  parseRecipients,
} from "@icrowed/database";
import { sendEmail } from "@/lib/email";

export type NotifyEvent =
  | "new_order"
  | "low_stock"
  | "refund"
  | "review_pending";

const EVENT_PREF: Record<NotifyEvent, keyof Awaited<ReturnType<typeof getOrCreateNotificationPrefs>>> = {
  new_order: "notifyOnNewOrder",
  low_stock: "notifyOnLowStock",
  refund: "notifyOnRefund",
  review_pending: "notifyOnReview",
};

/**
 * Sends an email to all configured admin recipients if the matching event
 * preference is enabled. Fire-and-forget; never throws.
 */
export async function notifyAdmins(
  event: NotifyEvent,
  payload: { subject: string; html: string }
): Promise<void> {
  try {
    const prefs = await getOrCreateNotificationPrefs();
    const enabled = prefs[EVENT_PREF[event]];
    if (!enabled) return;
    const recipients = parseRecipients(prefs.recipientEmails);
    if (recipients.length === 0) return;
    await Promise.all(
      recipients.map((to) =>
        sendEmail({ to, subject: payload.subject, html: payload.html }).catch(
          (err) => console.error("notifyAdmins:send failed", to, err)
        )
      )
    );
  } catch (err) {
    console.error("notifyAdmins failed", err);
  }
}
