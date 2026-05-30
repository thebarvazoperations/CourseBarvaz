// כלי פורמט למספרים ומטבע

export function formatCurrency(value) {
  const n = Number(value) || 0;
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatNumber(value) {
  const n = Number(value) || 0;
  return new Intl.NumberFormat("he-IL").format(n);
}

export function formatPercent(value, digits = 2) {
  const n = Number(value) || 0;
  return `${n.toFixed(digits)}%`;
}

// המרת מחרוזת קלט עם פסיקים למספר נקי
export function parseNumberInput(str) {
  return Number(String(str).replace(/[^\d.]/g, "")) || 0;
}

// פורמט תוך כדי הקלדה (הוספת פסיקים)
export function formatInputLive(str) {
  const num = parseNumberInput(str);
  if (!num) return "";
  return new Intl.NumberFormat("he-IL").format(num);
}
