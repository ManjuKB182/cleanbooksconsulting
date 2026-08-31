import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
        <h1>Clients</h1>
        <Link to="/admin/clients/new" className="btn-primary">
          + Onboard client
        </Link>
      </div>
      {error && <p className="error-text">{error}</p>}
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
            {clients?.map((c) => (
              <tr key={c.id}>
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
            {clients?.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">
                  No clients yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
