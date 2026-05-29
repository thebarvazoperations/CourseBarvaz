import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  Download,
  Wallet,
  Coins,
  PieChart,
  Target,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  BarChart2,
  Percent,
  Activity,
} from "lucide-react";
import { api } from "../lib/api.js";
import { formatCurrency, formatPercent } from "../lib/format.js";
import MixTable from "../components/MixTable.jsx";
import SensitivityChart from "../components/SensitivityChart.jsx";
import AmortizationChart from "../components/AmortizationChart.jsx";
import CostCompareChart from "../components/CostCompareChart.jsx";
import ChatWidget from "../components/ChatWidget.jsx";

// ---- Primitive components ----

function StatCard({ icon: Icon, color, label, value, sub }) {
  return (
    <div className="card p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">{label}</span>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="text-2xl font-700 tracking-tight">{value}</div>
      {sub && <div className="text-xs text-muted">{sub}</div>}
    </div>
  );
}

function GaugeBar({ label, value, max, color, okThreshold, inverted = false }) {
  const pct = Math.min(100, (value / max) * 100);
  const ok = inverted ? value >= okThreshold : value <= okThreshold;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className={`font-700 ${ok ? "text-accent" : "text-danger"}`}>
          {value}% {ok ? "✓" : "⚠"}
        </span>
      </div>
      <div className="h-2 rounded-full bg-surface-2">
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: ok
              ? "linear-gradient(90deg,#10b981,#34d399)"
              : "linear-gradient(90deg,#f59e0b,#ef4444)",
          }}
        />
      </div>
    </div>
  );
}

function Section({ id, title, icon: Icon, note, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div id={id} className="card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between p-6 hover:bg-surface-2 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {Icon && <Icon size={20} className="text-primary" />}
          <h2 className="text-base font-700">{title}</h2>
        </div>
        {open ? <ChevronUp size={18} className="text-muted" /> : <ChevronDown size={18} className="text-muted" />}
      </button>
      {open && (
        <div className="px-6 pb-6 space-y-5">
          {note && <p className="text-sm text-muted leading-relaxed border-r-2 border-primary/40 pr-3">{note}</p>}
          {children}
        </div>
      )}
    </div>
  );
}

// לוח שפיצר — טבלת snapshot כל 5 שנים
function AmortizationTable({ schedule }) {
  if (!schedule?.length) return null;
  const rows = schedule.filter((s) => s.year % 5 === 0 || s.year === 1 || s.year === schedule.length);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="p-3 text-right text-muted font-600">שנה</th>
            <th className="p-3 text-right text-muted font-600">קרן ששולמה</th>
            <th className="p-3 text-right text-muted font-600">ריבית ששולמה</th>
            <th className="p-3 text-right text-muted font-600">יתרת חוב</th>
            <th className="p-3 text-right text-muted font-600">ריבית מצטברת</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.year} className="border-b border-border/30 hover:bg-surface-2 transition-colors">
              <td className="p-3 font-600">{r.year}</td>
              <td className="p-3 text-accent">{formatCurrency(r.principalPaid)}</td>
              <td className="p-3 text-danger">{formatCurrency(r.interestPaid)}</td>
              <td className="p-3">{formatCurrency(r.balance)}</td>
              <td className="p-3 text-muted">{formatCurrency(r.cumulativeInterest)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// שאלות לבנק עם קטגוריות
const QUESTION_CATEGORIES = {
  rate: { label: "ריבית", color: "#6366f1" },
  mix: { label: "תמהיל", color: "#10b981" },
  conditions: { label: "תנאים", color: "#f59e0b" },
  risk: { label: "סיכון", color: "#ef4444" },
};

function QuestionCard({ q, index }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen((o) => !o)}
      className="card card-hover w-full p-4 text-right transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-700 text-primary">
          {index + 1}
        </div>
        <div className="flex-1">
          <p className="text-sm font-600 leading-relaxed">{q}</p>
          {open && (
            <p className="mt-2 text-xs text-muted leading-relaxed border-t border-border/50 pt-2">
              שמור את השאלה הזו לפגישה עם הבנק. כדאי לקבל תשובה בכתב.
            </p>
          )}
        </div>
        <HelpCircle size={14} className="shrink-0 mt-0.5 text-muted" />
      </div>
    </button>
  );
}

