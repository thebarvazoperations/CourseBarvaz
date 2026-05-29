/**
 * Guardrail — קריאה שנייה ל-Gemini שבודקת שהטקסט נשאר ניטרלי
 * (ללא המלצה אישית, ללא בחירת בנק, ללא הכרעה בשביל המשתמש).
 */

const GUARDRAIL_PROMPT = `בדוק אם הטקסט הבא כולל אחד מאלה:
1. המלצה אישית ("כדאי לך", "עדיף עבורך", "מתאים לך", "אני ממליץ")
2. שם בנק ספציפי כבחירה מומלצת
3. הכרעה בשביל המשתמש (בחירה במקומו)

החזר JSON בלבד, ללא טקסט נוסף וללא code fences:
{"safe": true/false, "rewrite": "גרסה מתוקנת אם safe=false, אחרת null"}

הטקסט לבדיקה:
"""
{{TEXT}}
"""`;

// fallback מבוסס regex למקרה שהקריאה ל-Gemini נכשלת
const FORBIDDEN_PATTERNS = [
  /כדאי\s+לך/,
  /עדיף\s+(?:לך|עבורך)/,
  /מתאים\s+לך/,
  /אני\s+ממליץ/,
  /ההמלצה\s+שלי/,
];

function localCheck(text) {
  const hit = FORBIDDEN_PATTERNS.some((p) => p.test(text));
  return { safe: !hit, rewrite: null };
}

/**
 * @param {object} model מודל Gemini מאותחל
 * @param {string} text הטיוטה לבדיקה
 */
async function runGuardrail(model, text) {
  // בדיקה מקומית מהירה תמיד רצה
  const local = localCheck(text);

  if (!model) return local;

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: GUARDRAIL_PROMPT.replace("{{TEXT}}", text) }],
        },
      ],
    });
    let raw = result.response.text().trim();
    // ניקוי code fences אם הוחזרו
    raw = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(raw);
    // אם אחת מהבדיקות מצאה בעיה — לא בטוח
    if (!local.safe && parsed.safe) {
      return { safe: false, rewrite: parsed.rewrite || null };
    }
    return parsed;
  } catch (err) {
    console.warn("[guardrail] קריאת Gemini נכשלה, נופל לבדיקה מקומית:", err.message);
    return local;
  }
}

module.exports = { runGuardrail, GUARDRAIL_PROMPT };
