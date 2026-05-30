/**
 * ai-provider.js — ספק AI מאוחד
 *
 * תומך ב: Anthropic Claude / OpenAI / Google Gemini
 * הבחירה נעשית לפי מפתחות API ב-.env:
 *   ANTHROPIC_API_KEY → Claude
 *   OPENAI_API_KEY    → OpenAI
 *   GEMINI_API_KEY    → Gemini
 *
 * אם יותר ממפתח אחד קיים, הסדר הוא Claude > OpenAI > Gemini.
 * אפשר לאלץ ספק ספציפי עם: AI_PROVIDER=claude|openai|gemini
 *
 * chat() תומך בתמונות (vision) דרך פרמטר images אופציונלי:
 *   images = [{ mediaType: "image/png", data: "<base64>" }]
 * מגבלת הטוקנים לתשובה נשלטת ע"י CHAT_MAX_TOKENS ב-.env (ברירת מחדל 1024).
 */

const CHAT_MAX_TOKENS = Number(process.env.CHAT_MAX_TOKENS) || 1024;
const GEN_MAX_TOKENS = 2048;

// ---- Anthropic ----
function buildAnthropicProvider() {
  const Anthropic = require("@anthropic-ai/sdk");
  const client = new Anthropic.Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  return {
    name: "claude",
    async generate(systemPrompt, userMessage) {
      const msg = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: GEN_MAX_TOKENS,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      });
      return msg.content[0].text;
    },
    async chat(systemPrompt, history, newMessage, images = []) {
      let userContent;
      if (images.length > 0) {
        userContent = [
          { type: "text", text: newMessage },
          ...images.map((img) => ({
            type: "image",
            source: { type: "base64", media_type: img.mediaType, data: img.data },
          })),
        ];
      } else {
        userContent = newMessage;
      }
      const messages = [
        ...history.map((h) => ({ role: h.role === "model" ? "assistant" : h.role, content: h.content })),
        { role: "user", content: userContent },
      ];
      const msg = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: CHAT_MAX_TOKENS,
        system: systemPrompt,
        messages,
      });
      return msg.content[0].text;
    },
  };
}

// ---- OpenAI ----
function buildOpenAIProvider() {
  const OpenAI = require("openai");
  const client = new OpenAI.OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  return {
    name: "openai",
    async generate(systemPrompt, userMessage) {
      const res = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: GEN_MAX_TOKENS,
      });
      return res.choices[0].message.content;
    },
    async chat(systemPrompt, history, newMessage, images = []) {
      let userContent;
      if (images.length > 0) {
        userContent = [
          { type: "text", text: newMessage },
          ...images.map((img) => ({
            type: "image_url",
            image_url: { url: `data:${img.mediaType};base64,${img.data}` },
          })),
        ];
      } else {
        userContent = newMessage;
      }
      const messages = [
        { role: "system", content: systemPrompt },
        ...history.map((h) => ({ role: h.role === "model" ? "assistant" : h.role, content: h.content })),
        { role: "user", content: userContent },
      ];
      const res = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        max_tokens: CHAT_MAX_TOKENS,
      });
      return res.choices[0].message.content;
    },
  };
}

// ---- Gemini ----
function buildGeminiProvider(systemPrompt) {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  return {
    name: "gemini",
    _genAI: genAI,
    async generate(sysPrompt, userMessage) {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: sysPrompt,
      });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
      });
      return result.response.text();
    },
    async chat(sysPrompt, history, newMessage, images = []) {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: sysPrompt,
        generationConfig: { maxOutputTokens: CHAT_MAX_TOKENS },
      });
      const userParts = [
        { text: newMessage },
        ...images.map((img) => ({
          inlineData: { mimeType: img.mediaType, data: img.data },
        })),
      ];
      const contents = [
        ...history.map((h) => ({
          role: h.role === "assistant" ? "model" : h.role,
          parts: [{ text: h.content }],
        })),
        { role: "user", parts: userParts },
      ];
      const result = await model.generateContent({ contents });
      return result.response.text();
    },
  };
}

// ---- Provider selection ----
function detectProvider() {
  const forced = (process.env.AI_PROVIDER || "").toLowerCase();

  if (forced === "claude" && process.env.ANTHROPIC_API_KEY) return buildAnthropicProvider();
  if (forced === "openai" && process.env.OPENAI_API_KEY) return buildOpenAIProvider();
  if (forced === "gemini" && process.env.GEMINI_API_KEY) return buildGeminiProvider();

  // auto-detect: Claude > OpenAI > Gemini
  if (process.env.ANTHROPIC_API_KEY) return buildAnthropicProvider();
  if (process.env.OPENAI_API_KEY) return buildOpenAIProvider();
  if (process.env.GEMINI_API_KEY) return buildGeminiProvider();

  return null; // demo mode
}

const provider = detectProvider();

if (provider) {
  console.log(`[ai-provider] משתמש ב-${provider.name}`);
} else {
  console.log("[ai-provider] אין מפתח API — מצב דמו");
}

module.exports = { provider };
