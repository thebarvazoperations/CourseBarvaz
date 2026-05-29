import { formatCurrency } from "../lib/format.js";

const RISK_COLOR = {
  נמוכה: "text-accent",
  בינונית: "text-warn",
  גבוהה: "text-danger",
};

export default function MixTable({ mixes }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-muted">
            <th className="p-3 text-right font-600">תמהיל</th>
            <th className="p-3 text-right font-600">הרכב</th>
            <th className="p-3 text-right font-600">החזר חודשי</th>
            <th className="p-3 text-right font-600">עלות כוללת</th>
            <th className="p-3 text-right font-600">% מהכנסה</th>
            <th className="p-3 text-right font-600">חשיפה לסיכון</th>
          </tr>
        </thead>
        <tbody>
          {mixes.map((m) => (
            <tr
              key={m.key}
              className="border-b border-border/50 transition-colors hover:bg-surface-2"
            >
              <td className="p-3 font-700">{m.label}</td>
              <td className="p-3 text-muted">
                {m.primePct}% פריים / {100 - m.primePct}% קל"צ
              </td>
              <td className="p-3 font-600">{formatCurrency(m.monthly)}</td>
              <td className="p-3">{formatCurrency(m.total)}</td>
              <td className="p-3">
                <span className={m.affordable ? "text-accent" : "text-danger"}>
                  {m.pctOfIncome}%
                </span>
              </td>
              <td className={`p-3 font-600 ${RISK_COLOR[m.risk] || "text-muted"}`}>
                {m.risk}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
