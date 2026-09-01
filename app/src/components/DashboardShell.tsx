import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { DASHBOARD_META } from "../dashboards/dashboardMeta";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { DashboardSummary } from "../lib/types";

export function DashboardShell() {
  const { session, logout } = useAuth();
  const [dashboards, setDashboards] = useState<DashboardSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (!session) return;
    api
      .listDashboards(session.accessToken)
      .then(setDashboards)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load dashboards."));
  }, [session]);

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <div className="dash-sidebar-brand">
          <span className="dash-brand-mark">CB</span>
          <div>
            <div className="dash-brand-name">CleanBooks</div>
            <div className="dash-brand-sub">Client Portal</div>
          </div>
        </div>

        <nav className="dash-nav">
          {!dashboards && !error && <p className="dash-nav-error">Loading…</p>}
          {error && <p className="dash-nav-error">{error}</p>}
          {dashboards?.map((d) => {
            const meta = DASHBOARD_META[d.key];
            if (!meta) return null;

            if (!d.enabled) {
              return (
                <div key={d.id} className="dash-nav-item disabled" title="Not enabled for your account">
                  <span className="dash-badge" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
                    {meta.code}
                  </span>
                  <div className="dash-nav-text">
                    <div className="dash-nav-name">{d.name}</div>
                    <div className="dash-nav-desc">Not enabled</div>
                  </div>
                </div>
              );
            }

            return (
              <NavLink key={d.id} to={meta.route} className={({ isActive }) => `dash-nav-item ${isActive ? "active" : ""}`}>
                <span className="dash-badge" style={{ background: meta.color }}>
                  {meta.code}
                </span>
                <div className="dash-nav-text">
                  <div className="dash-nav-name">{d.name}</div>
                  <div className="dash-nav-desc">{d.description}</div>
                </div>
              </NavLink>
            );
          })}
        </nav>

        <div className="dash-sidebar-footer">
          <div className="dash-sync-note">Refreshed every 2 hours</div>
          <button type="button" className="dash-signout" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="dash-main">
        <div key={location.pathname} className="dash-page-enter">
          <Outlet context={dashboards} />
        </div>
      </main>
    </div>
  );
}
