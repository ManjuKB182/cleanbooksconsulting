// Illustrative rows for dashboards whose ingestion pipeline isn't connected yet.
// Shapes mirror the real fact tables (see cleanbooks-api/app/models/domain_data.py)
// so swapping this for a live api.* call later is a drop-in change. Built
// deterministically (no Math.random) so numbers stay stable across reloads.

import { addDaysIso } from "./chartUtils";

const TODAY = "2026-08-31";
const MONTHS_2026 = ["2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08"];

export interface ReconciliationRow {
  order_id: string;
  marketplace: string;
  order_date: string;
  gross_amount: number;
  fees: number;
  net_amount: number;
  status: "settled" | "pending";
}

const MARKETPLACES = [
  { name: "Amazon", base: 24000, feeRate: 0.15 },
  { name: "Flipkart", base: 18500, feeRate: 0.14 },
  { name: "Myntra", base: 9800, feeRate: 0.15 },
  { name: "Nykaa", base: 6200, feeRate: 0.13 },
];

function buildReconciliation(): ReconciliationRow[] {
  const rows: ReconciliationRow[] = [];
  let seq = 8000;
  MONTHS_2026.forEach((month, monthIndex) => {
    const growth = 1 + monthIndex * 0.09;
    MARKETPLACES.forEach((marketplace, i) => {
      seq += 1;
      const day = 4 + i * 6;
      const gross = Math.round((marketplace.base * growth) / 10) * 10;
      const fees = Math.round(gross * marketplace.feeRate);
      const isLatestMonth = monthIndex === MONTHS_2026.length - 1;
      rows.push({
        order_id: `${marketplace.name.slice(0, 3).toUpperCase()}-${seq}`,
        marketplace: marketplace.name,
        order_date: `${month}-${String(day).padStart(2, "0")}`,
        gross_amount: gross,
        fees,
        net_amount: gross - fees,
        status: isLatestMonth && i >= 2 ? "pending" : "settled",
      });
    });
  });
  return rows;
}

export const mockReconciliation: ReconciliationRow[] = buildReconciliation();
export const RECONCILIATION_EARLIEST = mockReconciliation[0].order_date;

export interface InvoiceRow {
  invoice_no: string;
  customer_name: string;
  invoice_date: string;
  due_date: string;
  amount: number;
  status: "paid" | "open" | "overdue";
}

const CUSTOMERS = ["Northwind Retail Pvt Ltd", "Harbor & Co.", "Acme D2C", "Bluepeak Foods", "Coastal Mart", "Aurora Home"];

function buildInvoices(): InvoiceRow[] {
  const rows: InvoiceRow[] = [];
  let seq = 100;
  MONTHS_2026.forEach((month, monthIndex) => {
    for (let i = 0; i < 3; i++) {
      seq += 1;
      const customer = CUSTOMERS[(monthIndex * 3 + i) % CUSTOMERS.length];
      const day = 3 + i * 9;
      const invoiceDate = `${month}-${String(day).padStart(2, "0")}`;
      const dueDate = addDaysIso(invoiceDate, 15);
      const amount = 8000 + ((monthIndex * 3 + i) % 6) * 4200;
      let status: InvoiceRow["status"];
      if (dueDate >= TODAY) status = "open";
      else status = seq % 3 === 0 ? "overdue" : "paid";
      rows.push({
        invoice_no: `INV-2026-${String(seq).padStart(4, "0")}`,
        customer_name: customer,
        invoice_date: invoiceDate,
        due_date: dueDate,
        amount,
        status,
      });
    }
  });
  return rows;
}

export const mockInvoices: InvoiceRow[] = buildInvoices();
export const INVOICES_EARLIEST = mockInvoices[0].invoice_date;

export interface ReturnRow {
  return_id: string;
  order_id: string;
  sku: string;
  reason: string;
  return_date: string;
  refund_amount: number;
  status: "pending" | "approved" | "rejected";
}

const RETURN_REASONS = ["Size mismatch", "Damaged in transit", "Changed mind", "Wrong item shipped", "Quality issue", "Late delivery"];
const SKUS = ["CB-TSHIRT-M-BLU", "CB-MUG-CERAMIC", "CB-TOTE-CANVAS", "CB-CANDLE-LAV", "CB-NOTEBOOK-A5", "CB-BOTTLE-STL"];
const STATUS_CYCLE: ReturnRow["status"][] = ["approved", "approved", "pending", "rejected"];

function buildReturns(): ReturnRow[] {
  const rows: ReturnRow[] = [];
  let seq = 8800;
  MONTHS_2026.forEach((month, monthIndex) => {
    for (let i = 0; i < 3; i++) {
      seq += 1;
      const idx = monthIndex * 3 + i;
      const day = 5 + i * 8;
      rows.push({
        return_id: `RET-${seq}`,
        order_id: `${MARKETPLACES[idx % MARKETPLACES.length].name.slice(0, 3).toUpperCase()}-${8000 + idx}`,
        sku: SKUS[idx % SKUS.length],
        reason: RETURN_REASONS[idx % RETURN_REASONS.length],
        return_date: `${month}-${String(day).padStart(2, "0")}`,
        refund_amount: 299 + (idx % 5) * 150,
        status: STATUS_CYCLE[idx % STATUS_CYCLE.length],
      });
    }
  });
  return rows;
}

export const mockReturns: ReturnRow[] = buildReturns();
export const RETURNS_EARLIEST = mockReturns[0].return_date;

export interface CashFlowRow {
  period: string;
  period_date: string;
  inflow: number;
  outflow: number;
  net: number;
}

function buildCashFlow(): CashFlowRow[] {
  const base = { inflow: 340000, outflow: 298000 };
  return MONTHS_2026.map((month, i) => {
    const inflow = Math.round((base.inflow * (1 + i * 0.08)) / 1000) * 1000;
    const outflow = Math.round((base.outflow * (1 + i * 0.075)) / 1000) * 1000;
    return {
      period: new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }),
      period_date: `${month}-01`,
      inflow,
      outflow,
      net: inflow - outflow,
    };
  });
}

export const mockCashFlow: CashFlowRow[] = buildCashFlow();
export const CASH_FLOW_EARLIEST = mockCashFlow[0].period_date;
