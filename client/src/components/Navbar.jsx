import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { to: "/", label: "בית" },
  { to: "/faq", label: "שאלות נפוצות" },
  { to: "/about", label: "אודות" },
  { to: "/contact", label: "צור קשר" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close on Escape key
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [menuOpen]);

  return (
    <nav
      aria-label="ניווט ראשי"
      className="sticky top-0 z-50 border-b border-border backdrop-blur-md"
      style={{ background: "rgba(10,14,26,0.95)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">

        {/* Logo */}
        <Link to="/" className="flex flex-col leading-tight">
          <span className="text-base font-700 text-text">
            כלי המשכנתא<span className="text-primary">.</span>
          </span>
          <span className="text-xs text-muted hidden sm:block">
            זה לא יועץ משכנתאות. זה יותר טוב.
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm transition-colors ${
                location.pathname === link.to
                  ? "text-text font-600"
                  : "text-muted hover:text-text"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link to="/form" className="btn-primary text-sm py-2 px-4">
            התחל ניתוח
          </Link>
          <button
            className="md:hidden btn-outline p-2"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "סגור תפריט" : "פתח תפריט"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="md:hidden border-t border-border px-4 py-3 space-y-0.5 animate-fade-up"
          style={{ background: "rgba(10,14,26,0.98)" }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block py-2.5 text-sm text-muted hover:text-text transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
