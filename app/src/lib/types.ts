export type Role = "staff_admin" | "client_viewer";

export interface AuthSession {
  accessToken: string;
  role: Role;
  clientId: number | null;
}

export interface DashboardSummary {
  id: number;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface PodStatusRow {
  invoice_no: string;
  customer_name: string;
  partner: string;
  sku: string;
  invoice_value: number;
  lr_number: string;
  pod_received: boolean;
}

export interface Client {
  id: number;
  name: string;
  slug: string;
  status: string;
}

export interface IngestionSource {
  client_id: number;
  mailbox_email: string;
  status: "pending" | "connected" | "revoked";
  connected_at: string | null;
}
