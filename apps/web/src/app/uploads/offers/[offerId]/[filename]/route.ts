import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { NextResponse } from "next/server";
import { localPathFromOfferImageUrl } from "@/lib/offer-images-storage";

export const runtime = "nodejs";

const CONTENT_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ offerId: string; filename: string }> },
) {
  const { offerId, filename } = await params;
  const publicPath = `/uploads/offers/${offerId}/${filename}`;
  const filePath = localPathFromOfferImageUrl(publicPath);

  if (!filePath || !existsSync(filePath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
  const body = await readFile(filePath);

  return new NextResponse(body, {
    headers: {
      "Content-Type": CONTENT_TYPE[ext] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
