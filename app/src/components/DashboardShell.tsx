import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AlertIcon } from "./icons";
import { DASHBOARD_ICON, DASHBOARD_META } from "../dashboards/dashboardMeta";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { DashboardSummary } from "../lib/types";

function initials(email: string | undefined): string {
  if (!email) return "?";
  const name = email.split("@")[0] ?? email;
  const parts = name.split(/[._-]/).filter(Boolean);
  const chars = parts.length >= 2 ? [parts[0][0], parts[1][0]] : [name.slice(0, 2)];
  return chars.join("").toUpperCase();
}

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
          <div className="dash-brand-name">CleanBooks</div>
        </div>

        <nav className="dash-nav">
          {!dashboards && !error && <p className="dash-nav-loading">Loading…</p>}
          {error && (
            <p className="dash-nav-error">
              <AlertIcon />
              {error}
            </p>
          )}
          {dashboards?.map((d) => {
            const meta = DASHBOARD_META[d.key];
            const Icon = DASHBOARD_ICON[d.key];
            if (!meta || !Icon) return null;

            if (!d.enabled) {
              return (
                <div key={d.id} className="dash-nav-item disabled" title="Not enabled for your account">
                  <span className="dash-nav-icon">
                    <Icon />
                  </span>
                  <span className="dash-nav-name">{d.name}</span>
                </div>
              );
            }

            return (
              <NavLink key={d.id} to={meta.route} className={({ isActive }) => `dash-nav-item ${isActive ? "active" : ""}`}>
                <span className="dash-nav-icon">
                  <Icon />
                </span>
                <span className="dash-nav-name">{d.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="dash-sidebar-footer">
          {session && (
            <div className="dash-profile">
              <span className="dash-avatar">{initials(session.email)}</span>
              <span className="dash-profile-email">{session.email}</span>
              <button type="button" className="dash-signout" onClick={logout} title="Sign out" aria-label="Sign out">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7.5 17.5H4a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1h3.5" />
                  <path d="M13 14l4-4-4-4" />
                  <path d="M17 10H7.5" />
                </svg>
              </button>
            </div>
          )}
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
