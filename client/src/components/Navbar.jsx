import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav
      className="sticky top-0 z-50 border-b border-border backdrop-blur-md"
      style={{ background: "rgba(10,14,26,0.95)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-1 text-xl font-700 text-text">
          כלי המשכנתא
          <span className="text-primary text-2xl leading-none">.</span>
        </Link>
        <Link to="/form" className="btn-primary text-sm py-2 px-4">
          התחל ניתוח
        </Link>
      </div>
    </nav>
  );
}
