"use client";

import { useRef, useState } from "react";
import { Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  file: File | null;
  onFileChange: (file: File | null) => void;
  label?: string;
  hint?: string;
}

const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
];

const ALLOWED_EXT = ["jpg", "jpeg", "png", "webp", "heic", "heif", "pdf"];

function isAllowedFile(file: File): boolean {
  if (ALLOWED.includes(file.type)) return true;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext ? ALLOWED_EXT.includes(ext) : false;
}

export function BankSlipUpload({
  file,
  onFileChange,
  label = "Attach bank deposit slip",
  hint = "JPEG, PNG, WebP, HEIC, or PDF — max 5 MB",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSelect(selected: File | null) {
    setError(null);
    if (!selected) {
      onFileChange(null);
      return;
    }
    if (!isAllowedFile(selected)) {
      setError("Please upload a JPEG, PNG, WebP, HEIC, or PDF file.");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError("File must be under 5 MB.");
      return;
    }
    onFileChange(selected);
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      {file ? (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white">
          <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
            <p className="text-xs text-gray-400">
              {(file.size / 1024).toFixed(0)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            aria-label="Remove file"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-xl border-dashed border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          Choose file
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf,.heic,.heif"
        className="hidden"
        onChange={(e) => handleSelect(e.target.files?.[0] ?? null)}
      />
      <p className="text-xs text-gray-400">{hint}</p>
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}
