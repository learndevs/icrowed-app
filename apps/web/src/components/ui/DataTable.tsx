import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: ReactNode;
  className?: string;
  render?: (row: T) => ReactNode;
  accessor?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  empty,
  onRowClick,
  className,
}: DataTableProps<T>) {
  if (rows.length === 0 && empty) {
    return <>{empty}</>;
  }
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-[var(--muted)] border-b border-[var(--border)]">
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn("py-3 pr-4 font-medium", c.className)}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                "hover:bg-[var(--surface)]",
                onRowClick && "cursor-pointer"
              )}
            >
              {columns.map((c) => (
                <td key={c.key} className={cn("py-3 pr-4", c.className)}>
                  {c.render ? c.render(row) : c.accessor ? c.accessor(row) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({
  page,
  pageSize,
  total,
  basePath,
  searchParams,
}: {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams ?? {}).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  };
  return (
    <div className="flex items-center justify-between text-xs text-[var(--muted)] pt-3">
      <span>
        Page {page} of {totalPages} · {total} total
      </span>
      <div className="flex items-center gap-2">
        <a
          href={page > 1 ? buildHref(page - 1) : "#"}
          aria-disabled={page <= 1}
          className={cn(
            "px-3 h-8 inline-flex items-center rounded-lg border border-[var(--border)] bg-white",
            page <= 1 && "pointer-events-none opacity-50"
          )}
        >
          Prev
        </a>
        <a
          href={page < totalPages ? buildHref(page + 1) : "#"}
          aria-disabled={page >= totalPages}
          className={cn(
            "px-3 h-8 inline-flex items-center rounded-lg border border-[var(--border)] bg-white",
            page >= totalPages && "pointer-events-none opacity-50"
          )}
        >
          Next
        </a>
      </div>
    </div>
  );
}
