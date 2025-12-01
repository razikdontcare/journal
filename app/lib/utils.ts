// Shared utilities that work on both client and server

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: string | null;
  date: string;
  readTime: string | null;
  author: string;
  heroImage: string | null;
  content: string;
  published: boolean;
  authorId?: string | null;
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
