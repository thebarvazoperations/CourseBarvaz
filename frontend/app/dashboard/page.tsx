"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { api, ExamSession } from "@/lib/api";

const CATEGORIES = [
  { slug: "amendments", label: "Amendments", icon: "\u{1F4DC}", desc: "Constitutional amendments 1-27", count: 10, color: "border-l-4 border-l-burnt-orange" },
  { slug: "branches", label: "Branches of Government", icon: "\u{1F3DB}", desc: "Executive, Legislative, Judicial", count: 8, color: "border-l-4 border-l-blue-500" },
  { slug: "civil-rights", label: "Civil Rights", icon: "✊", desc: "Key cases, acts & protections", count: 7, color: "border-l-4 border-l-green-600" },
];

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      api.mySessions().then(setSessions).catch(() => {}).finally(() => setLoadingSessions(false));
    }
  }, [user]);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-surface"><div className="text-muted text-lg">Loading...</div></div>;
  }

  const bestScore = sessions.length ? Math.max(...sessions.map((s) => Math.round((s.score / s.total) * 100))) : null;

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />
      <main className="flex-1 px-4 py-6 pb-28 sm:pb-10 max-w-content mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-charcoal">Hello, {user.name || user.email.split("@")[0]} <span role="img" aria-label="wave">&#128075;</span></h1>
          <p className="text-muted mt-1">Choose a category and start your exam</p>
        </div>

        {sessions.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="card text-center">
              <p className="text-3xl font-bold text-burnt-orange">{sessions.length}</p>
              <p className="text-sm text-muted mt-1">Exams Taken</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-burnt-orange">{bestScore}%</p>
              <p className="text-sm text-muted mt-1">Best Score</p>
            </div>
          </div>
        )}

        <div className={`flex items-center justify-between rounded-xl px-4 py-3 mb-6 ${user.plan === "pro" ? "bg-burnt-orange text-white" : "bg-charcoal text-white"}`}>
          <div>
            <p className="font-semibold">{user.plan === "pro" ? "⭐ Pro Plan" : "Free Plan"}</p>
            <p className="text-sm opacity-75">{user.plan === "pro" ? "Full access — 20 questions per exam" : "10 questions per exam · 2 categories"}</p>
          </div>
          {user.plan !== "pro" && (
            <Link href="/pricing" className="bg-burnt-orange text-white text-sm font-semibold px-3 py-2 rounded-lg whitespace-nowrap">Upgrade</Link>
          )}
        </div>

        <h2 className="text-lg font-bold text-charcoal mb-3">Exam Categories</h2>
        <div className="space-y-3 mb-8">
          {CATEGORIES.map((cat, i) => {
            const locked = user.plan === "free" && i >= 2;
            return locked ? (
              <div key={cat.slug} className={`card ${cat.color} opacity-60 flex items-center gap-4`}>
                <div className="text-4xl">{cat.icon}</div>
                <div className="flex-1">
                  <p className="font-semibold text-charcoal">{cat.label}</p>
                  <p className="text-sm text-muted">{cat.desc}</p>
                </div>
                <div className="text-xl">{"\u{1F512}"}</div>
              </div>
            ) : (
              <Link key={cat.slug} href={`/exam/${cat.slug}`} className={`card ${cat.color} flex items-center gap-4 active:bg-surface transition-colors block`}>
                <div className="text-4xl">{cat.icon}</div>
                <div className="flex-1">
                  <p className="font-semibold text-charcoal">{cat.label}</p>
                  <p className="text-sm text-muted">{cat.desc}</p>
                  <p className="text-xs text-muted mt-1">{user.plan === "pro" ? cat.count : Math.min(cat.count, 10)} questions</p>
                </div>
                <div className="text-burnt-orange font-bold text-2xl">&rsaquo;</div>
              </Link>
            );
          })}
        </div>

        {user.plan === "pro" && (
          <div>
            <h2 className="text-lg font-bold text-charcoal mb-3">Recent Exams</h2>
            {loadingSessions ? <p className="text-muted">Loading...</p> : sessions.length === 0 ? (
              <div className="card text-center py-6"><p className="text-muted">No exams taken yet. Start one above!</p></div>
            ) : (
              <div className="space-y-2">
                {sessions.slice(0, 5).map((s) => {
                  const pct = Math.round((s.score / s.total) * 100);
                  return (
                    <div key={s.id} className="card flex items-center gap-4">
                      <div className={`text-2xl font-bold ${pct >= 70 ? "text-success" : "text-error"}`}>{pct}%</div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-charcoal capitalize">{s.category?.replace("-", " ") || "Mixed"}</p>
                        <p className="text-xs text-muted">{s.score}/{s.total} correct &middot; {new Date(s.taken_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
