import { useCallback, useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DataTable } from "../components/DataTable";
import { DashboardHeader } from "../components/DashboardHeader";
import { FilterBar, presetRange } from "../components/FilterBar";
import { DocumentIcon, PercentIcon, ReceiptIcon, WalletIcon } from "../components/icons";
import { StatRow, StatTile } from "../components/StatTiles";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import { CATEGORY_PALETTE, chartColors } from "../lib/chartColors";
import { downloadCsv } from "../lib/csv";
import type { InvoiceLifecycleRow } from "../lib/types";
import { useRefreshable } from "../lib/useRefreshable";
import { aggregateMonthly, isoToday, withinRange, type DateRange } from "./chartUtils";

const rupees = (n: number) => `₹${Math.round(n).toLocaleString()}`;

interface VendorAgg {
  vendor: string;
  poCount: number;
  taxable: number;
  tax: number;
  amount: number;
}

function totalTax(r: InvoiceLifecycleRow): number {
  return r.total_cgst_amount + r.total_sgst_amount + r.total_igst_amount + r.total_cess_amount;
}

export function InvoiceLifecycleDashboard() {
  const { session } = useAuth();
  const [rows, setRows] = useState<InvoiceLifecycleRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vendor, setVendor] = useState("all");
  const [rangeOverride, setRangeOverride] = useState<DateRange | null>(null);

  const load = useCallback(async () => {
    if (!session) return;
    try {
      setRows(await api.invoiceLifecycleDashboard(session.accessToken));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load invoice lifecycle data.");
      throw err;
    }
  }, [session]);

  useEffect(() => {
    load();
  }, [load]);

  const { refreshing, refresh } = useRefreshable(load);

  const earliest = useMemo(() => (rows?.length ? rows.reduce((min, r) => (r.txn_date < min ? r.txn_date : min), rows[0].txn_date) : isoToday()), [rows]);

  // Rows land asynchronously, so the "All data" default (which depends on `earliest`)
  // can only be computed once they arrive — fall back to it until the user picks their
  // own range, rather than storing a derived default in state.
  const range = useMemo(() => rangeOverride ?? presetRange(null, earliest), [rangeOverride, earliest]);

  const vendors = useMemo(
    () => Array.from(new Set((rows ?? []).map((r) => r.vendor_name || r.vendor_gstin))).sort(),
    [rows]
  );

  const filtered = useMemo(() => {
    if (!rows) return [];
    return rows
      .filter((r) => vendor === "all" || (r.vendor_name || r.vendor_gstin) === vendor)
      .filter((r) => withinRange(r.txn_date, range))
      .sort((a, b) => (a.txn_date < b.txn_date ? 1 : -1));
  }, [rows, vendor, range]);

  const totalPoCount = filtered.reduce((sum, r) => sum + r.po_count, 0);
  const totalAmount = filtered.reduce((sum, r) => sum + r.total_amount, 0);
  const totalTaxable = filtered.reduce((sum, r) => sum + r.total_taxable_value, 0);
  const totalTaxAmount = filtered.reduce((sum, r) => sum + totalTax(r), 0);

  const byMonth = useMemo(
    () => aggregateMonthly(filtered, "txn_date", ["total_amount", "total_taxable_value"]),
    [filtered]
  );

  const taxComposition = useMemo(() => {
    const totals = filtered.reduce(
      (acc, r) => {
        acc.cgst += r.total_cgst_amount;
        acc.sgst += r.total_sgst_amount;
        acc.igst += r.total_igst_amount;
        acc.cess += r.total_cess_amount;
        return acc;
      },
      { cgst: 0, sgst: 0, igst: 0, cess: 0 }
    );
    return [
      { name: "CGST", value: totals.cgst },
      { name: "SGST", value: totals.sgst },
      { name: "IGST", value: totals.igst },
      { name: "Cess", value: totals.cess },
    ].filter((t) => t.value > 0);
  }, [filtered]);

  const byVendor = useMemo(() => {
    const map = new Map<string, VendorAgg>();
    for (const r of filtered) {
      const key = r.vendor_name || r.vendor_gstin;
      const agg = map.get(key) ?? { vendor: key, poCount: 0, taxable: 0, tax: 0, amount: 0 };
      agg.poCount += r.po_count;
      agg.taxable += r.total_taxable_value;
      agg.tax += totalTax(r);
      agg.amount += r.total_amount;
      map.set(key, agg);
    }
    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }, [filtered]);

  const latest = filtered.slice(0, 8);

  return (
    <div>
      <DashboardHeader
        title="Invoice Lifecycle"
        meta={`${filtered.length.toLocaleString()} vendor-day rollups · ${rupees(totalAmount)} total`}
        onExport={() =>
          downloadCsv(
            "invoice-lifecycle.csv",
            [
              { key: "vendor_name", header: "Vendor", value: (r) => r.vendor_name || r.vendor_gstin },
              { key: "vendor_gstin", header: "GSTIN" },
              { key: "txn_date", header: "Date" },
              { key: "po_count", header: "PO count" },
              { key: "total_taxable_value", header: "Taxable value" },
              { key: "total_tax", header: "Total tax", value: (r) => totalTax(r) },
              { key: "total_amount", header: "Total amount" },
            ],
            filtered
          )
        }
        onRefresh={refresh}
        refreshing={refreshing}
      />

      {error && <p className="error-text">{error}</p>}

      {rows && rows.length === 0 && (
        <p className="muted" style={{ margin: "16px 0" }}>
          No invoice lifecycle data yet — nothing has synced from GRN ingestion so far.
        </p>
      )}

      {rows && rows.length > 0 && (
        <>
          <FilterBar
            range={range}
            onChange={setRangeOverride}
            earliest={earliest}
            defaultPreset="All"
            select={{ label: "Vendor", value: vendor, options: vendors, onChange: setVendor }}
          />

          <StatRow>
            <StatTile label="Total PO count" value={totalPoCount.toLocaleString()} icon={<DocumentIcon />} />
            <StatTile label="Total amount" value={rupees(totalAmount)} icon={<WalletIcon />} />
            <StatTile label="Taxable value" value={rupees(totalTaxable)} icon={<ReceiptIcon />} />
            <StatTile label="Total tax" value={rupees(totalTaxAmount)} icon={<PercentIcon />} />
          </StatRow>

          <div className="chart-grid">
            <div className="panel chart-panel">
              <h2>Amount & taxable value by month</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={byMonth} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={chartColors.grid} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: chartColors.muted }} axisLine={{ stroke: chartColors.grid }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: chartColors.muted }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => rupees(Number(v))} contentStyle={{ borderRadius: 8, borderColor: chartColors.grid, fontSize: 13 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar isAnimationActive={false} dataKey="total_amount" name="Total amount" fill={chartColors.accent} radius={[4, 4, 0, 0]} />
                  <Bar isAnimationActive={false} dataKey="total_taxable_value" name="Taxable value" fill={chartColors.mint} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="panel chart-panel">
              <h2>Tax composition</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie isAnimationActive={false} data={taxComposition} dataKey="value" nameKey="name" innerRadius={44} outerRadius={70} paddingAngle={3}>
                    {taxComposition.map((entry, i) => (
                      <Cell key={entry.name} fill={CATEGORY_PALETTE[i % CATEGORY_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => rupees(Number(v))} contentStyle={{ borderRadius: 8, borderColor: chartColors.grid, fontSize: 13 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <DataTable
            title="By vendor"
            meta={`${byVendor.length} vendors in range`}
            columns={[
              { key: "vendor", header: "Vendor" },
              { key: "poCount", header: "PO count", align: "right" },
              { key: "taxable", header: "Taxable value", align: "right", render: (r) => rupees(r.taxable) },
              { key: "tax", header: "Tax", align: "right", render: (r) => rupees(r.tax) },
              { key: "amount", header: "Amount", align: "right", render: (r) => rupees(r.amount) },
            ]}
            rows={byVendor}
            rowKey={(r) => r.vendor}
          />

          <DataTable
            title="Latest data"
            meta={`Showing ${latest.length} of ${filtered.length.toLocaleString()}`}
            columns={[
              { key: "vendor_name", header: "Vendor", render: (r) => r.vendor_name || r.vendor_gstin },
              { key: "txn_date", header: "Date" },
              { key: "po_count", header: "PO count", align: "right" },
              { key: "total_taxable_value", header: "Taxable value", align: "right", render: (r) => rupees(r.total_taxable_value) },
              { key: "total_tax", header: "Tax", align: "right", render: (r) => rupees(totalTax(r)) },
              { key: "total_amount", header: "Amount", align: "right", render: (r) => rupees(r.total_amount) },
            ]}
            rows={latest}
            rowKey={(r) => `${r.vendor_gstin}-${r.txn_date}`}
          />
        </>
      )}
    </div>
  );
}
