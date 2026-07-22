"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api, Question } from "@/lib/api";

type AnswerState = "idle" | "selected" | "revealed";

const LABELS = ["A", "B", "C", "D"] as const;
const OPTIONS: (keyof Question)[] = ["opt_a", "opt_b", "opt_c", "opt_d"];

const CATEGORY_NAMES: Record<string, string> = {
  amendments: "Amendments",
  branches: "Branches of Government",
  "civil-rights": "Civil Rights",
};

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const category = params.category as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    api.getQuestions(category).then((qs) => {
      setQuestions(qs);
      setLoading(false);
    }).catch(() => {
      setError("Failed to load questions. Please try again.");
      setLoading(false);
    });
  }, [category, user]);

  const currentQ = questions[current];
  const total = questions.length;

  const handleSelect = (label: string) => {
    if (answerState !== "idle") return;
    setSelected(label);
    setAnswerState("selected");
  };

  const handleConfirm = useCallback(async () => {
    if (!selected || !currentQ) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const withAnswer = await fetch(`${API_URL}/questions/${currentQ.id}`).then((r) => r.json());
      const correctAns = withAnswer.correct_ans as string;
      setCorrectAnswers((prev) => ({ ...prev, [currentQ.id]: correctAns }));
      setAnswers((prev) => ({ ...prev, [currentQ.id]: selected }));
      setAnswerState("revealed");
    } catch {
      setAnswers((prev) => ({ ...prev, [currentQ.id]: selected }));
      setAnswerState("revealed");
    }
  }, [selected, currentQ]);

  const handleNext = useCallback(() => {
    if (current + 1 >= total) {
      const score = Object.keys(answers).filter(
        (qid) => answers[Number(qid)] === correctAnswers[Number(qid)]
      ).length;
      const resultData = {
        score, total, category, answers, correctAnswers,
        questions: questions.map((q) => ({
          id: q.id, question_text: q.question_text,
          opt_a: q.opt_a, opt_b: q.opt_b, opt_c: q.opt_c, opt_d: q.opt_d,
        })),
      };
      localStorage.setItem("cg_result", JSON.stringify(resultData));
      api.saveSession(score, total, category).catch(() => {});
      router.push("/results");
      return;
    }
    setCurrent((c) => c + 1);
    setSelected(null);
    setAnswerState("idle");
  }, [current, total, answers, correctAnswers, questions, category, router]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4">
        <div className="text-4xl mb-4">&#9203;</div>
        <p className="text-muted text-lg">Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4">
        <p className="text-error text-lg mb-4">{error}</p>
        <button onClick={() => router.push("/dashboard")} className="btn-primary">Back to Dashboard</button>
      </div>
    );
  }

  if (!currentQ) return null;

  const progress = (current / total) * 100;
  const correctForCurrent = correctAnswers[currentQ.id];

  function getButtonClass(label: string) {
    if (answerState !== "revealed") {
      return selected === label ? "answer-btn selected" : "answer-btn";
    }
    if (label === correctForCurrent) return "answer-btn reveal-correct";
    if (label === selected && selected !== correctForCurrent) return "answer-btn wrong";
    return "answer-btn opacity-50";
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="bg-charcoal text-white px-4 py-3 flex items-center gap-4 sticky top-0 z-40">
        <button onClick={() => router.push("/dashboard")} className="text-white/70 text-2xl leading-none min-h-0 p-1" aria-label="Exit exam">&#10005;</button>
        <div className="flex-1">
          <p className="text-xs text-white/60 font-medium uppercase tracking-wide">{CATEGORY_NAMES[category] || category}</p>
          <p className="text-sm font-semibold">Question {current + 1} of {total}</p>
        </div>
      </div>
      <div className="h-2 bg-border w-full">
        <div className="h-2 bg-burnt-orange transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>
      <main className="flex-1 flex flex-col max-w-content mx-auto w-full px-4 py-6 pb-10">
        <div className="mb-6">
          <p className="text-xl font-semibold text-charcoal leading-snug">{currentQ.question_text}</p>
        </div>
        <div className="space-y-3 mb-6">
          {OPTIONS.map((optKey, i) => {
            const label = LABELS[i];
            const text = currentQ[optKey] as string;
            return (
              <button key={label} className={getButtonClass(label)} onClick={() => handleSelect(label)} disabled={answerState === "revealed"}>
                <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                  ${answerState === "revealed" && label === correctForCurrent ? "bg-success text-white" :
                    answerState === "revealed" && label === selected && selected !== correctForCurrent ? "bg-error text-white" :
                    selected === label ? "bg-burnt-orange text-white" : "bg-surface text-muted"}`}>
                  {label}
                </span>
                <span className="text-base leading-snug">{text}</span>
              </button>
            );
          })}
        </div>
        {answerState === "revealed" && correctForCurrent && (
          <div className={`rounded-xl px-4 py-3 mb-4 text-base font-medium ${
            selected === correctForCurrent
              ? "bg-success-light text-success border border-success/30"
              : "bg-error-light text-error border border-error/30"
          }`}>
            {selected === correctForCurrent ? "✓ Correct!" : `✗ Correct answer: ${correctForCurrent}`}
          </div>
        )}
        <div className="mt-auto pt-4">
          {answerState === "idle" && (
            <button className="btn-primary w-full justify-center opacity-40" disabled>Select an answer</button>
          )}
          {answerState === "selected" && (
            <button className="btn-primary w-full justify-center" onClick={handleConfirm}>Confirm Answer</button>
          )}
          {answerState === "revealed" && (
            <button className="btn-primary w-full justify-center" onClick={handleNext}>
              {current + 1 >= total ? "See Results →" : "Next Question →"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
