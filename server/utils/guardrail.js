/**
 * Guardrail — שכבת ניטרליות כפולה:
 * 1. regex מהיר על מילות מפתח סובייקטיביות
 * 2. קריאה שנייה ל-Gemini עם רשימת בדיקה מפורטת
 *
 * עיקרון: אם *אחת* מהשכבות מוצאת בעיה — הטקסט נחשב לא בטוח.
 */

const GUARDRAIL_PROMPT = `אתה בוחן ניטרליות לכלי מידע פיננסי. בדוק את הטקסט הבא לפי הקריטריונים:

BIAS_TYPES:
1. המלצה אישית — ביטויים כמו "כדאי לך", "עדיף עבורך", "מתאים לך", "אני ממליץ", "הייתי בוחר", "הבחירה הטובה"
2. הכרעה בשביל המשתמש — "לכן בחר ב-X", "הפתרון הוא X", "ברור ש-X"
3. בנק ספציפי כבחירה מומלצת — "הבנק הכי טוב הוא", "פנה ל-X"
4. שימוש ב"אנחנו" בצורה הטיית דעת — "אנחנו ממליצים", "לדעתנו כדאי"
5. לשון עתידית חד-משמעית — "תחסוך", "תרוויח", "תפסיד" (במקום "עשוי לחסוך", "עשוי להרוויח")

כלל ה-Reframe: כל "כדאי לך X" חייב להיות "שיקול לטובת X הוא... שיקול נגד הוא..."

החזר JSON בלבד, ללא code fences:
{
  "safe": true/false,
  "violations": ["תיאור קצר של כל הפרה שנמצאה"],
  "rewrite": "גרסה מתוקנת מלאה אם safe=false, אחרת null"
}

הטקסט לבדיקה:
"""
{{TEXT}}
"""`;

// רשימה מקיפה של ביטויים אסורים (Hebrew + mixed)
const FORBIDDEN_PATTERNS = [
  /כדאי\s+לך/i,
  /עדיף\s+(?:לך|עבורך|שתבחר)/i,
  /מתאים\s+(?:לך|לפרופיל\s+שלך)/i,
  /אני\s+ממליץ/i,
  /ממליצים\s+(?:לך|על)/i,
  /ההמלצה\s+(?:שלי|שלנו)/i,
  /הייתי\s+(?:בוחר|לוקח|ממליץ)/i,
  /הבחירה\s+(?:הנכונה|הטובה|המתאימה)/i,
  /לכן\s+(?:בחר|קח|פנה)/i,
  /ברור\s+ש/i,
  /הפתרון\s+(?:הוא|הטוב)\s+/i,
  /תחסוך\s+(?:הרבה|כסף)/i, // לשון ודאית (לא "עשוי לחסוך")
];

function localCheck(text) {
  const violations = FORBIDDEN_PATTERNS
    .filter((p) => p.test(text))
    .map((p) => p.source);
  return { safe: violations.length === 0, violations, rewrite: null };
}

/**
 * @param {object|null} model מודל Gemini מאותחל (null = demo)
 * @param {string} text הטיוטה לבדיקה
 * @returns {{ safe: boolean, violations: string[], rewrite: string|null }}
 */
async function runGuardrail(model, text) {
  const local = localCheck(text);

  if (!model) return local;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: GUARDRAIL_PROMPT.replace("{{TEXT}}", text) }] }],
    });
    let raw = result.response.text().trim()
      .replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(raw);

    // כל הפרה — גם מקומית, גם מה-AI — מדליקה אדום
    const combinedViolations = [...(local.violations || []), ...(parsed.violations || [])];
    if (!local.safe || !parsed.safe) {
      return {
        safe: false,
        violations: combinedViolations,
        rewrite: parsed.rewrite || null,
      };
    }
    return { safe: true, violations: [], rewrite: null };
  } catch (err) {
    console.warn("[guardrail] קריאת Gemini נכשלה, נופל לבדיקה מקומית:", err.message);
    return local;
  }
}

module.exports = { runGuardrail, GUARDRAIL_PROMPT };
