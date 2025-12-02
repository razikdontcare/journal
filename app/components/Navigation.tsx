import { Link, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { Search, LogIn } from "lucide-react";

interface NavigationProps {
  siteName?: string;
  showNewsletter?: boolean;
  draftBanner?: React.ReactNode;
}

export function Navigation({
  siteName = "Journal",
  showNewsletter = true,
}: NavigationProps) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Add shadow when scrolled
      setIsScrolled(currentScrollY > 50);

      // Hide/show based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/articles", label: "Articles" },
    { to: "/about", label: "About" },
    ...(showNewsletter
      ? [{ to: "/#newsletter", label: "Subscribe", isHash: true }]
      : []),
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path.startsWith("/#")) return false;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <div
        className={`nav-wrapper ${isHidden ? "nav-hidden" : ""} ${
          isScrolled ? "nav-scrolled" : ""
        }`}
      >
        <nav>
          <Link to="/" className="logo">
            {siteName}
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-links">
            {navLinks.map((link) =>
              link.isHash ? (
                <a
                  key={link.to}
                  href={link.to}
                  className={isActive(link.to) ? "active" : ""}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  className={isActive(link.to) ? "active" : ""}
                >
                  {link.label}
                </Link>
              )
            )}
            <Link
              to="/articles"
              className="nav-search-link"
              aria-label="Search articles"
            >
              <Search size={16} />
            </Link>
            <Link to="/login" className="nav-login-link" aria-label="Login">
              <LogIn size={16} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`mobile-menu-btn ${isMenuOpen ? "open" : ""}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>
      </div>

      {/* Mobile Navigation Overlay */}
      <div className={`mobile-nav-overlay ${isMenuOpen ? "open" : ""}`}>
        {navLinks.map((link) =>
          link.isHash ? (
            <a
              key={link.to}
              href={link.to}
              className={isActive(link.to) ? "active" : ""}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </a>
          ) : (
            <Link
              key={link.to}
              to={link.to}
              className={isActive(link.to) ? "active" : ""}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          )
        )}
        <Link
          to="/articles"
          className="mobile-search-link"
          onClick={() => setIsMenuOpen(false)}
        >
          Search Articles
        </Link>
        <Link
          to="/login"
          className="mobile-login-link"
          onClick={() => setIsMenuOpen(false)}
        >
          <LogIn size={16} /> Login
        </Link>
      </div>

      {/* Spacer for fixed nav */}
      <div className="nav-spacer" />
    </>
  );
}
