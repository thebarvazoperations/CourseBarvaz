// ============================================================
// וֶעדה AI — לוגיקת צד-לקוח: שליטה במודאל + צ'אט מול הרופא
// ============================================================

// שנה בפוטר
document.getElementById("year").textContent = new Date().getFullYear();

// ----- אלמנטים -----
const modal = document.getElementById("simModal");
const simIntro = document.getElementById("simIntro");
const simChat = document.getElementById("simChat");
const messagesEl = document.getElementById("messages");
const composerEl = document.getElementById("composer");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const startBtn = document.getElementById("startBtn");
const skipBtn = document.getElementById("skipBtn");
const reportInput = document.getElementById("reportInput");

/** היסטוריית השיחה הנשלחת לשרת */
let history = [];
let busy = false;
let started = false;

// ============================================================
// פתיחה / סגירה של המודאל
// ============================================================
function openModal() {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  // פוקוס על השדה הרלוונטי
  setTimeout(() => (started ? userInput : reportInput)?.focus(), 50);
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-open-sim]").forEach((b) =>
  b.addEventListener("click", openModal)
);
document.querySelectorAll("[data-close-sim]").forEach((b) =>
  b.addEventListener("click", closeModal)
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
});

// ============================================================
// התחלת השיחה
// ============================================================
startBtn.addEventListener("click", () => {
  const report = reportInput.value.trim();
  if (!report) {
    reportInput.focus();
    reportInput.style.borderColor = "#f59e0b";
    return;
  }
  beginChat(
    `שלום ד״ר אבי. הנה הדוח הרפואי / האבחנות שלי לקראת הוועדה הרפואית:\n\n${report}\n\nאשמח שתעבור עליו ותתחיל לראיין אותי כמו בוועדה.`
  );
});

skipBtn.addEventListener("click", () => {
  beginChat(
    "שלום ד״ר אבי. אני מתכונן לוועדה רפואית של הביטוח הלאומי ורוצה שתראיין אותי. בוא נתחיל."
  );
});

function beginChat(firstUserMessage) {
  started = true;
  simIntro.classList.add("hidden");
  simChat.classList.remove("hidden");
  userInput.focus();
  sendMessage(firstUserMessage);
}

// ============================================================
// שליחת הודעות
// ============================================================
composerEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  if (!text || busy) return;
  userInput.value = "";
  autosize();
  sendMessage(text);
});

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    composerEl.requestSubmit();
  }
});
userInput.addEventListener("input", autosize);
function autosize() {
  userInput.style.height = "auto";
  userInput.style.height = Math.min(userInput.scrollHeight, 140) + "px";
}

async function sendMessage(text) {
  addBubble(text, "user");
  history.push({ role: "user", content: text });
  setBusy(true);
  const typing = addTyping();

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    });
    const data = await res.json();
    typing.remove();

    if (!res.ok) {
      addError(data.error || "אירעה שגיאה. נסו שוב.");
      history.pop();
      return;
    }

    const reply = data.reply || "";
    history.push({ role: "assistant", content: reply });
    addBubble(reply, isFinal(reply) ? "bot final" : "bot");
  } catch (err) {
    typing.remove();
    addError("בעיית תקשורת עם השרת. בדקו את החיבור ונסו שוב.");
    history.pop();
  } finally {
    setBusy(false);
    userInput.focus();
  }
}

function isFinal(text) {
  return text.includes("===הערכה סופית===");
}

// ============================================================
// עזרי UI
// ============================================================
function addBubble(text, cls) {
  const div = document.createElement("div");
  div.className = "msg " + cls;
  div.innerHTML = formatText(text.replace("===הערכה סופית===", "").trim());
  messagesEl.appendChild(div);
  scrollDown();
  return div;
}

function addTyping() {
  const div = document.createElement("div");
  div.className = "msg bot";
  div.innerHTML =
    '<span class="typing"><span></span><span></span><span></span></span>';
  messagesEl.appendChild(div);
  scrollDown();
  return div;
}

function addError(msg) {
  const div = document.createElement("div");
  div.className = "error-banner";
  div.textContent = "⚠️ " + msg;
  messagesEl.appendChild(div);
  scrollDown();
}

function formatText(text) {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function scrollDown() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function setBusy(v) {
  busy = v;
  sendBtn.disabled = v;
}
