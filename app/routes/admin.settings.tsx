import { Link, redirect, useNavigation } from "react-router";
import { useState, useEffect } from "react";
import type { Route } from "./+types/admin.settings";
import { signOut } from "../lib/auth.client";
import {
  FileText,
  Image,
  Settings,
  Users,
  ExternalLink,
  LogOut,
  Check,
  Save,
} from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Settings - Journal CMS" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

// Server-side loader
export async function loader({ request }: Route.LoaderArgs) {
  const { requireAuthWithRole } = await import("../lib/auth.server");
  const { getSiteSettings } = await import("../lib/settings.server");

  const session = await requireAuthWithRole(request);

  // Only admin and editor can access settings
  if (session.user.role !== "admin" && session.user.role !== "editor") {
    throw redirect("/admin");
  }

  const settings = await getSiteSettings();
  return { settings, user: session.user };
}

// Server-side action for update
export async function action({ request }: Route.ActionArgs) {
  const { requireAuthWithRole } = await import("../lib/auth.server");
  const { updateSiteSettings } = await import("../lib/settings.server");

  const session = await requireAuthWithRole(request);

  // Only admin and editor can update settings
  if (session.user.role !== "admin" && session.user.role !== "editor") {
    throw redirect("/admin");
  }

  const formData = await request.formData();

  await updateSiteSettings({
    // General
    siteName: formData.get("siteName") as string,
    siteTagline: formData.get("siteTagline") as string,
    siteDescription: formData.get("siteDescription") as string,
    // Social
    socialTwitter: (formData.get("socialTwitter") as string) || null,
    socialGithub: (formData.get("socialGithub") as string) || null,
    socialLinkedin: (formData.get("socialLinkedin") as string) || null,
    socialInstagram: (formData.get("socialInstagram") as string) || null,
    // Footer
    footerText: formData.get("footerText") as string,
    // Hero Section
    heroTitle: formData.get("heroTitle") as string,
    heroTitleAccent: formData.get("heroTitleAccent") as string,
    heroDescription: formData.get("heroDescription") as string,
    heroImage: (formData.get("heroImage") as string) || null,
    heroCtaText: formData.get("heroCtaText") as string,
    heroCtaLink: formData.get("heroCtaLink") as string,
    // About Page
    aboutHeroTitle: formData.get("aboutHeroTitle") as string,
    aboutHeroSubtitle: formData.get("aboutHeroSubtitle") as string,
    aboutIntroTitle: formData.get("aboutIntroTitle") as string,
    aboutIntroParagraph1: formData.get("aboutIntroParagraph1") as string,
    aboutIntroParagraph2:
      (formData.get("aboutIntroParagraph2") as string) || null,
    aboutIntroParagraph3:
      (formData.get("aboutIntroParagraph3") as string) || null,
    aboutEmail: (formData.get("aboutEmail") as string) || null,
    aboutImage: (formData.get("aboutImage") as string) || null,
    // Values Section
    valuesSectionTitle: formData.get("valuesSectionTitle") as string,
    value1Title: formData.get("value1Title") as string,
    value1Description: formData.get("value1Description") as string,
    value2Title: (formData.get("value2Title") as string) || null,
    value2Description: (formData.get("value2Description") as string) || null,
    value3Title: (formData.get("value3Title") as string) || null,
    value3Description: (formData.get("value3Description") as string) || null,
    // Newsletter
    newsletterTitle: formData.get("newsletterTitle") as string,
    newsletterDescription: formData.get("newsletterDescription") as string,
    newsletterImage: (formData.get("newsletterImage") as string) || null,
    showNewsletter: formData.get("showNewsletter") === "true",
    // Security
    allowRegistration: formData.get("allowRegistration") === "true",
  });

  return redirect("/admin/settings?saved=true");
}

