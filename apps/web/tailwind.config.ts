import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f6ff", 100: "#e2eaff", 500: "#3858e9", 600: "#2c46c9", 700: "#22369e",
        },
        inkBg: "#0A0E14", inkElevated: "#11151F", inkLine: "rgba(255,255,255,0.08)",
        inkText: "#EDEFF5", inkMuted: "#96A0B5",
        accentAmber: "#F2B84B", accentTeal: "#3FD9C7",

        // ===== Dashboard design tokens (from HTML) =====
        "on-secondary-container": "#54647a",
        "on-background": "#131b2e",
        "on-primary": "#ffffff",
        "inverse-surface": "#283044",
        "inverse-on-surface": "#eef0ff",
        "surface-dim": "#d2d9f4",
        "surface": "#faf8ff",
        "surface-variant": "#dae2fd",
        "surface-container": "#eaedff",
        "surface-container-lowest": "#ffffff",
        "surface-container-highest": "#dae2fd",
        "outline": "#7e7576",
        "outline-variant": "#dae2fd",
        "secondary": "#505f76",
        "primary": "#000000",
      },
      spacing: {
        base: "4px", xs: "8px", sm: "16px", md: "24px",
        gutter: "24px", lg: "40px", xl: "64px", "margin-safe": "32px",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        "label-caps": ['"Hanken Grotesk"', "sans-serif"],
        "body-sm": ['"Hanken Grotesk"', "sans-serif"],
        "body-lg": ['"Hanken Grotesk"', "sans-serif"],
        "title-md": ['"Hanken Grotesk"', "sans-serif"],
        "headline-lg": ['"Hanken Grotesk"', "sans-serif"],
        "display-lg": ['"Hanken Grotesk"', "sans-serif"],
      },
      fontSize: {
        "label-caps": ["12px", { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "700" }],
        "body-sm": ["13px", { lineHeight: "1.5" }],
        "body-lg": ["16px", { lineHeight: "1.6" }],
        "title-md": ["18px", { lineHeight: "1.3", fontWeight: "600" }],
        "headline-lg": ["32px", { lineHeight: "1.2", fontWeight: "700" }],
        "display-lg": ["48px", { lineHeight: "1.1", fontWeight: "800" }],
      },
      borderRadius: { DEFAULT: "0.125rem", lg: "0.5rem", xl: "0.75rem", full: "9999px" },
      keyframes: {
        drift: { "0%, 100%": { transform: "translateY(0px) rotate(0deg)" }, "50%": { transform: "translateY(-14px) rotate(1.5deg)" } },
        fadeUp: { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      animation: { drift: "drift 9s ease-in-out infinite", "fade-up": "fadeUp 0.7s ease-out both" },
    },
  },
  plugins: [],
};

export default config;
