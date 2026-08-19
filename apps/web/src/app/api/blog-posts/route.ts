import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  createBlogPost,
  getAllBlogPosts,
  getPublishedBlogPosts,
} from "@icrowd/database/queries";
import { requireAdmin } from "@/lib/admin";
import { slugifyBlogTitle } from "@/lib/blog-types";

function revalidateBlogPages(slug?: string) {
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function GET(req: NextRequest) {
  try {
    const all = req.nextUrl.searchParams.get("all") === "true";
    const type = req.nextUrl.searchParams.get("type") ?? undefined;

    if (all) {
      const auth = await requireAdmin();
      if (auth instanceof NextResponse) return auth;
      const posts = await getAllBlogPosts();
      return NextResponse.json(posts);
    }

    const posts = await getPublishedBlogPosts(type);
    return NextResponse.json(posts);
  } catch (err) {
    console.error("[GET /api/blog-posts]", err);
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
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
    if (!finalSlug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    const post = await createBlogPost({
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt?.trim() || null,
      body: content?.trim() || null,
      postType: postType === "review" ? "review" : "article",
      coverImageUrl: coverImageUrl ?? null,
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
      publishedAt: publishedAt ? new Date(publishedAt) : isPublished ? new Date() : null,
      sortOrder: sortOrder ?? 0,
    });

    revalidateBlogPages(post.slug);
    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error("[POST /api/blog-posts]", err);
    const message = err instanceof Error && err.message.includes("unique")
      ? "A post with this slug already exists"
      : "Failed to create blog post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
