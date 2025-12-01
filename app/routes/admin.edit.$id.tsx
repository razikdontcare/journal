import { Link, redirect, useNavigation, useSearchParams } from "react-router";
import { useState, useEffect } from "react";
import type { Route } from "./+types/admin.edit.$id";
import { TiptapEditor } from "../components/TiptapEditor";
import { getArticleById, updateArticle } from "../lib/articles.server";
import { requireAuth } from "../lib/auth.server";
import { signOut } from "../lib/auth.client";
import { generateSlug, calculateReadTime, type Article } from "../lib/utils";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Edit Article - Journal CMS" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

// Server-side loader
export async function loader({ request, params }: Route.LoaderArgs) {
  await requireAuth(request);
  const article = await getArticleById(params.id);
  return { article: article || null };
}

// Server-side action for update
export async function action({ request, params }: Route.ActionArgs) {
  await requireAuth(request);
  const formData = await request.formData();

  const title = formData.get("title") as string;
  const subtitle = formData.get("subtitle") as string;
  const category = formData.get("category") as string;
  const author = formData.get("author") as string;
  const heroImage = formData.get("heroImage") as string;
  const content = formData.get("content") as string;
  const published = formData.get("published") === "true";

  await updateArticle(params.id, {
    title,
    subtitle,
    category,
    author,
    heroImage,
    content,
    published,
    slug: generateSlug(title),
    readTime: calculateReadTime(content),
  });

  return redirect(`/admin/edit/${params.id}?saved=true`);
}

export default function EditArticle({ loaderData }: Route.ComponentProps) {
  const { article } = loaderData;
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const saving = navigation.state === "submitting";
  const [saved, setSaved] = useState(searchParams.get("saved") === "true");

  const [formData, setFormData] = useState({
    title: article?.title || "",
    subtitle: article?.subtitle || "",
    category: article?.category || "",
    author: article?.author || "",
    heroImage: article?.heroImage || "",
    content: article?.content || "",
    published: article?.published || false,
  });

  useEffect(() => {
    if (saved) {
      const timer = setTimeout(() => setSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saved]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleContentChange = (html: string) => {
    setFormData((prev) => ({ ...prev, content: html }));
  };

  if (!article) {
    return (
      <div className="admin-layout">
        <header className="admin-header">
          <div className="admin-header-content">
            <Link to="/admin" className="admin-logo">
              Journal <span>CMS</span>
            </Link>
          </div>
        </header>
        <main className="admin-main">
          <div className="admin-container">
            <div className="admin-empty">
              <p>Article not found</p>
              <Link to="/admin" className="admin-btn admin-btn-primary">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <Link to="/admin" className="admin-logo">
            Journal <span>CMS</span>
          </Link>
          <nav className="admin-nav">
            <Link to="/admin" className="admin-nav-link">
              ← Back to Dashboard
            </Link>
            <button
              type="button"
              className="admin-nav-link admin-logout-btn"
              onClick={() =>
                signOut().then(() => (window.location.href = "/login"))
              }
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Save notification */}
      {saved && (
        <div className="admin-notification success">
          ✓ Article saved successfully
        </div>
      )}

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-container">
          <form method="post" className="admin-form">
            {/* Hidden inputs for form data */}
            <input type="hidden" name="title" value={formData.title} />
            <input type="hidden" name="subtitle" value={formData.subtitle} />
            <input type="hidden" name="category" value={formData.category} />
            <input type="hidden" name="author" value={formData.author} />
            <input type="hidden" name="heroImage" value={formData.heroImage} />
            <input type="hidden" name="content" value={formData.content} />
            <input
              type="hidden"
              name="published"
              value={formData.published.toString()}
            />

            {/* Page Header */}
            <div className="admin-page-header">
              <div>
                <h1>Edit Article</h1>
                <p className="admin-subtitle">
                  Last updated:{" "}
                  {new Date(article.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="admin-header-actions">
                <Link
                  to={`/article/${article.slug}`}
                  className="admin-btn admin-btn-secondary"
                >
                  View Article
                </Link>
                <label className="admin-toggle">
                  <input
                    type="checkbox"
                    name="published"
                    checked={formData.published}
                    onChange={handleChange}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label">
                    {formData.published ? "Published" : "Draft"}
                  </span>
                </label>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={saving || !formData.title || !formData.content}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="admin-form-grid">
              {/* Main Column */}
              <div className="admin-form-main">
                <div className="admin-form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter article title"
                    required
                  />
                  {formData.title && (
                    <span className="admin-slug-preview">
                      Slug: {generateSlug(formData.title)}
                    </span>
                  )}
                </div>

                <div className="admin-form-group">
                  <label htmlFor="subtitle">Subtitle</label>
                  <textarea
                    id="subtitle"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleChange}
                    placeholder="A brief description or teaser"
                    rows={2}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Content</label>
                  <TiptapEditor
                    content={formData.content}
                    onChange={handleContentChange}
                    placeholder="Start writing your article..."
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="admin-form-sidebar">
                <div className="admin-form-group">
                  <label htmlFor="category">Category</label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g., Mindfulness"
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="author">Author</label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    placeholder="Author name"
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="heroImage">Hero Image URL</label>
                  <input
                    type="url"
                    id="heroImage"
                    name="heroImage"
                    value={formData.heroImage}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                  {formData.heroImage && (
                    <div className="admin-image-preview">
                      <img src={formData.heroImage} alt="Preview" />
                    </div>
                  )}
                </div>

                <div className="admin-form-info">
                  <h4>Article Info</h4>
                  <ul>
                    <li>
                      <strong>Created:</strong>{" "}
                      {new Date(article.createdAt).toLocaleDateString()}
                    </li>
                    <li>
                      <strong>Read time:</strong>{" "}
                      {calculateReadTime(formData.content)}
                    </li>
                    <li>
                      <strong>ID:</strong> {article.id.slice(0, 8)}...
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
