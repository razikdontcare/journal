import { Link, useSearchParams, Form } from "react-router";
import type { Route } from "./+types/articles";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { BackToTop } from "../components/BackToTop";
import {
  getPublishedArticles,
  getCategories,
  getTags,
} from "../lib/articles.server";
import { getSiteSettings } from "../lib/settings.server";
import { Search, X, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

export function meta({ data }: Route.MetaArgs) {
  const settings = data?.settings;
  return [
    { title: `Articles — ${settings?.siteName || "Journal"}` },
    {
      name: "description",
      content: "Browse all articles, stories, and thoughts.",
    },
    {
      property: "og:title",
      content: `Articles — ${settings?.siteName || "Journal"}`,
    },
    {
      property: "og:description",
      content: "Browse all articles, stories, and thoughts.",
    },
    { property: "og:type", content: "website" },
  ];
}

// Server-side loader
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const search = url.searchParams.get("q") || undefined;
  const category = url.searchParams.get("category") || undefined;
  const tag = url.searchParams.get("tag") || undefined;
  const page = parseInt(url.searchParams.get("page") || "1", 10);

  const [articlesResult, categories, tags, settings] = await Promise.all([
    getPublishedArticles({ search, category, tag }, { page, limit: 10 }),
    getCategories(),
    getTags(),
    getSiteSettings(),
  ]);

  return {
    articles: articlesResult.items,
    pagination: {
      page: articlesResult.page,
      totalPages: articlesResult.totalPages,
      total: articlesResult.total,
      hasNext: articlesResult.hasNext,
      hasPrev: articlesResult.hasPrev,
    },
    categories,
    tags,
    settings,
    filters: { search, category, tag },
  };
}

export default function Articles({ loaderData }: Route.ComponentProps) {
  const { articles, pagination, categories, tags, settings, filters } =
    loaderData;
  const [searchParams, setSearchParams] = useSearchParams();

  // Format date for display
  const formatDate = (dateString: string) => {
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

  // Handle filter change
  const handleFilterChange = (type: "category" | "tag", value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(type, value);
    } else {
      newParams.delete(type);
    }
    newParams.delete("page");
    setSearchParams(newParams);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchParams({});
  };

  // Generate pagination URL
  const getPaginationUrl = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    if (page > 1) {
      newParams.set("page", page.toString());
    } else {
      newParams.delete("page");
    }
    return `/articles?${newParams.toString()}`;
  };

  const hasActiveFilters = filters.search || filters.category || filters.tag;

  return (
    <>
      <Navigation
        siteName={settings.siteName}
        showNewsletter={settings.showNewsletter}
      />
      <BackToTop />

      {/* Page Header */}
      <section className="articles-header">
        <h1 className="articles-title">All Articles</h1>
        <p className="articles-subtitle">
          {pagination.total} article{pagination.total !== 1 ? "s" : ""}{" "}
          published
        </p>
      </section>

      {/* Search and Filters */}
      <section className="articles-filters">
        <Form method="get" className="articles-search-form">
          <input
            type="text"
            name="q"
            placeholder="Search articles..."
            defaultValue={filters.search || ""}
            className="articles-search-input"
          />
          <button
            type="submit"
            className="articles-search-btn flex items-center gap-2"
          >
            <Search size={16} /> Search
          </button>
          {/* Preserve other filters */}
          {filters.category && (
            <input type="hidden" name="category" value={filters.category} />
          )}
          {filters.tag && (
            <input type="hidden" name="tag" value={filters.tag} />
          )}
        </Form>

        <div className="articles-filter-row">
          {categories.length > 0 && (
            <div className="articles-filter-group">
              <label className="articles-filter-label">Category</label>
              <select
                value={filters.category || ""}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="articles-filter-select"
              >
                <option value="">All</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {tags.length > 0 && (
            <div className="articles-filter-group">
              <label className="articles-filter-label">Tag</label>
              <select
                value={filters.tag || ""}
                onChange={(e) => handleFilterChange("tag", e.target.value)}
                className="articles-filter-select"
              >
                <option value="">All</option>
                {tags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {hasActiveFilters && (
            <button onClick={handleClearFilters} className="articles-clear-btn">
              <X size={14} /> Clear all
            </button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="articles-active-filters">
            {filters.search && (
              <span className="articles-filter-tag">
                Search: "{filters.search}"
              </span>
            )}
            {filters.category && (
              <span className="articles-filter-tag">{filters.category}</span>
            )}
            {filters.tag && (
              <span className="articles-filter-tag">#{filters.tag}</span>
            )}
          </div>
        )}
      </section>

      {/* Article List */}
      <section className="journal-section articles-list">
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
              {index === 0 && !hasActiveFilters && (
                <p className="item-excerpt">
                  {article.subtitle || getExcerpt(article.content)}
                </p>
              )}
              {article.authorUser && (
                <span className="item-author">
                  by {article.authorUser.name}
                </span>
              )}
            </div>
            <span className="item-action">
              Read <ArrowRight size={14} />
            </span>
          </Link>
        ))}

        {articles.length === 0 && (
          <div className="articles-empty">
            <p>
              {hasActiveFilters
                ? "No articles found matching your criteria."
                : "No articles published yet."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="articles-clear-btn"
              >
                <X size={14} /> Clear filters
              </button>
            )}
          </div>
        )}
      </section>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <section className="articles-pagination">
          <div className="articles-pagination-inner">
            {pagination.hasPrev ? (
              <Link
                to={getPaginationUrl(pagination.page - 1)}
                className="articles-pagination-btn"
              >
                <ChevronLeft size={16} /> Previous
              </Link>
            ) : (
              <span />
            )}
            <span className="articles-pagination-info">
              {pagination.page} / {pagination.totalPages}
            </span>
            {pagination.hasNext ? (
              <Link
                to={getPaginationUrl(pagination.page + 1)}
                className="articles-pagination-btn"
              >
                Next <ChevronRight size={16} />
              </Link>
            ) : (
              <span />
            )}
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
