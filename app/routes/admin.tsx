import { Link, redirect } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/admin";
import { signOut } from "../lib/auth.client";
import {
  FileText,
  Image,
  Settings,
  Users,
  ExternalLink,
  LogOut,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Check,
  FileStack,
  Send,
  FileEdit,
} from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin Dashboard - Journal CMS" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

// Server-side loader
export async function loader({ request }: Route.LoaderArgs) {
  const { getArticles, canDeleteArticle } =
    await import("../lib/articles.server");
  const { requireAuthWithRole } = await import("../lib/auth.server");

  const session = await requireAuthWithRole(request);
  const allArticles = await getArticles();

  // Filter articles based on role
  // Admins and editors see all articles
  // Authors only see their own
  const articles =
    session.user.role === "admin" || session.user.role === "editor"
      ? allArticles
      : allArticles.filter((a) => a.authorId === session.user.id);

  // Add canDelete flag to each article
  const articlesWithPermissions = articles.map((article) => ({
    ...article,
    canDelete: canDeleteArticle(article, session.user.id, session.user.role),
  }));

  return {
    articles: articlesWithPermissions,
    user: session.user,
  };
}

// Server-side action for delete
export async function action({ request }: Route.ActionArgs) {
  const { getArticles, deleteArticle, canDeleteArticle } =
    await import("../lib/articles.server");
  const { requireAuthWithRole } = await import("../lib/auth.server");

  const session = await requireAuthWithRole(request);
  const formData = await request.formData();
  const id = formData.get("id") as string;
  const actionType = formData.get("_action") as string;

  if (actionType === "delete" && id) {
    // Get the article to check permissions
    const allArticles = await getArticles();
    const article = allArticles.find((a) => a.id === id);

    if (
      article &&
      canDeleteArticle(article, session.user.id, session.user.role)
    ) {
      await deleteArticle(id);
    }
  }

  return redirect("/admin");
}

export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
  const { articles, user } = loaderData;
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const formatDate = (dateInput: Date | string) => {
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="admin-layout">
      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <Link to="/" className="admin-logo">
            Journal <span>CMS</span>
          </Link>
          <nav className="admin-nav">
            <Link to="/admin" className="admin-nav-link active">
              <FileText size={16} />
              Articles
            </Link>
            <Link to="/admin/media" className="admin-nav-link">
              <Image size={16} />
              Media
            </Link>
            {(user.role === "admin" || user.role === "editor") && (
              <Link to="/admin/settings" className="admin-nav-link">
                <Settings size={16} />
                Settings
              </Link>
            )}
            {user.role === "admin" && (
              <Link to="/admin/users" className="admin-nav-link">
                <Users size={16} />
                Users
              </Link>
            )}
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
          {/* Page Header */}
          <div className="admin-page-header">
            <div>
              <h1>Articles</h1>
              <p className="admin-subtitle">
                {user.role === "author"
                  ? "Manage your blog posts"
                  : "Manage all blog posts and content"}
              </p>
            </div>
            <Link to="/admin/new" className="admin-btn admin-btn-primary">
              <Plus size={16} />
              New Article
            </Link>
          </div>

          {/* User Info Badge */}
          <div className="admin-user-badge">
            <span>
              Logged in as <strong>{user.name}</strong>
            </span>
            <span className={`role-badge role-${user.role}`}>{user.role}</span>
          </div>

          {/* Stats */}
          <div className="admin-stats">
            <div className="admin-stat-card">
              <span className="admin-stat-number">{articles.length}</span>
              <span className="admin-stat-label">
                {user.role === "author" ? "Your Articles" : "Total Articles"}
              </span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-number">
                {articles.filter((a) => a.published).length}
              </span>
              <span className="admin-stat-label">Published</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-number">
                {articles.filter((a) => !a.published).length}
              </span>
              <span className="admin-stat-label">Drafts</span>
            </div>
          </div>

          {/* Articles Table */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <div className="admin-article-title">
                        <strong>{article.title}</strong>
                        <span className="admin-article-slug">
                          /{article.slug}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-author-name">
                        {article.authorUser?.name || article.author}
                      </span>
                    </td>
                    <td>
                      <span className="admin-category-badge">
                        {article.category}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`admin-status-badge ${
                          article.published ? "published" : "draft"
                        }`}
                      >
                        {article.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="admin-date">
                      {formatDate(article.updatedAt)}
                    </td>
                    <td>
                      <div className="admin-actions">
                        <Link
                          to={`/article/${article.slug}`}
                          className="admin-action-btn"
                          title="View"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          to={`/admin/edit/${article.id}`}
                          className="admin-action-btn"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </Link>
                        {article.canDelete && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirm(
                                  deleteConfirm === article.id
                                    ? null
                                    : article.id
                                )
                              }
                              className={`admin-action-btn delete ${
                                deleteConfirm === article.id ? "confirm" : ""
                              }`}
                              title={
                                deleteConfirm === article.id
                                  ? "Click confirm to delete"
                                  : "Delete"
                              }
                            >
                              <Trash2 size={14} />
                            </button>
                            {deleteConfirm === article.id && (
                              <form method="post" style={{ display: "inline" }}>
                                <input
                                  type="hidden"
                                  name="id"
                                  value={article.id}
                                />
                                <input
                                  type="hidden"
                                  name="_action"
                                  value="delete"
                                />
                                <button
                                  type="submit"
                                  className="admin-action-btn delete confirm"
                                  title="Confirm delete"
                                >
                                  <Check size={14} />
                                </button>
                              </form>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {articles.length === 0 && (
              <div className="admin-empty">
                <p>No articles yet.</p>
                <Link to="/admin/new" className="admin-btn admin-btn-primary">
                  Create your first article
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
