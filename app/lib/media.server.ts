// Server-side media management using Drizzle ORM with PostgreSQL

import { db } from "./db";
import { media, users } from "./db/schema";
import { eq, desc, sql, and } from "drizzle-orm";

export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;

// Media with uploader info
export type MediaWithUploader = Media & {
  uploader?: {
    id: string;
    name: string;
  } | null;
};

// Pagination options
export interface MediaPaginationOptions {
  page?: number;
  limit?: number;
  mimeType?: string;
}

// Paginated result
export interface PaginatedMediaResult {
  items: MediaWithUploader[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Get all media with pagination
export async function getMedia(
  options?: MediaPaginationOptions
): Promise<PaginatedMediaResult> {
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [];
  if (options?.mimeType) {
    conditions.push(sql`${media.mimeType} LIKE ${options.mimeType + "%"}`);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(media)
    .where(whereClause);
  const total = countResult[0]?.count || 0;

  // Get paginated results with uploader info
  const result = await db
    .select({
      media: media,
      uploader: {
        id: users.id,
        name: users.name,
      },
    })
    .from(media)
    .leftJoin(users, eq(media.uploadedBy, users.id))
    .where(whereClause)
    .orderBy(desc(media.createdAt))
    .limit(limit)
    .offset(offset);

  const items = result.map((row) => ({
    ...row.media,
    uploader: row.uploader,
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

// Get media by ID
export async function getMediaById(
  id: string
): Promise<MediaWithUploader | undefined> {
  const result = await db
    .select({
      media: media,
      uploader: {
        id: users.id,
        name: users.name,
      },
    })
    .from(media)
    .leftJoin(users, eq(media.uploadedBy, users.id))
    .where(eq(media.id, id))
    .limit(1);

  if (result.length === 0) return undefined;

  return {
    ...result[0].media,
    uploader: result[0].uploader,
  };
}

// Get media by URL
export async function getMediaByUrl(url: string): Promise<Media | undefined> {
  const result = await db
    .select()
    .from(media)
    .where(eq(media.url, url))
    .limit(1);
  return result[0];
}

// Create a new media record
export async function createMedia(
  mediaData: Omit<NewMedia, "id" | "createdAt" | "updatedAt">
): Promise<Media> {
  const result = await db
    .insert(media)
    .values({
      ...mediaData,
    })
    .returning();
  return result[0];
}

// Update media metadata
export async function updateMedia(
  id: string,
  updates: Partial<Omit<Media, "id" | "createdAt">>
): Promise<Media | undefined> {
  const result = await db
    .update(media)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(media.id, id))
    .returning();
  return result[0];
}

// Delete media record
export async function deleteMedia(id: string): Promise<boolean> {
  const result = await db.delete(media).where(eq(media.id, id)).returning();
  return result.length > 0;
}

// Get media by uploader
export async function getMediaByUploader(
  uploaderId: string
): Promise<MediaWithUploader[]> {
  const result = await db
    .select({
      media: media,
      uploader: {
        id: users.id,
        name: users.name,
      },
    })
    .from(media)
    .leftJoin(users, eq(media.uploadedBy, users.id))
    .where(eq(media.uploadedBy, uploaderId))
    .orderBy(desc(media.createdAt));

  return result.map((row) => ({
    ...row.media,
    uploader: row.uploader,
  }));
}

// Get total storage used by a user
export async function getUserStorageUsed(userId: string): Promise<number> {
  const result = await db
    .select({ total: sql<number>`COALESCE(SUM(${media.size}), 0)::int` })
    .from(media)
    .where(eq(media.uploadedBy, userId));
  return result[0]?.total || 0;
}

// Get total storage used by all users
export async function getTotalStorageUsed(): Promise<number> {
  const result = await db
    .select({ total: sql<number>`COALESCE(SUM(${media.size}), 0)::int` })
    .from(media);
  return result[0]?.total || 0;
}
