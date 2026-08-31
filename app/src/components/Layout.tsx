import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";

/** Topbar shell for the Admin Portal. Client dashboards use DashboardShell instead. */
export function Layout({ children }: { children: ReactNode }) {
  const { session, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/admin" className="brand">
          CleanBooks
        </Link>
        <nav className="topnav">
          <Link to="/admin" className={location.pathname.startsWith("/admin") ? "active" : ""}>
            Admin
          </Link>
        </nav>
        <div className="topbar-right">
          {session && (
            <button type="button" className="btn-ghost" onClick={logout}>
              Sign out
            </button>
          )}
        </div>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
