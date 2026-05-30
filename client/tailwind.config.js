/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0e1a",
        surface: "#111827",
        "surface-2": "#1f2937",
        primary: "#6366f1",
        "primary-hover": "#4f46e5",
        accent: "#10b981",
        danger: "#ef4444",
        warn: "#f59e0b",
        text: "#f9fafb",
        muted: "#9ca3af",
        border: "#1f2937",
      },
      fontFamily: {
        sans: ['"Assistant"', "system-ui", "sans-serif"],
      },
      fontWeight: {
        300: "300",
        400: "400",
        600: "600",
        700: "700",
      },
      fontSize: {
        h1: ["48px", { lineHeight: "1.1", fontWeight: "700" }],
        h2: ["32px", { lineHeight: "1.2", fontWeight: "700" }],
        h3: ["20px", { lineHeight: "1.3", fontWeight: "600" }],
      },
      borderRadius: {
        card: "16px",
      },
      boxShadow: {
        card: "0 4px 24px rgba(99,102,241,0.08)",
        glow: "0 8px 40px rgba(99,102,241,0.18)",
      },
      backgroundImage: {
        "primary-gradient": "linear-gradient(135deg, #6366f1, #8b5cf6)",
      },
    },
  },
  plugins: [],
};