export default function AdminSettings({ loaderData }: Route.ComponentProps) {
  const { settings, user } = loaderData;
  const navigation = useNavigation();
  const saving = navigation.state === "submitting";
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("saved") === "true") {
      setSaved(true);
      window.history.replaceState({}, "", "/admin/settings");
      const timer = setTimeout(() => setSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

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
            <Link to="/admin/settings" className="admin-nav-link active">
              <Settings size={16} />
              Settings
            </Link>
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
              <h1>Site Settings</h1>
              <p className="admin-subtitle">
                Configure your blog's appearance and information
              </p>
            </div>
            {saved && (
              <div className="admin-saved-badge">
                <Check size={14} /> Settings saved
              </div>
            )}
          </div>

          {/* Settings Form */}
          <form method="post" className="admin-settings-form">
            {/* General Settings */}
            <section className="admin-settings-section">
              <h2 className="admin-settings-section-title">General</h2>
              <div className="admin-settings-grid">
                <div className="admin-form-group">
                  <label htmlFor="siteName">Site Name</label>
                  <input
                    type="text"
                    id="siteName"
                    name="siteName"
                    defaultValue={settings.siteName}
                    placeholder="My Blog"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="siteTagline">Tagline</label>
                  <input
                    type="text"
                    id="siteTagline"
                    name="siteTagline"
                    defaultValue={settings.siteTagline || ""}
                    placeholder="A short description of your blog"
                  />
                </div>
                <div className="admin-form-group full-width">
                  <label htmlFor="siteDescription">Site Description</label>
                  <textarea
                    id="siteDescription"
                    name="siteDescription"
                    defaultValue={settings.siteDescription || ""}
                    placeholder="A longer description for SEO and about sections"
                    rows={3}
                  />
                </div>
              </div>
            </section>

            {/* Hero Section */}
            <section className="admin-settings-section">
              <h2 className="admin-settings-section-title">
                Hero Section (Home Page)
              </h2>
              <div className="admin-settings-grid">
                <div className="admin-form-group">
                  <label htmlFor="heroTitle">Title (Line 1)</label>
                  <input
                    type="text"
                    id="heroTitle"
                    name="heroTitle"
                    defaultValue={settings.heroTitle || ""}
                    placeholder="Thoughts,"
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="heroTitleAccent">Title Accent (Line 2)</label>
                  <input
                    type="text"
                    id="heroTitleAccent"
                    name="heroTitleAccent"
                    defaultValue={settings.heroTitleAccent || ""}
                    placeholder="stories & ideas"
                  />
                </div>
                <div className="admin-form-group full-width">
                  <label htmlFor="heroDescription">Description</label>
                  <textarea
                    id="heroDescription"
                    name="heroDescription"
                    defaultValue={settings.heroDescription || ""}
                    placeholder="Welcome message or intro text"
                    rows={3}
                  />
                </div>
                <div className="admin-form-group full-width">
                  <label htmlFor="heroImage">Hero Image URL</label>
                  <input
                    type="url"
                    id="heroImage"
                    name="heroImage"
                    defaultValue={settings.heroImage || ""}
                    placeholder="https://example.com/hero.jpg"
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="heroCtaText">CTA Button Text</label>
                  <input
                    type="text"
                    id="heroCtaText"
                    name="heroCtaText"
                    defaultValue={settings.heroCtaText || ""}
                    placeholder="Learn more about me →"
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="heroCtaLink">CTA Button Link</label>
                  <input
                    type="text"
                    id="heroCtaLink"
                    name="heroCtaLink"
                    defaultValue={settings.heroCtaLink || ""}
                    placeholder="/about"
                  />
                </div>
              </div>
            </section>

            {/* About Page */}
            <section className="admin-settings-section">
              <h2 className="admin-settings-section-title">About Page</h2>
              <div className="admin-settings-grid">
                <div className="admin-form-group">
                  <label htmlFor="aboutHeroTitle">Hero Title</label>
                  <input
                    type="text"
                    id="aboutHeroTitle"
                    name="aboutHeroTitle"
                    defaultValue={settings.aboutHeroTitle || ""}
                    placeholder="Hello, I'm"
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="aboutHeroSubtitle">
                    Hero Subtitle (Accent)
                  </label>
                  <input
                    type="text"
                    id="aboutHeroSubtitle"
                    name="aboutHeroSubtitle"
                    defaultValue={settings.aboutHeroSubtitle || ""}
                    placeholder="a storyteller"
                  />
                </div>
                <div className="admin-form-group full-width">
                  <label htmlFor="aboutIntroTitle">Intro Section Title</label>
                  <input
                    type="text"
                    id="aboutIntroTitle"
                    name="aboutIntroTitle"
                    defaultValue={settings.aboutIntroTitle || ""}
                    placeholder="A little about me"
                  />
                </div>
                <div className="admin-form-group full-width">
                  <label htmlFor="aboutIntroParagraph1">
                    Intro Paragraph 1
                  </label>
                  <textarea
                    id="aboutIntroParagraph1"
                    name="aboutIntroParagraph1"
                    defaultValue={settings.aboutIntroParagraph1 || ""}
                    placeholder="First paragraph about yourself..."
                    rows={3}
                  />
                </div>
                <div className="admin-form-group full-width">
                  <label htmlFor="aboutIntroParagraph2">
                    Intro Paragraph 2
                  </label>
                  <textarea
                    id="aboutIntroParagraph2"
                    name="aboutIntroParagraph2"
                    defaultValue={settings.aboutIntroParagraph2 || ""}
                    placeholder="Second paragraph (optional)..."
                    rows={3}
                  />
                </div>
                <div className="admin-form-group full-width">
                  <label htmlFor="aboutIntroParagraph3">
                    Intro Paragraph 3
                  </label>
                  <textarea
                    id="aboutIntroParagraph3"
                    name="aboutIntroParagraph3"
                    defaultValue={settings.aboutIntroParagraph3 || ""}
                    placeholder="Third paragraph (optional)..."
                    rows={3}
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="aboutEmail">Contact Email</label>
                  <input
                    type="email"
                    id="aboutEmail"
                    name="aboutEmail"
                    defaultValue={settings.aboutEmail || ""}
                    placeholder="hello@example.com"
                  />
                </div>
                <div className="admin-form-group full-width">
                  <label htmlFor="aboutImage">About Page Image URL</label>
                  <input
                    type="url"
                    id="aboutImage"
                    name="aboutImage"
                    defaultValue={settings.aboutImage || ""}
                    placeholder="https://example.com/your-photo.jpg"
                  />
                </div>
              </div>
            </section>

            {/* Values Section */}
            <section className="admin-settings-section">
              <h2 className="admin-settings-section-title">
                Values Section (About Page)
              </h2>
              <div className="admin-settings-grid">
                <div className="admin-form-group full-width">
                  <label htmlFor="valuesSectionTitle">Section Title</label>
                  <input
                    type="text"
                    id="valuesSectionTitle"
                    name="valuesSectionTitle"
                    defaultValue={settings.valuesSectionTitle || ""}
                    placeholder="What I believe in"
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="value1Title">Value 1 Title</label>
                  <input
                    type="text"
                    id="value1Title"
                    name="value1Title"
                    defaultValue={settings.value1Title || ""}
                    placeholder="Intentionality"
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="value1Description">Value 1 Description</label>
                  <textarea
                    id="value1Description"
                    name="value1Description"
                    defaultValue={settings.value1Description || ""}
                    placeholder="Description for value 1..."
                    rows={2}
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="value2Title">Value 2 Title</label>
                  <input
                    type="text"
                    id="value2Title"
                    name="value2Title"
                    defaultValue={settings.value2Title || ""}
                    placeholder="Simplicity"
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="value2Description">Value 2 Description</label>
                  <textarea
                    id="value2Description"
                    name="value2Description"
                    defaultValue={settings.value2Description || ""}
                    placeholder="Description for value 2..."
                    rows={2}
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="value3Title">Value 3 Title</label>
                  <input
                    type="text"
                    id="value3Title"
                    name="value3Title"
                    defaultValue={settings.value3Title || ""}
                    placeholder="Connection"
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="value3Description">Value 3 Description</label>
                  <textarea
                    id="value3Description"
                    name="value3Description"
                    defaultValue={settings.value3Description || ""}
                    placeholder="Description for value 3..."
                    rows={2}
                  />
                </div>
              </div>
            </section>

            {/* Newsletter Section */}
            <section className="admin-settings-section">
              <h2 className="admin-settings-section-title">
                Newsletter Section
              </h2>
              <div className="admin-settings-grid">
                <div className="admin-form-group full-width">
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      name="showNewsletter"
                      value="true"
                      defaultChecked={settings.showNewsletter}
                    />
                    <span>Show newsletter section</span>
                  </label>
                  <p className="admin-field-hint">
                    When disabled, the newsletter section and subscribe links
                    will be hidden.
                  </p>
                </div>
                <div className="admin-form-group">
                  <label htmlFor="newsletterTitle">Title</label>
                  <input
                    type="text"
                    id="newsletterTitle"
                    name="newsletterTitle"
                    defaultValue={settings.newsletterTitle || ""}
                    placeholder="Stay in touch"
                  />
                </div>
                <div className="admin-form-group full-width">
                  <label htmlFor="newsletterDescription">Description</label>
                  <textarea
                    id="newsletterDescription"
                    name="newsletterDescription"
                    defaultValue={settings.newsletterDescription || ""}
                    placeholder="Subscribe to receive updates..."
                    rows={2}
                  />
                </div>
                <div className="admin-form-group full-width">
                  <label htmlFor="newsletterImage">Background Image URL</label>
                  <input
                    type="url"
                    id="newsletterImage"
                    name="newsletterImage"
                    defaultValue={settings.newsletterImage || ""}
                    placeholder="https://example.com/newsletter-bg.jpg"
                  />
                </div>
              </div>
            </section>

            {/* Social Links */}
            <section className="admin-settings-section">
              <h2 className="admin-settings-section-title">Social Links</h2>
              <div className="admin-settings-grid">
                <div className="admin-form-group">
                  <label htmlFor="socialTwitter">Twitter / X</label>
                  <input
                    type="url"
                    id="socialTwitter"
                    name="socialTwitter"
                    defaultValue={settings.socialTwitter || ""}
                    placeholder="https://twitter.com/username"
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="socialGithub">GitHub</label>
                  <input
                    type="url"
                    id="socialGithub"
                    name="socialGithub"
                    defaultValue={settings.socialGithub || ""}
                    placeholder="https://github.com/username"
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="socialLinkedin">LinkedIn</label>
                  <input
                    type="url"
                    id="socialLinkedin"
                    name="socialLinkedin"
                    defaultValue={settings.socialLinkedin || ""}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="socialInstagram">Instagram</label>
                  <input
                    type="url"
                    id="socialInstagram"
                    name="socialInstagram"
                    defaultValue={settings.socialInstagram || ""}
                    placeholder="https://instagram.com/username"
                  />
                </div>
              </div>
            </section>

            {/* Footer Settings */}
            <section className="admin-settings-section">
              <h2 className="admin-settings-section-title">Footer</h2>
              <div className="admin-settings-grid">
                <div className="admin-form-group full-width">
                  <label htmlFor="footerText">Footer Text</label>
                  <input
                    type="text"
                    id="footerText"
                    name="footerText"
                    defaultValue={settings.footerText || ""}
                    placeholder="© 2025 My Blog. All rights reserved."
                  />
                </div>
              </div>
            </section>

            {/* Security Settings */}
            <section className="admin-settings-section">
              <h2 className="admin-settings-section-title">Security</h2>
              <div className="admin-settings-grid">
                <div className="admin-form-group full-width">
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      name="allowRegistration"
                      value="true"
                      defaultChecked={settings.allowRegistration}
                    />
                    <span>Allow new user registration</span>
                  </label>
                  <p className="admin-field-hint">
                    When disabled, new users cannot create accounts. Only
                    existing users can log in.
                  </p>
                </div>
              </div>
            </section>

            {/* Submit */}
            <div className="admin-form-actions">
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
