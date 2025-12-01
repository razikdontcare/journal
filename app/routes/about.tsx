import { Link } from "react-router";
import type { Route } from "./+types/about";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { BackToTop } from "../components/BackToTop";
import { getSiteSettings } from "../lib/settings.server";

export function meta({ data }: Route.MetaArgs) {
  const settings = data?.settings;
  return [
    { title: `About - ${settings?.siteName || "Journal"}` },
    {
      name: "description",
      content:
        settings?.siteDescription ||
        "Learn more about the person behind this blog.",
    },
  ];
}

// Server-side loader
export async function loader() {
  const settings = await getSiteSettings();
  return { settings };
}

export default function About({ loaderData }: Route.ComponentProps) {
  const { settings } = loaderData;

  return (
    <>
      <Navigation
        siteName={settings.siteName}
        showNewsletter={settings.showNewsletter}
      />
      <BackToTop />

      {/* About Hero */}
      <section className="hero" style={{ minHeight: "60vh" }}>
        <div
          className="hero-content animate-fade-in-up"
          style={{ width: "100%" }}
        >
          <h1 className="hero-title" style={{ fontSize: "3.5rem" }}>
            {settings.aboutHeroTitle || "Hello, I'm"}
            <span>
              {settings.aboutHeroSubtitle ||
                settings.authorName ||
                "a storyteller"}
            </span>
          </h1>
          <p
            className="hero-desc animate-fade-in-up animate-delay-1"
            style={{ maxWidth: "600px" }}
          >
            {settings.siteDescription ||
              "Welcome to my digital garden—a space where thoughts bloom and ideas take root. I write about mindfulness, creativity, and the art of living intentionally."}
          </p>
        </div>
      </section>

      {/* About Content */}
      <section className="about-grid">
        <div>
          <img
            src={
              settings.aboutImage ||
              "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80"
            }
            alt={settings.authorName || "Portrait"}
            loading="lazy"
            style={{
              width: "100%",
              height: "auto",
              filter: "grayscale(30%)",
            }}
          />
        </div>
        <div style={{ paddingTop: "1rem" }}>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "2rem",
              marginBottom: "1.5rem",
              fontWeight: 400,
            }}
          >
            {settings.aboutIntroTitle || "A little about me"}
          </h2>
          {settings.aboutIntroParagraph1 && (
            <p
              style={{
                marginBottom: "1.5rem",
                lineHeight: 1.8,
                color: "var(--text-main)",
              }}
            >
              {settings.aboutIntroParagraph1}
            </p>
          )}
          {settings.aboutIntroParagraph2 && (
            <p
              style={{
                marginBottom: "1.5rem",
                lineHeight: 1.8,
                color: "var(--text-main)",
              }}
            >
              {settings.aboutIntroParagraph2}
            </p>
          )}
          {settings.aboutIntroParagraph3 && (
            <p
              style={{
                marginBottom: "2rem",
                lineHeight: 1.8,
                color: "var(--text-main)",
              }}
            >
              {settings.aboutIntroParagraph3}
            </p>
          )}
          <div
            style={{
              display: "flex",
              gap: "2rem",
              borderTop: "1px solid var(--line-color)",
              paddingTop: "2rem",
              flexWrap: "wrap",
            }}
          >
            {settings.aboutEmail && (
              <a
                href={`mailto:${settings.aboutEmail}`}
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  borderBottom: "1px solid var(--text-main)",
                  paddingBottom: "4px",
                }}
              >
                Say hello →
              </a>
            )}
            {settings.showNewsletter && (
              <a
                href="/#newsletter"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  borderBottom: "1px solid var(--text-main)",
                  paddingBottom: "4px",
                }}
              >
                Subscribe →
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <h2
          style={{
            fontFamily: "var(--font-sans)",
            textTransform: "uppercase",
            letterSpacing: "2px",
            fontSize: "0.9rem",
            marginBottom: "3rem",
          }}
        >
          {settings.valuesSectionTitle || "What I believe in"}
        </h2>
        <div className="values-grid">
          {settings.value1Title && (
            <div>
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.5rem",
                  marginBottom: "1rem",
                  fontWeight: 400,
                }}
              >
                {settings.value1Title}
              </h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>
                {settings.value1Description}
              </p>
            </div>
          )}
          {settings.value2Title && (
            <div>
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.5rem",
                  marginBottom: "1rem",
                  fontWeight: 400,
                }}
              >
                {settings.value2Title}
              </h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>
                {settings.value2Description}
              </p>
            </div>
          )}
          {settings.value3Title && (
            <div>
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.5rem",
                  marginBottom: "1rem",
                  fontWeight: 400,
                }}
              >
                {settings.value3Title}
              </h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>
                {settings.value3Description}
              </p>
            </div>
          )}
        </div>
      </section>

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
