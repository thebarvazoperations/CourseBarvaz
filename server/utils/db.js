/**
 * שכבת גישה למסד נתונים.
 * משתמש ב-Replit DB כשהוא זמין (בתוך Replit), אחרת נופל ל-store בזיכרון
 * כדי לאפשר פיתוח מקומי ללא תלות חיצונית.
 */

let store;

try {
  // @replit/database עובד אוטומטית בתוך סביבת Replit
  const Database = require("@replit/database");
  const client = new Database();
  store = {
    async get(key) {
      const res = await client.get(key);
      // הגרסאות החדשות מחזירות { ok, value }
      if (res && typeof res === "object" && "ok" in res) {
        return res.ok ? res.value : null;
      }
      return res ?? null;
    },
    async set(key, value) {
      await client.set(key, value);
    },
    async delete(key) {
      await client.delete(key);
    },
    async list(prefix = "") {
      const res = await client.list(prefix);
      if (res && typeof res === "object" && "ok" in res) {
        return res.ok ? res.value : [];
      }
      return res || [];
    },
  };
  console.log("[db] משתמש ב-Replit DB");
} catch (err) {
  // fallback בזיכרון לפיתוח מקומי
  const mem = new Map();
  store = {
    async get(key) {
      return mem.has(key) ? mem.get(key) : null;
    },
    async set(key, value) {
      mem.set(key, value);
    },
    async delete(key) {
      mem.delete(key);
    },
    async list(prefix = "") {
      return [...mem.keys()].filter((k) => k.startsWith(prefix));
    },
  };
  console.warn("[db] Replit DB לא זמין — משתמש ב-store בזיכרון (פיתוח בלבד)");
}

module.exports = store;
