// Literal hex mirrors of the CSS custom properties in index.css — recharts renders
// through its own SVG/canvas pipeline, so colors here are kept as literals rather
// than var(...) to avoid theming edge cases in chart internals (tooltips, legends).
export const chartColors = {
  primary: "#0b2a4a",
  accent: "#1e88e5",
  accentDark: "#1565c0",
  mint: "#6fd3a7",
  warning: "#f59e0b",
  critical: "#ef4444",
  grid: "#e2e8f0",
  muted: "#64748b",
};

export const CATEGORY_PALETTE = [chartColors.accent, chartColors.mint, chartColors.warning, chartColors.critical, "#8b5cf6", "#0ea5e9"];
