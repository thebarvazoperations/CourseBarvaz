// שכבת תקשורת עם השרת

const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "אירעה שגיאה. נסה שוב.");
  }
  return data;
}

export const api = {
  // יצירה + הפקה בקריאה אחת (ללא תשלום)
  quickAnalysis: (profile) =>
    request("/analyze/quick", { method: "POST", body: JSON.stringify(profile) }),

  createAnalysis: (profile) =>
    request("/analyze/create", { method: "POST", body: JSON.stringify(profile) }),

  createCheckout: (analysisId) =>
    request("/payment/create-checkout", {
      method: "POST",
      body: JSON.stringify({ analysisId }),
    }),

  verifyPayment: (analysisId) => request(`/payment/verify/${analysisId}`),

  generateReport: (analysisId) =>
    request(`/analyze/generate/${analysisId}`, { method: "POST" }),

  getReport: (analysisId) => request(`/analyze/report/${analysisId}`),

  // השרת מנהל את הזיכרון — מעבירים רק הודעה + תמונות. images = [{mediaType, data}]
  chat: (message, analysisId, images = []) =>
    request("/chat", {
      method: "POST",
      body: JSON.stringify({ message, analysisId, images }),
    }),

  getChatHistory: (analysisId) => request(`/chat/${analysisId}`),

  // images = [{mediaType, data}] — base64, not stored server-side
  analyzeMortgageDoc: (images, analysisId) =>
    request("/mortgage-doc/analyze", {
      method: "POST",
      body: JSON.stringify({ images, analysisId }),
    }),

  health: () => request("/health"),
};
