// Shared utilities that work on both client and server

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: string | null;
  tags: string[] | null;
  date: string;
  readTime: string | null;
  author: string;
  heroImage: string | null;
  content: string;
  published: boolean;
  // SEO fields
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  canonicalUrl?: string | null;
  // Author relationship
  authorId?: string | null;
  authorUser?: {
    id: string;
    name: string;
    image: string | null;
  } | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Calculate read time from content
export function calculateReadTime(content: string): string {
  const text = content.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

// Parse tags from comma-separated string
export function parseTags(tagsString: string): string[] {
  if (!tagsString) return [];
  return tagsString
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

// Format tags to comma-separated string
export function formatTags(tags: string[] | null): string {
  if (!tags || tags.length === 0) return "";
  return tags.join(", ");
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
