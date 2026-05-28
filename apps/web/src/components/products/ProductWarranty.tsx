import { ShieldCheck } from "lucide-react";

export function ProductWarranty({ text }: { text: string }) {
  const trimmed = text.trim();
  if (!trimmed) return null;

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
