import { Link } from "react-router";
import { useEffect, useState } from "react";
import type { Route } from "./+types/article";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { BackToTop } from "../components/BackToTop";
import { getArticleBySlug, getPublishedArticles } from "../lib/articles.server";
import { getSiteSettings } from "../lib/settings.server";
import { getSession } from "../lib/auth.server";
import { highlightCodeBlocks } from "../lib/highlight.server";
import { Bookmark, Share2, Twitter, Linkedin } from "lucide-react";

// Server-side loader
export async function loader({ request, params }: Route.LoaderArgs) {
  const [article, settings, session] = await Promise.all([
    getArticleBySlug(params.slug || ""),
    getSiteSettings(),
    getSession(request),
  ]);

  const isAuthenticated = !!session;

  // If article doesn't exist, return null
  if (!article) {
    return {
      article: null,
      relatedArticles: [],
      navigation: { prev: null, next: null },
      settings,
      isAuthenticated,
      canonicalUrl: null,
    };
  }

  // If article is a draft and user is not authenticated, treat as not found
  if (!article.published && !isAuthenticated) {
    return {
      article: null,
      relatedArticles: [],
      navigation: { prev: null, next: null },
      settings,
      isAuthenticated,
      canonicalUrl: null,
    };
  }

  // Highlight code blocks in the article content
  const highlightedContent = highlightCodeBlocks(article.content);

  const allArticlesResult = await getPublishedArticles();
  const allArticles = allArticlesResult.items;
  const currentIndex = allArticles.findIndex((a) => a.slug === params.slug);

  const relatedArticles = allArticles
    .filter((a) => a.slug !== params.slug)
    .slice(0, 3);

  const navigation = {
    prev: currentIndex > 0 ? allArticles[currentIndex - 1] : null,
    next:
      currentIndex < allArticles.length - 1
        ? allArticles[currentIndex + 1]
        : null,
  };

  // Build canonical URL
  const baseUrl = process.env.SITE_URL || request.url.split("/article/")[0];
  const canonicalUrl =
    article.canonicalUrl || `${baseUrl}/article/${article.slug}`;

  return {
    article: { ...article, content: highlightedContent },
    relatedArticles,
    navigation,
    settings,
    isAuthenticated,
    canonicalUrl,
  };
}

export function meta({ data }: Route.MetaArgs) {
  const article = data?.article;
  const siteName = data?.settings?.siteName || "Journal";
  const canonicalUrl = data?.canonicalUrl;

  if (!article) {
    return [
      { title: "Article Not Found" },
      {
        name: "description",
        content: "The requested article could not be found.",
      },
    ];
  }

  // Get excerpt from content for description
  const getExcerpt = (html: string, maxLength = 160) => {
    const text = html.replace(/<[^>]*>/g, "");
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  const title = article.seoTitle || article.title;
  const description =
    article.seoDescription || article.subtitle || getExcerpt(article.content);
  const keywords = article.seoKeywords || article.tags?.join(", ") || "";
  const authorName = article.authorUser?.name || article.author;

  return [
    { title: `${title} - ${siteName}` },
    { name: "description", content: description },
    { name: "keywords", content: keywords },
    { name: "author", content: authorName },
    // Canonical URL
    ...(canonicalUrl
      ? [{ tagName: "link", rel: "canonical", href: canonicalUrl }]
      : []),
    // Open Graph
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "article" },
    { property: "og:url", content: canonicalUrl },
    ...(article.heroImage
      ? [{ property: "og:image", content: article.heroImage }]
      : []),
    { property: "og:site_name", content: siteName },
    { property: "article:published_time", content: article.date },
    { property: "article:author", content: authorName },
    ...(article.category
      ? [{ property: "article:section", content: article.category }]
      : []),
    ...(article.tags?.length
      ? article.tags.map((tag) => ({ property: "article:tag", content: tag }))
      : []),
    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    ...(article.heroImage
      ? [{ name: "twitter:image", content: article.heroImage }]
      : []),
  ];
}

