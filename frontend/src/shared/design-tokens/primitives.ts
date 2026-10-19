/**
 * Global Design Tokens (Primitives) - GDPT 2018 Sunflower Mentor
 * Foundation layer: raw color values, spacing units, radii, and typography scales.
 */

export const globalTokens = {
  colors: {
    // Amber & Warm Honey (Primary brand tone, intellectual warmth)
    amber: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b",
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
      950: "#451a03",
    },
    // Natural Stone (Neutral foundation, reading comfort, eye strain reduction)
    stone: {
      50: "#fafaf9",
      100: "#f5f5f4",
      200: "#e7e5e4",
      300: "#d6d3d1",
      400: "#a8a29e",
      500: "#78716c",
      600: "#57534e",
      700: "#44403c",
      800: "#292524",
      900: "#1c1917",
      950: "#0c0a09",
    },
    // Emerald / Sage (Growth, sprouts, correct answer feedback)
    emerald: {
      50: "#ecfdf5",
      100: "#d1fae5",
      200: "#a7f3d0",
      300: "#6ee7b7",
      400: "#34d399",
      500: "#10b981",
      600: "#059669",
      700: "#047857",
      800: "#065f46",
      900: "#064e3b",
    },
    // Rose / Coral (Pedagogical dissonance, misconceptions, learning gaps)
    rose: {
      50: "#fff1f2",
      100: "#ffe4e6",
      200: "#fecdd3",
      300: "#fda4af",
      400: "#fb7185",
      500: "#f43f5e",
      600: "#e11d48",
      700: "#be123c",
      800: "#9f1239",
      900: "#881337",
    },
    // Indigo / Sky (Academic subject distinctions, knowledge badges)
    indigo: {
      50: "#eef2ff",
      100: "#e0e7ff",
      200: "#c7d2fe",
      300: "#a5b4fc",
      400: "#818cf8",
      500: "#6366f1",
      600: "#4f46e5",
      700: "#4338ca",
      800: "#3730a3",
      900: "#312e81",
    },
    sky: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
    },
  },
  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    "2xl": "3rem", // 48px
  },
  radii: {
    sm: "0.375rem", // 6px
    md: "0.625rem", // 10px
    lg: "0.875rem", // 14px
    xl: "1.125rem", // 18px
    "2xl": "1.5rem", // 24px
    "3xl": "2rem", // 32px
    full: "9999px",
  },
  typography: {
    fontFamilies: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      math: '"KaTeX_Math", "KaTeX_Main", "Times New Roman", serif',
    },
    fontSizes: {
      "2xs": "0.625rem", // 10px - Micro tags & hints
      xs: "0.75rem", // 12px - Secondary annotations & badges
      sm: "0.875rem", // 14px - Body secondary, inputs
      base: "1rem", // 16px - Standard reading text
      lg: "1.125rem", // 18px - Sub-section headers
      xl: "1.25rem", // 20px - Card headers
      "2xl": "1.5rem", // 24px - Page section titles
      "3xl": "1.875rem", // 30px - Hero banners
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.625,
    },
  },
  shadows: {
    xs: "0 1px 2px 0 rgba(28, 25, 23, 0.05)",
    sm: "0 1px 3px 0 rgba(28, 25, 23, 0.08), 0 1px 2px -1px rgba(28, 25, 23, 0.08)",
    md: "0 4px 6px -1px rgba(28, 25, 23, 0.07), 0 2px 4px -2px rgba(28, 25, 23, 0.07)",
    card: "0 10px 25px -5px rgba(217, 119, 6, 0.06), 0 8px 10px -6px rgba(28, 25, 23, 0.04)",
  },
} as const;

export type GlobalTokens = typeof globalTokens;
