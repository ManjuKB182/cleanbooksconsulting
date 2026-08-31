// One place tying each dashboard's catalog key to its sidebar badge (code + color)
// and route. Colors are a categorical set distinct from the semantic status colors
// (mint/warning/critical) used inside each dashboard's own charts and pills.
export interface DashboardMeta {
  code: string;
  color: string;
  route: string;
}

export const DASHBOARD_META: Record<string, DashboardMeta> = {
  pod: { code: "PD", color: "#1e88e5", route: "/dashboards/pod" },
  reconciliation: { code: "MR", color: "#7c3aed", route: "/dashboards/reconciliation" },
  invoices: { code: "IL", color: "#059669", route: "/dashboards/invoices" },
  returns: { code: "RC", color: "#db2777", route: "/dashboards/returns" },
  cash_flow: { code: "CF", color: "#0891b2", route: "/dashboards/cash-flow" },
};
