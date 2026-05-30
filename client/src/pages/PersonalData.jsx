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

export default function PrivacyPolicy() {
  return (
    <PageTransition>
      <SEOMeta
        title="מדיניות פרטיות"
        description="מדיניות הפרטיות של כלי המשכנתא — כיצד אנו מטפלים בנתונים שלך."
      />
      <main role="main" className="mx-auto max-w-3xl px-4 py-14">
        <div className="mb-10">
          <h1 className="text-h2 mb-2">מדיניות פרטיות</h1>
          <p className="text-xs text-muted">עודכן לאחרונה: [DATE]</p>
        </div>

        <LegalSection title="1. מבוא">
          <p>
            [ENTITY_NAME] ("אנחנו", "כלי המשכנתא") מחויבת להגנה על פרטיות המשתמשים.
            מסמך זה מתאר אילו נתונים נאספים, כיצד הם משמשים ומהן זכויותיך.
          </p>
          <p>
            השימוש בשירות מהווה הסכמה למדיניות זו. אם אינך מסכים — אנא הפסק את השימוש.
          </p>
        </LegalSection>

        <LegalSection title="2. אילו נתונים אנו אוספים">
          <p><strong className="text-text">נתוני הטופס:</strong> סכום הלוואה, הון עצמי, הכנסה חודשית,
            גיל, תקופה ופרמטרים פיננסיים נוספים — לצורך יצירת הדוח בלבד.</p>
          <p><strong className="text-text">נתונים שאנו לא אוספים:</strong> שם, תעודת זהות, כתובת,
            מספר טלפון, פרטי חשבון בנק — שדות אלה אינם קיימים בטופס ולא נשמרים.</p>
          <p><strong className="text-text">נתוני שימוש:</strong> כתובת IP אנונימית, סוג דפדפן, עמודים
            שביקרת — לצורך שיפור השירות בלבד.</p>
        </LegalSection>

        <LegalSection title="3. כיצד הנתונים משמשים">
          <p>הנתונים הפיננסיים משמשים אך ורק ליצירת הדוח האישי שלך. אין שיתוף עם בנקים,
            גופים פיננסיים, מפרסמים או כל צד שלישי.</p>
          <p>נתונים אנונימיים ומצטברים עשויים לשמש לשיפור אלגוריתמי החישוב.</p>
        </LegalSection>

        <LegalSection title="4. בסיס חוקי לעיבוד (GDPR)">
          <p>עיבוד הנתונים מתבסס על:</p>
          <ul className="list-disc list-inside space-y-1 mr-2">
            <li>הסכמה (GDPR סעיף 6(1)(א)) — מילוי הטופס מהווה הסכמה מפורשת.</li>
            <li>אינטרס לגיטימי (GDPR סעיף 6(1)(ו)) — שיפור ואבטחת השירות.</li>
          </ul>
        </LegalSection>

        <LegalSection title="5. שמירה ומחיקת נתונים">
          <p>נתוני הטופס הגולמיים נמחקים אוטומטית תוך <strong className="text-text">24 שעות</strong>
            מרגע יצירת הדוח. הדוח עצמו (ללא פרטים מזהים) עשוי להישמר עד 30 יום.</p>
          <p>ניתן לבקש מחיקה מיידית בפנייה אלינו.</p>
        </LegalSection>

        <LegalSection title="6. זכויות המשתמש (GDPR)">
          <p>על-פי תקנות GDPR, יש לך זכות:</p>
          <ul className="list-disc list-inside space-y-1 mr-2">
            <li><strong className="text-text">גישה</strong> — לדעת אילו נתונים קיימים עליך.</li>
            <li><strong className="text-text">תיקון</strong> — לתקן נתונים שגויים.</li>
            <li><strong className="text-text">מחיקה</strong> — "הזכות להישכח".</li>
            <li><strong className="text-text">התנגדות</strong> — להתנגד לעיבוד.</li>
            <li><strong className="text-text">ניידות</strong> — לקבל את הנתונים בפורמט מובנה.</li>
          </ul>
          <p>לממש את הזכויות — פנה אלינו לכתובת: [CONTACT_EMAIL]</p>
        </LegalSection>

        <LegalSection title="7. עוגיות (Cookies)">
          <p>אנו משתמשים בעוגיות הכרחיות לפעולת השירות. לפרטים נוספים ראה את{" "}
            <Link to="/cookies" className="text-primary hover:underline">מדיניות העוגיות</Link>.
          </p>
        </LegalSection>

        <LegalSection title="8. אבטחת מידע">
          <p>אנו מיישמים אמצעי אבטחה סטנדרטיים בתעשייה: HTTPS, הצפנה בתעבורה,
            והגבלת גישה. עם זאת, אין מערכת מאובטחת ב-100% — השימוש הוא על אחריותך.</p>
        </LegalSection>

        <LegalSection title="9. שינויים במדיניות">
          <p>אנו רשאים לעדכן מדיניות זו. שינויים מהותיים יפורסמו בדף זה עם עדכון
            התאריך בכותרת.</p>
        </LegalSection>

        <LegalSection title="10. יצירת קשר">
          <p>שאלות בנושא פרטיות: <strong className="text-text">[CONTACT_EMAIL]</strong></p>
          <p>רשות הגנת הפרטיות בישראל: <a href="https://www.gov.il/he/departments/the_privacy_protection_authority"
            target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">gov.il</a></p>
        </LegalSection>
      </main>
    </PageTransition>
  );
}
