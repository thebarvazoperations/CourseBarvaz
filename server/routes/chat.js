/**
 * נתיב צ'אט — שאלות ותשובות בהקשר הדוח של המשתמש.
 * - זיכרון מתמשך: השיחה נשמרת תחת chat:${analysisId} ושורדת רענון דף.
 * - תמונות: נשלחות ל-AI לניתוח אך לא נשמרות (רק דגל hasImage).
 * - כללים: נטענים מקובץ chat-rules.md ניתן לעריכה + blocklist.
 * - מניעת הזיות: הקשר עובדתי מלא + הנחיות מחמירות.
 */

const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const { CHAT_SYSTEM_PROMPT } = require("../utils/gemini");
const { provider } = require("../utils/ai-provider");
const { getChatRules, checkBlocklist } = require("../utils/chat-rules");
const { buildChatContext } = require("../utils/chat-context");

const HISTORY_TURNS = Number(process.env.CHAT_HISTORY_TURNS) || 12;

const FALLBACK_ANSWERS = [
  "שאלה מצוינת. על פי נתוני הדוח שלך, כדאי לבדוק את החלק הרלוונטי בדוח שמופיע למעלה.",
  "המידע בדוח מכסה את הנושא הזה. שים לב לחלק ניתוח הרגישות שמראה את ההשפעה על ההחזר שלך.",
  "זוהי שאלה שכדאי לשאול את הבנק ישירות — עם הנתונים מהדוח שלך כבסיס למשא ומתן.",
];

const SAFE_REPLACEMENT =
  "איני יכול לנסח זאת כהמלצה. אציג זאת כך: יש שיקולים לכאן ולכאן, וההחלטה תלויה בך. " +
  "לבירור מותאם אישית מומלץ לפנות לבנק או ליועץ משכנתאות מורשה. זה לא יועץ משכנתאות. זה יותר טוב.";

// --- GET היסטוריה (שחזור השיחה בפתיחת הווידג'ט) ---
router.get("/:analysisId", async (req, res) => {
  try {
    const conv = (await db.get(`chat:${req.params.analysisId}`)) || [];
    // לא מחזירים base64 — רק טקסט ודגל תמונה
    const safe = conv.map((m) => ({ role: m.role, text: m.text, hasImage: !!m.hasImage }));
    res.json({ history: safe });
  } catch (err) {
    console.error("[chat] שגיאת GET היסטוריה:", err.message);
    res.json({ history: [] });
  }
});

router.post("/", async (req, res) => {
  try {
    const { message, analysisId, images = [] } = req.body;
    if (!message && images.length === 0) {
      return res.status(400).json({ error: "חסרת הודעה" });
    }

    // טוען רשומת ניתוח + שיחה שמורה
    let record = null;
    let conv = [];
    if (analysisId) {
      record = await db.get(`analysis:${analysisId}`);
      conv = (await db.get(`chat:${analysisId}`)) || [];
    }

    // מצב דמו — ללא ספק AI
    if (!provider) {
      const answer = FALLBACK_ANSWERS[Math.floor(Math.random() * FALLBACK_ANSWERS.length)];
      return res.json({ answer, demo: true });
    }

    // הקשר עובדתי מלא — מקור האמת היחיד למספרים
    const context = record ? buildChatContext(record) : "";

    // System prompt = הוראות בסיס + כללים ניתנים לעריכה + הקשר עובדתי
    const rules = getChatRules();
    const systemPrompt = [
      CHAT_SYSTEM_PROMPT,
      rules ? `\n=== כללים נוספים (ניתנים לעריכה) ===\n${rules}` : "",
      context ? `\n${context}` : "\nאין נתוני ניתוח זמינים — ענה רק על מושגים כלליים או הפנה לבנק.",
    ].join("\n");

    // היסטוריה לשליחה למודל — חתוכה ל-N תורות אחרונות
    const recentHistory = conv.slice(-HISTORY_TURNS).map((m) => ({
      role: m.role === "user" ? "user" : "model",
      content: m.text,
    }));

    let answer = await provider.chat(systemPrompt, recentHistory, message || "(תמונה צורפה)", images);

    // בדיקת blocklist — אם הופר, מחליפים בהודעה ניטרלית בטוחה
    const { clean } = checkBlocklist(answer);
    if (!clean) answer = SAFE_REPLACEMENT;

    // שמירת השיחה (ללא base64 — רק דגל תמונה)
    if (analysisId) {
      conv.push({ role: "user", text: message || "", hasImage: images.length > 0, at: Date.now() });
      conv.push({ role: "assistant", text: answer, at: Date.now() });
      await db.set(`chat:${analysisId}`, conv);
    }

    res.json({ answer });
  } catch (err) {
    console.error("[chat] שגיאה:", err.message);
    res.status(500).json({ error: "שגיאה בשרת הצ'אט. נסה שוב." });
  }
});

module.exports = router;
