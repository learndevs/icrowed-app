"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/Switch";
import {
  ChevronLeft,
  Plus,
  X,
  ImagePlus,
  AlertCircle,
  Loader2,
  Upload,
  Check,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Category { id: string; name: string; }
interface Brand { id: string; name: string; }

/* ─── Reusable primitives ─────────────────────────── */

const INPUT =
  "w-full h-11 px-4 rounded-xl border border-gray-200 text-sm bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all";

const TEXTAREA =
  "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none";

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

/* ─── Spec row ────────────────────────────────────── */

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
  return (
    <div className="flex gap-2 group">
      <input
        className="flex-1 h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
        placeholder="e.g. Display"
        value={spec.key}
        onChange={(e) => onKeyChange(e.target.value)}
      />
      <input
        className="flex-1 h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
        placeholder="e.g. 6.8″ AMOLED 120Hz"
        value={spec.value}
        onChange={(e) => onValueChange(e.target.value)}
      />
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

/* ─── Page ────────────────────────────────────────── */

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Image preview (purely visual — actual upload happens post-save)
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories?all=true").then((r) => r.json()),
      fetch("/api/brands?all=true").then((r) => r.json()),
    ])
      .then(([cats, brnds]) => { setCategories(cats); setBrands(brnds); })
      .catch(() => {});
  }, []);

  function handleImageFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      setPreviewImages((prev) => [...prev, url]);
    });
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  }

  function updateSpec(i: number, field: "key" | "value", val: string) {
    setSpecs((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: val };
      return next;
    });
  }

  async function submit(draft: boolean) {
    if (!name || !price) { setError("Product name and price are required."); return; }
    if (draft) { setSavingDraft(true); } else { setSaving(true); }
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
          isActive: draft ? false : isActive,
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
      setSavingDraft(false);
    }
  }

  const discount =
    comparePrice && price && Number(comparePrice) > Number(price)
      ? Math.round((1 - Number(price) / Number(comparePrice)) * 100)
      : null;

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
            <h1 className="text-xl font-bold text-gray-900 leading-none">Add New Product</h1>
            <p className="text-sm text-gray-400 mt-1">Fill in the details to create a new listing</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => submit(true)}
            disabled={savingDraft || saving}
            className="h-10 px-5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {savingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => submit(false)}
            disabled={saving || savingDraft}
            className="h-10 px-5 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm shadow-indigo-200"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            Add Product
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
          <Card>
            <SectionTitle>General Information</SectionTitle>
            <div className="space-y-5">
              <div>
                <FieldLabel>Product Name <span className="text-red-400">*</span></FieldLabel>
                <input
                  required
                  className={INPUT}
                  placeholder="e.g. Samsung Galaxy S25 Ultra 256GB"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <FieldLabel hint="(shown on listing cards)">Short Description</FieldLabel>
                <textarea
                  rows={2}
                  className={TEXTAREA}
                  placeholder="Brief product summary…"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                />
              </div>

              <div>
                <FieldLabel>Full Description</FieldLabel>
                <textarea
                  rows={6}
                  className={TEXTAREA}
                  placeholder="Detailed product description, features, and benefits…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Pricing & Stock */}
          <Card>
            <SectionTitle>Pricing &amp; Stock</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              {/* Sale price */}
              <div>
                <FieldLabel>Sale Price <span className="text-red-400">*</span></FieldLabel>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400 pointer-events-none">LKR</span>
                  <input
                    type="number"
                    required
                    className={cn(INPUT, "pl-11")}
                    placeholder="249,900"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>
              {/* Compare price */}
              <div>
                <FieldLabel hint="(strikethrough)">Compare Price</FieldLabel>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400 pointer-events-none">LKR</span>
                  <input
                    type="number"
                    className={cn(INPUT, "pl-11")}
                    placeholder="299,900"
                    value={comparePrice}
                    onChange={(e) => setComparePrice(e.target.value)}
                  />
                </div>
              </div>
              {/* Cost */}
              <div>
                <FieldLabel hint="(internal)">Cost Price</FieldLabel>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400 pointer-events-none">LKR</span>
                  <input
                    type="number"
                    className={cn(INPUT, "pl-11")}
                    placeholder="200,000"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                  />
                </div>
              </div>
              {/* Stock */}
              <div>
                <FieldLabel>Stock Qty</FieldLabel>
                <input
                  type="number"
                  className={INPUT}
                  placeholder="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>
              {/* Low stock */}
              <div>
                <FieldLabel hint="(alert below)">Low Stock Alert</FieldLabel>
                <input
                  type="number"
                  className={INPUT}
                  placeholder="5"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                />
              </div>
              {/* SKU */}
              <div>
                <FieldLabel>SKU</FieldLabel>
                <input
                  className={INPUT}
                  placeholder="SAM-S25U-256"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>
            </div>

            {/* Discount badge */}
            {discount !== null && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-100">
                <span className="text-xs font-semibold text-green-700">{discount}% discount applied</span>
              </div>
            )}
          </Card>

          {/* Specifications */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">Specifications</h2>
              <button
                type="button"
                onClick={() => setSpecs((prev) => [...prev, { key: "", value: "" }])}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Row
              </button>
            </div>
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
          </Card>

          {/* Weight */}
          <Card>
            <SectionTitle>Shipping</SectionTitle>
            <div className="max-w-xs">
              <FieldLabel>Weight (grams)</FieldLabel>
              <input
                type="number"
                className={INPUT}
                placeholder="218"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <p className="mt-2 text-xs text-gray-400">Used to calculate shipping rates at checkout.</p>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Image upload */}
          <Card className="p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4">Product Images</h2>

            {/* Main preview */}
            <div
              className={cn(
                "relative rounded-xl overflow-hidden border-2 border-dashed transition-colors cursor-pointer mb-3",
                previewImages.length > 0 ? "border-transparent" : "border-gray-200 hover:border-indigo-300 bg-gray-50"
              )}
              style={{ aspectRatio: "4/3" }}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewImages.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewImages[activeImage]}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                    <ImagePlus className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-600">Click to upload</p>
                    <p className="text-xs text-gray-400 mt-0.5">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-2">
              {previewImages.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors shrink-0",
                    activeImage === i ? "border-indigo-500" : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-300 flex items-center justify-center text-gray-300 hover:text-indigo-400 transition-colors shrink-0"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleImageFiles(e.target.files)}
            />

            <p className="mt-3 text-[11px] text-gray-400 leading-relaxed">
              Images are previewed here. They will be saved when you publish the product.
            </p>
          </Card>

          {/* Category & Brand */}
          <Card className="p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4">Category</h2>
            <div className="space-y-4">
              <div>
                <FieldLabel>Product Category</FieldLabel>
                <div className="relative">
                  <select
                    className={cn(INPUT, "appearance-none cursor-pointer pr-9")}
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">Select a category…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 -rotate-90 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <FieldLabel>Brand</FieldLabel>
                <div className="relative">
                  <select
                    className={cn(INPUT, "appearance-none cursor-pointer pr-9")}
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                  >
                    <option value="">Select a brand…</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 -rotate-90 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </Card>

          {/* Tags */}
          <Card className="p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4">Tags</h2>
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
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                      className="hover:text-red-500 transition-colors"
                    >
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
              <Switch
                checked={isActive}
                onChange={setIsActive}
                label="Active"
                description="Visible to customers on the storefront"
              />
              <Switch
                checked={isFeatured}
                onChange={setIsFeatured}
                label="Featured"
                description="Highlighted in featured sections"
              />
            </div>
          </Card>

          {/* Bottom publish */}
          <button
            type="button"
            onClick={() => submit(false)}
            disabled={saving || savingDraft}
            className="w-full h-11 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-indigo-200"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Publish Product
          </button>
        </div>
      </div>
    </div>
  );
}
