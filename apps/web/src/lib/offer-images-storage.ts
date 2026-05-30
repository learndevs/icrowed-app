import "server-only";

import { mkdir, writeFile, unlink, rm } from "fs/promises";
import path from "path";
import {
  resolveWebAppRoot,
  validateProductImageUpload,
} from "./product-images-storage";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** Directory on disk: {webRoot}/public/uploads/offers */
export function resolveOfferImagesUploadRoot(): string {
  const explicit = process.env.OFFER_IMAGES_UPLOAD_DIR?.trim();
  if (explicit) return path.resolve(explicit);
  return path.join(resolveWebAppRoot(), "public/uploads/offers");
}

export function buildOfferImagePublicUrl(offerId: string, filename: string): string {
  return `/uploads/offers/${offerId}/${filename}`;
}

export async function saveOfferImageLocal(
  offerId: string,
  file: File,
): Promise<{ publicUrl: string; filename: string }> {
  if (!UUID_RE.test(offerId)) {
    throw new Error("Invalid offer id");
  }

  const check = validateProductImageUpload(file);
  if (!check.ok) throw new Error(check.error);

  const nameExt = file.name.split(".").pop()?.toLowerCase();
  const ext =
    EXT_BY_TYPE[file.type] ??
    (nameExt === "jpeg"
      ? "jpg"
      : nameExt && ["jpg", "png", "webp", "gif"].includes(nameExt)
        ? nameExt
        : "jpg");

  const filename = `${Date.now()}.${ext}`;
  const root = resolveOfferImagesUploadRoot();
  const dir = path.join(root, offerId);
  const absolutePath = path.join(dir, filename);

  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  return {
    publicUrl: buildOfferImagePublicUrl(offerId, filename),
    filename,
  };
}

export function localPathFromOfferImageUrl(url: string): string | null {
  try {
    const pathname = url.startsWith("http")
      ? new URL(url).pathname
      : url.startsWith("/")
        ? url
        : `/${url}`;
    const match = pathname.match(/^\/uploads\/offers\/([^/]+)\/([^/]+)$/);
    if (!match) return null;
    const [, offerId, filename] = match;
    if (!UUID_RE.test(offerId)) return null;
    if (!/^[a-zA-Z0-9._-]+$/.test(filename)) return null;

    const root = path.resolve(resolveOfferImagesUploadRoot());
    const filePath = path.resolve(root, offerId, filename);
    if (!filePath.startsWith(root + path.sep) && filePath !== root) return null;
    return filePath;
  } catch {
    return null;
  }
}

export async function deleteOfferImageFile(url: string): Promise<void> {
  const localPath = localPathFromOfferImageUrl(url);
  if (localPath) {
    await unlink(localPath).catch(() => {});
  }
}

export async function deleteAllOfferImagesForOffer(offerId: string): Promise<void> {
  if (!UUID_RE.test(offerId)) return;
  const dir = path.join(resolveOfferImagesUploadRoot(), offerId);
  await rm(dir, { recursive: true, force: true }).catch(() => {});
}
