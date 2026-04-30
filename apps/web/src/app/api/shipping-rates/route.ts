import { NextRequest, NextResponse } from "next/server";
import { getOrCreateShippingRates, upsertShippingRates } from "@icrowed/database";

export async function GET() {
  try {
    const rates = await getOrCreateShippingRates();
    return NextResponse.json({
      standardLkr: Number(rates.standardLkr),
      expressLkr: Number(rates.expressLkr),
      freeShippingMinSubtotal: Number(rates.freeShippingMinSubtotal),
      updatedAt: rates.updatedAt,
    });
  } catch (err) {
    console.error("shipping-rates GET:", err);
    return NextResponse.json({ error: "Failed to load shipping rates" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { standardLkr, expressLkr, freeShippingMinSubtotal } = body as {
      standardLkr?: number;
      expressLkr?: number;
      freeShippingMinSubtotal?: number;
    };

    if (
      standardLkr === undefined ||
      expressLkr === undefined ||
      freeShippingMinSubtotal === undefined
    ) {
      return NextResponse.json(
        { error: "standardLkr, expressLkr, and freeShippingMinSubtotal are required" },
        { status: 400 }
      );
    }

    if (standardLkr < 0 || expressLkr < 0 || freeShippingMinSubtotal < 0) {
      return NextResponse.json({ error: "Values must be non-negative" }, { status: 400 });
    }

    const row = await upsertShippingRates({
      standardLkr: String(standardLkr),
      expressLkr: String(expressLkr),
      freeShippingMinSubtotal: String(freeShippingMinSubtotal),
    });

    return NextResponse.json({
      standardLkr: Number(row.standardLkr),
      expressLkr: Number(row.expressLkr),
      freeShippingMinSubtotal: Number(row.freeShippingMinSubtotal),
      updatedAt: row.updatedAt,
    });
  } catch (err) {
    console.error("shipping-rates PUT:", err);
    return NextResponse.json({ error: "Failed to save shipping rates" }, { status: 500 });
  }
}
