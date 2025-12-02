import { Link, redirect, useNavigation } from "react-router";
import { useState, useRef } from "react";
import type { Route } from "./+types/admin.new";
import { TiptapEditor } from "../components/TiptapEditor";
import { createArticle } from "../lib/articles.server";
import { requireAuthWithRole } from "../lib/auth.server";
import { signOut } from "../lib/auth.client";
import {
  generateSlug,
  calculateReadTime,
  parseTags,
  formatTags,
} from "../lib/utils";
import {
  ArrowLeft,
  ExternalLink,
  LogOut,
  Save,
  Send,
  Upload,
  Loader2,
} from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New Article - Journal CMS" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

// Server-side loader to protect the route and get user info
export async function loader({ request }: Route.LoaderArgs) {
  const session = await requireAuthWithRole(request);
  return { user: session.user };
}

// Server-side action for create
export async function action({ request }: Route.ActionArgs) {
  const session = await requireAuthWithRole(request);
  const formData = await request.formData();

  const title = formData.get("title") as string;
  const subtitle = formData.get("subtitle") as string;
  const category = formData.get("category") as string;
  const heroImage = formData.get("heroImage") as string;
  const heroImageCaption = formData.get("heroImageCaption") as string;
  const content = formData.get("content") as string;
  const published = formData.get("published") === "true";
  const tagsString = formData.get("tags") as string;
  const seoTitle = formData.get("seoTitle") as string;
  const seoDescription = formData.get("seoDescription") as string;
  const seoKeywords = formData.get("seoKeywords") as string;
  const canonicalUrl = formData.get("canonicalUrl") as string;

  const article = await createArticle({
    title,
    subtitle,
    category,
    author: session.user.name, // Use logged-in user's name
    authorId: session.user.id, // Link to user account
    heroImage,
    heroImageCaption: heroImageCaption || null,
    content,
    published,
    slug: generateSlug(title),
    date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    readTime: calculateReadTime(content),
    tags: parseTags(tagsString),
    seoTitle: seoTitle || null,
    seoDescription: seoDescription || null,
    seoKeywords: seoKeywords || null,
    canonicalUrl: canonicalUrl || null,
  });

  return redirect(`/admin/edit/${article.id}?saved=true`);
}

