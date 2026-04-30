"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";

type InventoryRow = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  price: string;
  stock: number;
  lowStockThreshold: number | null;
  categoryName: string | null;
};

function stockStatus(stock: number, low: number) {
  if (stock === 0) return { label: "Out of Stock", variant: "error" as const };
  if (stock <= low) return { label: "Low Stock", variant: "warning" as const };
  return { label: "In Stock", variant: "success" as const };
}

export default function AdminInventoryPage() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/products?limit=500");
        if (!res.ok) throw new Error("Failed to load");
        const json = await res.json();
        const data = (json.data ?? []) as {
          id: string;
          name: string;
          slug: string;
          sku: string | null;
          price: string;
          stock: number;
          lowStockThreshold: number | null;
          categoryName: string | null;
        }[];
        if (!cancelled) setRows(data);
      } catch (e) {
        if (!cancelled) setError("Could not load inventory from the database.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const low = (r: InventoryRow) => r.lowStockThreshold ?? 5;
    return {
      inStock: rows.filter((p) => p.stock > low(p)).length,
      low: rows.filter((p) => p.stock > 0 && p.stock <= low(p)).length,
      out: rows.filter((p) => p.stock === 0).length,
    };
  }, [rows]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Inventory</h2>
        <p className="text-sm text-[var(--muted)] mt-1">
          Live stock from products. Levels update when orders are placed.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "In Stock", value: summary.inStock, color: "text-green-600 bg-green-50" },
          { label: "Low Stock", value: summary.low, color: "text-amber-600 bg-amber-50" },
          { label: "Out of Stock", value: summary.out, color: "text-red-600 bg-red-50" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className={`text-center py-4 rounded-2xl ${s.color}`}>
              <p className="text-3xl font-bold">{loading ? "—" : s.value}</p>
              <p className="text-sm font-medium mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface)]">
              <tr className="text-left text-xs text-[var(--muted)] border-b border-[var(--border)]">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--muted)]">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((p) => {
                  const low = p.lowStockThreshold ?? 5;
                  const { label, variant } = stockStatus(p.stock, low);
                  return (
                    <tr key={p.id} className="hover:bg-[var(--surface)]">
                      <td className="px-4 py-3 font-medium">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="text-[var(--color-primary)] hover:underline"
                        >
                          {p.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">
                        {p.sku ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="default">{p.categoryName ?? "—"}</Badge>
                      </td>
                      <td className="px-4 py-3 font-bold">{p.stock}</td>
                      <td className="px-4 py-3">
                        <Badge variant={variant}>{label}</Badge>
                      </td>
                      <td className="px-4 py-3">{formatPrice(p.price)}</td>
                    </tr>
                  );
                })}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--muted)]">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
