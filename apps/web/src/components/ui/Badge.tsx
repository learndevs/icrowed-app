import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "error" | "outline";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)]",
    primary: "bg-[var(--brand-100)] text-[var(--brand-700)]",
    success: "bg-green-50 text-green-700",
    warning: "bg-amber-50 text-amber-700",
    error: "bg-red-50 text-red-700",
    outline: "border border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
