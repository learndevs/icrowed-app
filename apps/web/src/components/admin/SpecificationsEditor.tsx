"use client";

const TEXTAREA =
  "w-full min-h-[220px] px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white font-mono placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-y";

export function SpecificationsEditor({
  value,
  onChange,
}: Readonly<{
  value: string;
  onChange: (value: string) => void;
}>) {
  return (
    <div className="space-y-2">
      <textarea
        className={TEXTAREA}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`## Display\n- **Size**: 6.9 inch\n- **Type**: OLED\n\n## Performance\n- **Chip**: A18 Pro\n- **Storage**: 256GB`}
      />
      <p className="text-xs text-gray-400">
        Markdown supported: headings, lists, **bold**, and line breaks.
      </p>
    </div>
  );
}
