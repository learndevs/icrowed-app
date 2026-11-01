import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function AccountPageHeader({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6 acct-rise">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-sky-300" />
          </span>
          <span className="text-[11px] font-extrabold tracking-[0.16em] text-[var(--brand-600)] uppercase">
            {eyebrow}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 leading-tight tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="text-neutral-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
