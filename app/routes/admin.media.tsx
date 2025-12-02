import { Link, useSearchParams } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/admin.media";
import { signOut } from "../lib/auth.client";
import { formatFileSize } from "../lib/utils";
import {
  FileText,
  Image,
  Settings,
  Users,
  ExternalLink,
  LogOut,
  Copy,
  Trash2,
  X,
  Calendar,
  User,
  HardDrive,
  FileType,
  Link as LinkIcon,
} from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Media Library - Journal CMS" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

// Server-side loader
export async function loader({ request }: Route.LoaderArgs) {
  const { getMedia } = await import("../lib/media.server");
  const { requireAuthWithRole, isEditorOrAdmin } =
    await import("../lib/auth.server");

  const session = await requireAuthWithRole(request);
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const mimeType = url.searchParams.get("type") || undefined;

  const mediaResult = await getMedia({ page, limit: 20, mimeType });

  return {
    media: mediaResult.items,
    pagination: {
      page: mediaResult.page,
      totalPages: mediaResult.totalPages,
      total: mediaResult.total,
      hasNext: mediaResult.hasNext,
      hasPrev: mediaResult.hasPrev,
    },
    user: session.user,
    canDelete: isEditorOrAdmin(session.user.role),
  };
}

// Server-side action for delete
export async function action({ request }: Route.ActionArgs) {
  const { requireAuthWithRole, isEditorOrAdmin } =
    await import("../lib/auth.server");
  const { deleteImage } = await import("../lib/s3.server");

  const session = await requireAuthWithRole(request);
  const formData = await request.formData();
  const actionType = formData.get("_action") as string;
  const mediaUrl = formData.get("mediaUrl") as string;

  if (actionType === "delete" && mediaUrl) {
    // Only admins, editors, or the uploader can delete
    if (isEditorOrAdmin(session.user.role)) {
      await deleteImage(mediaUrl);
    }
  }

  return { success: true };
}

