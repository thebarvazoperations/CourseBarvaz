/**
 * מנוע חישובים פיננסיים למשכנתאות.
 * כל המספרים בדוח מחושבים כאן באופן דטרמיניסטי — Gemini מוסיף רק נרטיב,
 * כדי שלא יהיו "הזיות" מספריות.
 *
 * הערות מתודולוגיה (שוק ישראלי, הנחות סבירות נכון ל-2025/2026):
 *  - פריים = ריבית בנק ישראל + 1.5%. מסלול פריים משתנה עם הריבית במשק.
 *  - קל"צ = קבועה לא צמודה. יקרה יותר אך ודאית לחלוטין.
 */

// הנחות בסיס לריביות (אחוז שנתי). ניתן לעדכן בקלות במקום אחד.
const RATE_ASSUMPTIONS = {
  prime: 6.0, // ריבית פריים נוכחית משוערת
  fixedUnlinked: 4.9, // קל"צ ממוצעת
};

/**
 * תשלום חודשי לפי לוח שפיצר (אמורטיזציה).
 * @param {number} principal קרן
 * @param {number} annualRatePct ריבית שנתית באחוזים
 * @param {number} years מספר שנים
 */
function monthlyPayment(principal, annualRatePct, years) {
  if (principal <= 0 || years <= 0) return 0;
  const n = years * 12;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / n;
  const factor = Math.pow(1 + r, n);
  return (principal * r * factor) / (factor - 1);
}

/**
 * עלות כוללת על פני חיי ההלוואה (סך התשלומים).
 */
function totalCost(principal, annualRatePct, years) {
  return monthlyPayment(principal, annualRatePct, years) * years * 12;
}

/**
 * חישוב תמהיל משוקלל בין פריים לקל"צ.
 * @param {object} opts
 * @param {number} opts.principal קרן כוללת
 * @param {number} opts.years תקופה
 * @param {number} opts.primePct אחוז מהקרן בפריים (0-100)
 * @param {number} opts.rateShockPct תוספת ריבית לתרחיש רגישות (חל על הפריים בלבד)
 */
function computeMix({ principal, years, primePct, rateShockPct = 0 }) {
  const primeShare = primePct / 100;
  const fixedShare = 1 - primeShare;

  const primePrincipal = principal * primeShare;
  const fixedPrincipal = principal * fixedShare;

  const primeRate = RATE_ASSUMPTIONS.prime + rateShockPct;
  const fixedRate = RATE_ASSUMPTIONS.fixedUnlinked; // קל"צ לא מושפעת מזעזוע ריבית

  const primePayment = monthlyPayment(primePrincipal, primeRate, years);
  const fixedPayment = monthlyPayment(fixedPrincipal, fixedRate, years);

  const monthly = primePayment + fixedPayment;
  const total = monthly * years * 12;

  return {
    monthly: Math.round(monthly),
    total: Math.round(total),
    blendedRate:
      Math.round((primeRate * primeShare + fixedRate * fixedShare) * 100) / 100,
  };
}

// שלושת התמהילים הסטנדרטיים
const MIX_PROFILES = [
  { key: "conservative", label: "שמרני", primePct: 30, risk: "נמוכה" },
  { key: "balanced", label: "מאוזן", primePct: 50, risk: "בינונית" },
  { key: "dynamic", label: "דינמי", primePct: 70, risk: "גבוהה" },
];

/**
 * בונה את כל הנתונים המספריים לדוח.
 */
function buildReportData(profile) {
  const { loanAmount, monthlyIncome, existingLoans, termYears } = profile;
  const principal = loanAmount;
  const years = termYears || 25;

  // --- חלק 1: כושר החזר ---
  const maxPaymentByRule = monthlyIncome * 0.35 - existingLoans; // כלל 35%
  const availableForMortgage = Math.max(0, maxPaymentByRule);

  // --- חלק 2: שלושה תמהילים ---
  const mixes = MIX_PROFILES.map((m) => {
    const base = computeMix({ principal, years, primePct: m.primePct });
    return {
      ...m,
      ...base,
      pctOfIncome:
        monthlyIncome > 0
          ? Math.round((base.monthly / monthlyIncome) * 1000) / 10
          : 0,
      affordable: base.monthly <= availableForMortgage,
    };
  });

  // --- חלק 3: ניתוח רגישות ---
  const shocks = [0, 0.5, 1, 1.5, 2];
  const sensitivity = mixes.map((m) => ({
    key: m.key,
    label: m.label,
    points: shocks.map((s) => ({
      shock: s,
      monthly: computeMix({ principal, years, primePct: m.primePct, rateShockPct: s })
        .monthly,
    })),
  }));

  // --- חלק 4: benchmark ריבית ---
  const balancedRate = mixes.find((m) => m.key === "balanced").blendedRate;
  const benchmark = {
    realisticLow: Math.round((balancedRate - 0.4) * 100) / 100,
    realisticHigh: Math.round((balancedRate + 0.3) * 100) / 100,
    bankOpening: Math.round((balancedRate + 0.5) * 100) / 100,
    fairPushTarget: Math.round((balancedRate - 0.2) * 100) / 100,
  };

  // --- כרטיסי סיכום (מבוססי תמהיל מאוזן כברירת מחדל) ---
  const balanced = mixes.find((m) => m.key === "balanced");
  const summary = {
    monthlyPayment: balanced.monthly,
    totalCost: balanced.total,
    pctOfIncome: balanced.pctOfIncome,
    benchmarkRate: benchmark.fairPushTarget,
  };

  // --- חלק 5: רפייננס (אם רלוונטי) ---
  let refinance = null;
  if (profile.dealType === "refinance" && profile.currentRate > 0) {
    const yearsLeft = profile.yearsRemaining || years;
    const currentMonthly = monthlyPayment(principal, profile.currentRate, yearsLeft);
    const newMonthly = balanced.monthly;
    const monthlySaving = currentMonthly - newMonthly;
    const refinanceCost = Math.max(5000, principal * 0.005); // אומדן עלויות מיחזור
    const breakEvenMonths =
      monthlySaving > 0 ? Math.ceil(refinanceCost / monthlySaving) : null;
    refinance = {
      currentMonthly: Math.round(currentMonthly),
      newMonthly: Math.round(newMonthly),
      monthlySaving: Math.round(monthlySaving),
      refinanceCost: Math.round(refinanceCost),
      breakEvenMonths,
      totalSaving:
        monthlySaving > 0 ? Math.round(monthlySaving * yearsLeft * 12 - refinanceCost) : 0,
    };
  }

  return {
    capacity: {
      maxMonthlyPayment: Math.round(availableForMortgage),
      ruleNote: "מבוסס על כלל 35% מההכנסה נטו בניכוי החזרי הלוואות קיימים",
      realistic: balanced.monthly <= availableForMortgage,
    },
    summary,
    mixes,
    sensitivity,
    benchmark,
    refinance,
    assumptions: RATE_ASSUMPTIONS,
  };
}

module.exports = {
  monthlyPayment,
  totalCost,
  computeMix,
  buildReportData,
  RATE_ASSUMPTIONS,
  MIX_PROFILES,
};