export default function ArticlePage({ loaderData }: Route.ComponentProps) {
  const { article, relatedArticles, navigation, settings, isAuthenticated } =
    loaderData;
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if article is saved in localStorage
  useEffect(() => {
    if (article) {
      const savedArticles = JSON.parse(
        localStorage.getItem("savedArticles") || "[]",
      );
      setIsSaved(savedArticles.includes(article.slug));
    }
  }, [article]);

  const handleSave = () => {
    if (!article) return;
    const savedArticles = JSON.parse(
      localStorage.getItem("savedArticles") || "[]",
    );
    if (isSaved) {
      const filtered = savedArticles.filter((s: string) => s !== article.slug);
      localStorage.setItem("savedArticles", JSON.stringify(filtered));
      setIsSaved(false);
    } else {
      savedArticles.push(article.slug);
      localStorage.setItem("savedArticles", JSON.stringify(savedArticles));
      setIsSaved(true);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = article?.title || "Article";

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(article?.title || "");
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "width=550,height=420",
    );
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      "_blank",
      "width=550,height=420",
    );
  };

  if (!article) {
    return (
      <>
        <Navigation
          siteName={settings.siteName}
          showNewsletter={settings.showNewsletter}
        />
        <div style={{ textAlign: "center", padding: "10rem 5%" }}>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "3rem",
              marginBottom: "1rem",
            }}
          >
            Article not found
          </h1>
          <Link
            to="/"
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              borderBottom: "1px solid var(--text-main)",
            }}
          >
            Return home →
          </Link>
        </div>
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

  // Use author from user account if available, otherwise fall back to article.author
  const authorName = article.authorUser?.name || article.author;
  const authorImage =
    article.authorUser?.image || "https://avatar.iran.liara.run/public";

  // Generate JSON-LD structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.subtitle || "",
    image: article.heroImage || "",
    datePublished: article.date,
    dateModified: article.updatedAt,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: settings.siteName,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
    },
    ...(article.tags?.length ? { keywords: article.tags.join(", ") } : {}),
    ...(article.category ? { articleSection: article.category } : {}),
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Reading Progress Bar */}
      <div id="progress-container">
        <div id="progress-bar" style={{ width: `${scrollProgress}%` }} />
      </div>
      {!article.published && isAuthenticated && (
        <div className="draft-banner">
          <span>📝 Draft</span> — This article is not published yet. Only you
          can see it.
          <Link to={`/admin/edit/${article.id}`} className="draft-edit-link">
            Edit Article
          </Link>
        </div>
      )}

      <Navigation
        siteName={settings.siteName}
        showNewsletter={settings.showNewsletter}
      />
      <BackToTop />

      {/* Article Header */}
      <header className="article-header animate-fade-in-up">
        <span className="category-tag">{article.category}</span>
        <h1>{article.title}</h1>
        <p className="subtitle">{article.subtitle}</p>
        {article.tags && article.tags.length > 0 && (
          <div className="article-tags">
            {article.tags.map((tag) => (
              <Link
                key={tag}
                to={`/articles?tag=${encodeURIComponent(tag)}`}
                className="article-tag"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Hero Image */}
      {article.heroImage && (
        <div className="hero-image-container animate-fade-in animate-delay-1">
          <img src={article.heroImage} alt={article.title} loading="lazy" />
        </div>
      )}

      {/* Content */}
      <div className="content-wrapper">
        {/* Sidebar */}
        <aside className="meta-sidebar">
          <div className="sidebar-author">
            <img src={authorImage} alt={authorName} loading="lazy" />
            <div className="sidebar-author-info">
              <span className="sidebar-author-label">Written by</span>
              <p className="sidebar-author-name">{authorName}</p>
            </div>
          </div>

          <div className="sidebar-meta">
            <div className="sidebar-meta-item">
              <span className="sidebar-meta-label">Published</span>
              <span className="sidebar-meta-value">{article.date}</span>
            </div>
            <div className="sidebar-meta-item">
              <span className="sidebar-meta-label">Read time</span>
              <span className="sidebar-meta-value">{article.readTime}</span>
            </div>
          </div>

          <div className="sidebar-actions">
            <button
              type="button"
              className={`sidebar-action-btn ${isSaved ? "saved" : ""}`}
              onClick={handleSave}
              title={isSaved ? "Remove from saved" : "Save for later"}
            >
              <Bookmark
                size={18}
                fill={isSaved ? "currentColor" : "none"}
                strokeWidth={1.5}
              />
              <span>{isSaved ? "Saved" : "Save"}</span>
            </button>

            <div className="sidebar-share">
              <button
                type="button"
                className="sidebar-action-btn"
                onClick={handleShare}
                title="Share article"
              >
                <Share2 size={18} strokeWidth={1.5} />
                <span>{showCopied ? "Copied!" : "Share"}</span>
              </button>

              <div className="sidebar-share-links">
                <button
                  type="button"
                  onClick={handleShareTwitter}
                  className="sidebar-share-link"
                  title="Share on Twitter"
                >
                  <Twitter size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleShareLinkedIn}
                  className="sidebar-share-link"
                  title="Share on LinkedIn"
                >
                  <Linkedin size={14} />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Article Body - Render HTML content */}
        <article
          className="article-body"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>

      {/* Article Navigation */}
      <nav className="article-nav">
        {navigation.prev ? (
          <Link
            to={`/article/${navigation.prev.slug}`}
            className="article-nav-item"
          >
            <span className="article-nav-label">← Previous</span>
            <span className="article-nav-title">{navigation.prev.title}</span>
          </Link>
        ) : (
          <div />
        )}
        {navigation.next ? (
          <Link
            to={`/article/${navigation.next.slug}`}
            className="article-nav-item next"
          >
            <span className="article-nav-label">Next →</span>
            <span className="article-nav-title">{navigation.next.title}</span>
          </Link>
        ) : (
          <div />
        )}
      </nav>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="related-section">
          <h2>Continue Reading</h2>
          <div className="related-grid">
            {relatedArticles.map((related) => (
              <Link
                key={related.id}
                to={`/article/${related.slug}`}
                className="related-card"
              >
                {related.heroImage && (
                  <img
                    src={related.heroImage}
                    alt={related.title}
                    className="related-card-image"
                    loading="lazy"
                  />
                )}
                <span className="related-card-category">
                  {related.category}
                </span>
                <h3 className="related-card-title">{related.title}</h3>
              </Link>
            ))}
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
