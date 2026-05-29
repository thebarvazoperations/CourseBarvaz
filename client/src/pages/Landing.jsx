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
  Cpu,
  Lock,
  Scale,
  Eye,
  PieChart,
  Activity,
  CheckCircle2,
  Zap,
  Brain,
  RefreshCw,
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

function StepCard({ num, title, desc }) {
  return (
    <div className="card p-5 relative">
      <div className="absolute -top-3 right-5 flex h-7 w-7 items-center justify-center rounded-full bg-primary-gradient text-sm font-700 text-white shadow-glow">
        {num}
      </div>
      <div className="mt-2 text-sm font-700 mb-1">{title}</div>
      <p className="text-xs text-muted leading-relaxed">{desc}</p>
    </div>
  );
}

function ReportPreview() {
  return (
    <div className="card p-5 shadow-glow animate-float">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-muted font-600 uppercase tracking-wide">דוח ניתוח</span>
        <span className="badge bg-accent/15 text-accent text-xs">✓ ניטרלי מאומת</span>
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
      {/* ===== HERO ===== */}
      <section className="mx-auto max-w-6xl px-4 pt-14 pb-10">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="animate-fade-up">
            <span
              className="badge mb-5 border border-primary/30 text-primary text-xs"
              style={{ background: "rgba(99,102,241,0.12)" }}
            >
              <Sparkles size={12} />
              מבוסס AI · ניטרלי · לשוק הישראלי 🇮🇱
            </span>
            <h1 className="mb-2 text-4xl sm:text-5xl font-700 leading-tight">
              זה לא יועץ משכנתאות.
              <br />
              <span className="text-primary">זה יותר טוב.</span>
            </h1>
            <p className="mb-2 text-lg font-300 text-muted leading-snug">
              יועץ עובד בשביל עמלה. הכלי הזה עובד בשבילך.
            </p>
            <p className="mb-6 text-sm text-muted leading-relaxed">
              תדע בדיוק מה לדרוש מהבנק לפני שנכנסת לפגישה —
              עם ניתוח מבוסס בינה מלאכותית, ניטרלי לחלוטין, אפס אינטרס ואפס עמלות.
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

      {/* ===== TRUST STRIP ===== */}
      <section className="border-y border-border/50 bg-surface/40">
        <div className="mx-auto max-w-6xl px-4 py-5 grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
          {[
            { icon: Scale, label: "100% ניטרלי" },
            { icon: Cpu, label: "מבוסס בינה מלאכותית" },
            { icon: Lock, label: "פרטיות מלאה" },
            { icon: Zap, label: "תוצאות מיידיות" },
          ].map((t) => (
            <div key={t.label} className="flex flex-col items-center gap-1.5">
              <t.icon size={20} className="text-primary" />
              <span className="text-xs font-600 text-muted">{t.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== WHAT THE TOOL DOES ===== */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="text-center mb-3">
          <span className="text-xs font-600 text-primary uppercase tracking-wider">מה האתר עושה</span>
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-700 mb-3">
          ניתוח משכנתא מלא — בלי לשלם על ייעוץ
        </h2>
        <p className="text-center text-sm text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          אתה ממלא את הנתונים שלך, והמערכת מפיקה דוח מקצועי שמראה בדיוק
          את אותם נתונים שיועץ משכנתאות היה מציג לך — אבל בלי אינטרס מסחרי,
          בלי עמלה, ובלי שאף אחד ינסה למכור לך כלום.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard icon={ShieldCheck} color="#6366f1" title="אפס ניגוד עניינים" desc="אנחנו לא מרוויחים מהבנק שתבחר ולא מקבלים עמלה — הניתוח עובד רק בשבילך." />
          <FeatureCard icon={PieChart} color="#8b5cf6" title="השוואת תמהילים" desc="3 תמהילי משכנתא (שמרני/מאוזן/דינמי) עם החזר, עלות כוללת ורמת סיכון לכל אחד." />
          <FeatureCard icon={Activity} color="#10b981" title="ניתוח רגישות" desc="מה קורה להחזר החודשי אם הריבית עולה ב-0.5%, 1% ועד 2% — לפני שתחתום." />
          <FeatureCard icon={BarChart2} color="#06b6d4" title="לוח סילוקין מלא" desc="גרף קרן מול ריבית לאורך כל חיי ההלוואה, עם פירוט לכל שנה." />
          <FeatureCard icon={Target} color="#f59e0b" title="הריבית שמגיע לך" desc="חישוב מותאם אישית לפי דירוג האשראי, המינוף והנכסים — והמנופים להתעקש עליהם." />
          <FeatureCard icon={TrendingUp} color="#ef4444" title="Benchmark ריבית" desc="הטווח הריאלי שמגיע לך לדרוש מהבנק, ונקודת ההתעקשות במשא ומתן." />
          <FeatureCard icon={RefreshCw} color="#a855f7" title="ניתוח מיחזור" desc="כדאיות מיחזור: חיסכון חודשי, נקודת איזון וחיסכון כולל צפוי." />
          <FeatureCard icon={MessageCircle} color="#0ea5e9" title="צ׳אט AI חכם" desc="עוזר AI שמכיר את הנתונים שלך ועונה על כל שאלה — בלי להחליט בשבילך." />
          <FeatureCard icon={FileText} color="#ec4899" title="דוח PDF + שאלות לבנק" desc="הורד דוח מוכן לפגישה, כולל 7 שאלות חדות ו-6 טיפים למשא ומתן." />
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="bg-surface/40 border-y border-border/50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-center text-2xl sm:text-3xl font-700 mb-10">
            איך זה עובד — 3 שלבים פשוטים
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            <StepCard num="1" title="ממלאים נתונים" desc="סכום משכנתא, הכנסה, הון עצמי, דירוג אשראי ונכסים. לוקח פחות מדקה." />
            <StepCard num="2" title="ה-AI מנתח" desc="המערכת מחשבת תמהילים, רגישות, יחסים פיננסיים וריבית מותאמת — ומפיקה נרטיב ניטרלי." />
            <StepCard num="3" title="נכנסים לבנק מוכנים" desc="עם דוח מלא, שאלות מוכנות וריבית יעד — אתה מנהל את השיחה, לא הבנק." />
          </div>
        </div>
      </section>

      {/* ===== NEUTRALITY ===== */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div>
            <span className="text-xs font-600 text-primary uppercase tracking-wider">למה ניטרלי</span>
            <h2 className="text-2xl sm:text-3xl font-700 mt-2 mb-4">
              הכלי היחיד שאין לו אינטרס מי הבנק שתבחר
            </h2>
            <p className="text-sm text-muted leading-relaxed mb-5">
              יועץ משכנתאות מקבל עמלה — לרוב מהבנק או ממך. לנו אין שום אינטרס
              באיזה מסלול תבחר או לאיזה בנק תלך. בנינו את המערכת כך שהיא
              <span className="text-text font-600"> פיזית לא יכולה </span>
              להמליץ לך מה לעשות.
            </p>
            <ul className="space-y-3">
              {[
                { t: "המספרים מחושבים בקוד", d: "כל חישוב פיננסי דטרמיניסטי — אין 'הזיות' של AI במספרים." },
                { t: "ה-AI לא ממליץ — רק מציג", d: "המערכת מציגה שיקול לכאן ושיקול לכאן. ההחלטה תמיד שלך." },
                { t: "שכבת בקרת ניטרליות כפולה", d: "כל טקסט עובר בדיקה אוטומטית שמסירה כל המלצה אישית או הטיה." },
                { t: "אנונימי ומאובטח", d: "פרטים מזהים לא נשלחים ל-AI, ונתונים גולמיים נמחקים תוך 24 שעות." },
              ].map((item) => (
                <li key={item.t} className="flex gap-3">
                  <CheckCircle2 size={18} className="text-accent shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-600">{item.t}</div>
                    <div className="text-xs text-muted leading-relaxed">{item.d}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* AI technology card */}
          <div className="card p-6 shadow-glow">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
                <Brain size={22} className="text-primary" />
              </div>
              <div>
                <div className="text-base font-700">הטכנולוגיה מבוססת AI</div>
                <div className="text-xs text-muted">בינה מלאכותית בשירות הניטרליות</div>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { icon: Cpu, t: "מנוע חישובים מדויק", d: "לוח שפיצר, יחסי LTV/DTI וריבית מותאמת — מחושבים בקוד." },
                { icon: Brain, t: "ניתוח נרטיבי חכם", d: "ה-AI מתרגם את המספרים להסבר ברור בעברית, בלי להכריע." },
                { icon: Eye, t: "שקיפות מלאה", d: "כל מושג פיננסי בדוח ניתן ללחיצה להסבר — אתה מבין כל מספר." },
                { icon: ShieldCheck, t: "בקרת איכות אוטומטית", d: "שכבת guardrail מוודאת שכל מילה נשארת ניטרלית." },
              ].map((row) => (
                <div key={row.t} className="flex gap-3 rounded-xl bg-surface-2 p-3">
                  <row.icon size={18} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-600">{row.t}</div>
                    <div className="text-xs text-muted leading-relaxed">{row.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF ===== */}
      <section className="mx-auto max-w-6xl px-4 pb-6">
        <div className="card flex items-center justify-center gap-3 p-4 text-center">
          <span className="text-warn text-base">★★★★★</span>
          <span className="text-sm text-muted">
            מאות לקוחות כבר נכנסו לבנק מוכנים יותר
          </span>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="card p-8 sm:p-10 text-center shadow-glow"
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.06))" }}
        >
          <h2 className="text-2xl sm:text-3xl font-700 mb-3">
            מוכן לדעת מה באמת מגיע לך?
          </h2>
          <p className="text-sm text-muted mb-6 max-w-md mx-auto leading-relaxed">
            תוך פחות מדקה תקבל דוח מלא, ניטרלי ומקצועי — חינם לחלוטין.
          </p>
          <Link to="/form" className="btn-primary text-base">
            התחל ניתוח חינם
            <ArrowLeft size={18} />
          </Link>
        </div>
      </section>

      <footer className="mt-4 border-t border-border/50 py-6 text-center text-xs text-muted space-y-1">
        <div className="font-600 text-muted/70 italic">
          "זה לא יועץ משכנתאות. זה יותר טוב."
        </div>
        <div>כלי המשכנתא © 2025 · מידע בלבד, אינו ייעוץ · לא מפוקח</div>
      </footer>
    </main>
  );
}