export default function AdminMedia({ loaderData }: Route.ComponentProps) {
  const { media, pagination, user, canDelete } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const formatDate = (dateInput: Date | string) => {
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleFilterChange = (type: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (type) {
      newParams.set("type", type);
    } else {
      newParams.delete("type");
    }
    newParams.delete("page");
    setSearchParams(newParams);
  };

  const getPaginationUrl = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    if (page > 1) {
      newParams.set("page", page.toString());
    } else {
      newParams.delete("page");
    }
    return `/admin/media?${newParams.toString()}`;
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopySuccess(id);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const selectedItem = media.find((m) => m.id === selectedMedia);

  return (
    <div className="admin-layout">
      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <Link to="/" className="admin-logo">
            Journal <span>CMS</span>
          </Link>
          <nav className="admin-nav">
            <Link to="/admin" className="admin-nav-link">
              <FileText size={16} />
              Articles
            </Link>
            <Link to="/admin/media" className="admin-nav-link active">
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
              <h1>Media Library</h1>
              <p className="admin-subtitle">
                {pagination.total} file{pagination.total !== 1 ? "s" : ""}{" "}
                uploaded
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="media-filters">
            <select
              value={searchParams.get("type") || ""}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="filter-select"
            >
              <option value="">All Types</option>
              <option value="image/jpeg">JPEG</option>
              <option value="image/png">PNG</option>
              <option value="image/gif">GIF</option>
              <option value="image/webp">WebP</option>
              <option value="image/svg">SVG</option>
            </select>
          </div>

          {/* Media Grid */}
          <div className="media-grid">
            {media.map((item) => (
              <div
                key={item.id}
                className={`media-card ${
                  selectedMedia === item.id ? "selected" : ""
                }`}
                onClick={() =>
                  setSelectedMedia(selectedMedia === item.id ? null : item.id)
                }
              >
                <div className="media-card-image">
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.altText || item.originalFilename}
                    loading="lazy"
                  />
                </div>
                <div className="media-card-info">
                  <span
                    className="media-card-name"
                    title={item.originalFilename}
                  >
                    {item.originalFilename.length > 20
                      ? item.originalFilename.slice(0, 17) + "..."
                      : item.originalFilename}
                  </span>
                  <span className="media-card-meta">
                    {formatFileSize(item.size)}
                  </span>
                </div>
                <div className="media-card-actions">
                  <button
                    type="button"
                    className="media-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(item.url, item.id);
                    }}
                    title="Copy URL"
                  >
                    {copySuccess === item.id ? "✓" : "📋"}
                  </button>
                  {canDelete && (
                    <>
                      <button
                        type="button"
                        className={`media-action-btn delete ${
                          deleteConfirm === item.id ? "confirm" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(
                            deleteConfirm === item.id ? null : item.id
                          );
                        }}
                        title="Delete"
                      >
                        🗑
                      </button>
                      {deleteConfirm === item.id && (
                        <form
                          method="post"
                          style={{ display: "inline" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input type="hidden" name="mediaId" value={item.id} />
                          <input
                            type="hidden"
                            name="mediaUrl"
                            value={item.url}
                          />
                          <input type="hidden" name="_action" value="delete" />
                          <button
                            type="submit"
                            className="media-action-btn delete confirm"
                            title="Confirm delete"
                          >
                            ✓
                          </button>
                        </form>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {media.length === 0 && (
            <div className="admin-empty">
              <p>No media files uploaded yet.</p>
              <p className="admin-empty-hint">
                Upload images when creating articles using the editor.
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              {pagination.hasPrev && (
                <Link
                  to={getPaginationUrl(pagination.page - 1)}
                  className="pagination-btn"
                >
                  ← Previous
                </Link>
              )}
              <span className="pagination-info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              {pagination.hasNext && (
                <Link
                  to={getPaginationUrl(pagination.page + 1)}
                  className="pagination-btn"
                >
                  Next →
                </Link>
              )}
            </div>
          )}

          {/* Media Details Panel */}
          {selectedItem && (
            <div className="media-details-panel">
              <div className="media-details-header">
                <h3>Media Details</h3>
                <button
                  type="button"
                  className="media-details-close"
                  onClick={() => setSelectedMedia(null)}
                >
                  ✕
                </button>
              </div>
              <div className="media-details-preview">
                <img
                  src={selectedItem.url}
                  alt={selectedItem.altText || selectedItem.originalFilename}
                />
              </div>
              <div className="media-details-info">
                <div className="media-detail-row">
                  <span className="media-detail-label">Filename:</span>
                  <span className="media-detail-value">
                    {selectedItem.originalFilename}
                  </span>
                </div>
                <div className="media-detail-row">
                  <span className="media-detail-label">Type:</span>
                  <span className="media-detail-value">
                    {selectedItem.mimeType}
                  </span>
                </div>
                <div className="media-detail-row">
                  <span className="media-detail-label">Size:</span>
                  <span className="media-detail-value">
                    {formatFileSize(selectedItem.size)}
                  </span>
                </div>
                {selectedItem.width && selectedItem.height && (
                  <div className="media-detail-row">
                    <span className="media-detail-label">Dimensions:</span>
                    <span className="media-detail-value">
                      {selectedItem.width} × {selectedItem.height}
                    </span>
                  </div>
                )}
                <div className="media-detail-row">
                  <span className="media-detail-label">Uploaded:</span>
                  <span className="media-detail-value">
                    {formatDate(selectedItem.createdAt)}
                  </span>
                </div>
                {selectedItem.uploader && (
                  <div className="media-detail-row">
                    <span className="media-detail-label">Uploaded by:</span>
                    <span className="media-detail-value">
                      {selectedItem.uploader.name}
                    </span>
                  </div>
                )}
                <div className="media-detail-row">
                  <span className="media-detail-label">URL:</span>
                  <div className="media-detail-url">
                    <input
                      type="text"
                      value={selectedItem.url}
                      readOnly
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(selectedItem.url, "detail")
                      }
                    >
                      {copySuccess === "detail" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
