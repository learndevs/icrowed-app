"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export function ProductSearchSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  function submit(e?: FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    onClose();
    router.push(`/products?search=${encodeURIComponent(q)}`);
  }

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-[2px]"
        aria-label="Close search"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 top-0 z-[201] border-b border-gray-100 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-xl sm:px-6">
        <form onSubmit={submit} className="mx-auto flex max-w-[1400px] items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="search"
              enterKeyHint="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products by name or brand…"
              className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <button
            type="submit"
            disabled={!query.trim()}
            className="hidden h-11 shrink-0 rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-40 sm:inline-flex sm:items-center"
          >
            Search
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50"
          >
            <X className="h-5 w-5" />
          </button>
        </form>
      </div>
    </>
  );
}
