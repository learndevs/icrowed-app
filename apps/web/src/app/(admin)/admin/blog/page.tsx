"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  ImagePlus,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  ExternalLink,
} from "lucide-react";
import { normalizeProductImageUrl } from "@/lib/product-image-url";
import {
  type BlogGalleryImage,
  type BlogPostRecord,
  linesToList,
  listToLines,
  parseRelatedLinks,
  parseVideoLines,
  relatedLinksToLines,
  slugifyBlogTitle,
  videosToLines,
} from "@/lib/blog-types";

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  postType: "review" | "article";
  brandName: string;
  productName: string;
  rating: string;
  prosText: string;
  consText: string;
  videosText: string;
  relatedLinksText: string;
  isPublished: boolean;
  sortOrder: string;
  coverImageUrl: string;
  galleryImages: BlogGalleryImage[];
}

const EMPTY_FORM: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  postType: "review",
  brandName: "",
  productName: "",
  rating: "",
  prosText: "",
  consText: "",
  videosText: "",
  relatedLinksText: "",
  isPublished: false,
  sortOrder: "0",
  coverImageUrl: "",
  galleryImages: [],
};

function postToForm(post: BlogPostRecord): FormState {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    body: post.body ?? "",
    postType: post.postType === "article" ? "article" : "review",
    brandName: post.brandName ?? "",
    productName: post.productName ?? "",
    rating: post.rating ? String(post.rating) : "",
    prosText: listToLines(post.pros),
    consText: listToLines(post.cons),
    videosText: videosToLines(post.videoUrls),
    relatedLinksText: relatedLinksToLines(post.relatedLinks),
    isPublished: post.isPublished,
    sortOrder: String(post.sortOrder),
    coverImageUrl: post.coverImageUrl ?? "",
    galleryImages: post.galleryImages ?? [],
  };
}

function formToBody(f: FormState) {
  return {
    title: f.title,
    slug: f.slug || slugifyBlogTitle(f.title),
    excerpt: f.excerpt || null,
    body: f.body || null,
    postType: f.postType,
    brandName: f.brandName || null,
    productName: f.productName || null,
    rating: f.rating ? Number(f.rating) : null,
    pros: linesToList(f.prosText),
    cons: linesToList(f.consText),
    videoUrls: parseVideoLines(f.videosText),
    relatedLinks: parseRelatedLinks(f.relatedLinksText),
    isPublished: f.isPublished,
    sortOrder: Number(f.sortOrder),
    coverImageUrl: f.coverImageUrl || null,
    galleryImages: f.galleryImages,
  };
}

const inputClass =
  "w-full h-10 px-3 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";
const textareaClass =
  "w-full px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-y";

