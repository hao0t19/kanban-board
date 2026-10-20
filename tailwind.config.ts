import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

// Colors resolve to CSS variables defined in globals.css so the same token
// names work for both light and dark themes.
const token = (name: string) => `rgb(var(--color-${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        page: token("page"),
        column: token("column"),
        surface: token("surface"),
        ink: {
          DEFAULT: token("ink"),
          muted: token("ink-muted"),
        },
        line: token("line"),
        accent: {
          DEFAULT: token("accent"),
          soft: token("accent-soft"),
          contrast: token("accent-contrast"),
          "on-ink": token("accent-on-ink"),
        },
        priority: {
          high: { DEFAULT: token("high"), bg: token("high-bg") },
          medium: { DEFAULT: token("medium"), bg: token("medium-bg") },
          low: { DEFAULT: token("low"), bg: token("low-bg") },
        },
        tag: {
          DEFAULT: token("tag"),
          bg: token("tag-bg"),
        },
      },
      borderColor: {
        DEFAULT: token("line"),
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
      },
      width: {
        column: "320px",
      },
      spacing: {
        column: "320px",
        "column-gap": "20px",
        "column-pad": "12px",
        "card-pad": "14px",
        control: "44px",
      },
      borderRadius: {
        column: "14px",
        card: "10px",
        control: "10px",
      },
      boxShadow: {
        card: "0 1px 2px rgb(var(--color-shadow) / 0.06)",
        drag: "0 16px 32px -8px rgb(var(--color-shadow) / 0.22), 0 4px 10px rgb(var(--color-shadow) / 0.08)",
      },
      rotate: {
        drag: "2.5deg",
      },
    },
  },
  plugins: [],
};

export default config;
