// Illustrative rows for dashboards whose ingestion pipeline isn't connected yet.
// Shapes mirror the real fact tables (see cleanbooks-api/app/models/domain_data.py)
// so swapping this for a live api.* call later is a drop-in change.

export interface ReconciliationRow {
  order_id: string;
  marketplace: string;
  period: string;
  gross_amount: number;
  fees: number;
  net_amount: number;
  status: "settled" | "pending";
}

export const mockReconciliation: ReconciliationRow[] = [
  { order_id: "AMZ-88213", marketplace: "Amazon", period: "Aug 2026", gross_amount: 24500, fees: 3675, net_amount: 20825, status: "settled" },
  { order_id: "FLP-55210", marketplace: "Flipkart", period: "Aug 2026", gross_amount: 18200, fees: 2548, net_amount: 15652, status: "settled" },
  { order_id: "MYN-11987", marketplace: "Myntra", period: "Aug 2026", gross_amount: 9600, fees: 1440, net_amount: 8160, status: "pending" },
  { order_id: "NYK-30044", marketplace: "Nykaa", period: "Aug 2026", gross_amount: 5400, fees: 810, net_amount: 4590, status: "pending" },
  { order_id: "AMZ-88544", marketplace: "Amazon", period: "Jul 2026", gross_amount: 31200, fees: 4680, net_amount: 26520, status: "settled" },
  { order_id: "FLP-54980", marketplace: "Flipkart", period: "Jul 2026", gross_amount: 12800, fees: 1792, net_amount: 11008, status: "settled" },
];

export interface InvoiceRow {
  invoice_no: string;
  customer_name: string;
  invoice_date: string;
  due_date: string;
  amount: number;
  status: "paid" | "open" | "overdue";
}

export const mockInvoices: InvoiceRow[] = [
  { invoice_no: "INV-2026-0142", customer_name: "Northwind Retail Pvt Ltd", invoice_date: "2026-08-01", due_date: "2026-08-15", amount: 48000, status: "paid" },
  { invoice_no: "INV-2026-0143", customer_name: "Harbor & Co.", invoice_date: "2026-08-05", due_date: "2026-08-20", amount: 32500, status: "open" },
  { invoice_no: "INV-2026-0144", customer_name: "Acme D2C", invoice_date: "2026-07-18", due_date: "2026-08-01", amount: 21000, status: "overdue" },
  { invoice_no: "INV-2026-0145", customer_name: "Bluepeak Foods", invoice_date: "2026-08-10", due_date: "2026-08-25", amount: 15750, status: "open" },
  { invoice_no: "INV-2026-0146", customer_name: "Acme D2C", invoice_date: "2026-08-12", due_date: "2026-08-27", amount: 9800, status: "open" },
];

export interface ReturnRow {
  return_id: string;
  order_id: string;
  sku: string;
  reason: string;
  refund_amount: number;
  status: "pending" | "approved" | "rejected";
}

export const mockReturns: ReturnRow[] = [
  { return_id: "RET-8821", order_id: "AMZ-88213", sku: "CB-TSHIRT-M-BLU", reason: "Size mismatch", refund_amount: 899, status: "approved" },
  { return_id: "RET-8822", order_id: "FLP-55210", sku: "CB-MUG-CERAMIC", reason: "Damaged in transit", refund_amount: 449, status: "approved" },
  { return_id: "RET-8823", order_id: "MYN-11987", sku: "CB-TOTE-CANVAS", reason: "Changed mind", refund_amount: 599, status: "pending" },
  { return_id: "RET-8824", order_id: "NYK-30044", sku: "CB-CANDLE-LAV", reason: "Wrong item shipped", refund_amount: 349, status: "rejected" },
];

export interface CashFlowRow {
  period: string;
  inflow: number;
  outflow: number;
  net: number;
}

export const mockCashFlow: CashFlowRow[] = [
  { period: "May 2026", inflow: 412000, outflow: 356000, net: 56000 },
  { period: "Jun 2026", inflow: 468000, outflow: 401000, net: 67000 },
  { period: "Jul 2026", inflow: 501000, outflow: 447000, net: 54000 },
  { period: "Aug 2026", inflow: 489000, outflow: 462000, net: 27000 },
];
