import { Link } from "react-router";
import type { Route } from "./+types/home";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { BackToTop } from "../components/BackToTop";
import { Newsletter } from "../components/Newsletter";
import { getPublishedArticles } from "../lib/articles.server";
import { getSiteSettings } from "../lib/settings.server";

export function meta({ data }: Route.MetaArgs) {
  const settings = data?.settings;
  return [
    { title: settings?.siteName || "My Personal Blog" },
    {
      name: "description",
      content:
        settings?.siteTagline ||
        "A personal blog about life, thoughts, and creativity.",
    },
  ];
}

// Server-side loader
export async function loader() {
  const [articles, settings] = await Promise.all([
    getPublishedArticles(),
    getSiteSettings(),
  ]);
  return { articles, settings };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { articles, settings } = loaderData;

  // Format date for display
  const formatDate = (dateString: string) => {
    // If it's already a formatted date like "November 28, 2025", extract short version
    if (dateString.includes(",")) {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
      return dateString;
    }
    return dateString;
  };

  // Extract excerpt from HTML content
  const getExcerpt = (html: string, maxLength = 150) => {
    const text = html.replace(/<[^>]*>/g, "");
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  return (
    <>
      <Navigation
        siteName={settings.siteName}
        showNewsletter={settings.showNewsletter}
      />
      <BackToTop />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content animate-fade-in-up">
          <h1 className="hero-title">
            {settings.heroTitle || "Thoughts,"}
            <span>{settings.heroTitleAccent || "stories & ideas"}</span>
          </h1>
          <p className="hero-desc animate-fade-in-up animate-delay-1">
            {settings.heroDescription ||
              "A space for reflection, creativity, and the quiet moments that shape who we become. Welcome to my corner of the internet."}
          </p>
          <Link
            to={settings.heroCtaLink || "/about"}
            className="animate-fade-in-up animate-delay-2"
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              borderBottom: "1px solid var(--text-main)",
              paddingBottom: "4px",
              display: "inline-block",
            }}
          >
            {settings.heroCtaText || "Learn more about me →"}
          </Link>
        </div>
        <img
          src={
            settings.heroImage ||
            "https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=800&q=80"
          }
          alt="Hero"
          className="hero-image animate-fade-in animate-delay-2"
          loading="lazy"
        />
      </section>

      {/* Journal Section */}
      <section className="journal-section" id="journal">
        <div className="section-header">
          <h2 className="section-title">Latest Entries</h2>
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              color: "var(--text-muted)",
            }}
          >
            Explore all writings
          </span>
        </div>

        {/* Article List */}
        {articles.map((article, index) => (
          <Link
            to={`/article/${article.slug}`}
            key={article.id}
            className="article-list-item"
          >
            <span className="item-date">{formatDate(article.date)}</span>
            <div className="item-content">
              <span className="item-category">{article.category}</span>
              <h3 className="item-title">{article.title}</h3>
              {index === 0 && (
                <p className="item-excerpt">
                  {article.subtitle || getExcerpt(article.content)}
                </p>
              )}
            </div>
            <span className="item-action">Read →</span>
          </Link>
        ))}

        {articles.length === 0 && (
          <p
            style={{
              textAlign: "center",
              color: "var(--text-muted)",
              padding: "3rem",
            }}
          >
            No articles published yet.
          </p>
        )}
      </section>

      {/* Visual Break / Newsletter */}
      {settings.showNewsletter && (
        <section className="visual-break" id="newsletter">
          <div className="vb-text">
            <h2>{settings.newsletterTitle || "Stay in touch"}</h2>
            <p
              style={{
                color: "var(--text-muted)",
                marginBottom: "2rem",
                maxWidth: "400px",
              }}
            >
              {settings.newsletterDescription ||
                "Subscribe to receive occasional updates, new posts, and thoughts delivered straight to your inbox."}
            </p>
            <Newsletter />
          </div>
          <div className="vb-img">
            <img
              src={
                settings.newsletterImage ||
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80"
              }
              alt="Newsletter"
              loading="lazy"
            />
          </div>
        </section>
      )}

      <Footer
        siteName={settings.siteName}
        footerText={settings.footerText}
        socialTwitter={settings.socialTwitter}
        socialGithub={settings.socialGithub}
        socialLinkedin={settings.socialLinkedin}
        socialInstagram={settings.socialInstagram}
        showNewsletter={settings.showNewsletter}
      />
    </>
  );
}
