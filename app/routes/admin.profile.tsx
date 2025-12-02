import { Link, Form, useNavigation } from "react-router";
import { useState, useRef, useEffect } from "react";
import type { Route } from "./+types/admin.profile";
import { signOut } from "../lib/auth.client";
import {
  FileText,
  Image,
  Settings,
  Users,
  ExternalLink,
  LogOut,
  Upload,
  Save,
  Calendar,
  Shield,
  Hash,
} from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Profile - Journal CMS" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

// Server-side loader
export async function loader({ request }: Route.LoaderArgs) {
  const { requireAuthWithRole, getUserById } =
    await import("../lib/auth.server");

  const session = await requireAuthWithRole(request);
  const user = await getUserById(session.user.id);

  return {
    user: {
      id: user?.id || session.user.id,
      name: user?.name || session.user.name,
      email: user?.email || session.user.email,
      image: user?.image || session.user.image,
      role: session.user.role,
      createdAt: user?.createdAt,
    },
  };
}

// Server-side action
export async function action({ request }: Route.ActionArgs) {
  const { requireAuthWithRole, updateUserProfile } =
    await import("../lib/auth.server");
  const { uploadImage } = await import("../lib/s3.server");

  const session = await requireAuthWithRole(request);
  const formData = await request.formData();
  const actionType = formData.get("_action") as string;

  if (actionType === "updateProfile") {
    const name = formData.get("name") as string;
    const image = formData.get("image") as string;

    if (!name || name.trim().length < 2) {
      return { error: "Name must be at least 2 characters" };
    }

    try {
      await updateUserProfile(session.user.id, {
        name: name.trim(),
        image: image?.trim() || null,
      });
      return { success: true, message: "Profile updated successfully" };
    } catch (error) {
      return { error: "Failed to update profile" };
    }
  }

  if (actionType === "uploadAvatar") {
    const file = formData.get("avatar") as File;

    if (!file || file.size === 0) {
      return { error: "Please select an image to upload" };
    }

    // Validate it's an image
    if (!file.type.startsWith("image/")) {
      return { error: "Please upload an image file" };
    }

    // Upload to S3
    const result = await uploadImage(file, file.name, session.user.id);

    if (!result.success) {
      return { error: result.error || "Failed to upload image" };
    }

    // Update user profile with new image URL
    try {
      await updateUserProfile(session.user.id, {
        name: session.user.name,
        image: result.url || null,
      });
      return {
        success: true,
        message: "Profile image uploaded successfully",
        newImageUrl: result.url,
      };
    } catch (error) {
      return { error: "Failed to update profile with new image" };
    }
  }

  return { error: "Invalid action" };
}

export default function AdminProfile({
  loaderData,
  actionData,
}: {
  loaderData: {
    user: {
      id: string;
      name: string;
      email: string;
      image: string | null;
      role: string;
      createdAt: Date | undefined;
    };
  };
  actionData?: {
    success?: boolean;
    message?: string;
    error?: string;
    newImageUrl?: string;
  };
}) {
  const { user } = loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use the new image URL if just uploaded, otherwise use existing
  const currentImage = actionData?.newImageUrl || user.image || "";
  const [imagePreview, setImagePreview] = useState(currentImage);
  const [imageUrl, setImageUrl] = useState(currentImage);

  // Update state when a new image is uploaded
  useEffect(() => {
    if (actionData?.newImageUrl) {
      setImagePreview(actionData.newImageUrl);
      setImageUrl(actionData.newImageUrl);
    }
  }, [actionData?.newImageUrl]);

  const formatDate = (dateInput: Date | string | undefined) => {
    if (!dateInput) return "Unknown";
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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
            <Link to="/admin" className="admin-nav-link">
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
              <h1>My Profile</h1>
              <p className="admin-subtitle">Update your personal information</p>
            </div>
          </div>

          {/* Success/Error Messages */}
          {actionData?.success && (
            <div className="admin-alert success">{actionData.message}</div>
          )}
          {actionData?.error && (
            <div className="admin-alert error">{actionData.error}</div>
          )}

          <div className="profile-layout">
            {/* Profile Card */}
            <div className="profile-card">
              <div className="profile-card-header">
                <div className="profile-avatar-large">
                  {imagePreview ? (
                    <img src={imagePreview} alt={user.name} />
                  ) : (
                    <span>{user.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="profile-card-info">
                  <h2>{user.name}</h2>
                  <p className="profile-email">{user.email}</p>
                  <span className={`role-badge ${user.role}`}>{user.role}</span>
                </div>
              </div>
              <div className="profile-card-meta">
                <div className="profile-meta-item">
                  <span className="profile-meta-label">Member since</span>
                  <span className="profile-meta-value">
                    {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            <div className="profile-form-card">
              <h3>Edit Profile</h3>

              {/* Avatar Upload Section */}
              <div className="profile-avatar-upload">
                <label>Profile Photo</label>
                <div className="avatar-upload-area">
                  <div className="avatar-preview">
                    {imagePreview ? (
                      <img src={imagePreview} alt={user.name} />
                    ) : (
                      <span>{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="avatar-upload-controls">
                    <Form
                      method="post"
                      encType="multipart/form-data"
                      className="avatar-upload-form"
                    >
                      <input
                        type="hidden"
                        name="_action"
                        value="uploadAvatar"
                      />
                      <input
                        type="file"
                        name="avatar"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Show preview
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setImagePreview(event.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="avatar-file-input"
                      />
                      <button
                        type="button"
                        className="admin-btn admin-btn-secondary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose Photo
                      </button>
                      <button
                        type="submit"
                        className="admin-btn admin-btn-primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Uploading..." : "Upload"}
                      </button>
                    </Form>
                    <span className="admin-form-hint">
                      JPG, PNG, GIF or WebP. Max 10MB.
                    </span>
                  </div>
                </div>
              </div>

              <Form method="post" className="profile-form">
                <input type="hidden" name="_action" value="updateProfile" />
                <input type="hidden" name="image" value={imageUrl} />

                <div className="admin-form-group">
                  <label htmlFor="name">Display Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={user.name}
                    required
                    minLength={2}
                    placeholder="Your name"
                  />
                  <span className="admin-form-hint">
                    This is how your name will appear on articles you write
                  </span>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={user.email}
                    disabled
                    className="input-disabled"
                  />
                  <span className="admin-form-hint">
                    Email cannot be changed
                  </span>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="imageUrl">Profile Image URL</label>
                  <input
                    type="url"
                    id="imageUrl"
                    value={imageUrl}
                    placeholder="Upload an image above or paste a URL"
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImagePreview(e.target.value);
                    }}
                  />
                  <span className="admin-form-hint">
                    Auto-filled when you upload, or enter a URL manually
                  </span>
                </div>

                <div className="admin-form-actions">
                  <button
                    type="submit"
                    className="admin-btn admin-btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </Form>
            </div>
          </div>

          {/* Account Info */}
          <div className="profile-section">
            <h3>Account Information</h3>
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <span className="profile-info-label">Role</span>
                <span className="profile-info-value">
                  <span className={`role-badge ${user.role}`}>{user.role}</span>
                  <span className="profile-role-desc">
                    {user.role === "admin" &&
                      "Full access to all features and settings"}
                    {user.role === "editor" &&
                      "Can edit all articles and access settings"}
                    {user.role === "author" &&
                      "Can create and edit own articles"}
                  </span>
                </span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">User ID</span>
                <span className="profile-info-value profile-id">{user.id}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
