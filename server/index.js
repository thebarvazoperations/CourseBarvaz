/**
 * כלי המשכנתא — שרת Express.
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const express = require("express");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");

const { router: analyzeRouter, purgeOldRawData } = require("./routes/analyze");
const { router: paymentRouter, webhookHandler } = require("./routes/payment");
const chatRouter = require("./routes/chat");
const mortgageDocRouter = require("./routes/mortgage-doc");

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.set("trust proxy", 1); // מאחורי proxy של Replit

// --- Stripe webhook חייב raw body, לפני json parser ---
app.post("/api/payment/webhook", express.raw({ type: "application/json" }), webhookHandler);

// --- Middleware כללי ---
app.use(cors({ origin: CLIENT_URL, credentials: true }));
// נתיב הצ'אט מקבל תמונות (base64) — מגבלת גוף גדולה יותר, לפני ה-parser הכללי
app.use("/api/chat", express.json({ limit: "8mb" }), chatRouter);
app.use("/api/mortgage-doc", express.json({ limit: "8mb" }), mortgageDocRouter);
app.use(express.json({ limit: "100kb" }));

// --- Rate limiting: 10 בקשות לשעה ל-IP על נתיבי ה-API ---
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "חרגת ממכסת הבקשות. נסה שוב בעוד שעה." },
});
app.use("/api/analyze", apiLimiter);
app.use("/api/mortgage-doc", apiLimiter);

// --- Routes ---
app.use("/api/analyze", analyzeRouter);
app.use("/api/payment", paymentRouter);
// /api/chat כבר מותקן למעלה עם parser בגודל מוגדל

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    gemini: !!process.env.GEMINI_API_KEY,
    stripe: !!process.env.STRIPE_SECRET_KEY,
  });
});

// --- הגשת הקליינט בבילד (production) ---
const clientDist = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) next();
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[server] כלי המשכנתא רץ על פורט ${PORT}`);
});

// --- ניקוי נתונים גולמיים כל שעה ---
setInterval(purgeOldRawData, 60 * 60 * 1000);
purgeOldRawData();
