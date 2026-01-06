/**
 * タグの色マッピング
 * Tailwind CSSの色名から各種形式への変換
 */

export const TAG_COLORS = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
  "slate",
] as const;

export type TagColor = (typeof TAG_COLORS)[number];

/**
 * Tailwind色名からHEXカラーコードへのマッピング（SVG用）
 */
const hexColorMap: Record<string, string> = {
  red: "#ef4444",
  orange: "#f97316",
  amber: "#f59e0b",
  yellow: "#eab308",
  lime: "#84cc16",
  green: "#22c55e",
  emerald: "#10b981",
  teal: "#14b8a6",
  cyan: "#06b6d4",
  sky: "#0ea5e9",
  blue: "#3b82f6",
  indigo: "#6366f1",
  violet: "#8b5cf6",
  purple: "#a855f7",
  fuchsia: "#d946ef",
  pink: "#ec4899",
  rose: "#f43f5e",
  slate: "#64748b",
};

/**
 * Tailwind色名からCSSクラスへのマッピング
 */
const cssClassMap: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  red: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" },
  orange: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-300",
  },
  amber: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-300",
  },
  yellow: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-300",
  },
  lime: { bg: "bg-lime-100", text: "text-lime-700", border: "border-lime-300" },
  green: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-300",
  },
  emerald: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-300",
  },
  teal: { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-300" },
  cyan: { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-300" },
  sky: { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-300" },
  blue: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
  indigo: {
    bg: "bg-indigo-100",
    text: "text-indigo-700",
    border: "border-indigo-300",
  },
  violet: {
    bg: "bg-violet-100",
    text: "text-violet-700",
    border: "border-violet-300",
  },
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-300",
  },
  fuchsia: {
    bg: "bg-fuchsia-100",
    text: "text-fuchsia-700",
    border: "border-fuchsia-300",
  },
  pink: { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-300" },
  rose: { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-300" },
  slate: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-300",
  },
};

const defaultCssClasses = {
  bg: "bg-slate-100",
  text: "text-slate-700",
  border: "border-slate-300",
};

/**
 * タグの色名からHEXカラーコードを取得
 */
export function getTagColorHex(color: string): string {
  return hexColorMap[color] ?? "#64748b";
}

/**
 * タグの色名からCSSクラスを取得
 */
export function getTagColorClasses(color: string): {
  bg: string;
  text: string;
  border: string;
} {
  return cssClassMap[color] ?? defaultCssClasses;
}
