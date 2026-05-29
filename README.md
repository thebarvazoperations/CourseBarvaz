# כלי המשכנתא 🏠

כלי AI ניטרלי לשוק המשכנתאות הישראלי. **לא יועץ משכנתאות — יותר טוב.**
תדע מה לדרוש מהבנק לפני שנכנסת לפגישה. אין עמלות, אין אינטרס.

## תכונות

- **אפס ניגוד עניינים** — אתה הלקוח, לא הבנק
- **ניתוח רגישות** — מה קורה להחזר אם הריבית עולה ב-1%/2%
- **Benchmark ריבית** — הריבית שמגיע לך לדרוש
- **השוואת 3 תמהילים** — שמרני / מאוזן / דינמי
- **ניתוח מיחזור (רפייננס)** עם נקודת איזון
- **7 שאלות מוכנות לבנק**
- **הורדת דוח PDF**
- עיצוב בסגנון FINQ — dark mode, RTL מלא, פונט Assistant

## ארכיטקטורה

| שכבה | טכנולוגיה |
|------|-----------|
| Frontend | React + Vite + Tailwind CSS + Chart.js |
| Backend | Node.js + Express |
| Database | Replit DB (fallback בזיכרון מקומית) |
| Payment | Stripe Checkout (₪) |
| AI | Google Gemini (`gemini-1.5-flash`) — חינמי |
| PDF | html2pdf.js |

### עקרונות ליבה

- **חישובים דטרמיניסטיים** (`server/utils/finance.js`) — כל המספרים מחושבים בקוד, לא ע"י ה-AI. Gemini מוסיף נרטיב בלבד.
- **אנונימיזציה** (`server/utils/anonymize.js`) — רק נתונים פיננסיים נשלחים ל-Gemini. לעולם לא שם/מייל/טלפון/ת"ז.
- **Guardrail** (`server/utils/guardrail.js`) — קריאה שנייה ל-AI מוודאת ניטרליות (ללא "כדאי לך" / המלצת בנק).
- **מחיקת נתונים גולמיים** תוך 24 שעות.

## הרצה מקומית

```bash
# התקנת כל התלויות (root + server + client)
npm run install:all

# העתקת משתני סביבה
cp .env.example .env
# ערוך את .env עם המפתחות שלך (GEMINI_API_KEY, STRIPE_SECRET_KEY...)

# הרצה (server + client במקביל)
npm run dev
```

- קליינט: http://localhost:5173
- שרת: http://localhost:3001

> **מצב דמו:** ללא `GEMINI_API_KEY` הדוח מופק עם נרטיב ברירת מחדל. ללא `STRIPE_SECRET_KEY` התשלום מדלג ישירות לדוח. כך אפשר לבדוק את כל ה-flow ללא מפתחות.

## בנייה ל-Production

```bash
npm run build     # בונה את הקליינט ל-client/dist
npm start         # השרת מגיש את הקליינט + ה-API
```

## משתני סביבה

ראה `.env.example`:

| משתנה | תיאור |
|-------|-------|
| `GEMINI_API_KEY` | מפתח Google Gemini (חינמי) |
| `STRIPE_SECRET_KEY` | מפתח סודי של Stripe |
| `STRIPE_PUBLISHABLE_KEY` | מפתח ציבורי של Stripe |
| `STRIPE_WEBHOOK_SECRET` | סוד webhook (אופציונלי) |
| `ANALYSIS_PRICE_AGOROT` | מחיר באגורות (ברירת מחדל 50000 = ₪500) |
| `CLIENT_URL` | כתובת הקליינט ל-CORS ו-redirect |

## אבטחה

- Rate limiting: 10 בקשות לשעה ל-IP
- Stripe מטפל בכרטיסים — השרת לא נוגע בפרטי תשלום
- HTTPS בלבד ב-production

---

**הבהרה:** המידע בכלי זה הוא מידע בלבד, אינו ייעוץ משכנתאות ואינו תחליף לבעל רישיון. הכלי אינו מפוקח.
