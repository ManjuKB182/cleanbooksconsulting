import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

/** Lands each role on the page that's actually theirs: staff admins manage clients,
 * client accounts view their dashboards. Used for "/" and any unmatched route. */
export function RoleHome() {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  return <Navigate to={session.role === "staff_admin" ? "/admin" : "/dashboards"} replace />;
}
