import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { DashboardSummary } from "../lib/types";

const ROUTE_BY_KEY: Record<string, string> = {
  pod: "/dashboards/pod",
  reconciliation: "/dashboards/reconciliation",
  invoices: "/dashboards/invoices",
  returns: "/dashboards/returns",
  cash_flow: "/dashboards/cash-flow",
};

export function DashboardsHome() {
  const { session } = useAuth();
  const [dashboards, setDashboards] = useState<DashboardSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isStaffAdmin = session?.role === "staff_admin";

  useEffect(() => {
    if (!session || isStaffAdmin) return;
    api
      .listDashboards(session.accessToken)
      .then(setDashboards)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load dashboards."));
  }, [session, isStaffAdmin]);

  if (isStaffAdmin) {
    return (
      <div>
        <h1>Dashboards</h1>
        <p className="muted">
          Staff accounts don't have a dashboard view of their own — dashboards belong to a client. Open a
          client from <Link to="/admin">Admin</Link> to manage what they see.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1>Dashboards</h1>
      <p className="muted">Refreshed automatically every 2 hours from your connected data sources.</p>
      {error && <p className="error-text">{error}</p>}
      {!dashboards && !error && <p className="muted">Loading…</p>}
      <div className="card-grid">
        {dashboards?.map((dashboard) => (
          <div key={dashboard.id} className={`dashboard-card ${dashboard.enabled ? "" : "disabled"}`}>
            <h2>{dashboard.name}</h2>
            <p>{dashboard.description}</p>
            {dashboard.enabled ? (
              <Link to={ROUTE_BY_KEY[dashboard.key] ?? "#"} className="btn-primary">
                Open
              </Link>
            ) : (
              <span className="pill pill-off">Not enabled for your account</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
