/** Parse YouTube / Vimeo URLs into embed-safe iframe src. */
export function getVideoEmbedUrl(raw: string): string | null {
  const url = raw.trim();
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname.startsWith("/embed/")) {
        return `https://www.youtube.com/embed/${parsed.pathname.split("/")[2] ?? ""}`;
      }
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host === "vimeo.com") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }

    if (host === "player.vimeo.com") {
      return url;
    }

    return null;
  } catch {
    return null;
  }
}

export function getVideoThumbnail(raw: string): string | null {
  const embed = getVideoEmbedUrl(raw);
  if (!embed) return null;

  if (embed.includes("youtube.com/embed/")) {
    const id = embed.split("/embed/")[1]?.split("?")[0];
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  }

  return null;
}
