import { TrendingDown, AlertCircle, CheckCircle2, Target } from "lucide-react";
import { formatPercent } from "../lib/format.js";

/**
 * "הריבית שמגיע לך" — מציג את הריבית שהבנק אמור לתת על בסיס הפרופיל,
 * את פער הפתיחה, ורשימת מנופים שצריך להתעקש עליהם במשא ומתן.
 */
export default function RateOffer({ rateOffer }) {
  if (!rateOffer) return null;
  const { base, deservedRate, bankOpening, gapBps, creditTier, adjustments } = rateOffer;

  return (
    <div className="space-y-5">
      {/* הריביות המרכזיות */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-surface-2 p-4 text-center">
          <div className="text-xs text-muted mb-1">ריבית בסיס</div>
          <div className="text-xl font-600 text-muted">{formatPercent(base)}</div>
        </div>
        <div className="rounded-xl border border-accent/40 bg-accent/10 p-4 text-center">
          <div className="text-xs text-accent mb-1 flex items-center justify-center gap-1">
            <Target size={12} /> מגיע לך
          </div>
          <div className="text-2xl font-700 text-accent">{formatPercent(deservedRate)}</div>
        </div>
        <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-center">
          <div className="text-xs text-danger mb-1">הבנק פותח ב-</div>
          <div className="text-xl font-700 text-danger">{formatPercent(bankOpening)}</div>
        </div>
      </div>

      {/* הפער שצריך להשיג */}
      <div className="rounded-xl bg-primary/10 border border-primary/30 p-4 flex items-start gap-3">
        <TrendingDown size={20} className="text-primary shrink-0 mt-0.5" />
        <div className="text-sm leading-relaxed">
          <span className="font-700 text-primary">צריך להשיג: {gapBps} נקודות בסיס </span>
          <span className="text-muted">
            ({formatPercent(gapBps / 100)}) — זה הפער בין הצעת הפתיחה של הבנק
            לבין הריבית שהפרופיל שלך מצדיק. כל מנוף למטה מקרב אותך ליעד.
          </span>
        </div>
      </div>

      {/* טבלת מנופים */}
      <div>
        <div className="text-xs text-muted uppercase tracking-wide mb-3 font-600">
          המנופים שלך — מה משפיע על הריבית
        </div>
        <div className="space-y-2">
          {adjustments.map((a) => (
            <div
              key={a.factor}
              className="rounded-xl bg-surface-2 p-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4"
            >
              <div className="sm:w-44 shrink-0">
                <div className="flex items-center gap-2">
                  {a.positive ? (
                    <CheckCircle2 size={15} className="text-accent shrink-0" />
                  ) : (
                    <AlertCircle size={15} className="text-warn shrink-0" />
                  )}
                  <span className="text-sm font-700">{a.factor}</span>
                </div>
                <div className="text-xs text-muted mt-0.5 mr-6">{a.detail}</div>
                <div
                  className={`text-xs font-700 mt-1 mr-6 ${
                    a.bps <= 0 ? "text-accent" : "text-danger"
                  }`}
                >
                  {a.bps <= 0 ? "" : "+"}
                  {a.bps} bps לריבית
                </div>
              </div>
              <div className="flex-1 text-xs text-muted leading-relaxed border-r border-border/50 pr-3">
                {a.insist}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted leading-relaxed">
        <span className="text-text font-600">איך להשתמש בזה: </span>
        הצג לבנק את הריבית שמגיע לך ({formatPercent(deservedRate)}) כנקודת פתיחה
        שלך. נמק כל דרישה עם המנופים למעלה — דירוג אשראי גבוה, מינוף נמוך, נכסים
        נזילים. אל תחתום לפני שהשגת לפחות 3 הצעות מתחרות.
      </p>
    </div>
  );
}