// Benchmark visual
function BenchmarkBar({ benchmark }) {
  const { realisticLow, realisticHigh, bankOpening, fairPushTarget } = benchmark;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <BBox label="טווח ריאלי נמוך" value={`${realisticLow}%`} color="#10b981" />
        <BBox label="טווח ריאלי גבוה" value={`${realisticHigh}%`} color="#6366f1" />
        <BBox label="הבנק פותח ב-" value={`${bankOpening}%`} color="#ef4444" />
        <BBox label="נקודת התעקשות" value={`${fairPushTarget}%`} color="#f59e0b" bold />
      </div>
      <div className="rounded-xl bg-surface-2 p-4 text-sm text-muted leading-relaxed">
        <span className="font-700 text-text">אסטרטגיית משא ומתן: </span>
        הבנקים פותחים בדרך כלל ב-
        <span className="text-danger font-600"> {bankOpening}% </span>
        — הטווח הריאלי לפרופיל כזה הוא
        <span className="text-accent font-600"> {realisticLow}%–{realisticHigh}% </span>
        . התחל משא ומתן עם דרישה של
        <span className="text-primary font-600"> {fairPushTarget}% </span>
        ואל תסכים ללא השוואת הצעות מ-3 בנקים לפחות.
      </div>
    </div>
  );
}

function BBox({ label, value, color, bold }) {
  return (
    <div className="rounded-xl bg-surface-2 p-3 text-center">
      <div className="text-xs text-muted mb-1">{label}</div>
      <div className="text-xl" style={{ color, fontWeight: bold ? 700 : 600 }}>{value}</div>
    </div>
  );
}

// ---- Main Report ----