function BlogPostForm({
  form,
  setForm,
  onSubmit,
  saving,
  onCancel,
  submitLabel,
  postId,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  onCancel: () => void;
  submitLabel: string;
  postId?: string | null;
}) {
  const f = form;
  const s = setForm;
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function uploadImage(file: File, kind: "cover" | "gallery") {
    if (!postId) return;
    const setLoading = kind === "cover" ? setUploadingCover : setUploadingGallery;
    setLoading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", kind);
      const res = await fetch(`/api/blog-posts/${postId}/images`, { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json()).error ?? "Upload failed");
      const data = await res.json();
      if (kind === "cover") {
        s({ ...f, coverImageUrl: data.coverImageUrl ?? data.imageUrl });
      } else {
        s({ ...f, galleryImages: data.galleryImages ?? f.galleryImages });
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
      if (kind === "cover" && coverInputRef.current) coverInputRef.current.value = "";
      if (kind === "gallery" && galleryInputRef.current) galleryInputRef.current.value = "";
    }
  }

  async function removeGalleryImage(url: string) {
    if (!postId) return;
    setUploadError(null);
    try {
      const res = await fetch(
        `/api/blog-posts/${postId}/images?url=${encodeURIComponent(url)}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error((await res.json()).error ?? "Delete failed");
      const data = await res.json();
      s({
        ...f,
        coverImageUrl: data.coverImageUrl ?? f.coverImageUrl,
        galleryImages: data.galleryImages ?? [],
      });
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  const coverPreview = f.coverImageUrl ? normalizeProductImageUrl(f.coverImageUrl) : "";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium mb-1 block">Title *</label>
          <input
            required
            className={inputClass}
            placeholder="Anker Soundcore Liberty 4 — Full Review"
            value={f.title}
            onChange={(e) => s({ ...f, title: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Slug</label>
          <input
            className={inputClass}
            placeholder="anker-liberty-4-review"
            value={f.slug}
            onChange={(e) => s({ ...f, slug: e.target.value })}
          />
          <p className="mt-1 text-xs text-[var(--muted)]">Auto-generated from title if empty.</p>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Type</label>
          <select
            className={inputClass}
            value={f.postType}
            onChange={(e) =>
              s({ ...f, postType: e.target.value as "review" | "article" })
            }
          >
            <option value="review">Product review</option>
            <option value="article">Blog article</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium mb-1 block">Excerpt</label>
          <textarea
            rows={2}
            className={textareaClass}
            placeholder="Short summary shown on the blog index and in search results."
            value={f.excerpt}
            onChange={(e) => s({ ...f, excerpt: e.target.value })}
          />
        </div>

        {f.postType === "review" && (
          <>
            <div>
              <label className="text-sm font-medium mb-1 block">Brand</label>
              <input
                className={inputClass}
                placeholder="Anker"
                value={f.brandName}
                onChange={(e) => s({ ...f, brandName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Product name</label>
              <input
                className={inputClass}
                placeholder="Soundcore Liberty 4"
                value={f.productName}
                onChange={(e) => s({ ...f, productName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Rating (1–5)</label>
              <input
                type="number"
                min={1}
                max={5}
                className={inputClass}
                placeholder="4"
                value={f.rating}
                onChange={(e) => s({ ...f, rating: e.target.value })}
              />
            </div>
          </>
        )}

        <div className="sm:col-span-2">
          <label className="text-sm font-medium mb-1 block">Body (Markdown)</label>
          <textarea
            rows={10}
            className={textareaClass}
            placeholder="Write your review letter here. Use **bold**, lists, and headings."
            value={f.body}
            onChange={(e) => s({ ...f, body: e.target.value })}
          />
        </div>

        {f.postType === "review" && (
          <>
            <div>
              <label className="text-sm font-medium mb-1 block">Pros (one per line)</label>
              <textarea
                rows={4}
                className={textareaClass}
                placeholder="Great battery life&#10;Comfortable fit"
                value={f.prosText}
                onChange={(e) => s({ ...f, prosText: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Cons (one per line)</label>
              <textarea
                rows={4}
                className={textareaClass}
                placeholder="Case is bulky&#10;No wireless charging"
                value={f.consText}
                onChange={(e) => s({ ...f, consText: e.target.value })}
              />
            </div>
          </>
        )}

        <div className="sm:col-span-2">
          <label className="text-sm font-medium mb-1 block">Video URLs (one per line)</label>
          <textarea
            rows={2}
            className={textareaClass}
            placeholder="https://www.youtube.com/watch?v=..."
            value={f.videosText}
            onChange={(e) => s({ ...f, videosText: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium mb-1 block">
            Related links (label|url per line)
          </label>
          <textarea
            rows={2}
            className={textareaClass}
            placeholder="Buy Anker Liberty 4|/products/anker-liberty-4&#10;All earbuds|/categories/earbuds"
            value={f.relatedLinksText}
            onChange={(e) => s({ ...f, relatedLinksText: e.target.value })}
          />
        </div>

        {/* Cover image */}
        <div className="sm:col-span-2">
          <label className="text-sm font-medium mb-1 block">Cover image</label>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 space-y-3">
            {coverPreview ? (
              <div className="relative aspect-[16/9] max-w-md overflow-hidden rounded-lg border border-[var(--border)] bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverPreview} alt="Cover" className="h-full w-full object-cover" />
              </div>
            ) : (
              <p className="text-xs text-[var(--muted)]">No cover image yet.</p>
            )}
            {postId ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingCover}
                  onClick={() => coverInputRef.current?.click()}
                >
                  {uploadingCover ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ImagePlus className="w-3.5 h-3.5" />
                  )}
                  Upload cover
                </Button>
                {f.coverImageUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeGalleryImage(f.coverImageUrl)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-xs text-[var(--muted)]">
                Save the post first, then upload images (compressed to WebP automatically).
              </p>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file, "cover");
              }}
            />
          </div>
        </div>

        {/* Gallery */}
        <div className="sm:col-span-2">
          <label className="text-sm font-medium mb-1 block">Gallery images</label>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 space-y-3">
            {f.galleryImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {f.galleryImages.map((img) => (
                  <div key={img.url} className="relative aspect-square overflow-hidden rounded-lg border border-[var(--border)] bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={normalizeProductImageUrl(img.url)}
                      alt={img.alt ?? ""}
                      className="h-full w-full object-cover"
                    />
                    {postId && (
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(img.url)}
                        className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                        aria-label="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--muted)]">No gallery images yet.</p>
            )}
            {postId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingGallery}
                onClick={() => galleryInputRef.current?.click()}
              >
                {uploadingGallery ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ImagePlus className="w-3.5 h-3.5" />
                )}
                Add gallery image
              </Button>
            )}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file, "gallery");
              }}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Sort order</label>
          <input
            type="number"
            className={inputClass}
            value={f.sortOrder}
            onChange={(e) => s({ ...f, sortOrder: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input
            id={`published-${postId ?? "new"}`}
            type="checkbox"
            checked={f.isPublished}
            onChange={(e) => s({ ...f, isPublished: e.target.checked })}
          />
          <label htmlFor={`published-${postId ?? "new"}`} className="text-sm cursor-pointer">
            Published on website
          </label>
        </div>
      </div>

      {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPostRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<FormState>(EMPTY_FORM);
  const [addSaving, setAddSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [editSaving, setEditSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function loadPosts() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/blog-posts?all=true");
      if (!res.ok) throw new Error("Failed to load");
      setPosts(await res.json());
    } catch {
      setError("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/blog-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToBody(addForm)),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create");
      }
      const created = await res.json();
      setShowAdd(false);
      setAddForm(EMPTY_FORM);
      setEditingId(created.id);
      setEditForm(postToForm(created));
      await loadPosts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setAddSaving(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setEditSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/blog-posts/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToBody(editForm)),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update");
      }
      setEditingId(null);
      await loadPosts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/blog-posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setConfirmDeleteId(null);
      if (editingId === id) setEditingId(null);
      await loadPosts();
    } catch {
      setError("Failed to delete post");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Blog &amp; Reviews</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Publish product review letters and blog articles to the website.
          </p>
        </div>
        {!showAdd && !editingId && (
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4" />
            New post
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showAdd && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">New blog post</h2>
            <button type="button" onClick={() => setShowAdd(false)} aria-label="Close">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <BlogPostForm
            form={addForm}
            setForm={setAddForm}
            onSubmit={handleAdd}
            saving={addSaving}
            onCancel={() => setShowAdd(false)}
            submitLabel="Create post"
          />
        </Card>
      )}

      {editingId && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Edit post</h2>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <BlogPostForm
            form={editForm}
            setForm={setEditForm}
            onSubmit={handleEdit}
            saving={editSaving}
            onCancel={() => setEditingId(null)}
            submitLabel="Save changes"
            postId={editingId}
          />
        </Card>
      )}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-500">No posts yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 line-clamp-1">{post.title}</p>
                      <p className="text-xs text-gray-400">/blog/{post.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={post.postType === "review" ? "primary" : "default"}>
                        {post.postType === "review" ? "Review" : "Article"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={post.isPublished ? "success" : "default"}>
                        {post.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(post.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {post.isPublished && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                            aria-label="View on site"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(post.id);
                            setEditForm(postToForm(post));
                            setShowAdd(false);
                          }}
                          className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                          aria-label="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {confirmDeleteId === post.id ? (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(post.id)}
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(post.id)}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
