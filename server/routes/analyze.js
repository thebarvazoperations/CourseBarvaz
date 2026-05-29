/**
 * נתיבי ניתוח — יצירת רשומת ניתוח, והפקת הדוח לאחר תשלום.
 */

const express = require("express");
const crypto = require("crypto");
const router = express.Router();

const db = require("../utils/db");
const { anonymizeProfile } = require("../utils/anonymize");
const { buildReportData, buildAmortizationSchedule, computeRatios, computeRateOffer } = require("../utils/finance");
const { generateNarrative } = require("../utils/gemini");

const RAW_TTL_MS = 24 * 60 * 60 * 1000; // מחיקת נתונים גולמיים תוך 24 שעות

/**
 * שלב 1: יצירת רשומת ניתוח מהטופס (לפני תשלום).
 * שומרים פרופיל אנונימי בלבד; פרטים מזהים אינם נשמרים כלל.
 */
router.post("/create", async (req, res) => {
  try {
    const profile = anonymizeProfile(req.body);

    if (!profile.loanAmount || !profile.monthlyIncome) {
      return res.status(400).json({ error: "חסרים נתונים חיוניים (סכום/הכנסה)" });
    }

    const analysisId = crypto.randomUUID();
    const record = {
      id: analysisId,
      profile, // אנונימי בלבד
      paid: false,
      report: null,
      createdAt: Date.now(),
      rawPurgeAt: Date.now() + RAW_TTL_MS,
    };

    await db.set(`analysis:${analysisId}`, record);
    res.json({ analysisId });
  } catch (err) {
    console.error("[analyze] שגיאה ביצירה:", err.message);
    res.status(500).json({ error: "שגיאה ביצירת הניתוח" });
  }
});

/**
 * שלב 2: הפקת הדוח. דורש תשלום.
 * מבצע caching — אם הדוח כבר הופק, מחזיר אותו.
 */
router.post("/generate/:analysisId", async (req, res) => {
  try {
    const { analysisId } = req.params;
    const record = await db.get(`analysis:${analysisId}`);

    if (!record) return res.status(404).json({ error: "ניתוח לא נמצא" });
    if (!record.paid) {
      return res.status(402).json({ error: "נדרש תשלום לפני הפקת הדוח" });
    }

    // דוח קיים — מחזירים מהמטמון
    if (record.report) {
      return res.json({ report: record.report, cached: true });
    }

    const reportData = buildReportData(record.profile);

    // לוח סילוקין שנתי + יחסים פיננסיים (מבוסס תמהיל מאוזן)
    const balanced = reportData.mixes.find((m) => m.key === "balanced");
    const amortization = buildAmortizationSchedule(
      record.profile.loanAmount,
      balanced.blendedRate,
      record.profile.termYears || 25
    );
    const ratios = computeRatios(record.profile, balanced.monthly);
    reportData.amortization = amortization;
    reportData.ratios = ratios;
    reportData.rateOffer = computeRateOffer(record.profile, balanced.blendedRate, ratios);

    const { narrative, demo } = await generateNarrative(record.profile, reportData);

    const report = { data: reportData, narrative, demo, generatedAt: Date.now() };
    record.report = report;
    await db.set(`analysis:${analysisId}`, record);

    res.json({ report });
  } catch (err) {
    console.error("[analyze] שגיאה בהפקה:", err.message);
    res.status(500).json({ error: "שגיאה בהפקת הדוח. נסה שוב." });
  }
});

/**
 * שליפת דוח קיים (לרענון דף).
 */
router.get("/report/:analysisId", async (req, res) => {
  try {
    const { analysisId } = req.params;
    const record = await db.get(`analysis:${analysisId}`);
    if (!record) return res.status(404).json({ error: "ניתוח לא נמצא" });
    if (!record.paid) return res.status(402).json({ error: "נדרש תשלום" });
    res.json({ report: record.report, paid: record.paid });
  } catch (err) {
    console.error("[analyze] שגיאה בשליפה:", err.message);
    res.status(500).json({ error: "שגיאה בשליפת הדוח" });
  }
});

/**
 * quick — יצירה + סימון כשולם + הפקת דוח בקריאה אחת (ללא תשלום).
 * משמש כשמדלגים על flow התשלום.
 */
router.post("/quick", async (req, res) => {
  try {
    const profile = anonymizeProfile(req.body);
    if (!profile.loanAmount || !profile.monthlyIncome) {
      return res.status(400).json({ error: "חסרים נתונים חיוניים" });
    }
    const analysisId = require("crypto").randomUUID();
    const record = {
      id: analysisId,
      profile,
      paid: true,
      report: null,
      createdAt: Date.now(),
      rawPurgeAt: Date.now() + RAW_TTL_MS,
    };
    await db.set(`analysis:${analysisId}`, record);

    // הפקת הדוח מיד
    const reportData = buildReportData(profile);
    const balanced = reportData.mixes.find((m) => m.key === "balanced");
    const amortization = buildAmortizationSchedule(
      profile.loanAmount,
      balanced.blendedRate,
      profile.termYears || 25
    );
    reportData.amortization = amortization;
    const ratios = computeRatios(profile, balanced.monthly);
    reportData.ratios = ratios;
    reportData.rateOffer = computeRateOffer(profile, balanced.blendedRate, ratios);

    const { narrative, demo } = await generateNarrative(profile, reportData);
    const report = { data: reportData, narrative, demo, generatedAt: Date.now() };
    record.report = report;
    await db.set(`analysis:${analysisId}`, record);

    res.json({ analysisId, report });
  } catch (err) {
    console.error("[analyze/quick] שגיאה:", err.message);
    res.status(500).json({ error: "שגיאה בהפקת הדוח. נסה שוב." });
  }
});

/**
 * משימת ניקוי — מוחקת נתונים גולמיים ישנים (מעבר ל-24 שעות).
 * הדוח המופק נשמר, אך הפרופיל הגולמי מוסר.
 */
async function purgeOldRawData() {
  try {
    const keys = await db.list("analysis:");
    const now = Date.now();
    for (const key of keys) {
      const record = await db.get(key);
      if (record && record.rawPurgeAt && now > record.rawPurgeAt && record.profile) {
        delete record.profile;
        record.profilePurged = true;
        await db.set(key, record);
      }
    }
  } catch (err) {
    console.warn("[purge] שגיאה בניקוי נתונים:", err.message);
  }
}

module.exports = { router, purgeOldRawData };
