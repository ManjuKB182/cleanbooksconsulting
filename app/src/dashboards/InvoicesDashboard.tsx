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
import { AlertIcon, CheckCircleIcon, DocumentIcon, PercentIcon, ReceiptIcon, TrendingUpIcon, UsersIcon, WalletIcon } from "../components/icons";
import { StatRow, StatTile } from "../components/StatTiles";
import { CATEGORY_PALETTE, chartColors } from "../lib/chartColors";
import { aggregateMonthly, countBy, withinRange } from "./chartUtils";
import { DASHBOARD_META } from "./dashboardMeta";
import { INVOICES_EARLIEST, mockInvoices } from "./mockData";

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
  const overdueCount = rows.filter((r) => r.status === "overdue").length;
  const overdue = rows.filter((r) => r.status === "overdue").reduce((sum, r) => sum + r.amount, 0);
  const paid = rows.filter((r) => r.status === "paid").reduce((sum, r) => sum + r.amount, 0);
  const totalInvoiced = rows.reduce((sum, r) => sum + r.amount, 0);
  const avgInvoice = rows.length ? Math.round(totalInvoiced / rows.length) : 0;
  const overdueRate = rows.length ? ((overdueCount / rows.length) * 100).toFixed(1) : "0.0";
  const customers = new Set(rows.map((r) => r.customer_name)).size;

  return (
    <div>
      <h1>Invoice & Payment Ledger</h1>
      <DemoNotice dashboardKey="invoices" />

      <DateRangeFilter range={range} onChange={setRange} earliest={INVOICES_EARLIEST} />

      <StatRow>
        <StatTile label="Outstanding" value={`₹${outstanding.toLocaleString()}`} color="var(--accent)" icon={<WalletIcon />} />
        <StatTile label="Overdue" value={`₹${overdue.toLocaleString()}`} color="var(--critical)" icon={<AlertIcon />} />
        <StatTile label="Paid" value={`₹${paid.toLocaleString()}`} color="var(--mint)" icon={<CheckCircleIcon />} />
        <StatTile label="Invoices" value={rows.length} color={DASHBOARD_META.invoices.color} icon={<DocumentIcon />} />
        <StatTile label="Total invoiced" value={`₹${totalInvoiced.toLocaleString()}`} color="var(--accent)" icon={<TrendingUpIcon />} />
        <StatTile label="Avg invoice" value={`₹${avgInvoice.toLocaleString()}`} color={DASHBOARD_META.invoices.color} icon={<ReceiptIcon />} />
        <StatTile label="Overdue rate" value={`${overdueRate}%`} color="var(--critical)" icon={<PercentIcon />} />
        <StatTile label="Customers" value={customers} color="#0891b2" icon={<UsersIcon />} />
      </StatRow>

      <div className="chart-grid">
        <div className="panel chart-panel">
          <h2>Invoiced amount by month</h2>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={trend} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={chartColors.grid} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: chartColors.muted }} axisLine={{ stroke: chartColors.grid }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: chartColors.muted }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: 8, borderColor: chartColors.grid, fontSize: 13 }} />
              <Line isAnimationActive={false} type="monotone" dataKey="amount" name="Invoiced" stroke={chartColors.accent} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="panel chart-panel">
          <h2>By status</h2>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie isAnimationActive={false} data={byStatus} dataKey="value" nameKey="name" innerRadius={44} outerRadius={70} paddingAngle={3}>
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
    </div>
  );
}
