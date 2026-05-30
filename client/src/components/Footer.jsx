import { Link } from "react-router-dom";

const NAV_LINKS = [
  { to: "/", label: "ראשי" },
  { to: "/form", label: "הפק דוח" },
  { to: "/faq", label: "שאלות נפוצות" },
  { to: "/about", label: "אודות" },
  { to: "/contact", label: "צור קשר" },
];

const LEGAL_LINKS = [
  { to: "/privacy", label: "מדיניות פרטיות" },
  { to: "/terms", label: "תנאי שימוש" },
  { to: "/cookies", label: "מדיניות עוגיות" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border mt-auto" style={{ background: "rgba(10,14,26,0.98)" }}>
      <div className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">

        {/* Brand */}
        <div>
          <div className="text-base font-700 text-text mb-1">
            כלי המשכנתא<span className="text-primary">.</span>
          </div>
          <div className="text-xs text-primary italic mb-3">
            זה לא יועץ משכנתאות. זה יותר טוב.
          </div>
          <p className="text-xs text-muted leading-relaxed max-w-xs">
            כלי מידע ניטרלי לשוק המשכנתאות הישראלי. אינו ייעוץ משכנתאות ואינו תחליף לבעל רישיון.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-xs font-700 uppercase tracking-wider text-muted mb-3">ניווט</h3>
          <ul className="space-y-1.5">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-sm text-muted hover:text-text transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-xs font-700 uppercase tracking-wider text-muted mb-3">משפטי</h3>
          <ul className="space-y-1.5">
            {LEGAL_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-sm text-muted hover:text-text transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/50 py-4 px-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} כלי המשכנתא · כל הזכויות שמורות ·{" "}
        <span className="italic">המידע הוא מידע בלבד ואינו ייעוץ משכנתאות</span>
      </div>
    </footer>
  );
}
