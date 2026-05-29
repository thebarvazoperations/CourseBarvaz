import { Link } from "react-router-dom";
import {
  ShieldCheck,
  TrendingUp,
  Target,
  Star,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

function FeatureCard({ icon: Icon, color, title, children }) {
  return (
    <div className="card card-hover p-6">
      <div
        className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ background: `${color}22` }}
      >
        <Icon size={24} style={{ color }} />
      </div>
      <h3 className="mb-2 text-h3 font-600">{title}</h3>
      <p className="text-muted leading-relaxed whitespace-pre-line">{children}</p>
    </div>
  );
}

// כרטיס preview מונפש של דוח (mock UI)
function ReportPreview() {
  return (
    <div className="card p-6 animate-float shadow-glow">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-muted">דוח ניתוח</span>
        <span className="badge bg-accent/15 text-accent">מוכן</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { l: "החזר חודשי", v: "₪6,420", c: "text-text" },
          { l: "% מהכנסה", v: "28%", c: "text-accent" },
          { l: "ריבית לדרוש", v: "4.6%", c: "text-primary" },
          { l: "עלות כוללת", v: "₪1.92M", c: "text-text" },
        ].map((k) => (
          <div key={k.l} className="rounded-xl bg-surface-2 p-3">
            <div className="text-xs text-muted">{k.l}</div>
            <div className={`text-lg font-700 ${k.c}`}>{k.v}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {[70, 45, 85].map((w, i) => (
          <div key={i} className="h-2 rounded-full bg-surface-2">
            <div
              className="h-2 rounded-full bg-primary-gradient"
              style={{ width: `${w}%` }}
            />
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
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-12">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="animate-fade-up">
            <span
              className="badge mb-6 border border-primary/40 text-primary"
              style={{ background: "rgba(99,102,241,0.15)" }}
            >
              <Sparkles size={14} />
              כלי AI ניטרלי לשוק הישראלי 🇮🇱
            </span>
            <h1 className="mb-4">
              לא יועץ משכנתאות
              <br />
              <span className="text-primary">יותר טוב.</span>
            </h1>
            <p className="mb-8 text-lg text-muted leading-relaxed">
              תדע מה לדרוש מהבנק — לפני שנכנסת לפגישה.
              <br />
              ניתוח AI ניטרלי. אין עמלות. אין אינטרס.
            </p>
            <Link to="/form" className="btn-primary text-lg">
              התחל ניתוח — ₪500
              <ArrowLeft size={20} />
            </Link>
            <p className="mt-4 text-sm text-muted">
              מידע בלבד · אינו ייעוץ משכנתאות · אינו תחליף לבעל רישיון
            </p>
          </div>
          <div className="lg:pr-8">
            <ReportPreview />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard icon={ShieldCheck} color="#6366f1" title="אפס ניגוד עניינים">
            {"אנחנו לא מרוויחים מהבנק שתבחר.\nאתה משלם לנו — אנחנו עובדים רק בשבילך."}
          </FeatureCard>
          <FeatureCard icon={TrendingUp} color="#10b981" title="ניתוח רגישות">
            {"תראה מה קורה להחזר שלך אם הריבית\nעולה ב-1% או ב-2% — לפני שתחתום."}
          </FeatureCard>
          <FeatureCard icon={Target} color="#f59e0b" title="Benchmark ריבית">
            {"תדע את הריבית שמגיע לך לדרוש —\nולא מה שהבנק רוצה לתת לך."}
          </FeatureCard>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="card flex flex-wrap items-center justify-center gap-3 p-6 text-center">
          <span className="flex text-warn">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} fill="currentColor" />
            ))}
          </span>
          <span className="text-muted">
            מאות לקוחות כבר נכנסו לבנק מוכנים יותר
          </span>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-border py-8 text-center text-sm text-muted">
        כלי המשכנתא © 2025 · מידע בלבד, אינו ייעוץ · לא מפוקח
      </footer>
    </main>
  );
}
