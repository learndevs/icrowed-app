import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { db, products, categories } from "@icrowed/database";
import { eq, asc, and } from "drizzle-orm";
import { Button } from "@/components/ui/Button";
import { Pencil } from "lucide-react";

function stockStatus(stock: number, threshold: number) {
  if (stock === 0) return { label: "Out of Stock", variant: "error" as const };
  if (stock <= threshold) return { label: "Low Stock", variant: "warning" as const };
  return { label: "In Stock", variant: "success" as const };
}

export default async function AdminInventoryPage() {
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      sku: products.sku,
      stock: products.stock,
      lowStockThreshold: products.lowStockThreshold,
      price: products.price,
      isActive: products.isActive,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.isActive, true))
    .orderBy(asc(products.stock));

  const inStock    = rows.filter((p) => p.stock > (p.lowStockThreshold ?? 5));
  const lowStock   = rows.filter((p) => p.stock > 0 && p.stock <= (p.lowStockThreshold ?? 5));
  const outOfStock = rows.filter((p) => p.stock === 0);

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">
        Inventory{" "}
        <span className="text-sm font-normal text-[var(--muted)]">({rows.length} active products)</span>
      </h2>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "In Stock",      value: inStock.length,    color: "text-green-600 bg-green-50" },
          { label: "Low Stock",     value: lowStock.length,   color: "text-amber-600 bg-amber-50" },
          { label: "Out of Stock",  value: outOfStock.length, color: "text-red-600 bg-red-50" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className={`text-center py-4 rounded-2xl ${s.color}`}>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-sm font-medium mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        {rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-[var(--muted)]">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--surface)]">
                <tr className="text-left text-xs text-[var(--muted)] border-b border-[var(--border)]">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Threshold</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {rows.map((p) => {
                  const { label, variant } = stockStatus(p.stock, p.lowStockThreshold ?? 5);
                  return (
                    <tr key={p.id} className={`hover:bg-[var(--surface)] ${p.stock === 0 ? "bg-red-50/40" : ""}`}>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{p.sku ?? "—"}</td>
                      <td className="px-4 py-3">
                        {p.categoryName
                          ? <Badge variant="default">{p.categoryName}</Badge>
                          : <span className="text-[var(--muted)]">—</span>}
                      </td>
                      <td className="px-4 py-3 font-bold text-base">{p.stock}</td>
                      <td className="px-4 py-3 text-[var(--muted)]">{p.lowStockThreshold ?? 5}</td>
                      <td className="px-4 py-3"><Badge variant={variant}>{label}</Badge></td>
                      <td className="px-4 py-3">{formatPrice(Number(p.price))}</td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/products/${p.id}/edit`}>
                          <Button size="sm" variant="outline">
                            <Pencil className="w-3 h-3" /> Edit
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
