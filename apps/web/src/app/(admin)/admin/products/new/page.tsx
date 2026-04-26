"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ChevronLeft, Plus, X } from "lucide-react";
import Link from "next/link";

interface Category { id: string; name: string; }
interface Brand { id: string; name: string; }

export default function NewProductPage() {
  const router = useRouter();

  // Dropdown data
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [sku, setSku] = useState("");
  const [weight, setWeight] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [cost, setCost] = useState("");
  const [stock, setStock] = useState("0");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: "Display", value: "" },
    { key: "Processor", value: "" },
    { key: "RAM", value: "" },
    { key: "Storage", value: "" },
    { key: "Battery", value: "" },
    { key: "Camera", value: "" },
    { key: "OS", value: "" },
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories?all=true").then((r) => r.json()),
      fetch("/api/brands?all=true").then((r) => r.json()),
    ])
      .then(([cats, brnds]) => { setCategories(cats); setBrands(brnds); })
      .catch(() => {});
  }, []);

  function addSpec() {
    setSpecs([...specs, { key: "", value: "" }]);
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price) { setError("Name and Price are required"); return; }
    setSaving(true);
    setError(null);
    try {
      const specsObj = specs
        .filter((s) => s.key.trim())
        .reduce<Record<string, string>>((acc, s) => { acc[s.key] = s.value; return acc; }, {});

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          categoryId: categoryId || null,
          brandId: brandId || null,
          sku: sku || null,
          weight: weight || null,
          shortDescription: shortDescription || null,
          description: description || null,
          price,
          comparePrice: comparePrice || null,
          cost: cost || null,
          stock: Number(stock),
          lowStockThreshold: Number(lowStockThreshold),
          isActive,
          isFeatured,
          tags,
          specifications: Object.keys(specsObj).length ? specsObj : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }
      const created = await res.json();
      router.push(`/admin/products/${created.id}/edit?new=1`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products">
          <Button type="button" size="icon" variant="outline"><ChevronLeft className="w-4 h-4" /></Button>
        </Link>
        <h2 className="text-xl font-bold">Add New Product</h2>
      </div>

      {error && (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
          <button type="button" onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Basic Info */}
      <Card>
        <CardContent className="space-y-4">
          <h3 className="font-semibold">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1 block">Product Name *</label>
              <input
                required
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="e.g. Samsung Galaxy S25 Ultra"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select category...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Brand</label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
              >
                <option value="">Select brand...</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">SKU</label>
              <input
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="SAM-S25U-256"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Weight (grams)</label>
              <input
                type="number"
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="218"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1 block">Short Description</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                placeholder="Brief product summary for listing cards"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1 block">Full Description</label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                placeholder="Detailed product description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Stock */}
      <Card>
        <CardContent className="space-y-4">
          <h3 className="font-semibold">Pricing & Inventory</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Price (LKR) *</label>
              <input
                required
                type="number"
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="249900"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Compare Price</label>
              <input
                type="number"
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="299900"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Cost (LKR)</label>
              <input
                type="number"
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="200000"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Stock *</label>
              <input
                type="number"
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="10"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Low Stock Alert</label>
              <input
                type="number"
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="5"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Active
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} /> Featured
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Specifications */}
      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Specifications</h3>
            <Button type="button" size="sm" variant="outline" onClick={addSpec}>
              <Plus className="w-3 h-3" /> Add Row
            </Button>
          </div>
          <div className="space-y-2">
            {specs.map((spec, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="flex-1 h-9 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="Spec name"
                  value={spec.key}
                  onChange={(e) => { const u = [...specs]; u[i] = { ...u[i], key: e.target.value }; setSpecs(u); }}
                />
                <input
                  className="flex-1 h-9 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="Value"
                  value={spec.value}
                  onChange={(e) => { const u = [...specs]; u[i] = { ...u[i], value: e.target.value }; setSpecs(u); }}
                />
                <button
                  type="button"
                  onClick={() => setSpecs(specs.filter((_, j) => j !== i))}
                  className="h-9 w-9 flex items-center justify-center text-[var(--muted)] hover:text-[var(--color-error)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardContent className="space-y-3">
          <h3 className="font-semibold">Tags</h3>
          <div className="flex gap-2">
            <input
              className="flex-1 h-9 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="Add tag and press Enter..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            />
            <Button type="button" size="sm" onClick={addTag}>Add</Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--brand-50)] text-[var(--brand-700)] text-xs font-medium">
                  {tag}
                  <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Link href="/admin/products">
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Product"}</Button>
      </div>
    </form>
  );
}

