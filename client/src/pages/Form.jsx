import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Home, RefreshCw, Loader2 } from "lucide-react";
import { api } from "../lib/api.js";
// הדוח מופק ישירות — ללא שלב תשלום
import { formatInputLive, parseNumberInput, formatCurrency } from "../lib/format.js";

const STEPS = ["פרטי המשכנתא", "פרופיל פיננסי", "העדפות"];

const initialState = {
  loanAmount: "",
  equity: "",
  dealType: "new",
  currentRate: "",
  yearsRemaining: "",
  monthlyIncome: "",
  existingLoans: "",
  age: "",
  termYears: 25,
  riskTolerance: 50,
  creditScore: 70,
  liquidAssets: "",
};

function ProgressBar({ step }) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex justify-between text-sm text-muted">
        <span>
          שלב {step + 1} מתוך {STEPS.length}
        </span>
        <span>{STEPS[step]}</span>
      </div>
      <div className="h-2 rounded-full bg-surface-2">
        <div
          className="h-2 rounded-full bg-primary-gradient transition-all duration-300"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

function MoneyInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input
          className="input pl-10"
          inputMode="numeric"
          value={value ? formatInputLive(value) : ""}
          onChange={(e) => onChange(parseNumberInput(e.target.value))}
          placeholder={placeholder}
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">₪</span>
      </div>
    </div>
  );
}

