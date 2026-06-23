import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",

  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        // ===== Existing Brand Colors =====
        brand: {
          50: "#f2f6ff",
          100: "#e2eaff",
          500: "#3858e9",
          600: "#2c46c9",
          700: "#22369e",
        },

        inkBg: "#0A0E14",
        inkElevated: "#11151F",
        inkLine: "rgba(255,255,255,0.08)",
        inkText: "#EDEFF5",
        inkMuted: "#96A0B5",

        accentAmber: "#F2B84B",
        accentTeal: "#3FD9C7",

        // ===== Dashboard Theme =====
        background: "#faf8ff",

        surface: "#faf8ff",
        "surface-dim": "#d2d9f4",

        "surface-variant": "#dae2fd",

        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f3ff",
        "surface-container": "#eaedff",
        "surface-container-high": "#e2e7ff",
        "surface-container-highest": "#dae2fd",

        "inverse-surface": "#283044",
        "inverse-on-surface": "#eef0ff",

        primary: "#000000",
        secondary: "#505f76",
        tertiary: "#000000",

        "secondary-container": "#d0e1fb",
        "tertiary-container": "#171c1f",

        "on-primary": "#ffffff",
        "on-primary-container": "#848484",
        "on-primary-fixed-variant": "#474747",

        "on-secondary": "#ffffff",
        "on-secondary-container": "#54647a",
        "on-secondary-fixed-variant": "#38485d",

        "on-tertiary-container": "#808488",
        "on-tertiary-fixed-variant": "#43474b",

        "on-background": "#131b2e",
        "on-surface": "#131b2e",
        "on-surface-variant": "#4c4546",

        outline: "#7e7576",
        "outline-variant": "#cfc4c5",
      },

      spacing: {
        base: "4px",
        xs: "8px",
        sm: "16px",
        md: "24px",

        gutter: "24px",

        lg: "40px",
        xl: "64px",

        "margin-safe": "32px",
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
        "label-caps": [
          "12px",
          {
            lineHeight: "1",
            letterSpacing: "0.05em",
            fontWeight: "700",
          },
        ],

        "body-sm": [
          "14px",
          {
            lineHeight: "1.5",
            fontWeight: "400",
          },
        ],

        "body-lg": [
          "16px",
          {
            lineHeight: "1.6",
            fontWeight: "400",
          },
        ],

        "title-md": [
          "20px",
          {
            lineHeight: "1.4",
            fontWeight: "600",
          },
        ],

        "headline-lg": [
          "32px",
          {
            lineHeight: "1.2",
            letterSpacing: "-0.01em",
            fontWeight: "600",
          },
        ],

        "display-lg": [
          "48px",
          {
            lineHeight: "1.1",
            letterSpacing: "-0.02em",
            fontWeight: "700",
          },
        ],
      },

      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem",
      },

      keyframes: {
        drift: {
          "0%, 100%": {
            transform: "translateY(0px) rotate(0deg)",
          },

          "50%": {
            transform: "translateY(-14px) rotate(1.5deg)",
          },
        },

        fadeUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(12px)",
          },

          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
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