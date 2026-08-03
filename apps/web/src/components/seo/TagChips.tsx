import Link from "next/link";
import type { TagChip } from "@/lib/price-list";

/**
 * Visible, clickable keyword-tag row (otc.lk / LuxuryX "Keywords:" pattern) —
 * genuine internal links rather than meta-only keyword stuffing.
 */
export function TagChips({ tags }: { tags: TagChip[] }) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 border-t border-gray-100 pt-4">
      {tags.map((tag) => (
        <Link
          key={tag.label}
          href={tag.href}
          className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900"
        >
          {tag.label}
        </Link>
      ))}
    </div>
  );
}
