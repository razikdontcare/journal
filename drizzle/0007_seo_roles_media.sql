-- Add role field to users table
ALTER TABLE "users" ADD COLUMN "role" text DEFAULT 'author' NOT NULL;

-- Add SEO and tag fields to articles table
ALTER TABLE "articles" ADD COLUMN "tags" text[];
ALTER TABLE "articles" ADD COLUMN "seo_title" text;
ALTER TABLE "articles" ADD COLUMN "seo_description" text;
ALTER TABLE "articles" ADD COLUMN "seo_keywords" text;
ALTER TABLE "articles" ADD COLUMN "canonical_url" text;

-- Create media table for image management
CREATE TABLE IF NOT EXISTS "media" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "filename" text NOT NULL,
    "original_filename" text NOT NULL,
    "url" text NOT NULL,
    "thumbnail_url" text,
    "mime_type" text NOT NULL,
    "size" integer NOT NULL,
    "width" integer,
    "height" integer,
    "alt_text" text,
    "caption" text,
    "uploaded_by" text REFERENCES "users"("id") ON DELETE SET NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "articles_tags_idx" ON "articles" USING GIN ("tags");
CREATE INDEX IF NOT EXISTS "articles_author_id_idx" ON "articles" ("author_id");
CREATE INDEX IF NOT EXISTS "articles_category_idx" ON "articles" ("category");
CREATE INDEX IF NOT EXISTS "articles_published_idx" ON "articles" ("published");
CREATE INDEX IF NOT EXISTS "articles_created_at_idx" ON "articles" ("created_at");
CREATE INDEX IF NOT EXISTS "media_uploaded_by_idx" ON "media" ("uploaded_by");
CREATE INDEX IF NOT EXISTS "media_created_at_idx" ON "media" ("created_at");
