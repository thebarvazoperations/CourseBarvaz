import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition.jsx";
import SEOMeta from "../components/SEOMeta.jsx";

const CATEGORIES = [
  {
    id: "general",
    title: "כללי",
    items: [
      {
        q: "האם הכלי מחליף יועץ משכנתאות?",
        a: "לא. כלי המשכנתא הוא כלי מידע בלבד. יועץ בעל רישיון מכיר פרמטרים נוספים, מכיר אישית את הבנקאים, ויכול לנהל משא ומתן בשמך. הכלי נועד להכין אותך לשיחה הזו — לא להחליפה.",
      },
      {
        q: "כמה עולה השימוש בכלי?",
        a: "הניתוח הבסיסי חינם לחלוטין. אין צורך להירשם, ואין צורך בכרטיס אשראי.",
      },
      {
        q: "כמה זמן לוקח להפיק דוח?",
        a: "פחות מ-2 דקות. ממלאים טופס קצר (3 שלבים), לוחצים על 'הפק דוח', והניתוח מוכן.",
      },
      {
        q: "באיזו שפה הדוח?",
        a: "הדוח כולו בעברית, כולל כל ההסברים, הגרפים וטבלאות הנתונים.",
      },
    ],
  },
  {
    id: "privacy",
    title: "פרטיות ואבטחה",
    items: [
      {
        q: "האם הנתונים שלי נשמרים?",
        a: "הנתונים שהזנת נמחקים אוטומטית תוך 24 שעות. אנחנו לא שומרים פרטים מזהים (שם, ת.ז., טלפון) — אלה לא נדרשים כלל לצורך הניתוח.",
      },
      {
        q: "האם ה-AI רואה את הפרטים האישיים שלי?",
        a: "לא. שם, תעודת זהות, טלפון וכתובת מייל לעולם לא נשלחים למודל ה-AI. ה-AI מקבל רק נתונים פיננסיים אנונימיים: סכום הלוואה, הכנסה, תקופה וכו'.",
      },
      {
        q: "האם הנתונים שלי ישמשו לפרסום?",
        a: "לא. אנחנו לא מוכרים נתונים, לא מפיצים אותם ולא משתמשים בהם לפרסום ממוקד.",
      },
    ],
  },
  {
    id: "report",
    title: "הניתוח והדוח",
    items: [
      {
        q: "מה ההבדל בין תמהיל שמרני, מאוזן ודינמי?",
        a: "שלושתם מחושבים על אותו סכום הלוואה. שמרני = חשיפה נמוכה לפריים (30%), ודאות גבוהה אך עלות גבוהה יותר. דינמי = חשיפה גבוהה לפריים (70%), עלות צפויה נמוכה אך סיכון לעליית ריבית. מאוזן = 50/50 ביניהם.",
      },
      {
        q: "מה זה LTV?",
        a: "Loan to Value — יחס ההלוואה לשווי הנכס. לדוגמה: נכס שווה 2M ₪ ומשכנתא של 1.5M ₪ = LTV של 75%. בנק ישראל מגביל ל-75% לדירה ראשונה.",
      },
      {
        q: "מה זה DTI?",
        a: "Debt to Income — יחס כלל ההחזרים החודשיים להכנסה נטו. מעל 40% נחשב גבוה ומקשה על קבלת משכנתא. הכלי מחשב אותו ומציג התראה אם הוא גבוה.",
      },
      {
        q: "כמה מדויקים החישובים?",
        a: "החישובים מבוססים על לוח שפיצר סטנדרטי עם ריביות שוק נכונות למועד הבנייה. הריביות האמיתיות שתקבל ישתנו לפי הבנק, הפרופיל שלך ותנאי השוק — אבל הם ישמשו כבסיס מצוין למשא ומתן.",
      },
    ],
  },
  {
    id: "rate",
    title: "הריבית שמגיע לך",
    items: [
      {
        q: "איך הכלי מחשב את הריבית שמגיע לי?",
        a: "לוקחים ריבית בסיס (תמהיל מאוזן) ומוסיפים/מחסירים נקודות בסיס לפי: דירוג אשראי, אחוז מימון (LTV), יחס החזר (DTI) ונכסים נזילים. כל גורם משפיע בכיוון שונה.",
      },
      {
        q: "מה ההבדל בין 'הריבית שמגיע לי' לבין 'הצעת הפתיחה של הבנק'?",
        a: "הבנקים פותחים בדרך כלל בריבית גבוהה יותר ממה שהם מוכנים לתת בפועל. הפער בנקודות הבסיס שהכלי מציג הוא יעד המשא ומתן — מה שצריך 'לכרסם' בפגישה.",
      },
      {
        q: "האם ה-AI נותן המלצות על איזה בנק לפנות?",
        a: "לא. הכלי לעולם לא ממליץ על בנק ספציפי ולא אומר 'כדאי לך'. הוא מציג שיקולים לטובת ונגד — ההחלטה תמיד שלך.",
      },
    ],
  },
];

function FaqItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className="border-b border-border/60 last:border-0">
      <button
        className="w-full flex items-center justify-between py-4 text-right gap-4 hover:text-primary transition-colors"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="text-sm font-600 text-right flex-1">{question}</span>
        <ChevronDown
          size={18}
          className={`text-muted shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="pb-4 text-sm text-muted leading-relaxed animate-fade-up">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [open, setOpen] = useState(null);

  const toggle = (key) => setOpen((o) => (o === key ? null : key));

  return (
    <PageTransition>
      <SEOMeta
        title="שאלות נפוצות"
        description="תשובות לשאלות הנפוצות ביותר על כלי המשכנתא — פרטיות, חישובים, ניתוח ועוד."
      />
      <main role="main" className="mx-auto max-w-3xl px-4 py-14">
        <div className="mb-10 text-center">
          <span className="badge bg-primary/15 text-primary mb-3">עזרה</span>
          <h1 className="text-h2 mb-2">שאלות נפוצות</h1>
          <p className="text-sm text-muted">לא מצאת תשובה?{" "}
            <Link to="/contact" className="text-primary hover:underline">צור קשר</Link>
          </p>
        </div>

        <div className="space-y-4">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="card overflow-hidden">
              <div className="px-6 pt-5 pb-2">
                <h2 className="text-xs font-700 uppercase tracking-wider text-primary">
                  {cat.title}
                </h2>
              </div>
              <div className="px-6 pb-2">
                {cat.items.map((item, i) => (
                  <FaqItem
                    key={i}
                    question={item.q}
                    answer={item.a}
                    isOpen={open === `${cat.id}-${i}`}
                    onToggle={() => toggle(`${cat.id}-${i}`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 card p-6 text-center">
          <p className="text-sm text-muted mb-4">מוכן להתחיל?</p>
          <Link to="/form" className="btn-primary">הפק דוח ניתוח</Link>
        </div>
      </main>
    </PageTransition>
  );
}
