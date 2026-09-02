import { Navigate, useOutletContext } from "react-router-dom";
import { DASHBOARD_META } from "./dashboardMeta";
import type { DashboardSummary } from "../lib/types";

/** Lands on /dashboards with nothing selected — send straight to the first
 * enabled dashboard so there's always something in preview, matching the
 * sidebar-plus-preview layout. */
export function DashboardIndex() {
  const dashboards = useOutletContext<DashboardSummary[] | null>();

  if (!dashboards) return null;

  const firstEnabled = dashboards.find((d) => d.enabled && DASHBOARD_META[d.key]);
  if (firstEnabled) {
    return <Navigate to={DASHBOARD_META[firstEnabled.key].route} replace />;
  }

  return (
    <div>
      <h1>Dashboards</h1>
      <p className="muted">No dashboards are enabled for your account yet. Contact CleanBooks to get set up.</p>
    </div>
  );
}
