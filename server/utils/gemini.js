/**
 * אינטגרציה עם Google Gemini (gemini-1.5-flash).
 * מייצר את הנרטיב של הדוח על בסיס הנתונים המספריים שכבר חושבו.
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { runGuardrail } = require("./guardrail");

const SYSTEM_PROMPT = `אתה כלי מידע משכנתאות ניטרלי לשוק הישראלי.
אין לך זיקה לאף בנק. אתה לא יועץ ואין לך רישיון.

מותר:
- לחשב תרחישים מספריים מדויקים
- להציג טווחי ריבית ריאליים
- לנתח רגישות לשינוי ריבית
- לתאר שיקולים לטובת ולנגד מסלולים
- benchmark ריבית לפרופיל זה

אסור:
- "כדאי לך" / "מתאים לך" / "עדיף עבורך"
- להמליץ על בנק ספציפי
- להכריע בשביל המשתמש

כשאתה רוצה לכתוב "כדאי לך X" — כתוב:
"שיקול לטובת X הוא... שיקול נגד הוא..."

סיים תמיד ב:
"המידע כאן הוא מידע בלבד, אינו ייעוץ משכנתאות
ואינו תחליף לבעל רישיון."`;

let genAI = null;
let model = null;

if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_PROMPT,
  });
}
// מודל נפרד ל-guardrail ללא system instruction
const guardModel = genAI
  ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  : null;

function buildPrompt(profile, reportData) {
  return `הנה פרופיל פיננסי אנונימי ונתונים מספריים שכבר חושבו. כתוב ניתוח נרטיבי בעברית.

פרופיל:
- סכום משכנתא: ${profile.loanAmount.toLocaleString("he-IL")} ₪
- הון עצמי: ${profile.equity.toLocaleString("he-IL")} ₪
- סוג עסקה: ${profile.dealType === "refinance" ? "מיחזור" : "משכנתא חדשה"}
- הכנסה חודשית נטו: ${profile.monthlyIncome.toLocaleString("he-IL")} ₪
- החזרי הלוואות קיימים: ${profile.existingLoans.toLocaleString("he-IL")} ₪
- גיל: ${profile.age}
- תקופה מבוקשת: ${profile.termYears} שנים
- רמת ודאות מועדפת (0=ודאות מקסימלית, 100=מוכן לסיכון): ${profile.riskTolerance}

נתונים מחושבים:
${JSON.stringify(reportData, null, 2)}

כתוב פסקאות קצרות וברורות עבור כל אחד מהחלקים הבאים. החזר JSON בלבד במבנה:
{
  "intro": "פסקת פתיחה אישית-נייטרלית על הפרופיל",
  "capacityNote": "ניתוח כושר ההחזר במשפט-שניים",
  "mixesNote": "השוואה בין שלושת התמהילים — שיקולים לכאן ולכאן, ללא הכרעה",
  "sensitivityNote": "מה מלמד ניתוח הרגישות",
  "benchmarkNote": "הסבר על טווח הריבית לדרוש",
  "refinanceNote": "ניתוח המיחזור (או null אם לא רלוונטי)",
  "questions": ["7 שאלות חדות לשאול את הבנק"],
  "disclaimer": "המידע כאן הוא מידע בלבד, אינו ייעוץ משכנתאות ואינו תחליף לבעל רישיון."
}`;
}

function parseJSON(raw) {
  let s = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  return JSON.parse(s);
}

/**
 * נרטיב ברירת מחדל כשאין מפתח API (מצב דמו/פיתוח).
 */
function fallbackNarrative(profile, reportData) {
  return {
    intro:
      "להלן ניתוח ניטרלי של הפרופיל הפיננסי שהוזן. המספרים חושבו לפי הנחות שוק שמרניות.",
    capacityNote: reportData.capacity.realistic
      ? "ההחזר החודשי המשוער נמצא בתוך גבול 35% מההכנסה נטו."
      : "ההחזר החודשי המשוער חורג מגבול 35% מההכנסה נטו — שיקול לטובת הארכת תקופה או הקטנת סכום.",
    mixesNote:
      "תמהיל שמרני מקטין חשיפה לשינויי ריבית אך עלותו הכוללת גבוהה יותר. תמהיל דינמי מוזיל את העלות הצפויה אך מגדיל את החשיפה. שיקול לטובת כל אחד תלוי ברמת הוודאות הרצויה.",
    sensitivityNote:
      "ככל ששיעור הפריים בתמהיל גבוה יותר, כך ההחזר רגיש יותר לעליית ריבית. הטבלה מציגה את ההפרש בכל תרחיש.",
    benchmarkNote: `טווח ריבית ריאלי לפרופיל זה הוא ${reportData.benchmark.realisticLow}%–${reportData.benchmark.realisticHigh}%. נקודת התעקשות סבירה: ${reportData.benchmark.fairPushTarget}%.`,
    refinanceNote: reportData.refinance
      ? `החיסכון החודשי המשוער הוא ${reportData.refinance.monthlySaving} ₪, עם נקודת איזון לאחר ${reportData.refinance.breakEvenMonths || "—"} חודשים.`
      : null,
    questions: [
      "מהי הריבית הנמוכה ביותר שאתם יכולים לאשר לפרופיל שלי?",
      "מהו תמהיל המסלולים שאתם מציעים ולמה דווקא הוא?",
      "מה ההחזר החודשי בכל מסלול בנפרד?",
      "מה קורה להחזר אם הפריים יעלה ב-1%?",
      "האם יש עמלות פתיחת תיק או עלויות נלוות?",
      "מהם תנאי הפירעון המוקדם בכל מסלול?",
      "האם ניתן לשלב מסלול בריבית קבועה ארוכה לוודאות?",
    ],
    disclaimer:
      "המידע כאן הוא מידע בלבד, אינו ייעוץ משכנתאות ואינו תחליף לבעל רישיון.",
  };
}

/**
 * מייצר את נרטיב הדוח, כולל מעבר guardrail.
 */
async function generateNarrative(profile, reportData) {
  if (!model) {
    return { narrative: fallbackNarrative(profile, reportData), demo: true };
  }

  const prompt = buildPrompt(profile, reportData);
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });
  const draft = result.response.text();

  // guardrail על הטקסט החופשי (שדות הנרטיב)
  const narrative = parseJSON(draft);
  const combinedText = [
    narrative.intro,
    narrative.capacityNote,
    narrative.mixesNote,
    narrative.sensitivityNote,
    narrative.benchmarkNote,
    narrative.refinanceNote || "",
  ].join("\n");

  const check = await runGuardrail(guardModel, combinedText);
  if (!check.safe && check.rewrite) {
    narrative.guardrailApplied = true;
    narrative.mixesNote = check.rewrite; // מחליפים את החלק הסובייקטיבי ביותר
  }

  return { narrative, demo: false };
}

module.exports = { generateNarrative, SYSTEM_PROMPT };
