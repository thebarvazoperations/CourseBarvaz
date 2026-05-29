/**
 * מנוע נרטיב AI למשכנתא.
 * תומך ב-Gemini / Claude / OpenAI דרך ai-provider.js.
 * Gemini/Claude/OpenAI מייצרים רק נרטיב — כל המספרים מחושבים דטרמיניסטית ב-finance.js.
 *
 * שכבות ניטרליות:
 *  1. SYSTEM_PROMPT — כללי ה"מותר/אסור" + תבנית ה-Reframe
 *  2. buildPrompt — מבנה JSON מחייב שמונע אמירות חופשיות
 *  3. runGuardrail — קריאה שנייה שבוחנת ומחדשת
 */

const { runGuardrail } = require("./guardrail");
const { provider } = require("./ai-provider");

// ===== SYSTEM PROMPT — שכבה 1 =====
const SYSTEM_PROMPT = `אתה "כלי המשכנתא" — כלי מידע ניטרלי לשוק המשכנתאות הישראלי.
הסלוגן שלך: "זה לא יועץ משכנתאות. זה יותר טוב."

הגדרת זהות:
- אינך יועץ, אין לך רישיון, אין לך זיקה לבנק כלשהו.
- אתה כלי שנותן מידע מספרי ניטרלי, לא מי שמחליט בשביל הלקוח.

=== מה מותר ===
✓ חישוב תרחישים מספריים מדויקים
✓ הצגת טווחי ריבית ריאליים לשוק הישראלי
✓ ניתוח רגישות לשינוי ריבית
✓ תיאור שיקולים *לטובת* ו*נגד* מסלול — שניהם תמיד, ללא הכרעה
✓ benchmark ריבית לפרופיל ספציפי
✓ שאלות ניטרליות שהלקוח יכול לשאול את הבנק

=== מה אסור בהחלט ===
✗ "כדאי לך" / "עדיף עבורך" / "מתאים לך" / "הייתי בוחר"
✗ "אני ממליץ" / "ממליצים על" / "ההמלצה שלנו"
✗ שם בנק ספציפי כ*בחירה מועדפת*
✗ לשון ודאית על העתיד: "תחסוך", "תרוויח" (כתוב: "עשוי לחסוך")
✗ הכרעה בשביל המשתמש: "לכן בחר ב-X", "הפתרון הוא X"

=== כלל ה-REFRAME (חובה) ===
כשאתה רוצה לכתוב "כדאי לך X" — כתוב במקום:
  "שיקול לטובת X: [סיבה]. שיקול נגד X: [סיבה]. ההחלטה תלויה בך."

=== DISCLAIMER — חובה בסוף כל תגובה ===
"זה לא יועץ משכנתאות. זה יותר טוב. | המידע כאן הוא מידע בלבד, אינו ייעוץ משכנתאות ואינו תחליף לבעל רישיון."`;

// ===== SYSTEM PROMPT לצ'אט — גרסה מקוצרת ומחמירה =====
const CHAT_SYSTEM_PROMPT = `אתה "כלי המשכנתא" — עוזר מידע ניטרלי. הסלוגן: "זה לא יועץ משכנתאות. זה יותר טוב."

חוקים קשיחים לכל הודעה:
1. ענה בעברית, 2-4 משפטים מקסימום.
2. אסור: "כדאי לך", "אני ממליץ", "עדיף", שם בנק ספציפי כבחירה, הכרעה בשביל המשתמש.
3. מותר: נתונים, הסברים, שיקולים לכאן ולכאן, שאלות לבנק.
4. כל "כדאי" → "שיקול לטובת... שיקול נגד..."
5. סיים תמיד: "זה לא יועץ משכנתאות. זה יותר טוב."`;

// ===== PROMPT לדוח — שכבה 2: מבנה JSON מחייב =====
function buildPrompt(profile, reportData) {
  return `כתוב ניתוח נרטיבי בעברית על הפרופיל הפיננסי שלמטה.
חשוב: כל שדה בJSON חייב לעמוד בכללי הניטרליות. אין המלצות, רק שיקולים.

פרופיל אנונימי:
- סכום משכנתא: ₪${profile.loanAmount.toLocaleString("he-IL")}
- הון עצמי: ₪${profile.equity.toLocaleString("he-IL")}
- סוג עסקה: ${profile.dealType === "refinance" ? "מיחזור" : "משכנתא חדשה"}
- הכנסה חודשית נטו: ₪${profile.monthlyIncome.toLocaleString("he-IL")}
- החזרי הלוואות קיימים: ₪${profile.existingLoans.toLocaleString("he-IL")}
- גיל: ${profile.age} | תקופה: ${profile.termYears} שנים
- רמת ודאות (0=מקסימלית, 100=מוכן לסיכון): ${profile.riskTolerance}
- דירוג אשראי (0-100): ${profile.creditScore || 70}

נתונים מחושבים:
${JSON.stringify({
  capacity: reportData.capacity,
  summary: reportData.summary,
  mixes: reportData.mixes,
  benchmark: reportData.benchmark,
  refinance: reportData.refinance,
  rateOffer: reportData.rateOffer,
}, null, 2)}

החזר JSON בלבד במבנה הזה (אסור לחרוג ממנו):
{
  "intro": "משפט-שניים ניטרליים על הפרופיל — ללא שיפוטיות",
  "capacityNote": "מה מספר כושר ההחזר — עובדות בלבד",
  "mixesNote": "שיקולים לטובת ונגד כל תמהיל — בלי להכריע. חובה: לכל תמהיל שיקול אחד בעד ואחד נגד",
  "sensitivityNote": "מה מראה ניתוח הרגישות — עובדות, לא המלצות",
  "benchmarkNote": "הסבר הטווח — מה ריאלי לפרופיל זה, ללא הכרעה",
  "refinanceNote": "ניתוח נתוני המיחזור בלבד (או null)",
  "questions": [
    "שאלה 1 — ניסוח ניטרלי לשאול את הבנק",
    "שאלה 2", "שאלה 3", "שאלה 4", "שאלה 5", "שאלה 6", "שאלה 7"
  ],
  "disclaimer": "זה לא יועץ משכנתאות. זה יותר טוב. | המידע כאן הוא מידע בלבד, אינו ייעוץ משכנתאות ואינו תחליף לבעל רישיון."
}`;
}