export default function Form() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initialState);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (val) => setData((d) => ({ ...d, [key]: val }));

  function validateStep() {
    setError("");
    if (step === 0) {
      if (!data.loanAmount) return "נא להזין סכום משכנתא";
      if (data.dealType === "refinance" && !data.currentRate)
        return "נא להזין ריבית נוכחית";
    }
    if (step === 1) {
      if (!data.monthlyIncome) return "נא להזין הכנסה חודשית";
      if (!data.age) return "נא להזין גיל";
    }
    return "";
  }

  function next() {
    const err = validateStep();
    if (err) return setError(err);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function prev() {
    setError("");
    setStep((s) => Math.max(0, s - 1));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const { analysisId } = await api.quickAnalysis(data);
      navigate(`/report/${analysisId}`);
    } catch (e) {
      setError(e.message);
      setSubmitting(false);
    }
  }

  const riskLabel =
    data.riskTolerance < 33
      ? "ודאות מקסימלית"
      : data.riskTolerance < 66
      ? "איזון בין ודאות לעלות"
      : "מוכן לסיכון בשביל ריבית נמוכה";

  const creditLabel =
    data.creditScore >= 85
      ? "מצוין"
      : data.creditScore >= 70
      ? "טוב"
      : data.creditScore >= 50
      ? "בינוני"
      : "חלש";

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="card p-6 sm:p-8 animate-fade-up">
        <ProgressBar step={step} />

        {/* שלב 1 */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-h3 font-600">פרטי המשכנתא</h2>
            <MoneyInput
              label="סכום המשכנתא"
              value={data.loanAmount}
              onChange={set("loanAmount")}
              placeholder="1,500,000"
            />
            <MoneyInput
              label="הון עצמי"
              value={data.equity}
              onChange={set("equity")}
              placeholder="600,000"
            />
            <div>
              <label className="label">סוג עסקה</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => set("dealType")("new")}
                  className={`btn ${
                    data.dealType === "new" ? "btn-primary" : "btn-outline"
                  }`}
                >
                  <Home size={18} /> משכנתא חדשה
                </button>
                <button
                  type="button"
                  onClick={() => set("dealType")("refinance")}
                  className={`btn ${
                    data.dealType === "refinance" ? "btn-primary" : "btn-outline"
                  }`}
                >
                  <RefreshCw size={18} /> מיחזור
                </button>
              </div>
            </div>
            {data.dealType === "refinance" && (
              <div className="grid grid-cols-2 gap-4 animate-fade-up">
                <div>
                  <label className="label">ריבית נוכחית (%)</label>
                  <input
                    className="input"
                    inputMode="decimal"
                    value={data.currentRate}
                    onChange={(e) => set("currentRate")(e.target.value)}
                    placeholder="5.2"
                  />
                </div>
                <div>
                  <label className="label">שנים שנותרו</label>
                  <input
                    className="input"
                    inputMode="numeric"
                    value={data.yearsRemaining}
                    onChange={(e) => set("yearsRemaining")(e.target.value)}
                    placeholder="20"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* שלב 2 */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-h3 font-600">פרופיל פיננסי</h2>
            <MoneyInput
              label="הכנסה חודשית נטו של משק הבית"
              value={data.monthlyIncome}
              onChange={set("monthlyIncome")}
              placeholder="22,000"
            />
            <MoneyInput
              label="החזרי הלוואות קיימים (חודשי)"
              value={data.existingLoans}
              onChange={set("existingLoans")}
              placeholder="0"
            />
            <div>
              <label className="label">גיל הלווה הראשי</label>
              <input
                className="input"
                inputMode="numeric"
                value={data.age}
                onChange={(e) => set("age")(e.target.value)}
                placeholder="35"
              />
            </div>
            <div>
              <label className="label">
                תקופה מבוקשת:{" "}
                <span className="text-primary font-700">{data.termYears} שנים</span>
              </label>
              <input
                type="range"
                min="10"
                max="30"
                value={data.termYears}
                onChange={(e) => set("termYears")(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted">
                <span>30</span>
                <span>10</span>
              </div>
            </div>
            <div>
              <label className="label">
                דירוג אשראי:{" "}
                <span className="text-primary font-700">{creditLabel}</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={data.creditScore}
                onChange={(e) => set("creditScore")(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted">
                <span>חלש</span>
                <span>מצוין</span>
              </div>
              <p className="mt-1 text-xs text-muted">
                לא בטוח? אפשר לבדוק חינם בדו"ח נתוני אשראי של בנק ישראל.
              </p>
            </div>
            <MoneyInput
              label="נכסים נזילים / חסכונות (מעבר להון העצמי)"
              value={data.liquidAssets}
              onChange={set("liquidAssets")}
              placeholder="100,000"
            />
          </div>
        )}

        {/* שלב 3 */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-h3 font-600">העדפות</h2>
            <div>
              <label className="label">
                רמת ודאות מועדפת:{" "}
                <span className="text-primary font-700">{riskLabel}</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={data.riskTolerance}
                onChange={(e) => set("riskTolerance")(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted">
                <span>ודאות מקסימלית</span>
                <span>סיכון לריבית נמוכה</span>
              </div>
            </div>

            {/* סיכום לפני תשלום */}
            <div className="rounded-xl bg-surface-2 p-4">
              <h3 className="mb-3 text-sm font-700 text-muted">סיכום הנתונים</h3>
              <dl className="space-y-2 text-sm">
                <Row label="סכום משכנתא" value={formatCurrency(data.loanAmount)} />
                <Row label="הון עצמי" value={formatCurrency(data.equity)} />
                <Row
                  label="סוג עסקה"
                  value={data.dealType === "refinance" ? "מיחזור" : "משכנתא חדשה"}
                />
                <Row label="הכנסה חודשית" value={formatCurrency(data.monthlyIncome)} />
                <Row label="החזרים קיימים" value={formatCurrency(data.existingLoans)} />
                <Row label="גיל" value={data.age} />
                <Row label="תקופה" value={`${data.termYears} שנים`} />
              </dl>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-xl bg-danger/15 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        {/* ניווט */}
        <div className="mt-8 flex justify-between gap-3">
          <button
            onClick={prev}
            disabled={step === 0}
            className="btn-outline"
            type="button"
          >
            <ArrowRight size={18} /> הקודם
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={next} className="btn-primary" type="button">
              הבא <ArrowLeft size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary"
              type="button"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> רגע...
                </>
              ) : (
                <>
                  הפק דוח <ArrowLeft size={18} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="font-600">{value}</dd>
    </div>
  );
}
