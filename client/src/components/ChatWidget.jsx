import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { api } from "../lib/api.js";

const SUGGESTED = [
  "מה זה פריים?",
  "מה ההבדל בין קל\"צ לפריים?",
  "מהי נקודת השיא של ההלוואה?",
  "מתי כדאי למחזר?",
  "מה אחוז ה-LTV שלי ומה משמעותו?",
];

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${
          isUser ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"
        }`}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-primary/15 text-text rounded-tr-sm"
            : "bg-surface-2 text-text rounded-tl-sm"
        }`}
      >
        {msg.text}
      </div>
    </div>
  );
}

export default function ChatWidget({ analysisId }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "שלום! אני כאן כדי לעזור להבין את הנתונים. אשיב על שאלות, אסביר מושגים, ואציג שיקולים לכאן ולכאן — בלי להחליט בשבילך.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages]);

  async function send(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg = { role: "user", text: msg };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.role !== "assistant" || messages.indexOf(m) > 0)
        .map((m) => ({ role: m.role === "user" ? "user" : "model", text: m.text }));

      const res = await api.chat(msg, analysisId, history);
      setMessages((m) => [...m, { role: "assistant", text: res.answer }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "מצטער, אירעה שגיאה. נסה שוב." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* כפתור פתיחה */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-gradient shadow-glow transition-transform duration-200 hover:scale-110"
        aria-label="פתח צ'אט"
      >
        {open ? <X size={22} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
      </button>

      {/* חלון הצ'אט */}
      {open && (
        <div className="fixed bottom-24 left-6 z-50 flex w-80 flex-col rounded-2xl border border-border bg-surface shadow-glow overflow-hidden animate-fade-up sm:w-96">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border bg-surface-2 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
              <Bot size={16} className="text-primary" />
            </div>
            <div>
              <div className="text-sm font-700">כלי המשכנתא</div>
              <div className="text-xs text-muted italic">לא יועץ. יותר טוב.</div>
            </div>
          </div>

          {/* הודעות */}
          <div className="flex flex-col gap-3 overflow-y-auto p-4" style={{ height: 340 }}>
            {messages.map((m, i) => (
              <Message key={i} msg={m} />
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/20">
                  <Loader2 size={14} className="animate-spin text-accent" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-surface-2 px-4 py-2.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* שאלות מהירות */}
          {messages.length <= 2 && (
            <div className="flex flex-wrap gap-1.5 border-t border-border px-3 py-2">
              {SUGGESTED.slice(0, 3).map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs text-muted transition-colors hover:border-primary hover:text-primary"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* קלט */}
          <div className="flex gap-2 border-t border-border p-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="שאל שאלה..."
              className="flex-1 rounded-xl bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={loading}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-gradient text-white disabled:opacity-40 transition-opacity"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
