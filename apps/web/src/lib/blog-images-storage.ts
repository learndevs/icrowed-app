import "server-only";

import { mkdir, writeFile, unlink, rm } from "fs/promises";
import path from "path";
import {
  resolveWebAppRoot,
  validateProductImageUpload,
} from "./product-images-storage";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_WIDTH = 1920;
const WEBP_QUALITY = 82;

/** Directory on disk: {webRoot}/public/uploads/blog */
export function resolveBlogImagesUploadRoot(): string {
  const explicit = process.env.BLOG_IMAGES_UPLOAD_DIR?.trim();
  if (explicit) return path.resolve(explicit);
  return path.join(resolveWebAppRoot(), "public/uploads/blog");
}

export function buildBlogImagePublicUrl(postId: string, filename: string): string {
  return `/uploads/blog/${postId}/${filename}`;
}

async function compressToWebp(buffer: Buffer): Promise<Buffer> {
  try {
    const sharp = (await import("sharp")).default;
    return sharp(buffer)
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  } catch {
    return buffer;
  }
}

export async function saveBlogImageLocal(
  postId: string,
  file: File,
): Promise<{ publicUrl: string; filename: string }> {
  if (!UUID_RE.test(postId)) {
    throw new Error("Invalid blog post id");
  }

  const check = validateProductImageUpload(file);
  if (!check.ok) throw new Error(check.error);

  const rawBuffer = Buffer.from(await file.arrayBuffer());
  const isGif = file.type === "image/gif";
  const filename = isGif
    ? `${Date.now()}.gif`
    : `${Date.now()}.webp`;

  const buffer = isGif ? rawBuffer : await compressToWebp(rawBuffer);

  const root = resolveBlogImagesUploadRoot();
  const dir = path.join(root, postId);
  const absolutePath = path.join(dir, filename);

  await mkdir(dir, { recursive: true });
  await writeFile(absolutePath, buffer);

  return {
    publicUrl: buildBlogImagePublicUrl(postId, filename),
    filename,
  };
}

export function localPathFromBlogImageUrl(url: string): string | null {
  try {
    const pathname = url.startsWith("http")
      ? new URL(url).pathname
      : url.startsWith("/")
        ? url
        : `/${url}`;
    const match = pathname.match(/^\/uploads\/blog\/([^/]+)\/([^/]+)$/);
    if (!match) return null;
    const [, postId, filename] = match;
    if (!UUID_RE.test(postId)) return null;
    if (!/^[a-zA-Z0-9._-]+$/.test(filename)) return null;

    const root = path.resolve(resolveBlogImagesUploadRoot());
    const filePath = path.resolve(root, postId, filename);
    if (!filePath.startsWith(root + path.sep) && filePath !== root) return null;
    return filePath;
  } catch {
    return null;
  }
}

export async function deleteBlogImageFile(url: string): Promise<void> {
  const localPath = localPathFromBlogImageUrl(url);
  if (localPath) {
    await unlink(localPath).catch(() => {});
  }
}

export async function deleteAllBlogImagesForPost(postId: string): Promise<void> {
  if (!UUID_RE.test(postId)) return;
  const dir = path.join(resolveBlogImagesUploadRoot(), postId);
  await rm(dir, { recursive: true, force: true }).catch(() => {});
}
