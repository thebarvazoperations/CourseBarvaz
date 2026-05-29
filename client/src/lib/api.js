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

  health: () => request("/health"),
};
