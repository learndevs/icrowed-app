"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Switch } from "@/components/ui/Switch";
import {
  ChevronLeft,
  Plus,
  Star,
  Trash2,
  Upload,
  X,
  AlertCircle,
  Loader2,
  Check,
  ImagePlus,
  Cpu,
  DollarSign,
  Layers,
  Package,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Category { id: string; name: string; }
interface Brand    { id: string; name: string; }
interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

/* ─── Shared primitives (same as Add page) ─────── */

const INPUT =
  "w-full h-11 px-4 rounded-xl border border-gray-200 text-sm bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all";

const TEXTAREA =
  "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none";

const SELECT =
  "w-full h-11 px-4 rounded-xl border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all appearance-none cursor-pointer pr-9";

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-2">
      <span className="text-sm font-semibold text-gray-700">{children}</span>
      {hint && <span className="ml-1.5 text-xs text-gray-400 font-normal">{hint}</span>}
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white rounded-2xl border border-gray-100 shadow-sm p-6", className)}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-bold text-gray-900 mb-5">{children}</h2>;
}

function SectionCard({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: typeof Package;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function SpecRow({
  spec,
  onKeyChange,
  onValueChange,
  onRemove,
}: {
  spec: { key: string; value: string };
  onKeyChange: (v: string) => void;
  onValueChange: (v: string) => void;
  onRemove: () => void;
}) {
  const ROW_INPUT =
    "flex-1 h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all";
  return (
    <div className="flex gap-2 group">
      <input className={ROW_INPUT} placeholder="e.g. Display" value={spec.key} onChange={(e) => onKeyChange(e.target.value)} />
      <input className={ROW_INPUT} placeholder="e.g. 6.8″ AMOLED 120Hz" value={spec.value} onChange={(e) => onValueChange(e.target.value)} />
      <button
        type="button"
        onClick={onRemove}
        className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────── */

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [productId, setProductId] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

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

  const [images, setImages] = useState<ProductImage[]>([]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);

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
        const sortedImgs: ProductImage[] = Array.isArray(imgs)
          ? [...imgs].sort((a, b) => a.sortOrder - b.sortOrder)
          : [];
        setImages(sortedImgs);
        const primaryIdx = sortedImgs.findIndex((i) => i.isPrimary);
        setActiveImageIdx(primaryIdx >= 0 ? primaryIdx : 0);
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

  function updateSpec(i: number, field: "key" | "value", val: string) {
    setSpecs((prev) => { const next = [...prev]; next[i] = { ...next[i], [field]: val }; return next; });
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
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
      setImages((prev) => {
        const next = [...prev, img];
        setActiveImageIdx(next.length - 1);
        return next;
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
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
        if (remaining.length > 0 && !remaining.some((img) => img.isPrimary)) {
          remaining[0] = { ...remaining[0], isPrimary: true };
        }
        setActiveImageIdx(0);
        return remaining;
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function handleSetPrimary(imageId: string) {
    if (!productId) return;
    try {
      const res = await fetch(`/api/products/${productId}/images/${imageId}`, { method: "PATCH" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setImages((prev) => prev.map((img) => ({ ...img, isPrimary: img.id === imageId })));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  async function handleSubmit() {
    if (!name || !price || !productId) { setError("Product name and price are required."); return; }
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
          name, categoryId: categoryId || null, brandId: brandId || null,
          sku: sku || null, weight: weight || null,
          shortDescription: shortDescription || null, description: description || null,
          price, comparePrice: comparePrice || null, cost: cost || null,
          stock: Number(stock), lowStockThreshold: Number(lowStockThreshold),
          isActive, isFeatured, tags,
          specifications: Object.keys(specsObj).length ? specsObj : null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to save");
      router.push("/admin/products");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const discount =
    comparePrice && price && Number(comparePrice) > Number(price)
      ? Math.round((1 - Number(price) / Number(comparePrice)) * 100)
      : null;

  const sortedImages = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const activeImage = sortedImages[activeImageIdx] ?? null;

  /* ── Loading skeleton ── */
  if (loadingProduct) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 animate-pulse">
        <div className="space-y-6">
          {[280, 220, 200].map((h, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm" style={{ height: h }} />
          ))}
        </div>
        <div className="space-y-6">
          {[320, 180, 140].map((h, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm" style={{ height: h }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <button
              type="button"
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-none">Edit Product</h1>
            <p className="text-sm text-gray-400 mt-1 truncate max-w-xs">{name || "Loading…"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/products">
            <button
              type="button"
              className="h-10 px-5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="h-10 px-5 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm shadow-indigo-200"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Update Product
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError(null)} className="hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Two-column body ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

        {/* Left column */}
        <div className="space-y-6">

          {/* General Information */}
          <SectionCard icon={Layers} title="General Information">
            <div className="space-y-5">
              <div>
                <FieldLabel>Product Name <span className="text-red-400">*</span></FieldLabel>
                <input required className={INPUT} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <FieldLabel hint="(shown on listing cards)">Short Description</FieldLabel>
                <textarea rows={2} className={TEXTAREA} value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
              </div>
              <div>
                <FieldLabel>Full Description</FieldLabel>
                <textarea rows={6} className={TEXTAREA} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>
          </SectionCard>

          {/* Pricing & Stock */}
          <SectionCard icon={DollarSign} title="Pricing &amp; Stock">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              {[
                { label: "Sale Price", req: true, val: price, set: setPrice, ph: "249,900" },
                { label: "Compare Price", hint: "(strikethrough)", val: comparePrice, set: setComparePrice, ph: "299,900" },
                { label: "Cost Price", hint: "(internal)", val: cost, set: setCost, ph: "200,000" },
              ].map(({ label, req, hint, val, set, ph }) => (
                <div key={label}>
                  <FieldLabel hint={hint}>{label}{req && <span className="text-red-400 ml-0.5">*</span>}</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400 pointer-events-none">LKR</span>
                    <input
                      type="number"
                      required={req}
                      className={cn(INPUT, "pl-11")}
                      placeholder={ph}
                      value={val}
                      onChange={(e) => set(e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <div>
                <FieldLabel>Stock Qty</FieldLabel>
                <input type="number" className={INPUT} placeholder="0" value={stock} onChange={(e) => setStock(e.target.value)} />
              </div>
              <div>
                <FieldLabel hint="(alert below)">Low Stock Alert</FieldLabel>
                <input type="number" className={INPUT} placeholder="5" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} />
              </div>
              <div>
                <FieldLabel>SKU</FieldLabel>
                <input className={INPUT} placeholder="SAM-S25U-256" value={sku} onChange={(e) => setSku(e.target.value)} />
              </div>
            </div>
            {discount !== null && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-100">
                <span className="text-xs font-semibold text-green-700">{discount}% discount applied</span>
              </div>
            )}
          </SectionCard>

          {/* Specifications */}
          <SectionCard
            icon={Cpu}
            title="Specifications"
            action={
              <button
                type="button"
                onClick={() => setSpecs((prev) => [...prev, { key: "", value: "" }])}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Row
              </button>
            }
          >
            <div className="grid grid-cols-2 gap-2 mb-2 px-0.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Specification</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Value</span>
            </div>
            <div className="space-y-2">
              {specs.map((spec, i) => (
                <SpecRow
                  key={i}
                  spec={spec}
                  onKeyChange={(v) => updateSpec(i, "key", v)}
                  onValueChange={(v) => updateSpec(i, "value", v)}
                  onRemove={() => setSpecs((prev) => prev.filter((_, j) => j !== i))}
                />
              ))}
              {specs.length === 0 && (
                <p className="text-center py-6 text-sm text-gray-400">No specs yet — click &ldquo;Add Row&rdquo; above.</p>
              )}
            </div>
          </SectionCard>

          {/* Shipping */}
          <Card>
            <SectionTitle>Shipping</SectionTitle>
            <div className="max-w-xs">
              <FieldLabel>Weight (grams)</FieldLabel>
              <input type="number" className={INPUT} placeholder="218" value={weight} onChange={(e) => setWeight(e.target.value)} />
              <p className="mt-2 text-xs text-gray-400">Used to calculate shipping rates at checkout.</p>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Image manager */}
          <Card className="p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4">Product Images</h2>

            {/* Main preview */}
            <div
              className="relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50 mb-3 cursor-pointer"
              style={{ aspectRatio: "4/3" }}
              onClick={() => !activeImage && fileInputRef.current?.click()}
            >
              {activeImage ? (
                <Image
                  src={activeImage.url}
                  alt={activeImage.altText ?? "Product image"}
                  fill
                  className="object-contain p-3"
                  sizes="340px"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                    <ImagePlus className="w-6 h-6 text-indigo-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-500">No images yet</p>
                  <p className="text-xs text-gray-400">Click the + button below to upload</p>
                </div>
              )}

              {/* Primary badge on main preview */}
              {activeImage?.isPrimary && (
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <Star className="w-2.5 h-2.5 fill-white" /> Primary
                </span>
              )}

              {/* Hover actions on main preview */}
              {activeImage && !activeImage.isPrimary && (
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    title="Set as primary"
                    onClick={(e) => { e.stopPropagation(); handleSetPrimary(activeImage.id); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-500 rounded-lg text-white text-xs font-semibold transition-colors"
                  >
                    <Star className="w-3 h-3 fill-white" /> Set Primary
                  </button>
                  <button
                    type="button"
                    title="Delete"
                    onClick={(e) => { e.stopPropagation(); handleDeleteImage(activeImage.id); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 rounded-lg text-white text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-2 flex-wrap">
              {sortedImages.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImageIdx(i)}
                  className={cn(
                    "relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0",
                    activeImageIdx === i ? "border-indigo-500 shadow-sm" : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <Image src={img.url} alt={img.altText ?? ""} fill className="object-cover" sizes="64px" />
                  {img.isPrimary && (
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                      <Star className="w-2.5 h-2.5 fill-white text-white" />
                    </span>
                  )}
                </button>
              ))}

              {/* Upload tile */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-300 flex items-center justify-center text-gray-300 hover:text-indigo-400 transition-colors shrink-0 disabled:opacity-50"
              >
                {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleImageUpload}
            />

            <p className="mt-3 text-[11px] text-gray-400 leading-relaxed">
              Max 5 MB · JPEG, PNG, WebP · Hover the main image to set as primary or delete.
            </p>
          </Card>

          {/* Category & Brand */}
          <Card className="p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4">Category</h2>
            <div className="space-y-4">
              <div>
                <FieldLabel>Product Category</FieldLabel>
                <div className="relative">
                  <select className={SELECT} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                    <option value="">Select a category…</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 -rotate-90 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <FieldLabel>Brand</FieldLabel>
                <div className="relative">
                  <select className={SELECT} value={brandId} onChange={(e) => setBrandId(e.target.value)}>
                    <option value="">Select a brand…</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 -rotate-90 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </Card>

          {/* Tags */}
          <Card className="p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Tags</h2>
            </div>
            <div className="flex gap-2 mb-3">
              <input
                className={cn(INPUT, "h-10 text-sm")}
                placeholder="Add a tag…"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
              />
              <button
                type="button"
                onClick={addTag}
                className="h-10 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
              >
                Add
              </button>
            </div>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                    {tag}
                    <button type="button" onClick={() => setTags((prev) => prev.filter((t) => t !== tag))} className="hover:text-red-500 transition-colors">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No tags yet. Press Enter or click Add.</p>
            )}
          </Card>

          {/* Listing status */}
          <Card className="p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4">Listing Status</h2>
            <div className="space-y-4">
              <Switch checked={isActive} onChange={setIsActive} label="Active" description="Visible to customers on the storefront" />
              <Switch checked={isFeatured} onChange={setIsFeatured} label="Featured" description="Highlighted in featured sections" />
            </div>
          </Card>

          {/* Bottom save */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="w-full h-11 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-indigo-200"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Update Product
          </button>
        </div>
      </div>
    </div>
  );
}
