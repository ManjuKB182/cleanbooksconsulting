import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { DashboardSummary, IngestionSource } from "../lib/types";

const GMAIL_CALLBACK_MESSAGE: Record<string, { tone: "ok" | "warn" | "error"; text: string }> = {
  connected: { tone: "ok", text: "Gmail connected. Ingestion will pick up this mailbox on the next scheduled run." },
  denied: { tone: "warn", text: "Gmail connection was cancelled — access wasn't granted." },
  error: { tone: "error", text: "Something went wrong connecting Gmail. Try again, or check the client_id matches." },
};

export function ClientDetail() {
  const { session } = useAuth();
  const { clientId } = useParams();
  const id = Number(clientId);
  const [searchParams, setSearchParams] = useSearchParams();

  const [dashboards, setDashboards] = useState<DashboardSummary[] | null>(null);
  const [source, setSource] = useState<IngestionSource | null>(null);
  const [connecting, setConnecting] = useState(false);

  const gmailCallback = searchParams.get("gmail");
  const gmailMessage = gmailCallback ? GMAIL_CALLBACK_MESSAGE[gmailCallback] : undefined;

  useEffect(() => {
    if (!gmailCallback) return;
    // Clear the query param so refreshing the page doesn't keep re-showing the banner.
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("gmail");
        return next;
      },
      { replace: true }
    );
  }, [gmailCallback, setSearchParams]);

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
    const nextEnabled = !dashboard.enabled;
    try {
      await api.setAccess(session.accessToken, id, dashboard.id, nextEnabled);
      load();
      toast.success(`${dashboard.name} ${nextEnabled ? "enabled" : "disabled"}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update access.");
    }
  }

  async function connectGmail() {
    if (!session) return;
    setConnecting(true);
    try {
      const { authorization_url } = await api.startGmailOAuth(session.accessToken, id);
      window.location.href = authorization_url;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not start the Gmail connection.");
      setConnecting(false);
    }
  }

  return (
    <div>
      <h1>Client #{id}</h1>
      {gmailMessage && <p className={`callout callout-${gmailMessage.tone}`}>{gmailMessage.text}</p>}

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
