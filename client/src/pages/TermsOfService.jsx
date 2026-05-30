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

export default function TermsOfService() {
  return (
    <PageTransition>
      <SEOMeta
        title="תנאי שימוש"
        description="תנאי השימוש של כלי המשכנתא."
      />
      <main role="main" className="mx-auto max-w-3xl px-4 py-14">
        <div className="mb-10">
          <h1 className="text-h2 mb-2">תנאי שימוש</h1>
          <p className="text-xs text-muted">עודכן לאחרונה: [DATE]</p>
        </div>

        <LegalSection title="1. כללי">
          <p>
            ברוכים הבאים לכלי המשכנתא, המופעל על-ידי [ENTITY_NAME] ("אנחנו").
            השימוש בשירות מהווה הסכמה מלאה לתנאים אלו. אם אינך מסכים — אנא הפסק
            את השימוש לאלתר.
          </p>
        </LegalSection>

        <LegalSection title="2. הגדרות">
          <p><strong className="text-text">"השירות"</strong> — כלי המשכנתא, לרבות האתר, הטופס, הדוח וצ'אט ה-AI.</p>
          <p><strong className="text-text">"המשתמש"</strong> — כל אדם המשתמש בשירות.</p>
          <p><strong className="text-text">"התוכן"</strong> — כל מידע, חישוב, גרף, טקסט ונרטיב המוצגים בשירות.</p>
        </LegalSection>

        <LegalSection title="3. מהות השירות וגבולותיו">
          <p>
            כלי המשכנתא הוא <strong className="text-text">כלי מידע בלבד</strong>. אינו ייעוץ משכנתאות,
            ייעוץ פיננסי, ייעוץ השקעות או כל ייעוץ מקצועי אחר כהגדרתו בחוק הסדרת
            העיסוק בייעוץ השקעות, בשיווק השקעות ובניהול תיקי השקעות, תשנ"ה-1995.
          </p>
          <p>
            החישובים מבוססים על הנחות כלכליות ועשויים שלא לשקף את התנאים הספציפיים
            שתקבל מהבנק שלך. אין להסתמך עליהם כעצה מחייבת.
          </p>
        </LegalSection>

        <LegalSection title="4. הגבלת אחריות">
          <p>
            [ENTITY_NAME] לא תישא באחריות לכל נזק ישיר, עקיף, מקרי או תוצאתי
            הנובע מהסתמכות על מידע מהשירות, לרבות הפסדים כספיים, החלטות השקעה
            או כל נזק אחר.
          </p>
          <p>
            השירות ניתן "כמות שהוא" (AS IS) ללא כל אחריות מפורשת או משתמעת לגבי
            דיוק, שלמות, עדכניות או התאמה למטרה מסוימת.
          </p>
        </LegalSection>

        <LegalSection title="5. שימוש מותר ואסור">
          <p><strong className="text-text">מותר:</strong> שימוש אישי, לא מסחרי, לצורך קבלת מידע
            על משכנתאות.</p>
          <p><strong className="text-text">אסור:</strong></p>
          <ul className="list-disc list-inside space-y-1 mr-2">
            <li>שימוש מסחרי או הפצה מחדש ללא אישור.</li>
            <li>גרידה אוטומטית (scraping) של תוכן השירות.</li>
            <li>ניסיון לעקוף אמצעי אבטחה.</li>
            <li>הצגת תוכן השירות כייעוץ מקצועי לצדדים שלישיים.</li>
          </ul>
        </LegalSection>

        <LegalSection title="6. קניין רוחני">
          <p>
            כל תוכן השירות, לרבות קוד, עיצוב, טקסט ואלגוריתמים, שייך ל-[ENTITY_NAME]
            ומוגן בזכויות יוצרים. אין להעתיק, לשכפל או לחלק ללא אישור בכתב.
          </p>
        </LegalSection>

        <LegalSection title="7. שינויים בתנאים">
          <p>
            אנו רשאים לשנות תנאים אלו בכל עת. שינויים מהותיים יפורסמו בדף זה.
            המשך השימוש לאחר פרסום השינויים מהווה הסכמה לתנאים החדשים.
          </p>
        </LegalSection>

        <LegalSection title="8. דין חל וסמכות שיפוט">
          <p>
            תנאים אלו כפופים לדין הישראלי. כל סכסוך יידון בבתי המשפט המוסמכים
            בתל אביב-יפו בלבד.
          </p>
        </LegalSection>

        <LegalSection title="9. יצירת קשר">
          <p>שאלות בנושא תנאי שימוש: <strong className="text-text">[CONTACT_EMAIL]</strong></p>
        </LegalSection>
      </main>
    </PageTransition>
  );
}
