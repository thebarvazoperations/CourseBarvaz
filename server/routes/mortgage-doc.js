/**
 * ניתוח מסמך משכנתא — מצלמת/צילום מסך מאתר בנק ישראלי.
 * POST /api/mortgage-doc/analyze
 * body: { images: [{mediaType, data}], analysisId? }
 */

const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const { MORTGAGE_DOC_SYSTEM_PROMPT } = require("../utils/gemini");
const { provider } = require("../utils/ai-provider");
const { buildChatContext } = require("../utils/chat-context");

const MAX_IMAGES = 3;
const MAX_BYTES = 5 * 1024 * 1024; // 5MB per image (base64 ~33% overhead already accounted)

const DEMO_VERDICT = `**מה נמצא בתמונה (דוגמה — מצב דמו)**
לא נמצא ספק AI פעיל. להפעלת ניתוח אמיתי יש להגדיר ANTHROPIC_API_KEY / OPENAI_API_KEY / GEMINI_API_KEY ב-.env.

**דוגמה לפורמט תשובה:**
• ריבית קל"צ: 4.5% לשנה | תקופה: 25 שנה | סכום: ₪1,200,000
• ריבית פריים: פריים − 0.5% (כיום ~4.75%)
• החזר חודשי משוער: ₪6,200

**השוואה לנתוני הניתוח שלך:**
לא ניתן להשוות — אין נתוני ניתוח (הניתוח טרם הופק).

**שאלות לשאול את הבנק:**
1. האם הריבית הזו סופית או פתוחה למשא ומתן?
2. מהן עמלות פתיחת התיק הכלולות בהצעה?
3. מה תנאי הפירעון המוקדם בכל מסלול?

זה לא יועץ משכנתאות. זה יותר טוב.`;

router.post("/analyze", async (req, res) => {
  try {
    const { images = [], analysisId } = req.body;

    if (!images.length) {
      return res.status(400).json({ error: "יש להעלות לפחות תמונה אחת." });
    }
    if (images.length > MAX_IMAGES) {
      return res.status(400).json({ error: `ניתן להעלות עד ${MAX_IMAGES} תמונות.` });
    }
    for (const img of images) {
      if (!img.mediaType || !img.data) {
        return res.status(400).json({ error: "פורמט תמונה שגוי." });
      }
      const bytes = Buffer.byteLength(img.data, "base64");
      if (bytes > MAX_BYTES) {
        return res.status(400).json({ error: "אחת התמונות גדולה מדי (מקסימום 5MB)." });
      }
    }

    if (!provider) {
      return res.json({ verdict: DEMO_VERDICT, demo: true });
    }

    // טוען הקשר ניתוח אם סופק
    let contextBlock = "";
    if (analysisId) {
      const record = await db.get(`analysis:${analysisId}`);
      if (record) contextBlock = buildChatContext(record);
    }

    const systemPrompt = contextBlock
      ? `${MORTGAGE_DOC_SYSTEM_PROMPT}\n\n${contextBlock}`
      : `${MORTGAGE_DOC_SYSTEM_PROMPT}\n\nאין נתוני ניתוח משכנתא קיימים — הצג רק את מה שנמצא בתמונה ללא השוואה.`;

    const userPrompt =
      "קרא את מסמך/צילום המסך של הצעת המשכנתא בתמונה. " +
      "ציין את כל הפרטים הנראים בה, השווה אותם לנתוני הניתוח אם קיימים, " +
      "והצג שאלות לשאול את הבנק.";

    const verdict = await provider.chat(systemPrompt, [], userPrompt, images);

    res.json({ verdict, demo: false });
  } catch (err) {
    console.error("[mortgage-doc] שגיאה:", err.message);
    res.status(500).json({ error: "שגיאה בניתוח המסמך. נסה שוב." });
  }
});

module.exports = router;
