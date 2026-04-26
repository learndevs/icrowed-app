"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

interface ProductRow {
  id: string;
  name: string;
  sku: string | null;
  price: string;
  stock: number;
  isActive: boolean;
  categoryName: string | null;
  brandName: string | null;
}

interface Category { id: string; name: string; }

const PAGE_SIZE = 20;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = useCallback(async (s: string, cid: string, p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE) });
      if (s) params.set("search", s);
      if (cid) params.set("categoryId", cid);
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.data ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/categories?all=true")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => { fetchProducts(search, categoryId, page); }, [fetchProducts, search, categoryId, page]);

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1);
  }

  function handleCategory(e: React.ChangeEvent<HTMLSelectElement>) {
    setCategoryId(e.target.value);
    setPage(1);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setConfirmDeleteId(null);
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      await fetchProducts(search, categoryId, page);
    } finally {
      setDeletingId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Products {!loading && <span className="text-sm font-normal text-[var(--muted)]">({total})</span>}</h2>
        <Link href="/admin/products/new">
          <Button><Plus className="w-4 h-4" /> Add Product</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={handleSearch}
          className="h-9 px-3 rounded-lg border border-[var(--border)] bg-white text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
        <select
          value={categoryId}
          onChange={handleCategory}
          className="h-9 px-3 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <Card>
        {loading ? (
          <div className="p-8 text-center text-[var(--muted)] text-sm">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-[var(--muted)] text-sm">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--surface)]">
                <tr className="text-left text-xs text-[var(--muted)] border-b border-[var(--border)]">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[var(--surface)]">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{p.sku ?? "—"}</td>
                    <td className="px-4 py-3">
                      {p.categoryName ? <Badge variant="default">{p.categoryName}</Badge> : <span className="text-[var(--muted)]">—</span>}
                    </td>
                    <td className="px-4 py-3 font-medium">{formatPrice(Number(p.price))}</td>
                    <td className="px-4 py-3">
                      <span className={p.stock === 0 ? "text-red-600 font-semibold" : p.stock <= 5 ? "text-amber-600 font-semibold" : ""}>
                        {p.stock === 0 ? "Out of stock" : p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={p.isActive ? "success" : "error"}>
                        {p.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/products/${p.id}/edit`}>
                          <Button size="sm" variant="outline">
                            <Pencil className="w-3 h-3" /> Edit
                          </Button>
                        </Link>
                        {confirmDeleteId === p.id ? (
                          <div className="flex items-center gap-1.5 text-sm">
                            <span className="text-red-600 font-medium">Delete?</span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                              disabled={deletingId === p.id}
                              onClick={() => handleDelete(p.id)}
                            >
                              {deletingId === p.id ? "..." : "Yes"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setConfirmDeleteId(null)}>No</Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => setConfirmDeleteId(p.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)] text-sm">
            <span className="text-[var(--muted)]">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
