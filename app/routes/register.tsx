import { Link, useNavigate } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/register";
import { signUp } from "../lib/auth.client";
import { getSiteSettings } from "../lib/settings.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Register - Journal" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

// Server-side loader to check if registration is enabled
export async function loader() {
  const settings = await getSiteSettings();
  return { allowRegistration: settings.allowRegistration };
}

export default function Register({ loaderData }: Route.ComponentProps) {
  const { allowRegistration } = loaderData;
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If registration is disabled, show message
  if (!allowRegistration) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              Journal
            </Link>
            <h1>Registration Disabled</h1>
            <p>New account registration is currently not available.</p>
          </div>
          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
            <Link to="/" className="auth-back">
              ← Back to site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const result = await signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        setError(result.error.message || "Registration failed");
        setLoading(false);
        return;
      }

      navigate("/admin");
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            Journal
          </Link>
          <h1>Create an account</h1>
          <p>Get started with Journal CMS</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              autoComplete="name"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
          <Link to="/" className="auth-back">
            ← Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}
