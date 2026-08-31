import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DateRangeFilter, presetRange } from "../components/DateRangeFilter";
import { DemoNotice } from "../components/DemoBadge";
import { StatRow, StatTile } from "../components/StatTiles";
import { CATEGORY_PALETTE, chartColors } from "../lib/chartColors";
import { aggregateMonthly, countBy, withinRange } from "./chartUtils";
import { INVOICES_EARLIEST, mockInvoices } from "./mockData";

const STATUS_PILL: Record<string, string> = {
  paid: "pill-on",
  open: "pill-off",
  overdue: "pill-critical",
};

const STATUS_COLOR: Record<string, string> = {
  paid: chartColors.mint,
  open: chartColors.accent,
  overdue: chartColors.critical,
};

export function InvoicesDashboard() {
  const [range, setRange] = useState(() => presetRange(183, INVOICES_EARLIEST));
  const rows = useMemo(
    () => mockInvoices.filter((r) => withinRange(r.invoice_date, range)).sort((a, b) => (a.invoice_date < b.invoice_date ? 1 : -1)),
    [range]
  );
  const trend = useMemo(() => aggregateMonthly(rows, "invoice_date", ["amount"]), [rows]);
  const byStatus = useMemo(() => countBy(rows, (r) => r.status, (r) => r.amount), [rows]);

  const outstanding = rows.filter((r) => r.status !== "paid").reduce((sum, r) => sum + r.amount, 0);
  const overdue = rows.filter((r) => r.status === "overdue").reduce((sum, r) => sum + r.amount, 0);
  const paid = rows.filter((r) => r.status === "paid").reduce((sum, r) => sum + r.amount, 0);

  return (
    <div>
      <h1>Invoice & Payment Ledger</h1>
      <DemoNotice dashboardKey="invoices" />

      <DateRangeFilter range={range} onChange={setRange} earliest={INVOICES_EARLIEST} />

      <StatRow>
        <StatTile label="Outstanding" value={`₹${outstanding.toLocaleString()}`} color="var(--accent)" />
        <StatTile label="Overdue" value={`₹${overdue.toLocaleString()}`} color="var(--critical)" />
        <StatTile label="Paid" value={`₹${paid.toLocaleString()}`} color="var(--mint)" />
        <StatTile label="Invoices" value={rows.length} />
      </StatRow>

      <div className="chart-grid">
        <div className="panel chart-panel">
          <h2>Invoiced amount by month</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={chartColors.grid} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: chartColors.muted }} axisLine={{ stroke: chartColors.grid }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: chartColors.muted }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: 8, borderColor: chartColors.grid, fontSize: 13 }} />
              <Line isAnimationActive={false} type="monotone" dataKey="amount" name="Invoiced" stroke={chartColors.accent} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="panel chart-panel">
          <h2>By status</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie isAnimationActive={false} data={byStatus} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {byStatus.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLOR[entry.name] ?? CATEGORY_PALETTE[0]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: 8, borderColor: chartColors.grid, fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Invoice date</th>
              <th>Due date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.invoice_no}>
                <td>{row.invoice_no}</td>
                <td>{row.customer_name}</td>
                <td>{row.invoice_date}</td>
                <td>{row.due_date}</td>
                <td>₹{row.amount.toLocaleString()}</td>
                <td>
                  <span className={`pill ${STATUS_PILL[row.status]}`}>{row.status}</span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
                  No invoices in this date range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
