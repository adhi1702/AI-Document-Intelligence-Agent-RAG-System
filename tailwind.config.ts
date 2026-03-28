import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["var(--font-mono)", "monospace"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      colors: {
        bg: {
          primary: "#0a0a0f",
          secondary: "#111118",
          card: "#16161f",
          hover: "#1c1c28",
          border: "#2a2a38",
          "border-light": "#353545",
        },
        accent: {
          purple: "#7c3aed",
          "purple-dim": "#5b21b6",
          "purple-glow": "#a78bfa",
          blue: "#2563eb",
          teal: "#0d9488",
        },
        text: {
          primary: "#f0eeff",
          secondary: "#a8a8c0",
          muted: "#5a5a70",
          danger: "#f87171",
          success: "#4ade80",
        },
      },
      animation: {
        "fade-up": "fadeUp 0.3s ease forwards",
        "pulse-dot": "pulseDot 1.4s ease-in-out infinite",
        "slide-in": "slideIn 0.25s ease forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseDot: {
          "0%, 80%, 100%": { transform: "scale(0.6)", opacity: "0.4" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
