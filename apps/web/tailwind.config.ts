import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f6ff",
          100: "#e2eaff",
          500: "#3858e9",
          600: "#2c46c9",
          700: "#22369e",
        },
        // Landing page palette — kept separate from `brand` so the
        // light-themed app pages (login/dashboard) are untouched.
        inkBg: "#0A0E14",
        inkElevated: "#11151F",
        inkLine: "rgba(255,255,255,0.08)",
        inkText: "#EDEFF5",
        inkMuted: "#96A0B5",
        accentAmber: "#F2B84B",
        accentTeal: "#3FD9C7",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-14px) rotate(1.5deg)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        drift: "drift 9s ease-in-out infinite",
        "fade-up": "fadeUp 0.7s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;