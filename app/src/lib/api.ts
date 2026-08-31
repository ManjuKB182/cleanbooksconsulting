// Talks to cleanbooks-api. In dev, Vite proxies /api to the local FastAPI server
// (see vite.config.ts); in production this is the deployed API's own origin.
import type { Client, DashboardSummary, IngestionSource, PodStatusRow } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(response.status, body.detail ?? response.statusText);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ access_token: string; role: string; client_id: number | null }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: (token: string) => request<{ id: number; email: string; role: string; client_id: number | null }>("/api/auth/me", {}, token),

  listDashboards: (token: string, clientId?: number) =>
    request<DashboardSummary[]>(`/api/dashboards${clientId ? `?client_id=${clientId}` : ""}`, {}, token),

  podDashboard: (token: string, clientId?: number) =>
    request<PodStatusRow[]>(`/api/dashboards/pod${clientId ? `?client_id=${clientId}` : ""}`, {}, token),

  listClients: (token: string) => request<Client[]>("/api/admin/clients", {}, token),

  createClient: (token: string, name: string, slug: string) =>
    request<Client>("/api/admin/clients", { method: "POST", body: JSON.stringify({ name, slug }) }, token),

  setAccess: (token: string, clientId: number, dashboardId: number, enabled: boolean) =>
    request(
      "/api/admin/access",
      { method: "POST", body: JSON.stringify({ client_id: clientId, dashboard_id: dashboardId, enabled }) },
      token
    ),

  getIngestionSource: (token: string, clientId: number) =>
    request<IngestionSource>(`/api/admin/clients/${clientId}/ingestion-source`, {}, token),

  startGmailOAuth: (token: string, clientId: number) =>
    request<{ authorization_url: string }>(`/api/admin/clients/${clientId}/gmail/oauth/start`, {}, token),
};
