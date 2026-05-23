"use client";

import ReactMarkdown from "react-markdown";
import { SlidersHorizontal } from "lucide-react";

export function ProductSpecifications({ markdown }: { markdown: string }) {
  if (!markdown.trim()) return null;

  return (
    <div className="bento-card p-5 sm:p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-gray-900 flex items-center justify-center">
          <SlidersHorizontal className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">Specifications</h2>
          <p className="text-xs text-gray-400 mt-0.5">Full technical details</p>
        </div>
      </div>

      <div className="product-spec-markdown text-sm text-gray-700 leading-relaxed space-y-3">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h3 className="text-base font-black text-gray-900 mt-4 first:mt-0">{children}</h3>
            ),
            h2: ({ children }) => (
              <h4 className="text-sm font-bold text-gray-900 mt-4 first:mt-0">{children}</h4>
            ),
            h3: ({ children }) => (
              <h5 className="text-sm font-semibold text-gray-900 mt-3 first:mt-0">{children}</h5>
            ),
            p: ({ children }) => <p className="text-sm text-gray-600 leading-relaxed">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="text-sm text-gray-600">{children}</li>,
            strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}