export default function Report() {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const reportRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const rec = await api.getReport(analysisId);
        if (!cancelled) {
          setReport(rec.report);
          setStatus("ready");
        }
      } catch (e) {
        // אולי הדוח עדיין לא הופק — generate
        try {
          const rec = await api.generateReport(analysisId);
          if (!cancelled) {
            setReport(rec.report);
            setStatus("ready");
          }
        } catch (e2) {
          if (!cancelled) {
            setError(e2.message);
            setStatus("error");
          }
        }
      }
    }
    run();
    return () => { cancelled = true; };
  }, [analysisId]);

  async function downloadPDF() {
    const html2pdf = (await import("html2pdf.js")).default;
    html2pdf()
      .set({
        margin: [8, 8],
        filename: "דוח-משכנתא.pdf",
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 2, backgroundColor: "#0a0e1a", useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(reportRef.current)
      .save();
  }

  if (status === "loading") {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="text-muted">מנתח את הנתונים שלך...</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center px-4">
        <XCircle size={40} className="text-danger" />
        <h2 className="text-h3 font-700">לא הצלחנו להפיק את הדוח</h2>
        <p className="text-muted max-w-sm">{error}</p>
        <button onClick={() => navigate("/form")} className="btn-primary mt-2">
          נסה שוב
        </button>
      </main>
    );
  }

  const { data, narrative } = report;
  const { capacity, summary, mixes, sensitivity, benchmark, refinance, amortization, ratios } = data;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 pb-32">

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-700 tracking-tight">דוח ניתוח משכנתא</h1>
          <p className="mt-1 text-sm text-muted">
            הופק {new Date(report.generatedAt).toLocaleDateString("he-IL")}
            {report.demo && <span className="mr-2 badge bg-warn/15 text-warn">דמו</span>}
          </p>
        </div>
        <button onClick={downloadPDF} className="btn-outline gap-2 text-sm self-start">
          <Download size={16} /> הורד PDF
        </button>
      </div>

      <div ref={reportRef} className="space-y-4">

        {/* ---- כרטיסי סיכום ---- */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={Wallet} color="#6366f1" label="החזר חודשי" value={formatCurrency(summary.monthlyPayment)} sub="תמהיל מאוזן" />
          <StatCard icon={Coins} color="#9ca3af" label="עלות כוללת" value={formatCurrency(summary.totalCost)} sub="כולל ריבית" />
          <StatCard icon={Percent} color="#10b981" label="מהכנסה" value={`${summary.pctOfIncome}%`} sub="יחס החזר להכנסה" />
          <StatCard icon={Target} color="#f59e0b" label="ריבית לדרוש" value={`${summary.benchmarkRate}%`} sub="נקודת התעקשות" />
        </div>

        {/* ---- יחסים פיננסיים ---- */}
        {ratios && (
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-700 text-muted uppercase tracking-wide">יחסים פיננסיים</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <GaugeBar
                label="LTV — יחס הלוואה לשווי נכס"
                value={ratios.ltv}
                max={100}
                okThreshold={75}
                color="green"
              />
              <GaugeBar
                label="DTI — יחס חוב להכנסה"
                value={ratios.dti}
                max={60}
                okThreshold={40}
                color="green"
              />
            </div>
            {!ratios.ltvOk && (
              <p className="text-xs text-danger bg-danger/10 rounded-xl px-3 py-2">
                LTV מעל 75% — בנק ישראל מגביל מינוף זה. ייתכן שתידרש ביטוח משכנתא נוסף.
              </p>
            )}
            {!ratios.dtiOk && (
              <p className="text-xs text-warn bg-warn/10 rounded-xl px-3 py-2">
                יחס החוב להכנסה גבוה. מומלץ לבדוק הארכת תקופה או הקטנת סכום.
              </p>
            )}
          </div>
        )}

        {/* ---- כושר החזר ---- */}
        <Section id="capacity" title="כושר החזר" icon={Wallet} note={narrative?.capacityNote} defaultOpen>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl bg-surface-2 px-5 py-3">
              <div className="text-xs text-muted">החזר מקסימלי (כלל 35%)</div>
              <div className="text-xl font-700">{formatCurrency(capacity.maxMonthlyPayment)}</div>
            </div>
            <span className={`badge ${capacity.realistic ? "bg-accent/15 text-accent" : "bg-danger/15 text-danger"}`}>
              {capacity.realistic
                ? <><CheckCircle2 size={14} /> הבקשה בתחום הנורמה</>
                : <><XCircle size={14} /> ההחזר חורג מ-35%</>}
            </span>
          </div>
          <p className="text-xs text-muted">{capacity.ruleNote}</p>
        </Section>

        {/* ---- תמהילים + השוואת עלויות ---- */}
        <Section id="mixes" title="השוואת תמהילים" icon={PieChart} note={narrative?.mixesNote}>
          <MixTable mixes={mixes} />
          <div className="mt-4">
            <p className="text-xs text-muted mb-3">השוואת עלות כוללת לפי תמהיל</p>
            <CostCompareChart mixes={mixes} />
          </div>
        </Section>

        {/* ---- ניתוח רגישות ---- */}
        <Section id="sensitivity" title="ניתוח רגישות לריבית" icon={Activity} note={narrative?.sensitivityNote}>
          <SensitivityChart sensitivity={sensitivity} />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-2.5 text-right text-muted font-600">תמהיל</th>
                  {sensitivity[0].points.map((p) => (
                    <th key={p.shock} className="p-2.5 text-right text-muted font-600">+{p.shock}%</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sensitivity.map((m) => (
                  <tr key={m.key} className="border-b border-border/30 hover:bg-surface-2 transition-colors">
                    <td className="p-2.5 font-700">{m.label}</td>
                    {m.points.map((p, i) => (
                      <td key={p.shock} className={`p-2.5 ${i === 0 ? "" : "text-warn"}`}>
                        {formatCurrency(p.monthly)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ---- לוח אמורטיזציה ---- */}
        {amortization?.length > 0 && (
          <Section id="amortization" title="לוח סילוקין — קרן מול ריבית" icon={BarChart2} note="ככל שחולפות שנים, חלק הקרן בתשלום החודשי גדל וחלק הריבית קטן.">
            <AmortizationChart schedule={amortization} />
            <div className="mt-5">
              <p className="text-xs text-muted mb-3">snapshot לכל 5 שנים</p>
              <AmortizationTable schedule={amortization} />
            </div>
          </Section>
        )}

        {/* ---- Benchmark ריבית ---- */}
        <Section id="benchmark" title="Benchmark ריבית" icon={Target} note={narrative?.benchmarkNote}>
          <BenchmarkBar benchmark={benchmark} />
        </Section>

        {/* ---- רפייננס ---- */}
        {refinance && (
          <Section id="refinance" title="ניתוח מיחזור (רפייננס)" icon={RefreshCw} note={narrative?.refinanceNote}>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
              <BBox label="החזר נוכחי" value={formatCurrency(refinance.currentMonthly)} color="#9ca3af" />
              <BBox label="החזר לאחר מיחזור" value={formatCurrency(refinance.newMonthly)} color="#6366f1" />
              <BBox label="חיסכון חודשי" value={formatCurrency(refinance.monthlySaving)} color="#10b981" />
              <BBox label="נקודת איזון" value={refinance.breakEvenMonths ? `${refinance.breakEvenMonths} חודשים` : "—"} color="#f59e0b" />
            </div>
            {refinance.totalSaving > 0 && (
              <div className="rounded-xl bg-accent/10 border border-accent/30 p-4 mt-1">
                <p className="text-sm text-accent font-600">
                  חיסכון כולל צפוי: {formatCurrency(refinance.totalSaving)}
                </p>
                <p className="text-xs text-muted mt-1">
                  לאחר ניכוי עלויות מיחזור משוערות ({formatCurrency(refinance.refinanceCost)})
                </p>
              </div>
            )}
          </Section>
        )}

        {/* ---- שאלות לבנק ---- */}
        <Section id="questions" title="שאלות לשאול את הבנק" icon={HelpCircle}>
          <p className="text-sm text-muted -mt-2">
            הכנס לפגישה עם שאלות אלו מוכנות — הן מסמנות שאתה לקוח שיודע מה הוא רוצה.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {(narrative?.questions || []).map((q, i) => (
              <QuestionCard key={i} q={q} index={i} />
            ))}
          </div>
        </Section>

        {/* ---- כלים נוספים שיועץ משכנתאות עוסה ---- */}
        <Section id="tips" title="טיפים למשא ומתן" icon={TrendingUp} defaultOpen={false}>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { t: "קבל לפחות 3 הצעות", d: "לעולם אל תסתפק בהצעה אחת. בנקים יורידו ריבית כשיראו שאתה משווה." },
              { t: "הצג מסמכים מסודרים", d: "תלוש שכר, דפי בנק, נסח טאבו — לקוח מוכן מקבל יחס אחר." },
              { t: "משא ומתן על תמהיל ולא רק ריבית", d: "הריבית על הקל\"צ גמישה יותר ממה שהבנק מציג בפתיחה." },
              { t: "בקש הסבר על כל עמלה", d: "עמלות פתיחת תיק, ביטוח חיים, ביטוח מבנה — כל אחת ניתנת להפחתה." },
              { t: "שאל על פירעון מוקדם", d: "הבן מה עמלת הפירעון המוקדם בכל מסלול לפני שתחתום." },
              { t: "תאם ציפיות לגבי לוח הזמנים", d: "אישור עקרוני, הסכם מכר, שמאי — הבן כל שלב מראש כדי לא להיתקע." },
            ].map((tip) => (
              <div key={tip.t} className="card p-4">
                <div className="text-sm font-700 mb-1">{tip.t}</div>
                <div className="text-xs text-muted leading-relaxed">{tip.d}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ---- Disclaimer ---- */}
        <div className="rounded-xl border border-border/50 p-4 text-center text-xs text-muted leading-relaxed">
          {narrative?.disclaimer}
        </div>
      </div>

      {/* Chat widget */}
      <ChatWidget analysisId={analysisId} />
    </main>
  );
}
