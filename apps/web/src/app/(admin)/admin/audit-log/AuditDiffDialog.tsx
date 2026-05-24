"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export type AuditRow = {
  id: string;
  actorEmail: string | null;
  actorName: string | null;
  entityType: string;
  entityId: string | null;
  action: string;
  summary: string | null;
  before: unknown;
  after: unknown;
  metadata: unknown;
  ipAddress: string | null;
  createdAt: Date | string;
};

export function AuditDiffButton({ row }: { row: AuditRow }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
        View
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={`${row.entityType} · ${row.action}`}
        description={row.summary ?? undefined}
        size="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Actor" value={row.actorEmail ?? row.actorName ?? "system"} />
            <Field label="Entity ID" value={row.entityId ?? "—"} />
            <Field label="When" value={String(formatDate(row.createdAt))} />
            <Field label="IP" value={row.ipAddress ?? "—"} />
          </div>

          <DiffBlock title="Before" value={row.before} />
          <DiffBlock title="After" value={row.after} />
          {row.metadata != null && <DiffBlock title="Metadata" value={row.metadata} />}
        </div>
      </Dialog>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">{label}</p>
      <p className="font-mono text-xs">{value}</p>
    </div>
  );
}

function DiffBlock({ title, value }: { title: string; value: unknown }) {
  if (value == null) {
    return (
      <div>
        <Badge>{title}</Badge>
        <p className="text-[var(--muted)] mt-1 text-xs">empty</p>
      </div>
    );
  }
  return (
    <div>
      <Badge>{title}</Badge>
      <pre className="mt-2 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 overflow-auto max-h-64">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
