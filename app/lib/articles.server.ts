// Server-side article data store using Drizzle ORM with PostgreSQL

import { db } from "./db";
import { articles, users } from "./db/schema";
import { eq, desc, and, or, ilike, sql, arrayContains } from "drizzle-orm";

// Re-export shared types and utilities
export { generateSlug, calculateReadTime } from "./utils";

// Type based on the schema
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;

// Article with author info
export type ArticleWithAuthor = Article & {
  authorUser?: {
    id: string;
    name: string;
    image: string | null;
  } | null;
};

// Search and filter options
export interface ArticleFilters {
  search?: string;
  category?: string;
  tag?: string;
  authorId?: string;
  published?: boolean;
}

// Pagination options
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

// Paginated result
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Get all articles with author info
export async function getArticles(): Promise<ArticleWithAuthor[]> {
  const result = await db
    .select({
      article: articles,
      authorUser: {
        id: users.id,
        name: users.name,
        image: users.image,
      },
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .orderBy(desc(articles.createdAt));

  return result.map((row) => ({
    ...row.article,
    authorUser: row.authorUser,
  }));
}

// Get published articles with filters and pagination
export async function getPublishedArticles(
  filters?: ArticleFilters,
  pagination?: PaginationOptions
): Promise<PaginatedResult<ArticleWithAuthor>> {
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 10;
  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [eq(articles.published, true)];

  if (filters?.search) {
    const searchTerm = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(articles.title, searchTerm),
        ilike(articles.subtitle, searchTerm),
        ilike(articles.content, searchTerm)
      )!
    );
  }

  if (filters?.category) {
    conditions.push(eq(articles.category, filters.category));
  }

  // Only apply tag filter if tags column exists (migration has been run)
  if (filters?.tag) {
    try {
      conditions.push(arrayContains(articles.tags, [filters.tag]));
    } catch {
      // Ignore tag filter if column doesn't exist
    }
  }

  if (filters?.authorId) {
    conditions.push(eq(articles.authorId, filters.authorId));
  }

  const whereClause = and(...conditions);

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(articles)
    .where(whereClause);
  const total = countResult[0]?.count || 0;

  // Get paginated results with author info
  const result = await db
    .select({
      article: articles,
      authorUser: {
        id: users.id,
        name: users.name,
        image: users.image,
      },
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(whereClause)
    .orderBy(desc(articles.createdAt))
    .limit(limit)
    .offset(offset);

  const items = result.map((row) => ({
    ...row.article,
    authorUser: row.authorUser,
  }));

  const totalPages = Math.ceil(total / limit);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// Get all unique categories
export async function getCategories(): Promise<string[]> {
  const result = await db
    .selectDistinct({ category: articles.category })
    .from(articles)
    .where(
      and(eq(articles.published, true), sql`${articles.category} IS NOT NULL`)
    );
  return result.map((r) => r.category).filter((c): c is string => c !== null);
}

// Get all unique tags
export async function getTags(): Promise<string[]> {
  try {
    const result = await db
      .select({ tags: articles.tags })
      .from(articles)
      .where(
        and(eq(articles.published, true), sql`${articles.tags} IS NOT NULL`)
      );

    const allTags = result.flatMap((r) => r.tags || []);
    return [...new Set(allTags)];
  } catch {
    // Column may not exist if migration hasn't been run
    return [];
  }
}

// Get article by slug with author info
export async function getArticleBySlug(
  slug: string
): Promise<ArticleWithAuthor | undefined> {
  const result = await db
    .select({
      article: articles,
      authorUser: {
        id: users.id,
        name: users.name,
        image: users.image,
      },
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(eq(articles.slug, slug))
    .limit(1);

  if (result.length === 0) return undefined;

  return {
    ...result[0].article,
    authorUser: result[0].authorUser,
  };
}

// Get article by ID with author info
export async function getArticleById(
  id: string
): Promise<ArticleWithAuthor | undefined> {
  const result = await db
    .select({
      article: articles,
      authorUser: {
        id: users.id,
        name: users.name,
        image: users.image,
      },
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(eq(articles.id, id))
    .limit(1);

  if (result.length === 0) return undefined;

  return {
    ...result[0].article,
    authorUser: result[0].authorUser,
  };
}

// Get articles by author
export async function getArticlesByAuthor(
  authorId: string
): Promise<ArticleWithAuthor[]> {
  const result = await db
    .select({
      article: articles,
      authorUser: {
        id: users.id,
        name: users.name,
        image: users.image,
      },
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(eq(articles.authorId, authorId))
    .orderBy(desc(articles.createdAt));

  return result.map((row) => ({
    ...row.article,
    authorUser: row.authorUser,
  }));
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

// Check if user can edit article (ownership check)
export function canEditArticle(
  article: ArticleWithAuthor,
  userId: string,
  userRole: string
): boolean {
  // Admins can edit anything
  if (userRole === "admin") return true;

  // Editors can edit any article
  if (userRole === "editor") return true;

  // Authors can only edit their own articles
  return article.authorId === userId;
}

// Check if user can delete article
export function canDeleteArticle(
  article: ArticleWithAuthor,
  userId: string,
  userRole: string
): boolean {
  // Only admins can delete any article
  if (userRole === "admin") return true;

  // Authors can delete their own articles
  return article.authorId === userId;
}
