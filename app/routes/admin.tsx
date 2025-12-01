import { Link, useNavigate, redirect } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/admin";
import { getArticles, deleteArticle } from "../lib/articles.server";
import { requireAuth } from "../lib/auth.server";
import { signOut } from "../lib/auth.client";
import { type Article } from "../lib/utils";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin Dashboard - Journal CMS" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

// Server-side loader
export async function loader({ request }: Route.LoaderArgs) {
  await requireAuth(request);
  const articles = await getArticles();
  return { articles };
}

// Server-side action for delete
export async function action({ request }: Route.ActionArgs) {
  await requireAuth(request);
  const formData = await request.formData();
  const id = formData.get("id") as string;
  const action = formData.get("_action") as string;

  if (action === "delete" && id) {
    await deleteArticle(id);
  }

  return redirect("/admin");
}

export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
  const { articles } = loaderData;
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
              Articles
            </Link>
            <Link to="/admin/settings" className="admin-nav-link">
              Settings
            </Link>
            <Link to="/" className="admin-nav-link">
              View Site
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

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-container">
          {/* Page Header */}
          <div className="admin-page-header">
            <div>
              <h1>Articles</h1>
              <p className="admin-subtitle">
                Manage your blog posts and content
              </p>
            </div>
            <Link to="/admin/new" className="admin-btn admin-btn-primary">
              + New Article
            </Link>
          </div>

          {/* Stats */}
          <div className="admin-stats">
            <div className="admin-stat-card">
              <span className="admin-stat-number">{articles.length}</span>
              <span className="admin-stat-label">Total Articles</span>
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
                          👁
                        </Link>
                        <Link
                          to={`/admin/edit/${article.id}`}
                          className="admin-action-btn"
                          title="Edit"
                        >
                          ✏️
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirm(
                              deleteConfirm === article.id ? null : article.id
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
                          🗑
                        </button>
                        {deleteConfirm === article.id && (
                          <form method="post" style={{ display: "inline" }}>
                            <input type="hidden" name="id" value={article.id} />
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
                              ✓
                            </button>
                          </form>
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
