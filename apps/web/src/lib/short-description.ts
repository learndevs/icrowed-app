/**
 * Parse short-description text into plain feature lines (no markdown bold).
 */
export function parseShortDescriptionLines(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  let lines: string[];
  if (/^(\s*[-*]|\s*\d+\.)/m.test(trimmed)) {
    lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);
  } else if (trimmed.includes("\n")) {
    lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);
  } else {
    lines = splitLegacyFeatureLine(trimmed);
  }

  return lines
    .map((line) => line.replace(/^[-*]\s*/, "").replace(/\*\*/g, "").trim())
    .filter(Boolean);
}

/** @deprecated use parseShortDescriptionLines */
export function normalizeShortDescriptionMarkdown(raw: string): string {
  return parseShortDescriptionLines(raw)
    .map((line) => `- ${line}`)
    .join("\n");
}

function splitLegacyFeatureLine(text: string): string[] {
  const parts = text.split(/\s+(?=[A-Z0-9])/).map((p) => p.trim()).filter(Boolean);
  return parts.length > 1 ? parts : [text.trim()];
}

export function hasShortDescription(raw: string | null | undefined): boolean {
  return Boolean(raw?.trim());
}
