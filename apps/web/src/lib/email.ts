import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  _resend ??= new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export type EmailAttachment = {
  filename: string;
  content: Buffer | string;
};

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
};

export async function sendEmail({ to, subject, html, attachments }: EmailPayload) {
  const from = process.env.EMAIL_FROM ?? "iCrowd <orders@icrowd.com>";
  const resend = getResend();

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    attachments: attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
    })),
  });

  if (error) {
    console.error("[email] Failed to send:", error);
  }
}
