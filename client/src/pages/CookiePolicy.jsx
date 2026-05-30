import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition.jsx";
import SEOMeta from "../components/SEOMeta.jsx";

function LegalSection({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-base font-700 mb-3 text-text">{title}</h2>
      <div className="text-sm text-muted leading-loose space-y-2">{children}</div>
    </div>
  );
}

const BROWSERS = [
  { name: "Chrome", link: "chrome://settings/cookies" },
  { name: "Firefox", link: "https://support.mozilla.org/he/kb/enable-and-disable-cookies-website-preferences" },
  { name: "Safari", link: "https://support.apple.com/guide/safari/manage-cookies-sfri11471" },
  { name: "Edge", link: "https://support.microsoft.com/he-il/microsoft-edge/delete-cookies-in-microsoft-edge-63947406" },
];

export default function CookiePolicy() {
  return (
    <PageTransition>
      <SEOMeta
        title="מדיניות עוגיות"
        description="מדיניות השימוש בעוגיות של כלי המשכנתא."
      />
      <main role="main" className="mx-auto max-w-3xl px-4 py-14">
        <div className="mb-10">
          <h1 className="text-h2 mb-2">מדיניות עוגיות</h1>
          <p className="text-xs text-muted">עודכן לאחרונה: [DATE]</p>
        </div>

        <LegalSection title="1. מה הן עוגיות?">
          <p>
            עוגיות (Cookies) הן קבצים קטנים הנשמרים בדפדפן שלך כשאתה מבקר באתר.
            הן עוזרות לאתר "לזכור" העדפות, לשמור מצב משתמש ולנתח שימוש.
          </p>
        </LegalSection>

        <LegalSection title="2. אילו עוגיות אנו משתמשים">
          <p><strong className="text-text">עוגיות הכרחיות (Session)</strong></p>
          <p>
            משמשות לשמירת מזהה הניתוח שלך בין הדפים (טופס → תשלום → דוח). לא ניתן
            לבטל אותן — הן נדרשות לפעולת השירות הבסיסית.
          </p>
          <p className="mt-3"><strong className="text-text">עוגיות ניתוח (Analytics)</strong></p>
          <p>
            [ANALYTICS_PROVIDER] — אנונימיות לחלוטין. מספרות לנו כמה מבקרים יש,
            אילו דפים פופולריים ומהיכן המשתמשים מגיעים. אינן כוללות פרטים מזהים.
          </p>
        </LegalSection>

        <LegalSection title="3. עוגיות צד שלישי">
          <p>
            ייתכן שנשתמש בשירותי ניתוח כגון [ANALYTICS_PROVIDER]. לשירותים אלו
            יש מדיניות פרטיות עצמאית שאיננו אחראים לה.
          </p>
        </LegalSection>

        <LegalSection title="4. כיצד לנהל ולמחוק עוגיות">
          <p>ניתן לנהל עוגיות דרך הגדרות הדפדפן:</p>
          <ul className="space-y-1 mr-2">
            {BROWSERS.map((b) => (
              <li key={b.name} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                <span className="font-600 text-text">{b.name}:</span>
                <span className="text-muted text-xs break-all">{b.link}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2">
            שים לב: חסימת עוגיות הכרחיות עלולה לפגוע בפעולת השירות.
          </p>
        </LegalSection>

        <LegalSection title="5. שינויים במדיניות">
          <p>
            אנו רשאים לעדכן מדיניות זו. שינויים יפורסמו בדף זה עם עדכון התאריך.
          </p>
        </LegalSection>

        <LegalSection title="6. יצירת קשר">
          <p>
            שאלות בנושא עוגיות: <strong className="text-text">[CONTACT_EMAIL]</strong>
          </p>
          <p>
            ראה גם:{" "}
            <Link to="/privacy" className="text-primary hover:underline">מדיניות פרטיות</Link>
          </p>
        </LegalSection>
      </main>
    </PageTransition>
  );
}
