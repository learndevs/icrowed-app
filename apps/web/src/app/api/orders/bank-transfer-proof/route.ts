import { NextRequest, NextResponse } from "next/server";
import { db, orders } from "@icrowd/database";
import { eq } from "drizzle-orm";
import { notifyAdmins } from "@/lib/notify";
import {
  deleteBankSlipFile,
  saveBankSlipLocal,
  validateBankSlipUpload,
} from "@/lib/bank-slips-storage";

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
      const check = validateBankSlipUpload(file);
      if (!check.ok) {
        return NextResponse.json({ error: check.error }, { status: 400 });
      }

      try {
        const { publicUrl } = await saveBankSlipLocal(orderNumber, file);
        patch.bankTransferProofUrl = publicUrl;
      } catch (uploadErr) {
        console.error("[bank-slip upload]", uploadErr);
        const message =
          uploadErr instanceof Error ? uploadErr.message : "Failed to save bank slip";
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }

    const [updated] = await db
      .update(orders)
      .set(patch)
      .where(eq(orders.id, order.id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }

    if (
      patch.bankTransferProofUrl &&
      order.bankTransferProofUrl &&
      order.bankTransferProofUrl !== patch.bankTransferProofUrl
    ) {
      await deleteBankSlipFile(order.bankTransferProofUrl);
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
