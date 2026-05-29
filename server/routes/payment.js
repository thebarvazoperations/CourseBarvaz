/**
 * נתיבי תשלום — Stripe Checkout.
 * אנחנו לא נוגעים בפרטי כרטיס; Stripe מטפל בכל.
 */

const express = require("express");
const router = express.Router();
const db = require("../utils/db");

const PRICE_AGOROT = Number(process.env.ANALYSIS_PRICE_AGOROT) || 50000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
}

/**
 * יצירת Checkout Session.
 * הקליינט שולח sessionId (מזהה הניתוח שכבר נשמר ב-DB עם הפרופיל).
 */
router.post("/create-checkout", async (req, res) => {
  try {
    const { analysisId } = req.body;
    if (!analysisId) {
      return res.status(400).json({ error: "חסר מזהה ניתוח" });
    }

    const record = await db.get(`analysis:${analysisId}`);
    if (!record) {
      return res.status(404).json({ error: "ניתוח לא נמצא" });
    }

    // מצב דמו ללא Stripe — מסמנים כשולם ומחזירים קישור ישיר
    if (!stripe) {
      record.paid = true;
      await db.set(`analysis:${analysisId}`, record);
      return res.json({
        demo: true,
        url: `${CLIENT_URL}/report/${analysisId}`,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "ils",
            product_data: {
              name: "כלי המשכנתא — ניתוח AI ניטרלי",
              description: "ניתוח מלא: תמהילים, רגישות, benchmark ריבית ושאלות לבנק",
            },
            unit_amount: PRICE_AGOROT,
          },
          quantity: 1,
        },
      ],
      success_url: `${CLIENT_URL}/report/${analysisId}?paid=1`,
      cancel_url: `${CLIENT_URL}/payment/${analysisId}?canceled=1`,
      metadata: { analysisId },
    });

    record.stripeSessionId = session.id;
    await db.set(`analysis:${analysisId}`, record);

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("[payment] שגיאה ביצירת checkout:", err.message);
    res.status(500).json({ error: "שגיאה ביצירת תשלום. נסה שוב." });
  }
});

/**
 * אימות תשלום אחרי חזרה מ-Stripe (בשימוש כשאין webhook).
 */
router.get("/verify/:analysisId", async (req, res) => {
  try {
    const { analysisId } = req.params;
    const record = await db.get(`analysis:${analysisId}`);
    if (!record) return res.status(404).json({ error: "ניתוח לא נמצא" });

    if (record.paid) return res.json({ paid: true });

    if (stripe && record.stripeSessionId) {
      const session = await stripe.checkout.sessions.retrieve(record.stripeSessionId);
      if (session.payment_status === "paid") {
        record.paid = true;
        await db.set(`analysis:${analysisId}`, record);
        return res.json({ paid: true });
      }
    }

    res.json({ paid: false });
  } catch (err) {
    console.error("[payment] שגיאה באימות:", err.message);
    res.status(500).json({ error: "שגיאה באימות תשלום" });
  }
});

/**
 * Stripe Webhook — מקור אמת לתשלומים.
 * דורש express.raw (מוגדר ב-index.js לפני json parser).
 */
async function webhookHandler(req, res) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(200).json({ received: true, skipped: true });
  }
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[webhook] חתימה לא תקינה:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const analysisId = event.data.object.metadata?.analysisId;
    if (analysisId) {
      const record = await db.get(`analysis:${analysisId}`);
      if (record) {
        record.paid = true;
        await db.set(`analysis:${analysisId}`, record);
      }
    }
  }
  res.json({ received: true });
}

module.exports = { router, webhookHandler };
