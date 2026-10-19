/**
 * Semantic & Component Tokens - GDPT 2018 Socratic Sunflower Mentor
 * Meaningful aliases and component specifications.
 */

import { globalTokens } from "@/shared/design-tokens/primitives";

// ============================================================================
// 2. SEMANTIC TOKENS (ALIASES)
// ============================================================================
export const semanticTokens = {
  canvas: {
    background: "#faf8f5",
    foreground: "#1c1917",
    surface: "#ffffff",
    surfaceSubtle: "#f5f3ef",
    border: "#e8e4dc",
    borderHover: "#d6cfc4",
  },
  brand: {
    primary: "#d97706",
    primaryHover: "#b45309",
    primaryLight: "#fef3c7",
    primaryForeground: "#ffffff",
    focusRing: "#f59e0b",
  },
  feedback: {
    exact: {
      label: "Chính xác tuyệt đối",
      background: "#ecfdf5",
      border: "#a7f3d0",
      text: "#065f46",
      solid: "#059669",
    },
    partial: {
      label: "Chính xác một phần / Cần hoàn thiện",
      background: "#fffbeb",
      border: "#fde68a",
      text: "#92400e",
      solid: "#d97706",
    },
    misconception: {
      label: "Cần xem lại / Lỗ hổng kiến thức",
      background: "#fff1f2",
      border: "#fecdd3",
      text: "#9f1239",
      solid: "#e11d48",
    },
    neutral: {
      label: "Thông tin trung lập",
      background: "#f5f5f4",
      border: "#e7e5e4",
      text: "#44403c",
      solid: "#78716c",
    },
  },
  subjects: {
    math: { name: "Toán học", color: "#d97706", bg: "#fef3c7", text: "#92400e" },
    physics: { name: "Vật lí", color: "#4f46e5", bg: "#e0e7ff", text: "#3730a3" },
    chemistry: { name: "Hóa học", color: "#7c3aed", bg: "#ede9fe", text: "#5b21b6" },
    biology: { name: "Sinh học", color: "#059669", bg: "#d1fae5", text: "#065f46" },
    literature: { name: "Ngữ văn", color: "#e11d48", bg: "#ffe4e6", text: "#9f1239" },
    english: { name: "Tiếng Anh", color: "#0284c7", bg: "#e0f2fe", text: "#0369a1" },
    history: { name: "Lịch sử", color: "#ea580c", bg: "#ffedd5", text: "#9a3412" },
    geography: { name: "Địa lí", color: "#16a34a", bg: "#dcfce7", text: "#166534" },
  },
} as const;

// ============================================================================
// 3. COMPONENT TOKENS (SPECIFIC)
// ============================================================================
export const componentTokens = {
  button: {
    heightSm: "2rem",
    heightDefault: "2.5rem",
    heightLg: "3rem",
    radii: globalTokens.radii.xl,
  },
  card: {
    radii: globalTokens.radii["2xl"],
    border: "1px solid var(--border)",
    paddingDefault: globalTokens.spacing.lg,
  },
  modal: {
    radii: globalTokens.radii["3xl"],
    backdropBlur: "blur(4px)",
    maxWidth: "36rem",
  },
  chip: {
    radii: globalTokens.radii.full,
    paddingX: "0.625rem",
    paddingY: "0.25rem",
    fontSize: globalTokens.typography.fontSizes["2xs"],
  },
} as const;

export type SemanticTokens = typeof semanticTokens;
export type ComponentTokens = typeof componentTokens;
