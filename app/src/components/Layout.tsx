import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function Layout({ children }: { children: ReactNode }) {
  const { session, logout } = useAuth();
  const location = useLocation();
  const isStaffAdmin = session?.role === "staff_admin";
  const homePath = isStaffAdmin ? "/admin" : "/dashboards";

  return (
    <div className="shell">
      <header className="topbar">
        <Link to={homePath} className="brand">
          CleanBooks
        </Link>
        <nav className="topnav">
          {!isStaffAdmin && (
            <Link to="/dashboards" className={location.pathname.startsWith("/dashboards") ? "active" : ""}>
              Dashboards
            </Link>
          )}
          {isStaffAdmin && (
            <Link to="/admin" className={location.pathname.startsWith("/admin") ? "active" : ""}>
              Admin
            </Link>
          )}
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
