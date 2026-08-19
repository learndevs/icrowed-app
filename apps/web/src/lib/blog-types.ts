export type BlogPostType = "review" | "article";

export type BlogGalleryImage = {
  url: string;
  alt?: string;
  caption?: string;
};

export type BlogVideo = {
  url: string;
  title?: string;
};

export type BlogLink = {
  label: string;
  href: string;
};

export interface BlogPostRecord {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  postType: string;
  coverImageUrl: string | null;
  productId: string | null;
  productName: string | null;
  brandName: string | null;
  rating: number | null;
  galleryImages: BlogGalleryImage[];
  videoUrls: BlogVideo[];
  pros: string[];
  cons: string[];
  relatedLinks: BlogLink[];
  isPublished: boolean;
  publishedAt: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export function slugifyBlogTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

export function linesToList(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function listToLines(items: string[] | null | undefined): string {
  return (items ?? []).join("\n");
}

export function parseVideoLines(text: string): BlogVideo[] {
  return linesToList(text).map((url) => ({ url }));
}

export function videosToLines(videos: BlogVideo[] | null | undefined): string {
  return (videos ?? []).map((v) => v.url).join("\n");
}

export function parseRelatedLinks(text: string): BlogLink[] {
  return linesToList(text)
    .map((line) => {
      const pipe = line.indexOf("|");
      if (pipe === -1) return null;
      const label = line.slice(0, pipe).trim();
      const href = line.slice(pipe + 1).trim();
      if (!label || !href) return null;
      return { label, href };
    })
    .filter((link): link is BlogLink => link !== null);
}

export function relatedLinksToLines(links: BlogLink[] | null | undefined): string {
  return (links ?? []).map((l) => `${l.label}|${l.href}`).join("\n");
}
