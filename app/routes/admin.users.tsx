import { Link, Form, useNavigation } from "react-router";
import type { Route } from "./+types/admin.users";
import {
  requireAuthWithRole,
  getAllUsers,
  updateUserRole,
} from "../lib/auth.server";
import { signOut } from "../lib/auth.client";
import type { UserRole } from "../lib/db/schema";
import {
  FileText,
  Image,
  Settings,
  Users,
  ExternalLink,
  LogOut,
  Shield,
  PenTool,
  UserCircle,
} from "lucide-react";

// Define types for loader and action data
type User = {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  image: string | null;
  createdAt: Date;
};

type LoaderData = {
  users: User[];
  currentUser: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role: UserRole;
  };
};

type ActionData = {
  error?: string;
  success?: boolean;
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "User Management - Journal CMS" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

// Server-side loader
export async function loader({ request }: Route.LoaderArgs) {
  const session = await requireAuthWithRole(request);

  // Only admins can access user management
  if (session.user.role !== "admin") {
    throw new Response("Forbidden", { status: 403 });
  }

  const users = await getAllUsers();

  return {
    users,
    currentUser: session.user,
  };
}

// Server-side action for role updates
export async function action({ request }: Route.ActionArgs) {
  const session = await requireAuthWithRole(request);

  // Only admins can update roles
  if (session.user.role !== "admin") {
    throw new Response("Forbidden", { status: 403 });
  }

  const formData = await request.formData();
  const userId = formData.get("userId") as string;
  const newRole = formData.get("role") as UserRole;

  if (userId && newRole) {
    // Prevent admin from demoting themselves
    if (userId === session.user.id) {
      return { error: "You cannot change your own role" };
    }

    await updateUserRole(userId, newRole);
  }

  return { success: true };
}

export default function AdminUsers({
  loaderData,
  actionData,
}: {
  loaderData: LoaderData;
  actionData?: ActionData;
}) {
  const { users, currentUser } = loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const formatDate = (dateInput: Date | string | null) => {
    if (!dateInput) return "Never";
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "admin":
        return "role-badge admin";
      case "editor":
        return "role-badge editor";
      default:
        return "role-badge author";
    }
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
            <Link to="/admin/settings" className="admin-nav-link">
              <Settings size={16} />
              Settings
            </Link>
            <Link to="/admin/users" className="admin-nav-link active">
              <Users size={16} />
              Users
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
                {currentUser.image ? (
                  <img src={currentUser.image} alt={currentUser.name} />
                ) : (
                  currentUser.name.charAt(0).toUpperCase()
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
              <h1>User Management</h1>
              <p className="admin-subtitle">
                {users.length} user{users.length !== 1 ? "s" : ""} registered
              </p>
            </div>
          </div>

          {/* Error/Success Messages */}
          {actionData?.error && (
            <div className="admin-alert error">{actionData.error}</div>
          )}

          {/* Role Legend */}
          <div className="role-legend">
            <h3>Role Permissions</h3>
            <div className="role-legend-items">
              <div className="role-legend-item">
                <span className="role-badge admin">Admin</span>
                <span>
                  Full access: manage users, settings, all articles, and media
                </span>
              </div>
              <div className="role-legend-item">
                <span className="role-badge editor">Editor</span>
                <span>
                  Can edit all articles, manage media, and access settings
                </span>
              </div>
              <div className="role-legend-item">
                <span className="role-badge author">Author</span>
                <span>Can create and edit own articles only</span>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Current Role</th>
                  <th>Created</th>
                  <th>Change Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={user.id === currentUser.id ? "current-user" : ""}
                  >
                    <td>
                      <div className="user-name">
                        {user.image && (
                          <img
                            src={user.image}
                            alt=""
                            className="user-avatar"
                          />
                        )}
                        <span>{user.name}</span>
                        {user.id === currentUser.id && (
                          <span className="you-badge">(you)</span>
                        )}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className={getRoleBadgeClass(user.role || "author")}
                      >
                        {user.role || "author"}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      {user.id === currentUser.id ? (
                        <span className="text-muted">
                          Cannot change own role
                        </span>
                      ) : (
                        <Form method="post" className="role-form">
                          <input type="hidden" name="userId" value={user.id} />
                          <select
                            name="role"
                            defaultValue={user.role || "author"}
                            disabled={isSubmitting}
                            className="role-select"
                          >
                            <option value="author">Author</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="role-save-btn"
                          >
                            {isSubmitting ? "Saving..." : "Update"}
                          </button>
                        </Form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="admin-empty">
              <p>No users found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
