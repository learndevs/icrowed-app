import { Shield, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductWarrantyProps = {
  text: string;
  /** Smaller inline style for product cards */
  compact?: boolean;
};

function WarrantyIcon({ compact }: { compact?: boolean }) {
  const size = compact ? "h-3.5 w-3.5 md:h-4 md:w-4" : "h-5 w-5";
  const checkSize = compact ? "h-1.5 w-1.5 md:h-[7px] md:w-[7px]" : "h-2 w-2";

  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", size)} aria-hidden>
      <Shield className={cn("fill-sky-600 text-sky-600", size)} strokeWidth={0} />
      <Check
        className={cn(
          "absolute left-1/2 top-[53%] -translate-x-1/2 -translate-y-1/2 text-white",
          checkSize,
        )}
        strokeWidth={3}
      />
    </span>
  );
}

export function ProductWarranty({ text, compact }: ProductWarrantyProps) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-1 min-w-0 font-inter">
        <WarrantyIcon compact />
        <span className="text-[10px] font-semibold text-gray-600 truncate md:text-xs">
          {trimmed}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 border-t border-gray-100 pt-4">
      <WarrantyIcon />
      <span className="text-sm font-medium text-gray-700">{trimmed}</span>
    </div>
  );
}
