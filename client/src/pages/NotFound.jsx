import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition.jsx";
import SEOMeta from "../components/SEOMeta.jsx";

export default function NotFound() {
  return (
    <PageTransition>
      <SEOMeta title="דף לא נמצא" />
      <main
        role="main"
        className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center"
      >
        <div className="text-8xl font-700 mb-2" style={{ color: "rgba(99,102,241,0.2)" }}>
          404
        </div>
        <h1 className="text-h2 mb-3">הדף לא נמצא</h1>
        <p className="text-muted text-sm mb-8 max-w-sm leading-relaxed">
          הדף שחיפשת אינו קיים. אולי הקישור שגוי, או שהדף הוסר.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link to="/" className="btn-primary">
            חזרה לדף הבית
          </Link>
          <Link to="/form" className="btn-outline">
            התחל ניתוח
          </Link>
        </div>
      </main>
    </PageTransition>
  );
}
