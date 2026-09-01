// Literal hex mirrors of the CSS custom properties in index.css — recharts renders
// through its own SVG/canvas pipeline, so colors here are kept as literals rather
// than var(...) to avoid theming edge cases in chart internals (tooltips, legends).
export const chartColors = {
  primary: "#0b2a4a",
  accent: "#1e88e5",
  accentDark: "#1565c0",
  mint: "#4c9a72",
  warning: "#b1690f",
  critical: "#c2452f",
  grid: "#e6e2d6",
  muted: "#77726a",
};

export const CATEGORY_PALETTE = [chartColors.accent, chartColors.mint, chartColors.warning, chartColors.critical, "#7c3aed", "#0891b2"];