function parseJSON(raw) {
  return JSON.parse(
    raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim()
  );
}

// ===== Fallback (ללא API) =====
function fallbackNarrative(profile, reportData) {
  const { capacity, benchmark, refinance } = reportData;
  return {
    intro: "הנתונים שהוזנו עובדו. להלן ניתוח מספרי ניטרלי.",
    capacityNote: capacity.realistic
      ? "ההחזר המשוער נמצא בטווח כלל 35% מהכנסה נטו."
      : "ההחזר המשוער חורג מכלל 35%. שיקול לטובת הארכת תקופה: יקטין החזר. שיקול נגד: יגדיל עלות כוללת.",
    mixesNote:
      "תמהיל שמרני — שיקול בעד: ודאות מלאה בהחזר. שיקול נגד: עלות כוללת גבוהה יותר.\n" +
      "תמהיל דינמי — שיקול בעד: עלות צפויה נמוכה יותר. שיקול נגד: חשיפה לעליית ריבית.\n" +
      "ההחלטה תלויה ברמת הוודאות שהפרופיל מבקש.",
    sensitivityNote:
      "ניתוח הרגישות מראה את גובה ההחזר בכל תרחיש ריבית. ככל שחלק הפריים גדול יותר, כך ההשפעה גדולה יותר.",
    benchmarkNote: `לפרופיל זה, הטווח הריאלי הוא ${benchmark.realisticLow}%–${benchmark.realisticHigh}%. נקודת התעקשות היסטורית: ${benchmark.fairPushTarget}%.`,
    refinanceNote: refinance
      ? `פוטנציאל חיסכון חודשי: ₪${refinance.monthlySaving.toLocaleString("he-IL")}. נקודת איזון: ${refinance.breakEvenMonths || "—"} חודשים.`
      : null,
    questions: [
      "מהי הריבית הנמוכה ביותר שאפשר לקבל על פרופיל כזה?",
      "מהו התמהיל שאתם מציעים ומהם השיקולים שהובילו אליו?",
      "מה ההחזר החודשי בכל מסלול בנפרד?",
      "מה קורה להחזר אם ריבית הפריים עולה ב-1%?",
      "מהן עמלות פתיחת התיק וכל עלות נלווית?",
      "מה תנאי הפירעון המוקדם בכל מסלול?",
      "אילו מסמכים נדרשים לאישור עקרוני?",
    ],
    disclaimer:
      "זה לא יועץ משכנתאות. זה יותר טוב. | המידע כאן הוא מידע בלבד, אינו ייעוץ משכנתאות ואינו תחליף לבעל רישיון.",
  };
}

// ===== generateNarrative — שלוש שכבות =====
async function generateNarrative(profile, reportData) {
  if (!provider) {
    return { narrative: fallbackNarrative(profile, reportData), demo: true };
  }

  const prompt = buildPrompt(profile, reportData);
  const draft = await provider.generate(SYSTEM_PROMPT, prompt);

  let narrative;
  try {
    narrative = parseJSON(draft);
  } catch {
    narrative = fallbackNarrative(profile, reportData);
    return { narrative, demo: false };
  }

  // שכבה 3 — guardrail על כל שדות הנרטיב
  const combinedText = [
    narrative.intro,
    narrative.capacityNote,
    narrative.mixesNote,
    narrative.sensitivityNote,
    narrative.benchmarkNote,
    narrative.refinanceNote || "",
    ...(narrative.questions || []),
  ].join("\n");

  const check = await runGuardrail(combinedText);
  if (!check.safe) {
    narrative.guardrailApplied = true;
    narrative.guardrailViolations = check.violations;
    if (check.rewrite) {
      narrative.mixesNote = check.rewrite;
    } else {
      narrative.mixesNote = fallbackNarrative(profile, reportData).mixesNote;
    }
  }

  narrative.disclaimer =
    "זה לא יועץ משכנתאות. זה יותר טוב. | המידע כאן הוא מידע בלבד, אינו ייעוץ משכנתאות ואינו תחליף לבעל רישיון.";

  return { narrative, demo: false };
}

module.exports = { generateNarrative, SYSTEM_PROMPT, CHAT_SYSTEM_PROMPT };
