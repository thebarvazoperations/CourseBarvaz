import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Mail, MessageSquare } from "lucide-react";
import PageTransition from "../components/PageTransition.jsx";
import SEOMeta from "../components/SEOMeta.jsx";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <PageTransition>
      <SEOMeta
        title="צור קשר"
        description="שאלות, הצעות או משוב? שלח לנו הודעה — צוות כלי המשכנתא ישמח לענות."
      />
      <main role="main" className="mx-auto max-w-2xl px-4 py-14">
        <div className="mb-10 text-center">
          <span className="badge bg-primary/15 text-primary mb-3">צור קשר</span>
          <h1 className="text-h2 mb-2">נשמח לשמוע ממך</h1>
          <p className="text-sm text-muted">שאלות, הצעות, שגיאות שמצאת — כל פנייה מתקבלת בברכה.</p>
        </div>

        {submitted ? (
          <div className="card shadow-glow p-10 text-center animate-fade-up">
            <CheckCircle2 size={48} className="text-accent mx-auto mb-4" />
            <h2 className="text-h3 font-700 mb-2">ההודעה התקבלה!</h2>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              תודה שפנית אלינו. נחזור אליך בהקדם.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/" className="btn-primary">חזרה לדף הבית</Link>
              <Link to="/faq" className="btn-outline">שאלות נפוצות</Link>
            </div>
          </div>
        ) : (
          <div className="card p-6 sm:p-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="contact-name" className="label">שם מלא</label>
                  <input
                    id="contact-name"
                    type="text"
                    className="input"
                    placeholder="ישראל ישראלי"
                    value={form.name}
                    onChange={set("name")}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="label">כתובת מייל</label>
                  <input
                    id="contact-email"
                    type="email"
                    className="input"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={set("email")}
                    required
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className="label">נושא</label>
                <input
                  id="contact-subject"
                  type="text"
                  className="input"
                  placeholder="שאלה על הדוח / הצעה / דיווח על שגיאה"
                  value={form.subject}
                  onChange={set("subject")}
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="label">הודעה</label>
                <textarea
                  id="contact-message"
                  rows={5}
                  className="input resize-none"
                  placeholder="כתוב את הודעתך כאן..."
                  value={form.message}
                  onChange={set("message")}
                  required
                />
              </div>

              <button type="submit" className="btn-primary w-full">
                <MessageSquare size={18} /> שלח הודעה
              </button>
            </form>
          </div>
        )}

        {/* Side info */}
        {!submitted && (
          <div className="mt-6 card p-5 flex items-center gap-4">
            <div className="rounded-xl bg-primary/10 p-2.5 shrink-0">
              <Mail size={20} className="text-primary" />
            </div>
            <div>
              <div className="text-sm font-600 mb-0.5">מייל ישיר</div>
              <div className="text-xs text-muted">[CONTACT_EMAIL]</div>
            </div>
          </div>
        )}
      </main>
    </PageTransition>
  );
}
