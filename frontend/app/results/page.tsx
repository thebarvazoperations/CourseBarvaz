"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface ResultData {
  score: number;
  total: number;
  category: string;
  answers: Record<number, string>;
  correctAnswers: Record<number, string>;
  questions: { id: number; question_text: string; opt_a: string; opt_b: string; opt_c: string; opt_d: string; }[];
}

const LABELS = ["A", "B", "C", "D"] as const;
const OPT_KEYS = ["opt_a", "opt_b", "opt_c", "opt_d"] as const;
const CATEGORY_NAMES: Record<string, string> = {
  amendments: "Amendments",
  branches: "Branches of Government",
  "civil-rights": "Civil Rights",
};

export default function ResultsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [result, setResult] = useState<ResultData | null>(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    const raw = localStorage.getItem("cg_result");
    if (!raw) { router.push("/dashboard"); return; }
    try { setResult(JSON.parse(raw)); } catch { router.push("/dashboard"); }
  }, [router]);

  if (!result || isLoading) {
    return <div className="min-h-screen bg-surface flex items-center justify-center"><p className="text-muted">Loading...</p></div>;
  }

  const { score, total, category, answers, correctAnswers, questions } = result;
  const pct = Math.round((score / total) * 100);
  const passed = pct >= 70;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="bg-charcoal text-white px-4 py-4">
        <div className="max-w-content mx-auto flex items-center justify-between">
          <span className="font-semibold text-lg">Exam Complete</span>
          <Link href="/dashboard" className="text-white/70 text-sm font-medium">Dashboard &rarr;</Link>
        </div>
      </div>
      <main className="flex-1 px-4 py-8 pb-10 max-w-content mx-auto w-full">
        <div className={`card text-center py-8 mb-6 ${passed ? "border-success border-2" : "border-error border-2"}`}>
          <div className={`w-28 h-28 rounded-full mx-auto flex flex-col items-center justify-center mb-4 ${passed ? "bg-success text-white" : "bg-error text-white"}`}>
            <span className="text-3xl font-bold leading-none">{pct}%</span>
            <span className="text-sm opacity-80">Score</span>
          </div>
          <h1 className="text-2xl font-bold text-charcoal mb-1">{passed ? "Well Done! \u{1F389}" : "Keep Practicing \u{1F4AA}"}</h1>
          <p className="text-muted text-lg mb-2">{score} out of {total} correct</p>
          <p className="text-sm text-muted">Category: {CATEGORY_NAMES[category] || category}</p>
        </div>
        <div className="card mb-6">
          <div className="flex justify-between text-sm text-muted mb-2">
            <span>Your score</span>
            <span className="font-semibold text-charcoal">{pct}%</span>
          </div>
          <div className="h-4 bg-surface rounded-full overflow-hidden border border-border">
            <div className={`h-4 rounded-full transition-all duration-700 ${passed ? "bg-success" : "bg-error"}`} style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-muted mt-2 text-center">Passing score: 70%</p>
        </div>
        <div className="space-y-3 mb-8">
          <Link href={`/exam/${category}`} className="btn-primary w-full justify-center">Try Again</Link>
          <Link href="/dashboard" className="btn-secondary w-full justify-center">Back to Dashboard</Link>
        </div>
        <button onClick={() => setShowReview((v) => !v)} className="w-full flex items-center justify-between bg-surface border border-border rounded-xl px-5 py-4 text-base font-semibold text-charcoal">
          <span>Review All Answers</span>
          <span className="text-muted text-xl">{showReview ? "▲" : "▼"}</span>
        </button>
        {showReview && (
          <div className="space-y-4 mt-4">
            {questions.map((q, i) => {
              const userAns = answers[q.id];
              const correctAns = correctAnswers[q.id];
              const isCorrect = userAns === correctAns;
              return (
                <div key={q.id} className={`card border-l-4 ${isCorrect ? "border-l-success" : "border-l-error"}`}>
                  <p className="text-sm text-muted font-medium mb-1">Question {i + 1}</p>
                  <p className="font-semibold text-charcoal mb-3 leading-snug">{q.question_text}</p>
                  <div className="space-y-2">
                    {OPT_KEYS.map((optKey, j) => {
                      const label = LABELS[j];
                      const text = q[optKey];
                      const isCorrectOpt = label === correctAns;
                      const isUserOpt = label === userAns;
                      return (
                        <div key={label} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                          ${isCorrectOpt ? "bg-success-light text-success font-semibold" : ""}
                          ${isUserOpt && !isCorrectOpt ? "bg-error-light text-error line-through" : ""}
                          ${!isCorrectOpt && !isUserOpt ? "text-muted" : ""}`}>
                          <span className="font-bold w-5 shrink-0">{label}</span>
                          <span>{text}</span>
                          {isCorrectOpt && <span className="ml-auto">{"✓"}</span>}
                          {isUserOpt && !isCorrectOpt && <span className="ml-auto">{"✗"}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
