/**
 * נתיב צ'אט — שאלות ותשובות בהקשר הדוח של המשתמש.
 */

const express = require("express");
const router = express.Router();
const db = require("../utils/db");

let genAI = null;
let chatModel = null;

if (process.env.GEMINI_API_KEY) {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  chatModel = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `אתה עוזר מידע למשכנתאות בישראל. המשתמש קיבל דוח ניתוח מפורט ועכשיו שואל שאלות.
ענה בעברית, קצר וברור — 2-4 משפטים מקסימום לתשובה רגילה.
השתמש בנתונים מהדוח שניתן לך כהקשר.
אסור: "כדאי לך", "אני ממליץ", שם בנק ספציפי, הכרעה בשביל המשתמש.
מותר: הסברים, חישובים, השוואות, הצגת שיקולים לכאן ולכאן.
אם אינך יודע — אמור זאת ישירות.
סיים תמיד עם הבהרה שזה מידע בלבד.`,
  });
}

const FALLBACK_ANSWERS = [
  "שאלה מצוינת. על פי נתוני הדוח שלך, כדאי לבדוק את החלק הרלוונטי בדוח שמופיע למעלה.",
  "המידע בדוח מכסה את הנושא הזה. שים לב לחלק ניתוח הרגישות שמראה את ההשפעה על ההחזר שלך.",
  "זוהי שאלה שכדאי לשאול את הבנק ישירות — עם הנתונים מהדוח שלך כבסיס למשא ומתן.",
];

router.post("/", async (req, res) => {
  try {
    const { message, analysisId, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: "חסרת הודעה" });

    // טוען הקשר הדוח אם קיים
    let contextStr = "";
    if (analysisId) {
      const record = await db.get(`analysis:${analysisId}`);
      if (record?.report?.data) {
        const d = record.report.data;
        contextStr = `
הקשר — נתוני הדוח של המשתמש:
- סכום משכנתא: ${record.profile?.loanAmount?.toLocaleString("he-IL") || "—"} ₪
- הכנסה חודשית: ${record.profile?.monthlyIncome?.toLocaleString("he-IL") || "—"} ₪
- תקופה: ${record.profile?.termYears || 25} שנים
- החזר חודשי משוער (מאוזן): ${d.summary?.monthlyPayment?.toLocaleString("he-IL") || "—"} ₪
- % מהכנסה: ${d.summary?.pctOfIncome || "—"}%
- benchmark ריבית: ${d.summary?.benchmarkRate || "—"}%
- LTV: ${d.ratios?.ltv || "—"}%
- הבקשה ריאלית: ${d.capacity?.realistic ? "כן" : "לא"}
`;
      }
    }

    if (!chatModel) {
      // fallback דמו
      const answer = FALLBACK_ANSWERS[Math.floor(Math.random() * FALLBACK_ANSWERS.length)];
      return res.json({ answer, demo: true });
    }

    // בניית היסטוריה לשיחה
    const contents = [
      ...(contextStr
        ? [{ role: "user", parts: [{ text: `הקשר הדוח:\n${contextStr}` }] },
           { role: "model", parts: [{ text: "הבנתי. אני מוכן לענות על שאלות בהקשר הדוח הזה." }] }]
        : []),
      ...history.map((h) => ({
        role: h.role,
        parts: [{ text: h.text }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const result = await chatModel.generateContent({ contents });
    const answer = result.response.text();
    res.json({ answer });
  } catch (err) {
    console.error("[chat] שגיאה:", err.message);
    res.status(500).json({ error: "שגיאה בשרת הצ'אט. נסה שוב." });
  }
});

module.exports = router;
