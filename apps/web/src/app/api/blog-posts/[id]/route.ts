import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  deleteBlogPost,
  getBlogPostById,
  updateBlogPost,
} from "@icrowd/database/queries";
import { requireAdmin } from "@/lib/admin";
import {
  deleteAllBlogImagesForPost,
  deleteBlogImageFile,
} from "@/lib/blog-images-storage";
import { slugifyBlogTitle } from "@/lib/blog-types";

function revalidateBlogPages(slug?: string) {
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const post = await getBlogPostById(id);
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(post);
  } catch (err) {
    console.error("[GET /api/blog-posts/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch blog post" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    const existing = await getBlogPostById(id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const {
      title,
      slug,
      excerpt,
      body: content,
      postType,
      coverImageUrl,
      productId,
      productName,
      brandName,
      rating,
      galleryImages,
      videoUrls,
      pros,
      cons,
      relatedLinks,
      isPublished,
      publishedAt,
      sortOrder,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const finalSlug = (slug?.trim() || slugifyBlogTitle(title)).slice(0, 200);
    const nextCover = coverImageUrl ?? null;

    const post = await updateBlogPost(id, {
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt?.trim() || null,
      body: content?.trim() || null,
      postType: postType === "review" ? "review" : "article",
      coverImageUrl: nextCover,
      productId: productId ?? null,
      productName: productName?.trim() || null,
      brandName: brandName?.trim() || null,
      rating: rating ? Number(rating) : null,
      galleryImages: galleryImages ?? [],
      videoUrls: videoUrls ?? [],
      pros: pros ?? [],
      cons: cons ?? [],
      relatedLinks: relatedLinks ?? [],
      isPublished: isPublished ?? false,
      publishedAt: publishedAt
        ? new Date(publishedAt)
        : isPublished && !existing.publishedAt
          ? new Date()
          : existing.publishedAt,
      sortOrder: sortOrder ?? 0,
    });

    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (existing.coverImageUrl && existing.coverImageUrl !== nextCover) {
      await deleteBlogImageFile(existing.coverImageUrl);
    }

    if (existing.slug !== post.slug) {
      revalidateBlogPages(existing.slug);
    }
    revalidateBlogPages(post.slug);
    return NextResponse.json(post);
  } catch (err) {
    console.error("[PUT /api/blog-posts/[id]]", err);
    const message = err instanceof Error && err.message.includes("unique")
      ? "A post with this slug already exists"
      : "Failed to update blog post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    const post = await deleteBlogPost(id);
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await deleteAllBlogImagesForPost(id);
    revalidateBlogPages(post.slug);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/blog-posts/[id]]", err);
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}