export default function NewArticle({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  const navigation = useNavigation();
  const saving = navigation.state === "submitting";
  const [showSeoFields, setShowSeoFields] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    category: "",
    heroImage: "",
    heroImageCaption: "",
    content: "",
    published: false,
    tags: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    canonicalUrl: "",
  });

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

  const handleHeroImageUpload = async (file: File) => {
    setIsUploadingHero(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();
      setFormData((prev) => ({ ...prev, heroImage: data.url }));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setIsUploadingHero(false);
    }
  };

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
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
            <span className="admin-nav-divider" />
            <Link to="/" className="admin-nav-link view-site">
              <ExternalLink size={14} />
              View Site
            </Link>
            <Link
              to="/admin/profile"
              className="admin-nav-link admin-profile-link"
              title="My Profile"
            >
              <span className="profile-avatar-small">
                {user.image ? (
                  <img src={user.image} alt={user.name} />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </span>
            </Link>
            <button
              type="button"
              className="admin-nav-link admin-logout-btn"
              onClick={() =>
                signOut().then(() => (window.location.href = "/login"))
              }
            >
              <LogOut size={14} />
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-container">
          <form method="post" className="admin-form">
            {/* Hidden inputs for form data */}
            <input type="hidden" name="title" value={formData.title} />
            <input type="hidden" name="subtitle" value={formData.subtitle} />
            <input type="hidden" name="category" value={formData.category} />
            <input type="hidden" name="heroImage" value={formData.heroImage} />
            <input
              type="hidden"
              name="heroImageCaption"
              value={formData.heroImageCaption}
            />
            <input type="hidden" name="content" value={formData.content} />
            <input
              type="hidden"
              name="published"
              value={formData.published.toString()}
            />
            <input type="hidden" name="tags" value={formData.tags} />
            <input type="hidden" name="seoTitle" value={formData.seoTitle} />
            <input
              type="hidden"
              name="seoDescription"
              value={formData.seoDescription}
            />
            <input
              type="hidden"
              name="seoKeywords"
              value={formData.seoKeywords}
            />
            <input
              type="hidden"
              name="canonicalUrl"
              value={formData.canonicalUrl}
            />

            {/* Page Header */}
            <div className="admin-page-header">
              <div>
                <h1>New Article</h1>
                <p className="admin-subtitle">
                  Creating as <strong>{user.name}</strong>
                </p>
              </div>
              <div className="admin-header-actions">
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
                  {saving ? "Saving..." : "Save Article"}
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
                  <label htmlFor="tags">Tags</label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="tag1, tag2, tag3"
                  />
                  <span className="admin-field-hint">
                    Separate tags with commas
                  </span>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="heroImage">Hero Image</label>
                  <div className="hero-image-upload">
                    <div className="hero-upload-row">
                      <input
                        type="url"
                        id="heroImage"
                        name="heroImage"
                        value={formData.heroImage}
                        onChange={handleChange}
                        placeholder="Paste URL or upload an image..."
                        className="hero-url-input"
                      />
                      <input
                        type="file"
                        ref={heroFileInputRef}
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleHeroImageUpload(file);
                        }}
                        style={{ display: "none" }}
                      />
                      <button
                        type="button"
                        className="admin-btn admin-btn-secondary hero-upload-btn"
                        onClick={() => heroFileInputRef.current?.click()}
                        disabled={isUploadingHero}
                      >
                        {isUploadingHero ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Upload size={14} />
                        )}
                        {isUploadingHero ? "Uploading..." : "Upload"}
                      </button>
                    </div>
                    {formData.heroImage && (
                      <div className="admin-image-preview">
                        <img src={formData.heroImage} alt="Hero preview" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="heroImageCaption">
                    Image Credit / Caption
                  </label>
                  <input
                    type="text"
                    id="heroImageCaption"
                    name="heroImageCaption"
                    value={formData.heroImageCaption}
                    onChange={handleChange}
                    placeholder="e.g., Photo by John Doe on Unsplash"
                  />
                  <span className="admin-field-hint">
                    Optional credit or caption for the hero image
                  </span>
                </div>

                {/* SEO Section */}
                <div className="admin-form-section">
                  <button
                    type="button"
                    className="admin-section-toggle"
                    onClick={() => setShowSeoFields(!showSeoFields)}
                  >
                    {showSeoFields ? "▼" : "▶"} SEO Settings
                  </button>

                  {showSeoFields && (
                    <div className="admin-seo-fields">
                      <div className="admin-form-group">
                        <label htmlFor="seoTitle">SEO Title</label>
                        <input
                          type="text"
                          id="seoTitle"
                          name="seoTitle"
                          value={formData.seoTitle}
                          onChange={handleChange}
                          placeholder="Custom title for search engines"
                        />
                      </div>

                      <div className="admin-form-group">
                        <label htmlFor="seoDescription">SEO Description</label>
                        <textarea
                          id="seoDescription"
                          name="seoDescription"
                          value={formData.seoDescription}
                          onChange={handleChange}
                          placeholder="Meta description for search engines"
                          rows={2}
                        />
                      </div>

                      <div className="admin-form-group">
                        <label htmlFor="seoKeywords">SEO Keywords</label>
                        <input
                          type="text"
                          id="seoKeywords"
                          name="seoKeywords"
                          value={formData.seoKeywords}
                          onChange={handleChange}
                          placeholder="keyword1, keyword2"
                        />
                      </div>

                      <div className="admin-form-group">
                        <label htmlFor="canonicalUrl">Canonical URL</label>
                        <input
                          type="url"
                          id="canonicalUrl"
                          name="canonicalUrl"
                          value={formData.canonicalUrl}
                          onChange={handleChange}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="admin-form-info">
                  <h4>Tips</h4>
                  <ul>
                    <li>Use H2 for main sections</li>
                    <li>Use H3 for subsections</li>
                    <li>Quotes create styled blockquotes</li>
                    <li>Images from Unsplash work great</li>
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
