import { desc, eq, and } from "drizzle-orm";
import { db } from "../db";
import { blogPosts } from "../schema/blog_posts";

export async function getPublishedBlogPosts(type?: string) {
  const conditions = [eq(blogPosts.isPublished, true)];
  if (type) conditions.push(eq(blogPosts.postType, type));

  return db.query.blogPosts.findMany({
    where: and(...conditions),
    orderBy: [desc(blogPosts.publishedAt), desc(blogPosts.createdAt)],
  });
}

export async function getAllBlogPosts() {
  return db.query.blogPosts.findMany({
    orderBy: [desc(blogPosts.updatedAt)],
  });
}

export async function getBlogPostBySlug(slug: string) {
  return db.query.blogPosts.findFirst({
    where: eq(blogPosts.slug, slug),
  });
}

export async function getBlogPostById(id: string) {
  return db.query.blogPosts.findFirst({
    where: eq(blogPosts.id, id),
  });
}

export async function getPublishedBlogPostBySlug(slug: string) {
  return db.query.blogPosts.findFirst({
    where: and(eq(blogPosts.slug, slug), eq(blogPosts.isPublished, true)),
  });
}

export async function createBlogPost(
  data: Omit<typeof blogPosts.$inferInsert, "id" | "createdAt" | "updatedAt">,
) {
  const [post] = await db.insert(blogPosts).values(data).returning();
  return post;
}

export async function updateBlogPost(
  id: string,
  data: Partial<typeof blogPosts.$inferInsert>,
) {
  const [post] = await db
    .update(blogPosts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(blogPosts.id, id))
    .returning();
  return post;
}

export async function deleteBlogPost(id: string) {
  const [post] = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning();
  return post ?? null;
}
