import type { Config } from "tailwindcss";

/**
 * Дефолтная палитра Tailwind ПОЛНОСТЬЮ заменена — не расширена.
 * Если цвета нет здесь, его нельзя использовать в разметке. Это единственный
 * механизм, который не даёт системе расползтись при добавлении новых экранов.
 *
 * Значения — CSS-переменные (см. globals.css), не hex: та же палитра токенов
 * получает тёмный вариант через `.dark` без дублирования classNames.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      bg: "var(--bg)",
      surface: "var(--surface)",
      border: "var(--border)",
      primary: "var(--primary)",
      secondary: "var(--secondary)",
      accent: "var(--accent)",
      "accent-soft": "var(--accent-soft)",
      error: "var(--error)",
    },
    fontFamily: {
      display: ["var(--font-fraunces)", "Georgia", "serif"],
      sans: ["var(--font-inter)", "system-ui", "sans-serif"],
    },
    // Шкала из брифа: 13/15/17/21/28/40/64. Ничего импровизированного.
    fontSize: {
      xs: ["13px", { lineHeight: "1.5" }],
      sm: ["15px", { lineHeight: "1.5" }],
      base: ["17px", { lineHeight: "1.5" }],
      lg: ["21px", { lineHeight: "1.4" }],
      xl: ["28px", { lineHeight: "1.2" }],
      "2xl": ["40px", { lineHeight: "1.1" }],
      "3xl": ["64px", { lineHeight: "1.1" }],
    },
    borderRadius: {
      none: "0",
      sm: "6px",
      md: "10px",
      lg: "14px",
      xl: "20px",
      full: "9999px",
    },
    boxShadow: {
      // Единственная разрешённая тень. Никаких цветных/светящихся.
      subtle:
        "0 1px 2px rgba(28,23,17,0.04), 0 8px 24px rgba(28,23,17,0.04)",
      none: "none",
    },
    extend: {
      letterSpacing: {
        tight: "-0.02em",
        tighter: "-0.03em",
      },
      spacing: {
        "18": "4.5rem",
        "gutter": "5rem",
      },
      maxWidth: {
        reading: "840px",
        shell: "1280px",
      },
      transitionTimingFunction: {
        "out-soft": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
