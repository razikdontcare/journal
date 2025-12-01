// Server-side article data store using Drizzle ORM with PostgreSQL

import { db } from "./db";
import { articles } from "./db/schema";
import { eq, desc } from "drizzle-orm";

// Re-export shared types and utilities
export { generateSlug, calculateReadTime } from "./utils";

// Type based on the schema
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;

// Get all articles
export async function getArticles(): Promise<Article[]> {
  return await db.select().from(articles).orderBy(desc(articles.createdAt));
}

// Get published articles only
export async function getPublishedArticles(): Promise<Article[]> {
  return await db
    .select()
    .from(articles)
    .where(eq(articles.published, true))
    .orderBy(desc(articles.createdAt));
}

// Get article by slug
export async function getArticleBySlug(
  slug: string
): Promise<Article | undefined> {
  const result = await db
    .select()
    .from(articles)
    .where(eq(articles.slug, slug))
    .limit(1);
  return result[0];
}

// Get article by ID
export async function getArticleById(id: string): Promise<Article | undefined> {
  const result = await db
    .select()
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);
  return result[0];
}

// Create a new article
export async function createArticle(
  article: Omit<NewArticle, "id" | "createdAt" | "updatedAt">
): Promise<Article> {
  const result = await db
    .insert(articles)
    .values({
      ...article,
    })
    .returning();
  return result[0];
}

// Update an existing article
export async function updateArticle(
  id: string,
  updates: Partial<Omit<Article, "id" | "createdAt">>
): Promise<Article | undefined> {
  const result = await db
    .update(articles)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(articles.id, id))
    .returning();
  return result[0];
}

// Delete an article
export async function deleteArticle(id: string): Promise<boolean> {
  const result = await db
    .delete(articles)
    .where(eq(articles.id, id))
    .returning();
  return result.length > 0;
}
