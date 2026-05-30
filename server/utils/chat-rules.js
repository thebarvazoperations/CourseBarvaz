/**
 * טעינת חוקי הצ'אט וה-blocklist מקבצי קונפיג ניתנים לעריכה.
 * הקבצים נטענים מחדש כשהם משתנים (בדיקת mtime) — אין צורך בהפעלה מחדש של השרת.
 */

const fs = require("fs");
const path = require("path");

const RULES_PATH = path.join(__dirname, "..", "config", "chat-rules.md");
const BLOCKLIST_PATH = path.join(__dirname, "..", "config", "chat-blocklist.json");

let rulesCache = { mtime: 0, content: "" };
let blockCache = { mtime: 0, patterns: [], onViolation: "replace" };

function getChatRules() {
  try {
    const stat = fs.statSync(RULES_PATH);
    if (stat.mtimeMs !== rulesCache.mtime) {
      rulesCache = { mtime: stat.mtimeMs, content: fs.readFileSync(RULES_PATH, "utf8") };
    }
  } catch (err) {
    console.warn("[chat-rules] לא ניתן לטעון chat-rules.md:", err.message);
    return "";
  }
  return rulesCache.content;
}

function loadBlocklist() {
  try {
    const stat = fs.statSync(BLOCKLIST_PATH);
    if (stat.mtimeMs !== blockCache.mtime) {
      const raw = JSON.parse(fs.readFileSync(BLOCKLIST_PATH, "utf8"));
      const patterns = (raw.forbidden || []).map(
        (p) => new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
      );
      blockCache = { mtime: stat.mtimeMs, patterns, onViolation: raw.onViolation || "replace" };
    }
  } catch (err) {
    console.warn("[chat-rules] לא ניתן לטעון chat-blocklist.json:", err.message);
  }
  return blockCache;
}

/**
 * בודק אם טקסט מכיל ביטוי אסור.
 * @returns {{ clean: boolean, hits: string[] }}
 */
function checkBlocklist(text) {
  const { patterns } = loadBlocklist();
  const hits = patterns.filter((re) => re.test(text)).map((re) => re.source);
  return { clean: hits.length === 0, hits };
}

module.exports = { getChatRules, checkBlocklist };
