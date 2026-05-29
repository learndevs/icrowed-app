import "server-only";

import { mkdir, writeFile, unlink, rm } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const SUPABASE_BUCKET = "product-images";

/** Directory on disk: apps/web/public/uploads/products */
export function resolveProductImagesUploadRoot(): string {
  const explicit = process.env.PRODUCT_IMAGES_UPLOAD_DIR?.trim();
  if (explicit) return path.resolve(explicit);

  const cwd = process.cwd();
  if (existsSync(path.join(cwd, "apps/web"))) {
    return path.join(cwd, "apps/web/public/uploads/products");
  }
  return path.join(cwd, "public/uploads/products");
}

export function appPublicBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  return base.replace(/\/$/, "");
}

export function buildProductImagePublicUrl(productId: string, filename: string): string {
  return `${appPublicBaseUrl()}/uploads/products/${productId}/${filename}`;
}

export function validateProductImageUpload(
  file: File,
): { ok: true } | { ok: false; error: string } {
  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false, error: "Only JPEG, PNG, WebP and GIF images are allowed" };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: "File must be under 5 MB" };
  }
  return { ok: true };
}

export async function saveProductImageLocal(
  productId: string,
  file: File,
): Promise<{ publicUrl: string; filename: string }> {
  if (!UUID_RE.test(productId)) {
    throw new Error("Invalid product id");
  }

  const check = validateProductImageUpload(file);
  if (!check.ok) throw new Error(check.error);

  const nameExt = file.name.split(".").pop()?.toLowerCase();
  const ext =
    EXT_BY_TYPE[file.type] ??
    (nameExt === "jpeg" ? "jpg" : nameExt && ["jpg", "png", "webp", "gif"].includes(nameExt) ? nameExt : "jpg");

  const filename = `${Date.now()}.${ext}`;
  const root = resolveProductImagesUploadRoot();
  const dir = path.join(root, productId);
  const absolutePath = path.join(dir, filename);

  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  return {
    publicUrl: buildProductImagePublicUrl(productId, filename),
    filename,
  };
}

/** Resolve local file path from a public URL, or null if not a local product image URL. */
export function localPathFromProductImageUrl(url: string): string | null {
  try {
    const pathname = url.startsWith("http")
      ? new URL(url).pathname
      : url.startsWith("/")
        ? url
        : `/${url}`;
    const match = pathname.match(/^\/uploads\/products\/([^/]+)\/([^/]+)$/);
    if (!match) return null;
    const [, productId, filename] = match;
    if (!UUID_RE.test(productId)) return null;
    if (!/^[a-zA-Z0-9._-]+$/.test(filename)) return null;

    const root = path.resolve(resolveProductImagesUploadRoot());
    const filePath = path.resolve(root, productId, filename);
    if (!filePath.startsWith(root + path.sep) && filePath !== root) return null;
    return filePath;
  } catch {
    return null;
  }
}

export async function deleteProductImageFile(url: string): Promise<void> {
  const localPath = localPathFromProductImageUrl(url);
  if (localPath) {
    await unlink(localPath).catch(() => {});
    return;
  }

  await deleteLegacySupabaseProductImage(url);
}

/** Remove entire product folder (all images for one product). */
export async function deleteAllProductImagesForProduct(productId: string): Promise<void> {
  if (!UUID_RE.test(productId)) return;
  const dir = path.join(resolveProductImagesUploadRoot(), productId);
  await rm(dir, { recursive: true, force: true }).catch(() => {});
}

async function deleteLegacySupabaseProductImage(url: string): Promise<void> {
  const marker = `/storage/v1/object/public/${SUPABASE_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx < 0) return;

  const storagePath = url.slice(idx + marker.length);
  const urlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!urlEnv || !key) return;

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(urlEnv, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error } = await supabase.storage.from(SUPABASE_BUCKET).remove([storagePath]);
    if (error) console.warn("[legacy supabase image delete]", error.message);
  } catch (err) {
    console.warn("[legacy supabase image delete]", err);
  }
}
