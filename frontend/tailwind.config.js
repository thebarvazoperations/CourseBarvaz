/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: "#1A1A1A",
        "burnt-orange": "#C0541E",
        "burnt-orange-dark": "#A0441A",
        "burnt-orange-light": "#FFF5F0",
        surface: "#F5F5F5",
        border: "#D0D0D0",
        success: "#2A7A2A",
        "success-light": "#E8F5E8",
        error: "#B30000",
        "error-light": "#FFE8E8",
        muted: "#4A4A4A",
      },
      fontFamily: {
        rubik: ["Rubik", "sans-serif"],
      },
      fontSize: {
        base: "18px",
      },
      minHeight: {
        touch: "56px",
      },
      maxWidth: {
        content: "680px",
      },
    },
  },
  plugins: [],
};
