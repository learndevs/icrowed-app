import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getBlogPostById, updateBlogPost } from "@icrowd/database/queries";
import { requireAdmin } from "@/lib/admin";
import {
  deleteBlogImageFile,
  saveBlogImageLocal,
} from "@/lib/blog-images-storage";
import type { BlogGalleryImage } from "@/lib/blog-types";

function revalidateBlogPages(slug?: string) {
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const existing = await getBlogPostById(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const kind = (formData.get("kind") as string | null) ?? "gallery";
    const alt = (formData.get("alt") as string | null)?.trim() || undefined;
    const caption = (formData.get("caption") as string | null)?.trim() || undefined;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const { publicUrl } = await saveBlogImageLocal(id, file);

    if (kind === "cover") {
      if (existing.coverImageUrl && existing.coverImageUrl !== publicUrl) {
        await deleteBlogImageFile(existing.coverImageUrl);
      }
      const post = await updateBlogPost(id, { coverImageUrl: publicUrl });
      revalidateBlogPages(post?.slug);
      return NextResponse.json({ imageUrl: publicUrl, coverImageUrl: publicUrl });
    }

    const galleryItem: BlogGalleryImage = { url: publicUrl, alt, caption };
    const galleryImages = [...(existing.galleryImages ?? []), galleryItem];
    const post = await updateBlogPost(id, { galleryImages });
    revalidateBlogPages(post?.slug);
    return NextResponse.json({ imageUrl: publicUrl, galleryImages });
  } catch (err) {
    console.error("[POST /api/blog-posts/[id]/images]", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const existing = await getBlogPostById(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const url = req.nextUrl.searchParams.get("url");
    if (!url) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    let coverImageUrl = existing.coverImageUrl;
    let galleryImages = existing.galleryImages ?? [];

    if (coverImageUrl === url) {
      coverImageUrl = null;
      await deleteBlogImageFile(url);
    } else {
      galleryImages = galleryImages.filter((img) => img.url !== url);
      await deleteBlogImageFile(url);
    }

    const post = await updateBlogPost(id, { coverImageUrl, galleryImages });
    revalidateBlogPages(post?.slug);
    return NextResponse.json({ coverImageUrl, galleryImages });
  } catch (err) {
    console.error("[DELETE /api/blog-posts/[id]/images]", err);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
