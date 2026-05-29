import { Link } from "react-router-dom";
import {
  ShieldCheck,
  TrendingUp,
  Target,
  BarChart2,
  MessageCircle,
  FileText,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

function FeatureCard({ icon: Icon, color, title, desc }) {
  return (
    <div className="card card-hover p-5">
      <div
        className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ background: `${color}1a` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div className="text-sm font-700 mb-1">{title}</div>
      <p className="text-xs text-muted leading-relaxed">{desc}</p>
    </div>
  );
}

function ReportPreview() {
  return (
    <div className="card p-5 shadow-glow animate-float">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-muted font-600 uppercase tracking-wide">דוח ניתוח</span>
        <span className="badge bg-accent/15 text-accent text-xs">מוכן</span>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { l: "החזר חודשי", v: "₪6,420", c: "text-text" },
          { l: "% מהכנסה", v: "28%", c: "text-accent" },
          { l: "ריבית לדרוש", v: "4.6%", c: "text-primary" },
          { l: "עלות כוללת", v: "₪1.93M", c: "text-text" },
        ].map((k) => (
          <div key={k.l} className="rounded-lg bg-surface-2 p-3">
            <div className="text-xs text-muted mb-1">{k.l}</div>
            <div className={`text-base font-700 ${k.c}`}>{k.v}</div>
          </div>
        ))}
      </div>
      {/* mini sensitivity preview */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted">
          <span>ניתוח רגישות</span>
          <span>+2% ריבית</span>
        </div>
        {[
          { label: "שמרני", w: 62, c: "#10b981" },
          { label: "מאוזן", w: 74, c: "#6366f1" },
          { label: "דינמי", w: 88, c: "#f59e0b" },
        ].map((b) => (
          <div key={b.label} className="flex items-center gap-2">
            <span className="text-xs text-muted w-10 text-right">{b.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-surface-2">
              <div className="h-1.5 rounded-full" style={{ width: `${b.w}%`, background: b.c }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <main>
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pt-14 pb-10">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="animate-fade-up">
            <span
              className="badge mb-5 border border-primary/30 text-primary text-xs"
              style={{ background: "rgba(99,102,241,0.12)" }}
            >
              <Sparkles size={12} />
              כלי AI ניטרלי לשוק הישראלי 🇮🇱
            </span>
            <h1 className="mb-4 text-4xl sm:text-5xl font-700 leading-tight">
              לא יועץ משכנתאות
              <br />
              <span className="text-primary">יותר טוב.</span>
            </h1>
            <p className="mb-6 text-base text-muted leading-relaxed">
              תדע מה לדרוש מהבנק — לפני שנכנסת לפגישה.
              <br />
              ניתוח AI ניטרלי. אין עמלות. אין אינטרס.
            </p>
            <Link to="/form" className="btn-primary">
              התחל ניתוח חינם
              <ArrowLeft size={18} />
            </Link>
            <p className="mt-3 text-xs text-muted">
              מידע בלבד · אינו ייעוץ משכנתאות · אינו תחליף לבעל רישיון
            </p>
          </div>
          <div className="lg:pr-6">
            <ReportPreview />
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-center text-lg font-600 text-muted mb-6">
          מה הדוח כולל
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard icon={ShieldCheck} color="#6366f1" title="אפס ניגוד עניינים" desc="אנחנו לא מרוויחים מהבנק שתבחר — הניתוח עובד רק בשבילך." />
          <FeatureCard icon={TrendingUp} color="#10b981" title="ניתוח רגישות" desc="מה קורה להחזר אם הריבית עולה ב-1% או ב-2% — לפני שתחתום." />
          <FeatureCard icon={Target} color="#f59e0b" title="Benchmark ריבית" desc="תדע את הטווח הריאלי לדרוש, ואת נקודת ההתעקשות שלך." />
          <FeatureCard icon={BarChart2} color="#8b5cf6" title="לוח סילוקין" desc="גרף קרן מול ריבית לאורך כל חיי ההלוואה — מה שיועצים מציגים." />
          <FeatureCard icon={MessageCircle} color="#06b6d4" title="צ׳אט AI" desc="שאל כל שאלה על הדוח שלך — עוזר AI מבין בהקשר הנתונים שלך." />
          <FeatureCard icon={FileText} color="#ec4899" title="דוח PDF" desc="הורד דוח מוכן לפגישה עם הבנק — עם כל הנתונים והשאלות." />
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="card flex items-center justify-center gap-3 p-4 text-center">
          <span className="text-warn text-base">★★★★★</span>
          <span className="text-sm text-muted">
            מאות לקוחות כבר נכנסו לבנק מוכנים יותר
          </span>
        </div>
      </section>

      <footer className="mt-10 border-t border-border/50 py-6 text-center text-xs text-muted">
        כלי המשכנתא © 2025 · מידע בלבד, אינו ייעוץ · לא מפוקח
      </footer>
    </main>
  );
}
