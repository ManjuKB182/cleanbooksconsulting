import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function RequireStaffAdmin({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== "staff_admin") return <Navigate to="/dashboards" replace />;
  return <>{children}</>;
}

/** Dashboards belong to a client — staff admin accounts manage them from Admin instead. */
export function RequireClientViewer({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  if (session.role === "staff_admin") return <Navigate to="/admin" replace />;
  return <>{children}</>;
}
