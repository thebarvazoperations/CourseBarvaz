/**
 * נתיב צ'אט — שאלות ותשובות בהקשר הדוח של המשתמש.
 * תומך בכל ספקי ה-AI דרך ai-provider.js.
 */

const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const { CHAT_SYSTEM_PROMPT } = require("../utils/gemini");
const { provider } = require("../utils/ai-provider");

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
    let contextPrefix = "";
    if (analysisId) {
      const record = await db.get(`analysis:${analysisId}`);
      if (record?.report?.data) {
        const d = record.report.data;
        contextPrefix = `הקשר — נתוני הדוח של המשתמש:
- סכום משכנתא: ${record.profile?.loanAmount?.toLocaleString("he-IL") || "—"} ₪
- הכנסה חודשית: ${record.profile?.monthlyIncome?.toLocaleString("he-IL") || "—"} ₪
- תקופה: ${record.profile?.termYears || 25} שנים
- החזר חודשי משוער (מאוזן): ${d.summary?.monthlyPayment?.toLocaleString("he-IL") || "—"} ₪
- % מהכנסה: ${d.summary?.pctOfIncome || "—"}%
- benchmark ריבית: ${d.summary?.benchmarkRate || "—"}%
- LTV: ${d.ratios?.ltv || "—"}%
- הבקשה ריאלית: ${d.capacity?.realistic ? "כן" : "לא"}`;
      }
    }

    if (!provider) {
      const answer = FALLBACK_ANSWERS[Math.floor(Math.random() * FALLBACK_ANSWERS.length)];
      return res.json({ answer, demo: true });
    }

    // היסטוריית שיחה בפורמט אחיד (role: user|assistant, content: string)
    const normalizedHistory = [
      ...(contextPrefix
        ? [
            { role: "user", content: contextPrefix },
            { role: "assistant", content: "הבנתי. אני מוכן לענות על שאלות בהקשר הדוח הזה." },
          ]
        : []),
      ...history.map((h) => ({
        role: h.role === "model" ? "assistant" : h.role,
        content: h.text || h.content || "",
      })),
    ];

    const answer = await provider.chat(CHAT_SYSTEM_PROMPT, normalizedHistory, message);
    res.json({ answer });
  } catch (err) {
    console.error("[chat] שגיאה:", err.message);
    res.status(500).json({ error: "שגיאה בשרת הצ'אט. נסה שוב." });
  }
});

module.exports = router;
