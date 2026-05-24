import Link from "next/link";
import { ExternalLink, FileText } from "lucide-react";

interface Props {
  proofUrl: string;
  reference?: string | null;
}

export function BankSlipViewer({ proofUrl, reference }: Props) {
  const isPdf = proofUrl.toLowerCase().includes(".pdf");

  return (
    <div className="pt-3 mt-1 border-t border-[var(--border)] space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        Deposit slip
      </p>
      {reference && (
        <p className="text-xs text-[var(--muted)]">
          Reference: <span className="font-mono text-[var(--foreground)]">{reference}</span>
        </p>
      )}
      {isPdf ? (
        <Link
          href={proofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          <FileText className="w-4 h-4" />
          View PDF slip
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      ) : (
        <Link href={proofUrl} target="_blank" rel="noopener noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={proofUrl}
            alt="Bank deposit slip"
            className="rounded-lg border border-[var(--border)] max-h-56 w-auto object-contain bg-[var(--surface)]"
          />
          <span className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] mt-2 hover:underline">
            Open full size <ExternalLink className="w-3 h-3" />
          </span>
        </Link>
      )}
    </div>
  );
}
