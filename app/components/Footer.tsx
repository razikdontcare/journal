import { Link } from "react-router";
import { Twitter, Github, Linkedin, Instagram } from "lucide-react";

interface FooterProps {
  siteName?: string;
  footerText?: string | null;
  socialTwitter?: string | null;
  socialGithub?: string | null;
  socialLinkedin?: string | null;
  socialInstagram?: string | null;
  showNewsletter?: boolean;
}

export function Footer({
  siteName = "Journal",
  footerText = "© 2025 Journal. All rights reserved.",
  socialTwitter,
  socialGithub,
  socialLinkedin,
  socialInstagram,
  showNewsletter = true,
}: FooterProps) {
  const hasSocials =
    socialTwitter || socialGithub || socialLinkedin || socialInstagram;

  return (
    <footer>
      <Link to="/" className="footer-logo">
        {siteName}
      </Link>
      <div className="footer-nav">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <a href="/#journal">Writing</a>
        {showNewsletter && <a href="/#newsletter">Subscribe</a>}
      </div>
      {hasSocials && (
        <div
          className="footer-social"
          style={{
            marginTop: "1.5rem",
            display: "flex",
            gap: "1.5rem",
            justifyContent: "center",
          }}
        >
          {socialTwitter && (
            <a
              href={socialTwitter}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <Twitter size={18} />
            </a>
          )}
          {socialGithub && (
            <a
              href={socialGithub}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Github size={18} />
            </a>
          )}
          {socialLinkedin && (
            <a
              href={socialLinkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} />
            </a>
          )}
          {socialInstagram && (
            <a
              href={socialInstagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </a>
          )}
        </div>
      )}
      <p style={{ marginTop: "2rem", fontSize: "0.85rem" }}>{footerText}</p>
    </footer>
  );
}
