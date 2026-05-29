import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Loader2,
  Download,
  Wallet,
  Coins,
  PieChart,
  Target,
  CheckCircle2,
  XCircle,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { api } from "../lib/api.js";
import { formatCurrency, formatPercent } from "../lib/format.js";
import MixTable from "../components/MixTable.jsx";
import SensitivityChart from "../components/SensitivityChart.jsx";
import QuestionCards from "../components/QuestionCards.jsx";

function SummaryCard({ icon: Icon, color, label, value }) {
  return (
    <div className="card p-5">
      <div
        className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ background: `${color}22` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div className="text-sm text-muted">{label}</div>
      <div className="text-2xl font-700">{value}</div>
    </div>
  );
}

function Section({ title, icon: Icon, children, note }) {
  return (
    <section className="card p-6">
      <h2 className="mb-4 flex items-center gap-2 text-h3 font-700">
        {Icon && <Icon size={22} className="text-primary" />}
        {title}
      </h2>
      {note && <p className="mb-4 text-muted leading-relaxed">{note}</p>}
      {children}
    </section>
  );
}

export default function Report() {
  const { analysisId } = useParams();
  const [status, setStatus] = useState("loading"); // loading | generating | ready | error | unpaid
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const reportRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        // אימות תשלום
        const verify = await api.verifyPayment(analysisId);
        if (!verify.paid) {
          if (!cancelled) setStatus("unpaid");
          return;
        }
        if (!cancelled) setStatus("generating");
        // הפקת הדוח (caching בצד השרת)
        const res = await api.generateReport(analysisId);
        if (!cancelled) {
          setReport(res.report);
          setStatus("ready");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message);
          setStatus("error");
        }
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [analysisId]);

  async function downloadPDF() {
    const html2pdf = (await import("html2pdf.js")).default;
    const el = reportRef.current;
    html2pdf()
      .set({
        margin: 10,
        filename: "דוח-משכנתא.pdf",
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 2, backgroundColor: "#0a0e1a" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(el)
      .save();
  }

  if (status === "loading" || status === "generating") {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <Loader2 size={48} className="animate-spin text-primary" />
        <p className="text-lg text-muted">
          {status === "generating"
            ? "הכלי מנתח את הנתונים שלך..."
            : "טוען..."}
        </p>
      </main>
    );
  }

  if (status === "unpaid") {
    return (
      <Centered
        icon={AlertTriangle}
        color="#f59e0b"
        title="התשלום טרם הושלם"
        text="לא נמצא תשלום עבור ניתוח זה. חזור לעמוד התשלום כדי להשלים."
      />
    );
  }

  if (status === "error") {
    return (
      <Centered
        icon={XCircle}
        color="#ef4444"
        title="אירעה שגיאה"
        text={error || "לא הצלחנו להפיק את הדוח. נסה לרענן."}
      />
    );
  }

  const { data, narrative } = report;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-h2">דוח ניתוח המשכנתא</h1>
          {report.demo && (
            <span className="badge mt-2 bg-warn/15 text-warn">
              מצב דמו — ללא מפתח Gemini
            </span>
          )}
        </div>
        <button onClick={downloadPDF} className="btn-primary">
          <Download size={18} /> הורד PDF
        </button>
      </div>

      <div ref={reportRef} className="space-y-6">
        {narrative.intro && (
          <p className="text-muted leading-relaxed">{narrative.intro}</p>
        )}

        {/* כרטיסי סיכום */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={Wallet}
            color="#6366f1"
            label="החזר חודשי משוער"
            value={formatCurrency(data.summary.monthlyPayment)}
          />
          <SummaryCard
            icon={Coins}
            color="#9ca3af"
            label="עלות כוללת"
            value={formatCurrency(data.summary.totalCost)}
          />
          <SummaryCard
            icon={PieChart}
            color="#10b981"
            label="% מהכנסה"
            value={`${data.summary.pctOfIncome}%`}
          />
          <SummaryCard
            icon={Target}
            color="#f59e0b"
            label="ריבית benchmark לדרוש"
            value={formatPercent(data.summary.benchmarkRate)}
          />
        </div>

        {/* חלק 1 — כושר השתתפות */}
        <Section title="כושר החזר" icon={Wallet} note={narrative.capacityNote}>
          <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-xl bg-surface-2 p-4">
              <div className="text-sm text-muted">החזר מקסימלי מומלץ (35%)</div>
              <div className="text-xl font-700">
                {formatCurrency(data.capacity.maxMonthlyPayment)}
              </div>
            </div>
            <span
              className={`badge ${
                data.capacity.realistic
                  ? "bg-accent/15 text-accent"
                  : "bg-danger/15 text-danger"
              }`}
            >
              {data.capacity.realistic ? (
                <>
                  <CheckCircle2 size={16} /> הבקשה ריאלית
                </>
              ) : (
                <>
                  <XCircle size={16} /> ההחזר חורג מ-35%
                </>
              )}
            </span>
          </div>
          <p className="mt-3 text-sm text-muted">{data.capacity.ruleNote}</p>
        </Section>

        {/* חלק 2 — תמהילים */}
        <Section
          title="השוואת 3 תמהילים"
          icon={PieChart}
          note={narrative.mixesNote}
        >
          <MixTable mixes={data.mixes} />
        </Section>

        {/* חלק 3 — ניתוח רגישות */}
        <Section
          title="ניתוח רגישות לעליית ריבית"
          icon={TrendingUp}
          note={narrative.sensitivityNote}
        >
          <SensitivityChart sensitivity={data.sensitivity} />
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="p-2 text-right font-600">תמהיל</th>
                  {data.sensitivity[0].points.map((p) => (
                    <th key={p.shock} className="p-2 text-right font-600">
                      +{p.shock}%
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.sensitivity.map((m) => (
                  <tr key={m.key} className="border-b border-border/50">
                    <td className="p-2 font-700">{m.label}</td>
                    {m.points.map((p) => (
                      <td key={p.shock} className="p-2">
                        {formatCurrency(p.monthly)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* חלק 4 — benchmark */}
        <Section title="Benchmark ריבית" icon={Target} note={narrative.benchmarkNote}>
          <div className="grid gap-4 sm:grid-cols-3">
            <BenchBox
              label="טווח ריאלי"
              value={`${data.benchmark.realisticLow}%–${data.benchmark.realisticHigh}%`}
              color="#10b981"
            />
            <BenchBox
              label="הבנק פותח בדרך כלל"
              value={formatPercent(data.benchmark.bankOpening)}
              color="#ef4444"
            />
            <BenchBox
              label="נקודת התעקשות סבירה"
              value={formatPercent(data.benchmark.fairPushTarget)}
              color="#6366f1"
            />
          </div>
        </Section>

        {/* חלק 5 — רפייננס */}
        {data.refinance && (
          <Section title="ניתוח מיחזור" icon={RefreshCw} note={narrative.refinanceNote}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <BenchBox
                label="החזר נוכחי"
                value={formatCurrency(data.refinance.currentMonthly)}
                color="#9ca3af"
              />
              <BenchBox
                label="החזר לאחר מיחזור"
                value={formatCurrency(data.refinance.newMonthly)}
                color="#6366f1"
              />
              <BenchBox
                label="חיסכון חודשי"
                value={formatCurrency(data.refinance.monthlySaving)}
                color="#10b981"
              />
              <BenchBox
                label="נקודת איזון"
                value={
                  data.refinance.breakEvenMonths
                    ? `${data.refinance.breakEvenMonths} חודשים`
                    : "—"
                }
                color="#f59e0b"
              />
            </div>
            {data.refinance.totalSaving > 0 && (
              <p className="mt-4 text-accent font-600">
                חיסכון כולל צפוי: {formatCurrency(data.refinance.totalSaving)}
              </p>
            )}
          </Section>
        )}

        {/* חלק 6 — שאלות לבנק */}
        <Section title="7 שאלות לשאול את הבנק" icon={Target}>
          <QuestionCards questions={narrative.questions} />
        </Section>

        {/* Disclaimer */}
        <div className="rounded-xl border border-border bg-surface-2 p-5 text-center text-sm text-muted">
          {narrative.disclaimer}
        </div>
      </div>
    </main>
  );
}

function BenchBox({ label, value, color }) {
  return (
    <div className="rounded-xl bg-surface-2 p-4">
      <div className="text-sm text-muted">{label}</div>
      <div className="text-xl font-700" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function Centered({ icon: Icon, color, title, text }) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <Icon size={48} style={{ color }} />
      <h2 className="text-h3 font-700">{title}</h2>
      <p className="max-w-md text-muted">{text}</p>
    </main>
  );
}
