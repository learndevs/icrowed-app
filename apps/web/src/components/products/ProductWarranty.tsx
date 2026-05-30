import { ShieldCheck } from "lucide-react";

type ProductWarrantyProps = {
  text: string;
  /** Smaller inline style for product cards */
  compact?: boolean;
};

export function ProductWarranty({ text, compact }: ProductWarrantyProps) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-1 min-w-0 font-inter">
        <ShieldCheck
          className="h-3 w-3 shrink-0 text-sky-600"
          strokeWidth={2}
          aria-hidden
        />
        <span className="text-[10px] font-semibold text-gray-600 truncate md:text-xs">
          {trimmed}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 border-t border-gray-100 pt-4">
      <ShieldCheck
        className="h-[18px] w-[18px] shrink-0 text-sky-600"
        strokeWidth={2}
        aria-hidden
      />
      <span className="text-sm font-medium text-gray-700">{trimmed}</span>
    </div>
  );
}
