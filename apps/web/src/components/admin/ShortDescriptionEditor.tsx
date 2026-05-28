"use client";

import { ProductShortDescription } from "@/components/products/ProductShortDescription";

const TEXTAREA =
  "w-full min-h-[140px] px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-y";

const EXAMPLE = `4 Mic AI-Powered Calls
Powerful 10mm Drivers
IP54 Sweatguard
Adaptive ANC
Up to 10Hr Battery Life`;

export function ShortDescriptionEditor({
  value,
  onChange,
}: Readonly<{
  value: string;
  onChange: (value: string) => void;
}>) {
  return (
    <div className="space-y-3">
      <textarea
        className={TEXTAREA}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={EXAMPLE}
        rows={6}
      />
      <p className="text-xs text-gray-400">
        One feature per line. Each point shows with a circle bullet on the product page.
      </p>
      {value.trim() ? (
        <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">
            Preview
          </p>
          <ProductShortDescription text={value} embedded />
        </div>
      ) : null}
    </div>
  );
}
