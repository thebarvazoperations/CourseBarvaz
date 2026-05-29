import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, Loader2, CreditCard } from "lucide-react";
import { api } from "../lib/api.js";

export default function Payment() {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePay() {
    setLoading(true);
    setError("");
    try {
      const res = await api.createCheckout(analysisId);
      if (res.demo) {
        // מצב דמו ללא Stripe — מעבר ישיר לדוח
        navigate(`/report/${analysisId}?paid=1`);
        return;
      }
      window.location.href = res.url; // הפניה ל-Stripe Checkout
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <div className="card p-8 text-center animate-fade-up">
        <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15">
          <CreditCard size={32} className="text-primary" />
        </div>
        <h2 className="mb-2 text-h3 font-700">ניתוח המשכנתא שלך</h2>
        <p className="mb-6 text-muted">
          ניתוח AI מלא: השוואת תמהילים, ניתוח רגישות, benchmark ריבית ו-7 שאלות
          לבנק.
        </p>

        <div className="mb-6 rounded-xl bg-surface-2 p-6">
          <div className="text-4xl font-700 text-primary">₪500</div>
          <div className="text-sm text-muted">תשלום חד-פעמי</div>
        </div>

        <ul className="mb-6 space-y-2 text-right text-sm">
          {[
            "ניתוח כושר החזר אישי",
            "השוואת 3 תמהילים",
            "ניתוח רגישות לעליית ריבית",
            "benchmark ריבית לדרוש",
            "הורדת דוח PDF",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 text-muted">
              <ShieldCheck size={16} className="text-accent shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        {error && (
          <p className="mb-4 rounded-xl bg-danger/15 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        <button
          onClick={handlePay}
          disabled={loading}
          className="btn-primary w-full text-lg"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" /> מעביר לתשלום...
            </>
          ) : (
            <>
              <Lock size={18} /> תשלום מאובטח
            </>
          )}
        </button>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
          <Lock size={12} /> התשלום מעובד באמצעות Stripe · איננו שומרים פרטי כרטיס
        </p>
      </div>
    </main>
  );
}
