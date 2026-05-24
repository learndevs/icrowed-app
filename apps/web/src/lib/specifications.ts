const MARKDOWN_KEY = "markdown";

/** Read specifications from DB jsonb (legacy key-value or markdown wrapper). */
export function specificationsToMarkdown(raw: unknown): string {
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>;
    if (typeof obj[MARKDOWN_KEY] === "string") return obj[MARKDOWN_KEY];
    return Object.entries(obj)
      .filter(([key]) => key !== MARKDOWN_KEY)
      .map(([key, value]) => `**${key}**: ${String(value ?? "")}`)
      .join("\n");
  }
  return "";
}

/** Persist markdown in jsonb as `{ markdown: "..." }`. */
export function markdownToSpecifications(markdown: string): { markdown: string } | null {
  const trimmed = markdown.trim();
  if (!trimmed) return null;
  return { [MARKDOWN_KEY]: trimmed };
}

export function hasSpecifications(raw: unknown): boolean {
  return specificationsToMarkdown(raw).trim().length > 0;
}
