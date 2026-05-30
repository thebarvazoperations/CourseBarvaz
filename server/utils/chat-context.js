/**
 * בונה את הקשר העובדתי לצ'אט מתוך רשומת ניתוח שמורה.
 * זהו מקור האמת היחיד שממנו הבוט רשאי לצטט מספרים על ההלוואה.
 */

const fmt = (n) => (typeof n === "number" ? n.toLocaleString("he-IL") : "—");

function buildChatContext(record) {
  if (!record?.report?.data) return "";
  const p = record.profile || {};
  const d = record.report.data;
  const n = record.report.narrative || {};

  const lines = [];
  lines.push("=== נתוני הניתוח של המשתמש (מקור האמת היחיד למספרים) ===");

  // פרופיל
  if (!record.profilePurged) {
    lines.push("— פרופיל —");
    lines.push(`סכום משכנתא: ${fmt(p.loanAmount)} ₪`);
    lines.push(`הון עצמי: ${fmt(p.equity)} ₪`);
    lines.push(`סוג עסקה: ${p.dealType === "refinance" ? "מיחזור" : "משכנתא חדשה"}`);
    if (p.dealType === "refinance" && p.currentRate) {
      lines.push(`ריבית נוכחית: ${p.currentRate}% | שנים שנותרו: ${p.yearsRemaining || "—"}`);
    }
    lines.push(`הכנסה חודשית נטו: ${fmt(p.monthlyIncome)} ₪`);
    lines.push(`החזרי הלוואות קיימים: ${fmt(p.existingLoans)} ₪`);
    lines.push(`גיל: ${p.age || "—"} | תקופה מבוקשת: ${p.termYears || 25} שנים`);
    if (p.creditScore) lines.push(`דירוג אשראי: ${p.creditScore}/850`);
    if (p.liquidAssets) lines.push(`נכסים נזילים: ${fmt(p.liquidAssets)} ₪`);
  }

  // כושר החזר
  if (d.capacity) {
    lines.push("— כושר החזר —");
    lines.push(`החזר מקסימלי (כלל 35%): ${fmt(d.capacity.maxMonthlyPayment)} ₪`);
    lines.push(`הבקשה בתחום הנורמה: ${d.capacity.realistic ? "כן" : "לא"}`);
  }

  // יחסים
  if (d.ratios) {
    lines.push("— יחסים פיננסיים —");
    lines.push(`LTV: ${d.ratios.ltv}% (${d.ratios.ltvOk ? "תקין" : "גבוה מ-75%"})`);
    lines.push(`DTI: ${d.ratios.dti}% (${d.ratios.dtiOk ? "תקין" : "גבוה מ-40%"})`);
    lines.push(`שווי נכס מוערך: ${fmt(d.ratios.propertyValue)} ₪`);
  }

  // תמהילים
  if (Array.isArray(d.mixes)) {
    lines.push("— תמהילים —");
    d.mixes.forEach((m) => {
      let line = `${m.label}: החזר ${fmt(m.monthly)} ₪/חודש, עלות כוללת ${fmt(m.total)} ₪, ריבית משוקללת ${m.blendedRate}%, ${m.pctOfIncome}% מההכנסה`;
      if (Array.isArray(m.tracks)) {
        const tracks = m.tracks.map((t) => `${t.name} ${fmt(t.amount)}₪ @ ${t.rate}% = ${fmt(t.monthly)}₪`).join("; ");
        line += ` [מסלולים: ${tracks}]`;
      }
      lines.push(line);
    });
  }

  // benchmark
  if (d.benchmark) {
    lines.push("— Benchmark ריבית —");
    lines.push(`טווח ריאלי: ${d.benchmark.realisticLow}%–${d.benchmark.realisticHigh}% | הבנק פותח ב-${d.benchmark.bankOpening}% | נקודת התעקשות: ${d.benchmark.fairPushTarget}%`);
  }

  // הריבית שמגיע לך
  if (d.rateOffer) {
    lines.push("— הריבית שמגיע לך —");
    lines.push(`ריבית בסיס: ${d.rateOffer.base}% | הריבית שמגיע לך: ${d.rateOffer.deservedRate}% | הבנק יפתח ב-${d.rateOffer.bankOpening}% | פער: ${d.rateOffer.gapBps} נק' בסיס`);
    if (Array.isArray(d.rateOffer.adjustments)) {
      d.rateOffer.adjustments.forEach((a) => {
        lines.push(`  • ${a.factor} (${a.detail}): ${a.bps > 0 ? "+" : ""}${a.bps} נק' בסיס`);
      });
    }
  }

  // מיחזור
  if (d.refinance) {
    lines.push("— מיחזור —");
    lines.push(`החזר נוכחי: ${fmt(d.refinance.currentMonthly)} ₪ | לאחר מיחזור: ${fmt(d.refinance.newMonthly)} ₪ | חיסכון חודשי: ${fmt(d.refinance.monthlySaving)} ₪ | נקודת איזון: ${d.refinance.breakEvenMonths || "—"} חודשים`);
  }

  return lines.join("\n");
}

module.exports = { buildChatContext };
