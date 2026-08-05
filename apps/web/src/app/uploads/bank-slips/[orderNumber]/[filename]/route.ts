import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { NextResponse } from "next/server";
import { localPathFromBankSlipUrl } from "@/lib/bank-slips-storage";

export const runtime = "nodejs";

const CONTENT_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderNumber: string; filename: string }> },
) {
  const { orderNumber, filename } = await params;
  const publicPath = `/uploads/bank-slips/${orderNumber}/${filename}`;
  const filePath = localPathFromBankSlipUrl(publicPath);

  if (!filePath || !existsSync(filePath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
  const body = await readFile(filePath);

  return new NextResponse(body, {
    headers: {
      "Content-Type": CONTENT_TYPE[ext] ?? "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
