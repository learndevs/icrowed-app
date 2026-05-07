import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Mail } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { listEmailTemplates } from "@icrowed/database";
import { TEMPLATE_LABELS, type TemplateKey } from "@/lib/email-templates/loader";

export const dynamic = "force-dynamic";

export default async function EmailTemplatesPage() {
  const customRows = await listEmailTemplates();
  const customByKey = new Map(customRows.map((r) => [r.key, r]));

  const allKeys = Object.keys(TEMPLATE_LABELS) as TemplateKey[];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Email Templates</h2>
        <p className="text-sm text-[var(--muted)] mt-1">
          Customise transactional emails. Templates without an override use the
          built-in defaults.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allKeys.map((key) => {
          const row = customByKey.get(key);
          return (
            <Link key={key} href={`/admin/email-templates/${key}`}>
              <Card hover className="cursor-pointer">
                <CardContent className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[var(--brand-100)] text-[var(--brand-700)] flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {TEMPLATE_LABELS[key]}
                        </p>
                        <p className="text-xs text-[var(--muted)] font-mono">
                          {key}
                        </p>
                      </div>
                    </div>
                    {row ? (
                      row.isActive ? (
                        <Badge variant="success">Custom</Badge>
                      ) : (
                        <Badge variant="warning">Disabled</Badge>
                      )
                    ) : (
                      <Badge>Default</Badge>
                    )}
                  </div>
                  {row && (
                    <p className="text-xs text-[var(--muted)]">
                      Updated {formatDate(row.updatedAt)} · {row.subject}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
