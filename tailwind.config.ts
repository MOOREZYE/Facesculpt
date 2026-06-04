import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        warm: {
          950: "#0D0B09",
          900: "#151210",
          800: "#1E1A16",
          700: "#2A2420",
          600: "#3A3028",
          500: "#9A8878",
          400: "#B8A898",
          300: "#CCC0B4",
          200: "#DDD4CC",
          100: "#EDE8E4",
          50:  "#F4EDE4",
        },
        gold: {
          700: "#8C6E3D",
          600: "#A88850",
          500: "#C9A96E",
          400: "#D4B880",
          300: "#DEC99A",
          200: "#EAD9B8",
          100: "#F4EDD8",
          50:  "#FAF5EC",
        },
      },
      fontFamily: {
        cormorant: ["Cormorant Garamond", "Georgia", "serif"],
        inter: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
