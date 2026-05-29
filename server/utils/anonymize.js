/**
 * אנונימיזציה של פרופיל המשתמש לפני שליחה ל-Gemini.
 * שולחים אך ורק נתונים פיננסיים — לעולם לא פרטים מזהים.
 */

const PII_FIELDS = ["name", "email", "phone", "idNumber", "fullName", "tz"];

/**
 * מחזיר אובייקט נקי שמכיל רק שדות פיננסיים מותרים.
 */
function anonymizeProfile(data = {}) {
  return {
    loanAmount: Number(data.loanAmount) || 0,
    equity: Number(data.equity) || 0,
    dealType: data.dealType === "refinance" ? "refinance" : "new",
    currentRate: data.dealType === "refinance" ? Number(data.currentRate) || 0 : null,
    yearsRemaining:
      data.dealType === "refinance" ? Number(data.yearsRemaining) || 0 : null,
    monthlyIncome: Number(data.monthlyIncome) || 0,
    existingLoans: Number(data.existingLoans) || 0,
    age: Number(data.age) || 0,
    termYears: Number(data.termYears) || 25,
    // 0 = ודאות מקסימלית, 100 = מוכן לסיכון בשביל ריבית נמוכה
    riskTolerance: Math.min(100, Math.max(0, Number(data.riskTolerance) || 50)),
    // דירוג אשראי: 0-100 (סקאלה מנורמלת. 100 = מצוין)
    creditScore: Math.min(100, Math.max(0, Number(data.creditScore) || 70)),
    // נכסים נזילים / חסכונות נוספים (₪) — מעבר להון העצמי
    liquidAssets: Number(data.liquidAssets) || 0,
  };
}

/**
 * בודק שאין דליפת PII באובייקט (הגנה כפולה).
 */
function stripPII(obj = {}) {
  const clean = { ...obj };
  for (const field of PII_FIELDS) {
    delete clean[field];
  }
  return clean;
}

module.exports = { anonymizeProfile, stripPII, PII_FIELDS };
