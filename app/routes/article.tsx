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
import { type Article } from "../lib/utils";

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
    };
  }

  // Highlight code blocks in the article content
  const highlightedContent = highlightCodeBlocks(article.content);

  const allArticles = await getPublishedArticles();
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

  return {
    article: { ...article, content: highlightedContent },
    relatedArticles,
    navigation,
    settings,
    isAuthenticated,
  };
}

export function meta({ data }: Route.MetaArgs) {
  const article = data?.article;
  const siteName = data?.settings?.siteName || "Journal";
  return [
    { title: article ? `${article.title} - ${siteName}` : "Article Not Found" },
    {
      name: "description",
      content: article?.subtitle || `Read this article on ${siteName}`,
    },
  ];
}

export default function ArticlePage({ loaderData }: Route.ComponentProps) {
  const { article, relatedArticles, navigation, settings, isAuthenticated } =
    loaderData;
  const [scrollProgress, setScrollProgress] = useState(0);

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

  return (
    <>
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
          <div className="author-block">
            <img
              src="https://avatar.iran.liara.run/public"
              alt={article.author}
              loading="lazy"
            />
            <p className="author-name">{article.author}</p>
          </div>
          <div className="meta-info">
            <span>{article.date}</span>
            <span>{article.readTime}</span>
          </div>
          <div className="share-icons">
            <span>Share</span>
            <span>·</span>
            <span>Save</span>
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
