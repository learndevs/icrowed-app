import { NextRequest, NextResponse } from "next/server";
import { deleteSiteReview } from "@icrowd/database/queries";
import { requireAdmin } from "@/lib/admin";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    const row = await deleteSiteReview(id);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/site-reviews/[id]]", err);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
