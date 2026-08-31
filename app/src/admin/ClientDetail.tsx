import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { DashboardSummary, IngestionSource } from "../lib/types";

export function ClientDetail() {
  const { session } = useAuth();
  const { clientId } = useParams();
  const id = Number(clientId);

  const [dashboards, setDashboards] = useState<DashboardSummary[] | null>(null);
  const [source, setSource] = useState<IngestionSource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const load = useCallback(() => {
    if (!session || !id) return;
    api.listDashboards(session.accessToken, id).then(setDashboards).catch(() => setDashboards([]));
    api
      .getIngestionSource(session.accessToken, id)
      .then(setSource)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setSource(null);
      });
  }, [session, id]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggle(dashboard: DashboardSummary) {
    if (!session) return;
    setError(null);
    try {
      await api.setAccess(session.accessToken, id, dashboard.id, !dashboard.enabled);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update access.");
    }
  }

  async function connectGmail() {
    if (!session) return;
    setConnecting(true);
    try {
      const { authorization_url } = await api.startGmailOAuth(session.accessToken, id);
      window.location.href = authorization_url;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not start the Gmail connection.");
      setConnecting(false);
    }
  }

  return (
    <div>
      <h1>Client #{id}</h1>
      {error && <p className="error-text">{error}</p>}

      <section className="panel">
        <h2>Gmail connection</h2>
        {source?.status === "connected" ? (
          <p>
            Connected to <b>{source.mailbox_email}</b> since {new Date(source.connected_at ?? "").toLocaleString()}.
          </p>
        ) : (
          <>
            <p className="muted">
              The client hasn't authorized their mailbox yet. Ingestion won't run for them until they do.
            </p>
            <button type="button" className="btn-primary" onClick={connectGmail} disabled={connecting}>
              {connecting ? "Redirecting…" : "Connect Gmail"}
            </button>
          </>
        )}
      </section>

      <section className="panel">
        <h2>Dashboard access</h2>
        <table>
          <thead>
            <tr>
              <th>Dashboard</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {dashboards?.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>
                  <span className={`pill ${d.enabled ? "pill-on" : "pill-off"}`}>
                    {d.enabled ? "Enabled" : "Disabled"}
                  </span>
                </td>
                <td>
                  <button type="button" className="btn-ghost" onClick={() => toggle(d)}>
                    {d.enabled ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
