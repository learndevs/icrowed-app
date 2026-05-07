import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getEmailTemplateByKey } from "@icrowed/database";
import {
  TEMPLATE_LABELS,
  TEMPLATE_VARIABLES,
  type TemplateKey,
} from "@/lib/email-templates/loader";
import { TEMPLATE_DEFAULTS } from "@/lib/email-templates/defaults";
import { TemplateEditor } from "./TemplateEditor";

export const dynamic = "force-dynamic";

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  if (!(key in TEMPLATE_LABELS)) notFound();

  const k = key as TemplateKey;
  const row = await getEmailTemplateByKey(key);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/email-templates"
        className="inline-flex items-center text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        <ChevronLeft className="w-4 h-4" /> Back to templates
      </Link>

      <div>
        <h2 className="text-xl font-bold">{TEMPLATE_LABELS[k]}</h2>
        <p className="text-sm text-[var(--muted)] mt-1 font-mono">{key}</p>
      </div>

      <TemplateEditor
        templateKey={key}
        label={TEMPLATE_LABELS[k]}
        variables={TEMPLATE_VARIABLES[k] ?? []}
        defaultContent={TEMPLATE_DEFAULTS[k]}
        initial={
          row
            ? {
                subject: row.subject,
                bodyHtml: row.bodyHtml,
                bodyText: row.bodyText ?? "",
                isActive: row.isActive,
              }
            : {
                subject: TEMPLATE_DEFAULTS[k]?.subject ?? "",
                bodyHtml: TEMPLATE_DEFAULTS[k]?.bodyHtml ?? "",
                bodyText: TEMPLATE_DEFAULTS[k]?.bodyText ?? "",
                isActive: true,
              }
        }
      />
    </div>
  );
}
