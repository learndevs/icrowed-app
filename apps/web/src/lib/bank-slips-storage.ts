import "server-only";

import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { resolveWebAppRoot } from "./product-images-storage";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
]);

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
  "application/pdf": "pdf",
};

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
};

/** Order numbers look like ICR-YYMMDD-XXXX */
const ORDER_NUMBER_RE = /^[A-Za-z0-9-]+$/;

/** Directory on disk: {webRoot}/public/uploads/bank-slips */
export function resolveBankSlipsUploadRoot(): string {
  const explicit = process.env.BANK_SLIPS_UPLOAD_DIR?.trim();
  if (explicit) return path.resolve(explicit);
  return path.join(resolveWebAppRoot(), "public/uploads/bank-slips");
}

export function buildBankSlipPublicUrl(orderNumber: string, filename: string): string {
  return `/uploads/bank-slips/${orderNumber}/${filename}`;
}

export function resolveBankSlipContentType(file: File): string | null {
  if (file.type && ALLOWED_TYPES.has(file.type)) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext && EXT_TO_MIME[ext]) return EXT_TO_MIME[ext];
  return null;
}

export function validateBankSlipUpload(
  file: File,
): { ok: true; contentType: string } | { ok: false; error: string } {
  const contentType = resolveBankSlipContentType(file);
  if (!contentType) {
    return { ok: false, error: "Only JPEG, PNG, WebP, HEIC, or PDF files are allowed" };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: "File must be under 5 MB" };
  }
  return { ok: true, contentType };
}

export async function saveBankSlipLocal(
  orderNumber: string,
  file: File,
): Promise<{ publicUrl: string; filename: string }> {
  if (!ORDER_NUMBER_RE.test(orderNumber)) {
    throw new Error("Invalid order number");
  }

  const check = validateBankSlipUpload(file);
  if (!check.ok) throw new Error(check.error);

  const nameExt = file.name.split(".").pop()?.toLowerCase();
  const ext =
    EXT_BY_TYPE[check.contentType] ??
    (nameExt === "jpeg" ? "jpg" : nameExt && EXT_TO_MIME[nameExt] ? nameExt : "jpg");

  const filename = `${Date.now()}-slip.${ext}`;
  const root = resolveBankSlipsUploadRoot();
  const dir = path.join(root, orderNumber);
  const absolutePath = path.join(dir, filename);

  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  return {
    publicUrl: buildBankSlipPublicUrl(orderNumber, filename),
    filename,
  };
}

/** Resolve local file path from a public URL, or null if not a local bank-slip URL. */
export function localPathFromBankSlipUrl(url: string): string | null {
  try {
    const pathname = url.startsWith("http")
      ? new URL(url).pathname
      : url.startsWith("/")
        ? url
        : `/${url}`;
    const match = pathname.match(/^\/uploads\/bank-slips\/([^/]+)\/([^/]+)$/);
    if (!match) return null;
    const [, orderNumber, filename] = match;
    if (!ORDER_NUMBER_RE.test(orderNumber)) return null;
    if (!/^[a-zA-Z0-9._-]+$/.test(filename)) return null;

    const root = path.resolve(resolveBankSlipsUploadRoot());
    const filePath = path.resolve(root, orderNumber, filename);
    if (!filePath.startsWith(root + path.sep) && filePath !== root) return null;
    return filePath;
  } catch {
    return null;
  }
}

export async function deleteBankSlipFile(url: string): Promise<void> {
  const localPath = localPathFromBankSlipUrl(url);
  if (localPath) {
    await unlink(localPath).catch(() => {});
  }
}
