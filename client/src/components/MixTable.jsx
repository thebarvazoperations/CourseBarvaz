import { formatCurrency } from "../lib/format.js";
import { CheckCircle2, XCircle } from "lucide-react";

const RISK = {
  נמוכה: { color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  בינונית: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  גבוהה: { color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

export default function MixTable({ mixes }) {
  if (!mixes?.length) return null;
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border">
            {["תמהיל", "הרכב", "החזר חודשי", "עלות כוללת", "% הכנסה", "סיכון"].map((h) => (
              <th key={h} className="p-3 text-right text-muted font-600 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mixes.map((m) => (
            <tr key={m.key} className="border-b border-border/30 hover:bg-surface-2 transition-colors">
              <td className="p-3 font-700 whitespace-nowrap">{m.label}</td>
              <td className="p-3 text-muted text-xs whitespace-nowrap">
                {m.primePct}% פריים · {100 - m.primePct}% קל"צ
              </td>
              <td className="p-3 font-700 whitespace-nowrap">{formatCurrency(m.monthly)}</td>
              <td className="p-3 text-muted whitespace-nowrap">{formatCurrency(m.total)}</td>
              <td className="p-3 whitespace-nowrap">
                <span className={m.affordable ? "text-accent" : "text-danger"}>
                  {m.affordable
                    ? <CheckCircle2 size={13} className="inline ml-1" />
                    : <XCircle size={13} className="inline ml-1" />}
                  {m.pctOfIncome}%
                </span>
              </td>
              <td className="p-3">
                <span
                  className="badge text-xs px-2 py-0.5"
                  style={{ background: RISK[m.risk]?.bg, color: RISK[m.risk]?.color }}
                >
                  {m.risk}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
