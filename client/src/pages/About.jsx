import { Link } from "react-router-dom";
import { Target, ShieldCheck, Eye, Scale, BarChart2, MessageSquare, Percent } from "lucide-react";
import PageTransition from "../components/PageTransition.jsx";
import SEOMeta from "../components/SEOMeta.jsx";

const VALUES = [
  {
    icon: ShieldCheck,
    color: "#10b981",
    title: "ניגוד עניינים אפס",
    desc: "לא מקבלים עמלה מאף בנק ואף חברה. אין לנו מניע לכוון אותך לשום מקום.",
  },
  {
    icon: Eye,
    color: "#6366f1",
    title: "שקיפות מלאה",
    desc: "כל חישוב גלוי, כל מונח ניתן להסבר. אין קסמים — רק מתמטיקה.",
  },
  {
    icon: Scale,
    color: "#f59e0b",
    title: "הגינות",
    desc: "הכלי מציג שיקולים לטובת ונגד כל בחירה. ההחלטה תמיד שלך בלבד.",
  },
];

const FEATURES = [
  { icon: BarChart2, title: "השוואת תמהילים", desc: "שלושה תמהילים עם ניתוח רגישות לעליות ריבית." },
  { icon: Target, title: "ריבית שמגיע לך", desc: "חישוב מותאם לפרופיל שלך — מה לדרוש מהבנק." },
  { icon: MessageSquare, title: "צ'אט AI ניטרלי", desc: "שאל שאלות בהקשר הדוח שלך ותקבל עובדות." },
  { icon: Percent, title: "LTV ו-DTI", desc: "יחסים פיננסיים שהבנק בודק — עוד לפני שנכנסת." },
];

export default function About() {
  return (
    <PageTransition>
      <SEOMeta
        title="אודות"
        description="כלי המשכנתא — המשימה, הערכים, ומה שמייחד ניתוח ניטרלי לשוק הישראלי."
      />
      <main role="main" className="mx-auto max-w-4xl px-4 py-14">

        {/* Hero */}
        <div className="mb-12 text-center">
          <span className="badge bg-primary/15 text-primary mb-4">מי אנחנו</span>
          <h1 className="text-h1 mb-4">
            ניטרליות היא לא תכונה —<br />
            <span className="text-primary italic">היא הבסיס</span>
          </h1>
          <p className="text-muted text-sm leading-relaxed max-w-xl mx-auto">
            בנינו את הכלי הזה כי שוק המשכנתאות הישראלי סובל מבעיה מבנית: רוב
            "היועצים" מקבלים עמלה מהבנקים. אנחנו לא.
          </p>
        </div>

        {/* Mission */}
        <div className="card shadow-glow p-8 mb-8 flex gap-5 items-start">
          <div className="rounded-xl bg-primary/15 p-3 shrink-0">
            <Target size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-base font-700 mb-2">המשימה שלנו</h2>
            <p className="text-sm text-muted leading-relaxed">
              לתת לכל אחד גישה לאותה איכות מידע שיש ליועץ הכי טוב — בלי לשלם על ייעוץ
              ובלי שמישהו ינסה למכור לך כלום. ניתוח מספרי מדויק, שפה ברורה, והחלטה
              שתישאר בידיים שלך.
            </p>
          </div>
        </div>

        {/* Values */}
        <h2 className="text-h3 font-700 mb-4">הערכים שמנחים אותנו</h2>
        <div className="grid gap-4 sm:grid-cols-3 mb-12">
          {VALUES.map((v) => (
            <div key={v.title} className="card p-5">
              <div
                className="rounded-xl p-2.5 w-fit mb-3"
                style={{ background: `${v.color}1a` }}
              >
                <v.icon size={20} style={{ color: v.color }} />
              </div>
              <div className="font-700 text-sm mb-1">{v.title}</div>
              <div className="text-xs text-muted leading-relaxed">{v.desc}</div>
            </div>
          ))}
        </div>

        {/* What we do */}
        <h2 className="text-h3 font-700 mb-4">מה הכלי עושה</h2>
        <div className="grid gap-4 sm:grid-cols-2 mb-12">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-5 flex gap-4 items-start">
              <div className="rounded-xl bg-primary/10 p-2 shrink-0">
                <f.icon size={18} className="text-primary" />
              </div>
              <div>
                <div className="font-600 text-sm mb-0.5">{f.title}</div>
                <div className="text-xs text-muted">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="card p-5 border-warn/30 mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge bg-warn/15 text-warn text-xs">הצהרת גילוי</span>
          </div>
          <p className="text-sm text-muted leading-relaxed">
            כלי המשכנתא הוא כלי מידע בלבד. אינו ייעוץ משכנתאות, אינו ייעוץ פיננסי,
            ואינו מחליף יועץ בעל רישיון על-פי חוק הסדרת העיסוק בייעוץ השקעות, בשיווק
            השקעות ובניהול תיקי השקעות, תשנ"ה-1995.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/form" className="btn-primary text-base px-8 py-4">
            התחל ניתוח חינם
          </Link>
        </div>
      </main>
    </PageTransition>
  );
}
