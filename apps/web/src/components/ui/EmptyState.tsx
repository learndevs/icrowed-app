import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-4",
        className
      )}
    >
      {icon && (
        <div className="w-12 h-12 rounded-full bg-[var(--surface)] flex items-center justify-center text-[var(--muted)] mb-4">
          {icon}
        </div>
      )}
      <p className="font-medium text-sm text-[var(--foreground)]">{title}</p>
      {description && (
        <p className="text-xs text-[var(--muted)] mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
