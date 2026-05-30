// סימולטור ועדה רפואית - לוגיקת צד-לקוח
const introEl = document.getElementById("intro");
const chatEl = document.getElementById("chat");
const messagesEl = document.getElementById("messages");
const composerEl = document.getElementById("composer");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const startBtn = document.getElementById("startBtn");
const skipBtn = document.getElementById("skipBtn");
const reportInput = document.getElementById("reportInput");

/** היסטוריית השיחה שנשלחת לשרת (role/content) */
let history = [];
let busy = false;

// ----- מעבר ממסך הפתיחה לצ'אט -----
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
  introEl.classList.add("hidden");
  chatEl.classList.remove("hidden");
  userInput.focus();
  sendMessage(firstUserMessage);
}

// ----- שליחת הודעה -----
composerEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  if (!text || busy) return;
  userInput.value = "";
  autosize();
  sendMessage(text);
});

// Enter לשליחה, Shift+Enter לשורה חדשה
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    composerEl.requestSubmit();
  }
});
userInput.addEventListener("input", autosize);
function autosize() {
  userInput.style.height = "auto";
  userInput.style.height = Math.min(userInput.scrollHeight, 160) + "px";
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
      // מסירים את ההודעה האחרונה כדי לאפשר ניסיון חוזר
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

// ----- עזרי UI -----
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

// המרת **טקסט** ל-bold ושמירה על שורות
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
