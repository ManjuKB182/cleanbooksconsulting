import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { BuildingIcon } from "../components/icons";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { Client } from "../lib/types";

export function ClientsList() {
  const { session } = useAuth();
  const [clients, setClients] = useState<Client[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    api
      .listClients(session.accessToken)
      .then(setClients)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load clients."));
  }, [session]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Clients</h1>
          <p className="muted">{clients ? `${clients.length} client${clients.length === 1 ? "" : "s"}` : "Every account with dashboard access."}</p>
        </div>
        <Link to="/admin/clients/new" className="btn-primary">
          + Onboard client
        </Link>
      </div>
      {error && <p className="error-text">{error}</p>}
      {clients?.length === 0 ? (
        <div className="table-wrap">
          <EmptyState
            icon={<BuildingIcon />}
            title="No clients yet"
            message="Onboard your first client to start connecting their mailbox and turning on dashboards."
            action={
              <Link to="/admin/clients/new" className="btn-primary">
                + Onboard client
              </Link>
            }
          />
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clients?.map((c, i) => (
                <tr key={c.id} className="stagger-row" style={{ "--row-index": i } as CSSProperties}>
                  <td>{c.name}</td>
                  <td>
                    <code>{c.slug}</code>
                  </td>
                  <td>
                    <span className="pill pill-on">{c.status}</span>
                  </td>
                  <td>
                    <Link to={`/admin/clients/${c.id}`}>Manage →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
