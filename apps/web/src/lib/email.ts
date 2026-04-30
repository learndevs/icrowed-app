import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  _resend ??= new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: EmailPayload) {
  const from = process.env.EMAIL_FROM ?? "iCrowed <orders@icrowed.com>";
  const resend = getResend();

  const { error } = await resend.emails.send({ from, to, subject, html });

  if (error) {
    console.error("[email] Failed to send:", error);
  }
}
