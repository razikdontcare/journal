CREATE TABLE "site_settings" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"site_name" text DEFAULT 'Journal' NOT NULL,
	"site_tagline" text DEFAULT 'A personal blog about life, thoughts, and creativity.',
	"site_description" text DEFAULT 'Welcome to my personal blog where I share my thoughts, experiences, and creative endeavors.',
	"author_name" text DEFAULT 'Journal',
	"author_bio" text,
	"author_image" text,
	"social_twitter" text,
	"social_github" text,
	"social_linkedin" text,
	"social_instagram" text,
	"footer_text" text DEFAULT '© 2025 Journal. All rights reserved.',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
