// Server-side site settings store using Drizzle ORM with PostgreSQL

import { db } from "./db";
import { siteSettings } from "./db/schema";
import { eq } from "drizzle-orm";

export type SiteSettings = typeof siteSettings.$inferSelect;

const DEFAULT_SETTINGS: Omit<SiteSettings, "createdAt" | "updatedAt"> = {
  id: "default",
  siteName: "Journal",
  siteTagline: "A personal blog about life, thoughts, and creativity.",
  siteDescription:
    "Welcome to my personal blog where I share my thoughts, experiences, and creative endeavors.",
  socialTwitter: null,
  socialGithub: null,
  socialLinkedin: null,
  socialInstagram: null,
  footerText: "© 2025 Journal. All rights reserved.",
  // Hero Section
  heroTitle: "Thoughts,",
  heroTitleAccent: "stories & ideas",
  heroDescription:
    "A space for reflection, creativity, and the quiet moments that shape who we become. Welcome to my corner of the internet.",
  heroImage:
    "https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=800&q=80",
  heroCtaText: "Learn more about me →",
  heroCtaLink: "/about",
  // About Page
  aboutHeroTitle: "Hello, I'm",
  aboutHeroSubtitle: "a storyteller",
  aboutIntroTitle: "A little about me",
  aboutIntroParagraph1:
    "I believe in the power of words to inspire, heal, and connect us. My writing explores the intersection of mindfulness, creativity, and everyday life—finding meaning in the mundane and beauty in the ordinary.",
  aboutIntroParagraph2:
    "When I'm not writing, you'll find me wandering through bookshops, experimenting in the kitchen, or getting lost in nature. I'm passionate about slow living, intentional design, and the art of doing nothing.",
  aboutIntroParagraph3:
    "This blog is my attempt to share what I'm learning along the way—imperfect thoughts, honest reflections, and the occasional moment of clarity. Thank you for being here.",
  aboutEmail: "hello@journal.com",
  aboutImage:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80",
  // Values Section
  valuesSectionTitle: "What I believe in",
  value1Title: "Intentionality",
  value1Description:
    "Every choice we make shapes our life. I believe in making those choices with purpose and awareness.",
  value2Title: "Simplicity",
  value2Description:
    "In a world of excess, simplicity is a radical act. Less noise, more signal. Less clutter, more clarity.",
  value3Title: "Connection",
  value3Description:
    "We're all walking each other home. I believe in building bridges through stories and shared experiences.",
  // Newsletter
  newsletterTitle: "Stay in touch",
  newsletterDescription:
    "Subscribe to receive occasional updates, new posts, and thoughts delivered straight to your inbox.",
  newsletterImage:
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
  showNewsletter: true,
  // Security
  allowRegistration: true,
};

// Get site settings (creates default if not exists)
export async function getSiteSettings(): Promise<SiteSettings> {
  const result = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, "default"))
    .limit(1);

  if (result.length === 0) {
    // Create default settings
    const created = await db
      .insert(siteSettings)
      .values(DEFAULT_SETTINGS)
      .returning();
    return created[0];
  }

  return result[0];
}

// Update site settings
export async function updateSiteSettings(
  updates: Partial<Omit<SiteSettings, "id" | "createdAt" | "updatedAt">>
): Promise<SiteSettings> {
  // First ensure settings exist
  await getSiteSettings();

  const result = await db
    .update(siteSettings)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(siteSettings.id, "default"))
    .returning();

  return result[0];
}
