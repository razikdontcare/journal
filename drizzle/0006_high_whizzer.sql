CREATE TABLE "article_redirects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_slug" text NOT NULL,
	"to_slug" text NOT NULL,
	"article_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "article_redirects_from_slug_unique" UNIQUE("from_slug")
);
--> statement-breakpoint
CREATE TABLE "image_uploads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"filename" text NOT NULL,
	"size" text NOT NULL,
	"mime_type" text NOT NULL,
	"uploaded_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "articles" DROP CONSTRAINT "articles_author_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "articles" ALTER COLUMN "author_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "tags" text[];--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" text DEFAULT 'author' NOT NULL;--> statement-breakpoint
ALTER TABLE "article_redirects" ADD CONSTRAINT "article_redirects_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_uploads" ADD CONSTRAINT "image_uploads_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" DROP COLUMN "author";