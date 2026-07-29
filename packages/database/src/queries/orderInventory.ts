import { and, eq, sql } from "drizzle-orm";
import { db } from "../db";
import { products, productVariants } from "../schema";
import { formatVariantChoiceLabel } from "../variant-options";

type DbExecutor = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type IncomingOrderItem = {
  productId?: string;
  variantId?: string;
  productName?: string;
  variantName?: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
};

export type PreparedOrderItem = {
  productId: string | null;
  variantId: string | null;
  productName: string;
  variantName: string | null;
  sku: string | null;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  imageUrl: string | null;
};

export class OrderItemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderItemError";
  }
}

const PRICE_TOLERANCE = 0.01;

function pricesMatch(client: number, server: number): boolean {
  return Math.abs(client - server) <= PRICE_TOLERANCE;
}

async function reserveVariantStock(
  tx: DbExecutor | typeof db,
  variantId: string,
  productId: string | undefined,
  quantity: number,
  clientUnitPrice: number,
  imageUrl: string | null | undefined,
): Promise<PreparedOrderItem> {
  const variant = await tx.query.productVariants.findFirst({
    where: eq(productVariants.id, variantId),
    with: { product: true },
  });

  if (!variant || !variant.isActive || !variant.product?.isActive) {
    throw new OrderItemError("Selected configuration is no longer available");
  }
  if (productId && productId !== variant.productId) {
    throw new OrderItemError("Product configuration mismatch");
  }

  const unitPrice = Number(variant.price ?? variant.product.price);
  if (!pricesMatch(clientUnitPrice, unitPrice)) {
    throw new OrderItemError("Price has changed — please refresh your cart and try again");
  }

  const [decremented] = await tx
    .update(productVariants)
    .set({ stock: sql`${productVariants.stock} - ${quantity}` })
    .where(and(eq(productVariants.id, variant.id), sql`${productVariants.stock} >= ${quantity}`))
    .returning({ id: productVariants.id });

  if (!decremented) {
    throw new OrderItemError(`Insufficient stock for ${variant.name}`);
  }

  return {
    productId: variant.productId,
    variantId: variant.id,
    productName: variant.product.name,
    variantName: formatVariantChoiceLabel(variant.options, variant.name),
    sku: variant.sku ?? variant.product.sku ?? null,
    quantity,
    unitPrice: String(unitPrice),
    subtotal: String(unitPrice * quantity),
    imageUrl: imageUrl ?? null,
  };
}

async function reserveProductStock(
  tx: DbExecutor | typeof db,
  productId: string,
  quantity: number,
  clientUnitPrice: number,
  imageUrl: string | null | undefined,
): Promise<PreparedOrderItem> {
  const activeVariants = await tx.query.productVariants.findMany({
    where: and(eq(productVariants.productId, productId), eq(productVariants.isActive, true)),
    columns: { id: true },
    limit: 1,
  });
  if (activeVariants.length > 0) {
    throw new OrderItemError("Please select a color, storage, or other option before checkout");
  }

  const product = await tx.query.products.findFirst({
    where: eq(products.id, productId),
  });
  if (!product || !product.isActive) {
    throw new OrderItemError("Product is no longer available");
  }

  const unitPrice = Number(product.price);
  if (!pricesMatch(clientUnitPrice, unitPrice)) {
    throw new OrderItemError("Price has changed — please refresh your cart and try again");
  }

  const [decremented] = await tx
    .update(products)
    .set({ stock: sql`${products.stock} - ${quantity}` })
    .where(and(eq(products.id, product.id), sql`${products.stock} >= ${quantity}`))
    .returning({ id: products.id });

  if (!decremented) {
    throw new OrderItemError(`Insufficient stock for ${product.name}`);
  }

  return {
    productId: product.id,
    variantId: null,
    productName: product.name,
    variantName: null,
    sku: product.sku ?? null,
    quantity,
    unitPrice: String(unitPrice),
    subtotal: String(unitPrice * quantity),
    imageUrl: imageUrl ?? null,
  };
}

/**
 * Validates line items against live product/variant rows, snapshots correct
 * color/storage labels from the DB, and decrements the matching stock.
 */
export async function prepareAndReserveOrderItems(
  items: IncomingOrderItem[],
  tx?: DbExecutor,
): Promise<PreparedOrderItem[]> {
  if (items.length === 0) return [];

  const executor = tx ?? db;
  const prepared: PreparedOrderItem[] = [];

  for (const item of items) {
    const quantity = Math.floor(Number(item.quantity));
    if (!Number.isFinite(quantity) || quantity < 1) {
      throw new OrderItemError("Invalid quantity");
    }

    if (item.variantId) {
      prepared.push(
        await reserveVariantStock(
          executor,
          item.variantId,
          item.productId,
          quantity,
          Number(item.unitPrice),
          item.imageUrl,
        ),
      );
      continue;
    }

    if (item.productId) {
      prepared.push(
        await reserveProductStock(
          executor,
          item.productId,
          quantity,
          Number(item.unitPrice),
          item.imageUrl,
        ),
      );
      continue;
    }

    throw new OrderItemError("Invalid order item");
  }

  return prepared;
}
