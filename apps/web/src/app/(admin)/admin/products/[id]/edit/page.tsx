"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ChevronLeft, Plus, Star, Trash2, Upload, X } from "lucide-react";
import Link from "next/link";

interface Category { id: string; name: string; }
interface Brand    { id: string; name: string; }
interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [productId, setProductId] = useState<string | null>(null);

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
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);

  // Images
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loadingProduct, setLoadingProduct] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id }) => setProductId(id));
  }, [params]);

  useEffect(() => {
    if (!productId) return;
    Promise.all([
      fetch(`/api/products/${productId}`).then((r) => r.json()),
      fetch("/api/categories?all=true").then((r) => r.json()),
      fetch("/api/brands?all=true").then((r) => r.json()),
      fetch(`/api/products/${productId}/images`).then((r) => r.json()),
    ])
      .then(([product, cats, brnds, imgs]) => {
        setCategories(cats);
        setBrands(brnds);
        setImages(Array.isArray(imgs) ? imgs : []);
        setName(product.name ?? "");
        setCategoryId(product.categoryId ?? "");
        setBrandId(product.brandId ?? "");
        setSku(product.sku ?? "");
        setWeight(product.weight ?? "");
        setShortDescription(product.shortDescription ?? "");
        setDescription(product.description ?? "");
        setPrice(product.price ?? "");
        setComparePrice(product.comparePrice ?? "");
        setCost(product.cost ?? "");
        setStock(String(product.stock ?? 0));
        setLowStockThreshold(String(product.lowStockThreshold ?? 5));
        setIsActive(product.isActive ?? true);
        setIsFeatured(product.isFeatured ?? false);
        setTags(product.tags ?? []);
        const rawSpecs = product.specifications;
        if (rawSpecs && typeof rawSpecs === "object") {
          setSpecs(Object.entries(rawSpecs as Record<string, string>).map(([key, value]) => ({ key, value })));
        }
      })
      .catch(() => setError("Failed to load product"))
      .finally(() => setLoadingProduct(false));
  }, [productId]);

  function addSpec() {
    setSpecs([...specs, { key: "", value: "" }]);
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !productId) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/products/${productId}/images`, { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json()).error ?? "Upload failed");
      const img: ProductImage = await res.json();
      setImages((prev) => [...prev, img]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDeleteImage(imageId: string) {
    if (!productId) return;
    try {
      const res = await fetch(`/api/products/${productId}/images/${imageId}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Delete failed");
      setImages((prev) => {
        const remaining = prev.filter((img) => img.id !== imageId);
        // Promote next to primary if we deleted the primary
        if (remaining.length > 0 && !remaining.some((img) => img.isPrimary)) {
          remaining[0] = { ...remaining[0], isPrimary: true };
        }
        return remaining;
      });
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleSetPrimary(imageId: string) {
    if (!productId) return;
    try {
      const res = await fetch(`/api/products/${productId}/images/${imageId}`, { method: "PATCH" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setImages((prev) => prev.map((img) => ({ ...img, isPrimary: img.id === imageId })));
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price || !productId) return;
    setSaving(true);
    setError(null);
    try {
      const specsObj = specs
        .filter((s) => s.key.trim())
        .reduce<Record<string, string>>((acc, s) => { acc[s.key] = s.value; return acc; }, {});

      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
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
      router.push("/admin/products");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-[var(--muted)] text-sm">
        Loading product...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products">
          <Button type="button" size="icon" variant="outline"><ChevronLeft className="w-4 h-4" /></Button>
        </Link>
        <h2 className="text-xl font-bold">Edit Product</h2>
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
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Weight (grams)</label>
              <input
                type="number"
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1 block">Short Description</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1 block">Full Description</label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
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
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Compare Price</label>
              <input
                type="number"
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Cost (LKR)</label>
              <input
                type="number"
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Stock</label>
              <input
                type="number"
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Low Stock Alert</label>
              <input
                type="number"
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
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
            {specs.length === 0 && (
              <p className="text-sm text-[var(--muted)]">No specifications. Click "Add Row" to add one.</p>
            )}
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

      {/* Images */}
      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Product Images</h3>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={uploadingImage}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-3 h-3" />
              {uploadingImage ? "Uploading..." : "Upload Image"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {images.length === 0 ? (
            <p className="text-sm text-[var(--muted)] py-2">No images yet. Upload one above.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[...images].sort((a, b) => a.sortOrder - b.sortOrder).map((img) => (
                <div key={img.id} className="relative group rounded-xl overflow-hidden border border-[var(--border)] bg-gray-50 aspect-square">
                  <Image
                    src={img.url}
                    alt={img.altText ?? "Product image"}
                    fill
                    className="object-contain p-1"
                    sizes="150px"
                  />
                  {img.isPrimary && (
                    <span className="absolute top-1 left-1 bg-amber-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-white" /> Primary
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    {!img.isPrimary && (
                      <button
                        type="button"
                        title="Set as primary"
                        onClick={() => handleSetPrimary(img.id)}
                        className="p-1.5 bg-amber-400 rounded-lg hover:bg-amber-500 transition-colors"
                      >
                        <Star className="w-3.5 h-3.5 text-white" />
                      </button>
                    )}
                    <button
                      type="button"
                      title="Delete image"
                      onClick={() => handleDeleteImage(img.id)}
                      className="p-1.5 bg-rose-500 rounded-lg hover:bg-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-[var(--muted)]">Max 5 MB · JPEG, PNG, WebP, GIF · Hover an image to set as primary or delete.</p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Link href="/admin/products">
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Update Product"}</Button>
      </div>
    </form>
  );
}
