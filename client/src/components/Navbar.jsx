import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav
      className="sticky top-0 z-50 border-b border-border backdrop-blur-md"
      style={{ background: "rgba(10,14,26,0.95)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link to="/" className="flex flex-col leading-tight">
          <span className="text-base font-700 text-text">
            כלי המשכנתא<span className="text-primary">.</span>
          </span>
          <span className="text-xs text-muted hidden sm:block">
            זה לא יועץ משכנתאות. זה יותר טוב.
          </span>
        </Link>
        <Link to="/form" className="btn-primary text-sm py-2 px-4">
          התחל ניתוח
        </Link>
      </div>
    </nav>
  );
}
