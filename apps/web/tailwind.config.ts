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
      },
    },
  },
  plugins: [],
};

export default config;
