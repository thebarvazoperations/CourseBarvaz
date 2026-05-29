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

// buildAmortizationSchedule and computeRatios defined below

/**
 * לוח סילוקין שנתי — מחזיר snapshot לכל שנה:
 * {year, principalPaid, interestPaid, balance, cumulativeInterest}
 */
function buildAmortizationSchedule(principal, annualRatePct, years) {
  const n = years * 12;
  const r = annualRatePct / 100 / 12;
  const payment = r === 0 ? principal / n : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  const schedule = [];
  let balance = principal;
  let cumulativeInterest = 0;

  for (let year = 1; year <= years; year++) {
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;
    for (let m = 0; m < 12; m++) {
      const interestPayment = balance * r;
      const principalPayment = payment - interestPayment;
      yearlyInterest += interestPayment;
      yearlyPrincipal += principalPayment;
      balance = Math.max(0, balance - principalPayment);
    }
    cumulativeInterest += yearlyInterest;
    schedule.push({
      year,
      principalPaid: Math.round(yearlyPrincipal),
      interestPaid: Math.round(yearlyInterest),
      balance: Math.round(balance),
      cumulativeInterest: Math.round(cumulativeInterest),
    });
  }
  return schedule;
}

/**
 * LTV ו-DTI — יחסים פיננסיים מרכזיים
 */
function computeRatios(profile, balancedMonthly) {
  const propertyValue = profile.loanAmount + profile.equity;
  const ltv = propertyValue > 0 ? Math.round((profile.loanAmount / propertyValue) * 1000) / 10 : 0;
  const dti = profile.monthlyIncome > 0
    ? Math.round(((balancedMonthly + profile.existingLoans) / profile.monthlyIncome) * 1000) / 10
    : 0;
  const maxLTV = 75; // הגבלת בנק ישראל למשפחה ראשונה
  return {
    ltv,
    dti,
    ltvOk: ltv <= maxLTV,
    dtiOk: dti <= 40,
    propertyValue: Math.round(propertyValue),
    maxLTV,
  };
}

/**
 * תווית מילולית לדירוג אשראי (0-100).
 */
function creditTier(score) {
  if (score >= 85) return { label: "מצוין", color: "#10b981" };
  if (score >= 70) return { label: "טוב", color: "#6366f1" };
  if (score >= 50) return { label: "בינוני", color: "#f59e0b" };
  return { label: "חלש", color: "#ef4444" };
}

/**
 * מנוע "הריבית שמגיע לך".
 * לוקח דירוג אשראי, LTV, DTI ונכסים נזילים, ומחשב:
 *  - dealsRate: הריבית שהבנק *אמור* לתת לפרופיל כזה (היעד הריאלי)
 *  - bankOpening: הריבית שהבנק יפתח בה בדרך כלל (גבוהה יותר)
 *  - gapBps: הפער בנקודות בסיס שצריך "להילחם" עליו
 *  - leverage: רשימת מנופים — כל גורם, ההשפעה שלו, ומה להתעקש עליו
 *
 * המתודולוגיה: מתחילים מריבית בסיס (ה-blendedRate המאוזן) ומיישמים
 * התאמות (בנקודות בסיס, bps) לכל גורם פרופיל. הריבית שמגיע לך = בסיס + סך ההתאמות.
 */
