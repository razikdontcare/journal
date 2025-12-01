import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";

// =========================================
// Better Auth Tables
// =========================================

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// =========================================
// Blog Tables
// =========================================

export const articles = pgTable("articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  category: text("category"),
  date: text("date").notNull(),
  readTime: text("read_time"),
  author: text("author").notNull().default("Journal"),
  heroImage: text("hero_image"),
  content: text("content").notNull(),
  published: boolean("published").notNull().default(false),
  authorId: text("author_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey().default("default"),
  siteName: text("site_name").notNull().default("Journal"),
  siteTagline: text("site_tagline").default(
    "A personal blog about life, thoughts, and creativity."
  ),
  siteDescription: text("site_description").default(
    "Welcome to my personal blog where I share my thoughts, experiences, and creative endeavors."
  ),
  authorName: text("author_name").default("Journal"),
  authorBio: text("author_bio"),
  authorImage: text("author_image"),
  socialTwitter: text("social_twitter"),
  socialGithub: text("social_github"),
  socialLinkedin: text("social_linkedin"),
  socialInstagram: text("social_instagram"),
  footerText: text("footer_text").default(
    "© 2025 Journal. All rights reserved."
  ),
  // Hero Section Content
  heroTitle: text("hero_title").default("Thoughts,"),
  heroTitleAccent: text("hero_title_accent").default("stories & ideas"),
  heroDescription: text("hero_description").default(
    "A space for reflection, creativity, and the quiet moments that shape who we become. Welcome to my corner of the internet."
  ),
  heroImage: text("hero_image").default(
    "https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=800&q=80"
  ),
  heroCtaText: text("hero_cta_text").default("Learn more about me →"),
  heroCtaLink: text("hero_cta_link").default("/about"),
  // About Page Content
  aboutHeroTitle: text("about_hero_title").default("Hello, I'm"),
  aboutHeroSubtitle: text("about_hero_subtitle").default("a storyteller"),
  aboutIntroTitle: text("about_intro_title").default("A little about me"),
  aboutIntroParagraph1: text("about_intro_paragraph1").default(
    "I believe in the power of words to inspire, heal, and connect us. My writing explores the intersection of mindfulness, creativity, and everyday life—finding meaning in the mundane and beauty in the ordinary."
  ),
  aboutIntroParagraph2: text("about_intro_paragraph2").default(
    "When I'm not writing, you'll find me wandering through bookshops, experimenting in the kitchen, or getting lost in nature. I'm passionate about slow living, intentional design, and the art of doing nothing."
  ),
  aboutIntroParagraph3: text("about_intro_paragraph3").default(
    "This blog is my attempt to share what I'm learning along the way—imperfect thoughts, honest reflections, and the occasional moment of clarity. Thank you for being here."
  ),
  aboutEmail: text("about_email").default("hello@journal.com"),
  aboutImage: text("about_image").default(
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80"
  ),
  // Values Section
  valuesSectionTitle: text("values_section_title").default("What I believe in"),
  value1Title: text("value1_title").default("Intentionality"),
  value1Description: text("value1_description").default(
    "Every choice we make shapes our life. I believe in making those choices with purpose and awareness."
  ),
  value2Title: text("value2_title").default("Simplicity"),
  value2Description: text("value2_description").default(
    "In a world of excess, simplicity is a radical act. Less noise, more signal. Less clutter, more clarity."
  ),
  value3Title: text("value3_title").default("Connection"),
  value3Description: text("value3_description").default(
    "We're all walking each other home. I believe in building bridges through stories and shared experiences."
  ),
  // Newsletter Section
  newsletterTitle: text("newsletter_title").default("Stay in touch"),
  newsletterDescription: text("newsletter_description").default(
    "Subscribe to receive occasional updates, new posts, and thoughts delivered straight to your inbox."
  ),
  newsletterImage: text("newsletter_image").default(
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80"
  ),
  showNewsletter: boolean("show_newsletter").notNull().default(true),
  // Security Settings
  allowRegistration: boolean("allow_registration").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type NewSiteSettings = typeof siteSettings.$inferInsert;
