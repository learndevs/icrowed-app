"use client";

import { parseShortDescriptionLines } from "@/lib/short-description";

function FeatureBullet() {
  return (
    <span
      className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gray-900"
      aria-hidden
    />
  );
}

function FeatureRow({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <FeatureBullet />
      <span className="flex-1 text-sm leading-relaxed text-gray-500">{text}</span>
    </li>
  );
}

export function ProductShortDescription({
  text,
  embedded = false,
}: {
  text: string;
  embedded?: boolean;
}) {
  const lines = parseShortDescriptionLines(text);
  if (lines.length === 0) return null;

  return (
    <div
      className={
        embedded ? "product-short-desc" : "border-t border-gray-100 pt-5 product-short-desc"
      }
    >
      <ul className="space-y-4">
        {lines.map((line, i) => (
          <FeatureRow key={`${i}-${line}`} text={line} />
        ))}
      </ul>
    </div>
  );
}