function computeRateOffer(profile, balancedRate, ratios) {
  const base = balancedRate; // נקודת המוצא הניטרלית
  const adjustments = [];

  // --- דירוג אשראי --- (טווח השפעה כ-0.6%)
  const credit = creditTier(profile.creditScore);
  // ככל שהדירוג גבוה יותר, הריבית נמוכה יותר. 85+ => -0.30%, 50- => +0.30%
  const creditBps = Math.round((70 - profile.creditScore) * 0.6); // לדוגמה score=100 => -18bps
  adjustments.push({
    factor: "דירוג אשראי",
    detail: `${credit.label} (${profile.creditScore}/100)`,
    bps: creditBps,
    insist:
      profile.creditScore >= 70
        ? "הצג דו\"ח נתוני אשראי עדכני — דירוג גבוה הוא קלף מיקוח חזק להורדת ריבית."
        : "שפר דירוג לפני הגשה: סגור מסגרות אשראי לא מנוצלות והסר חריגות.",
    positive: creditBps <= 0,
  });

  // --- LTV (מינוף) --- (ככל שנמוך יותר, סיכון נמוך => ריבית נמוכה)
  const ltvBps = Math.round((ratios.ltv - 60) * 0.8); // LTV=60 => 0, LTV=75 => +12bps
  adjustments.push({
    factor: "מינוף (LTV)",
    detail: `${ratios.ltv}% משווי הנכס`,
    bps: ltvBps,
    insist:
      ratios.ltv > 60
        ? "הוספת הון עצמי שתוריד את ה-LTV מתחת ל-60% יכולה להוריד את הריבית משמעותית."
        : "מינוף נמוך — דרוש את הריבית הנמוכה בטווח. אתה לקוח בסיכון נמוך לבנק.",
    positive: ltvBps <= 0,
  });

  // --- DTI (יחס החזר) ---
  const dtiBps = Math.round((ratios.dti - 30) * 0.5); // DTI=30 => 0
  adjustments.push({
    factor: "יחס החזר (DTI)",
    detail: `${ratios.dti}% מההכנסה`,
    bps: dtiBps,
    insist:
      ratios.dti > 35
        ? "צמצם הלוואות קיימות או הארך תקופה — יחס החזר נמוך מאותת על לווה יציב."
        : "יחס החזר בריא — נקודת חוזק במשא ומתן.",
    positive: dtiBps <= 0,
  });

  // --- נכסים נזילים --- (כרית ביטחון מורידה סיכון)
  const assetMonths =
    profile.monthlyIncome > 0 ? profile.liquidAssets / profile.monthlyIncome : 0;
  // 6 חודשי הכנסה ומעלה => עד -15bps
  const assetBps = assetMonths >= 6 ? -15 : assetMonths >= 3 ? -8 : 0;
  adjustments.push({
    factor: "נכסים נזילים",
    detail:
      assetMonths >= 1
        ? `כרית של ~${Math.round(assetMonths)} חודשי הכנסה`
        : "כרית ביטחון נמוכה",
    bps: assetBps,
    insist:
      assetBps < 0
        ? "הצג חסכונות/נכסים נזילים — הם מוכיחים יציבות ומפחיתים את הסיכון בעיני הבנק."
        : "בניית כרית ביטחון של 3-6 חודשי הכנסה תחזק את עמדת המיקוח.",
    positive: assetBps <= 0,
  });

  const totalBps = adjustments.reduce((s, a) => s + a.bps, 0);
  const deservedRate = Math.round((base + totalBps / 100) * 100) / 100;
  const bankOpening = Math.round((deservedRate + 0.5) * 100) / 100; // הבנק תמיד פותח גבוה יותר
  const gapBps = Math.round((bankOpening - deservedRate) * 100);

  return {
    base: Math.round(base * 100) / 100,
    deservedRate,
    bankOpening,
    gapBps,
    creditTier: credit,
    adjustments,
    // חיסכון חודשי פוטנציאלי אם תשיג את הריבית שמגיע לך במקום הפתיחה
    note:
      "הריבית שמגיע לך מחושבת מהפרופיל שלך. הפער מול הצעת הפתיחה הוא מה שצריך להשיג במשא ומתן.",
  };
}

module.exports = {
  monthlyPayment,
  totalCost,
  computeMix,
  buildReportData,
  buildAmortizationSchedule,
  computeRatios,
  computeRateOffer,
  creditTier,
  RATE_ASSUMPTIONS,
  MIX_PROFILES,
};
