import { NextRequest, NextResponse } from "next/server";
import { db, orders } from "@icrowd/database";
import { eq } from "drizzle-orm";
import { getSupabaseAdmin } from "@/lib/supabase/admin-client";
import { notifyAdmins } from "@/lib/notify";

const BUCKET = "bank-slips";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
];

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
};

function resolveContentType(file: File): string | null {
  if (file.type && ALLOWED_TYPES.includes(file.type)) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext && EXT_TO_MIME[ext]) return EXT_TO_MIME[ext];
  return null;
}

async function ensureBankSlipsBucket() {
  const supabase = getSupabaseAdmin();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;

  if (buckets?.some((b) => b.name === BUCKET)) return supabase;

  const { error: createError } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_FILE_SIZE,
  });

  if (createError && !createError.message.toLowerCase().includes("already exists")) {
    throw createError;
  }

  return supabase;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const orderNumber = String(formData.get("orderNumber") ?? "").trim();
    const reference = String(formData.get("reference") ?? "").trim();
    const file = formData.get("file") as File | null;

    if (!orderNumber) {
      return NextResponse.json({ error: "orderNumber is required" }, { status: 400 });
    }

    if (!file && !reference) {
      return NextResponse.json(
        { error: "Provide a bank slip file and/or transfer reference" },
        { status: 400 },
      );
    }

    const order = await db.query.orders.findFirst({
      where: eq(orders.orderNumber, orderNumber),
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentMethod !== "bank_transfer") {
      return NextResponse.json(
        { error: "This order is not a bank transfer order" },
        { status: 400 },
      );
    }

    const patch: {
      updatedAt: Date;
      bankTransferReference?: string;
      bankTransferProofUrl?: string;
    } = { updatedAt: new Date() };

    if (reference) {
      patch.bankTransferReference = reference;
    }

    if (file) {
      const contentType = resolveContentType(file);
      if (!contentType) {
        return NextResponse.json(
          { error: "Only JPEG, PNG, WebP, HEIC, or PDF files are allowed" },
          { status: 400 },
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "File must be under 5 MB" }, { status: 400 });
      }

      const supabase = await ensureBankSlipsBucket();
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const storagePath = `${orderNumber}/${Date.now()}-slip.${ext}`;
      const buffer = await file.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, buffer, { contentType, upsert: false });

      if (uploadError) {
        console.error("[bank-slip upload]", uploadError);
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
      patch.bankTransferProofUrl = publicUrl;
    }

    const [updated] = await db
      .update(orders)
      .set(patch)
      .where(eq(orders.id, order.id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }

    notifyAdmins("new_order", {
      subject: `Bank slip uploaded — ${orderNumber}`,
      html: `<p>A customer uploaded bank transfer proof for order <strong>${orderNumber}</strong>.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/admin/orders/${order.id}">Review order</a></p>`,
    }).catch(() => {});

    return NextResponse.json({
      ok: true,
      bankTransferReference: updated.bankTransferReference,
      bankTransferProofUrl: updated.bankTransferProofUrl,
    });
  } catch (err) {
    console.error("[POST /api/orders/bank-transfer-proof]", err);
    const message =
      err instanceof Error ? err.message : "Failed to save bank transfer proof";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
