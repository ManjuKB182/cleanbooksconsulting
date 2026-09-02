export type Role = "staff_admin" | "client_viewer";

export interface AuthSession {
  accessToken: string;
  role: Role;
  clientId: number | null;
  email: string;
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

/** One (vendor, day) GRN rollup from dashboards.invoice. */
export interface InvoiceLifecycleRow {
  vendor_gstin: string;
  vendor_name: string | null;
  txn_date: string;
  po_count: number;
  total_taxable_value: number;
  total_cgst_amount: number;
  total_sgst_amount: number;
  total_igst_amount: number;
  total_cess_amount: number;
  total_amount: number;
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
