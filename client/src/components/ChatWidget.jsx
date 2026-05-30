import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, Paperclip, Image as ImageIcon } from "lucide-react";
import { api } from "../lib/api.js";

const SUGGESTED = [
  "מה זה פריים?",
  "מה ה-LTV שלי ומה משמעותו?",
  "מה ההחזר החודשי בכל תמהיל?",
  "מתי כדאי למחזר?",
];

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB

const GREETING = {
  role: "assistant",
  text: "שלום! אני כאן כדי לעזור להבין את הנתונים של הניתוח שלך. אפשר גם להעלות צילום מסך של הצעת בנק ואשווה אותה לנתונים שלך — בלי להחליט בשבילך.",
};

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
        {/* תצוגת תמונה — או thumbnail מקומי (preview) או דגל מהיסטוריה */}
        {msg.image && (
          <img
            src={msg.image}
            alt="צרופה"
            className="mb-2 max-h-40 rounded-lg border border-border"
          />
        )}
        {!msg.image && msg.hasImage && (
          <div className="mb-2 flex items-center gap-1.5 text-xs text-muted">
            <ImageIcon size={13} /> תמונה צורפה
          </div>
        )}
        {msg.text}
      </div>
    </div>
  );
}

export default function ChatWidget({ analysisId }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState(null); // { dataUrl, mediaType, base64 }
  const [notice, setNotice] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const fileRef = useRef(null);
  const loadedRef = useRef(false);

  // שחזור היסטוריה בפתיחה ראשונה
  useEffect(() => {
    if (!open || loadedRef.current || !analysisId) return;
    loadedRef.current = true;
    api
      .getChatHistory(analysisId)
      .then((res) => {
        if (res.history?.length) {
          setMessages([GREETING, ...res.history]);
        }
      })
      .catch(() => {});
  }, [open, analysisId]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages, loading]);

  function handleFile(e) {
    setNotice("");
    const file = e.target.files?.[0];
    e.target.value = ""; // לאפשר בחירה חוזרת של אותו קובץ
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setNotice("ניתן להעלות תמונות בלבד.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setNotice("התמונה גדולה מדי (מקסימום 4MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const base64 = String(dataUrl).split(",")[1];
      setAttachment({ dataUrl, mediaType: file.type, base64 });
    };
    reader.readAsDataURL(file);
  }

  async function send(text) {
    const msg = (text || input.trim());
    if ((!msg && !attachment) || loading) return;
    setInput("");
    setNotice("");

    const userMsg = {
      role: "user",
      text: msg,
      image: attachment?.dataUrl || null,
    };
    setMessages((m) => [...m, userMsg]);

    const images = attachment ? [{ mediaType: attachment.mediaType, data: attachment.base64 }] : [];
    setAttachment(null);
    setLoading(true);

    try {
      const res = await api.chat(msg || "(תמונה צורפה)", analysisId, images);
      setMessages((m) => [...m, { role: "assistant", text: res.answer }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", text: "מצטער, אירעה שגיאה. נסה שוב." }]);
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
          {messages.length <= 1 && (
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

          {/* תצוגת צרופה / הודעת מערכת */}
          {(attachment || notice) && (
            <div className="border-t border-border px-3 py-2">
              {attachment && (
                <div className="flex items-center gap-2 rounded-lg bg-surface-2 p-1.5">
                  <img src={attachment.dataUrl} alt="תצוגה" className="h-10 w-10 rounded object-cover" />
                  <span className="flex-1 text-xs text-muted">תמונה מצורפת</span>
                  <button
                    onClick={() => setAttachment(null)}
                    className="text-muted hover:text-danger"
                    aria-label="הסר תמונה"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}
              {notice && <div className="mt-1 text-xs text-danger">{notice}</div>}
            </div>
          )}

          {/* קלט */}
          <div className="flex items-center gap-2 border-t border-border p-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={loading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-muted transition-colors hover:text-primary disabled:opacity-40"
              aria-label="צרף תמונה"
            >
              <Paperclip size={15} />
            </button>
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
              disabled={(!input.trim() && !attachment) || loading}
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
