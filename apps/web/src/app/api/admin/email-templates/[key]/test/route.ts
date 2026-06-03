import { NextRequest, NextResponse } from "next/server";
import { getEmailTemplateByKey } from "@icrowd/database";
import { requireAdmin } from "@/lib/admin";
import { sendEmail } from "@/lib/email";
import { TEMPLATE_DEFAULTS } from "@/lib/email-templates/defaults";
import { renderTemplate, TEMPLATE_LABELS, type TemplateKey } from "@/lib/email-templates/loader";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const { key } = await params;
    if (!(key in TEMPLATE_LABELS)) {
      return NextResponse.json({ error: "Unknown template key" }, { status: 404 });
    }

    const body = (await req.json()) as {
      to?: string;
      vars?: Record<string, unknown>;
      subject?: string;
      bodyHtml?: string;
    };

    if (!body.to?.trim()) {
      return NextResponse.json({ error: "to (email) required" }, { status: 400 });
    }

    const sample = body.vars ?? {};
    let subjectTpl: string;
    let htmlTpl: string;

    if (body.subject && body.bodyHtml) {
      subjectTpl = body.subject;
      htmlTpl = body.bodyHtml;
    } else {
      const row = await getEmailTemplateByKey(key);
      if (row) {
        subjectTpl = row.subject;
        htmlTpl = row.bodyHtml;
      } else {
        const defaults = TEMPLATE_DEFAULTS[key as TemplateKey];
        subjectTpl = defaults.subject;
        htmlTpl = defaults.bodyHtml;
      }
    }

    const subject = renderTemplate(subjectTpl, sample);
    const html = renderTemplate(htmlTpl, sample);

    const result = await sendEmail({ to: body.to.trim(), subject, html });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    return NextResponse.json({ ok: true, id: result.id });
  } catch (err) {
    console.error("[POST /api/admin/email-templates/[key]/test]", err);
    const message = err instanceof Error ? err.message : "Failed to send test";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
