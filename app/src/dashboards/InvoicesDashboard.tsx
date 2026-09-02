import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DataTable } from "../components/DataTable";
import { DashboardHeader } from "../components/DashboardHeader";
import { FilterBar, presetRange } from "../components/FilterBar";
import { DocumentIcon, ReceiptIcon, TrendingUpIcon, UsersIcon } from "../components/icons";
import { StatRow, StatTile } from "../components/StatTiles";
import { CATEGORY_PALETTE, chartColors } from "../lib/chartColors";
import { downloadCsv } from "../lib/csv";
import { useRefreshable } from "../lib/useRefreshable";
import { aggregateMonthly, countBy, withinRange } from "./chartUtils";
import { INVOICES_EARLIEST, mockInvoices } from "./mockData";

const STATUS_COLOR: Record<string, string> = {
  paid: chartColors.mint,
  open: chartColors.accent,
  overdue: chartColors.critical,
};

export function InvoicesDashboard() {
  const [range, setRange] = useState(() => presetRange(183, INVOICES_EARLIEST));
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const { refreshing, refresh } = useRefreshable(() => new Promise((resolve) => setTimeout(resolve, 500)));

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mockInvoices
      .filter((r) => withinRange(r.invoice_date, range))
      .filter((r) => status === "all" || r.status === status)
      .filter((r) => !q || r.invoice_no.toLowerCase().includes(q) || r.customer_name.toLowerCase().includes(q))
      .sort((a, b) => (a.invoice_date < b.invoice_date ? 1 : -1));
  }, [range, search, status]);

  const byMonth = useMemo(() => aggregateMonthly(rows.map((r) => ({ ...r, count: 1 })), "invoice_date", ["count", "amount"]), [rows]);
  const byStatus = useMemo(() => countBy(rows, (r) => r.status, (r) => r.amount), [rows]);

  const outstanding = rows.filter((r) => r.status !== "paid").reduce((sum, r) => sum + r.amount, 0);
  const overdueCount = rows.filter((r) => r.status === "overdue").length;
  const totalInvoiced = rows.reduce((sum, r) => sum + r.amount, 0);
  const avgInvoice = rows.length ? Math.round(totalInvoiced / rows.length) : 0;
  const customers = new Set(rows.map((r) => r.customer_name)).size;

  const latest = rows.slice(0, 8);

  return (
    <div>
      <DashboardHeader
        title="Invoice & Payment Ledger"
        meta={`${rows.length.toLocaleString()} invoices · ₹${totalInvoiced.toLocaleString()} invoiced`}
        demo
        onExport={() =>
          downloadCsv(
            "invoices.csv",
            [
              { key: "invoice_no", header: "Invoice" },
              { key: "customer_name", header: "Customer" },
              { key: "invoice_date", header: "Invoice date" },
              { key: "due_date", header: "Due date" },
              { key: "amount", header: "Amount" },
              { key: "status", header: "Status" },
            ],
            rows
          )
        }
        onRefresh={refresh}
        refreshing={refreshing}
      />

      <FilterBar
        range={range}
        onChange={setRange}
        earliest={INVOICES_EARLIEST}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search invoice or customer"
        select={{ label: "Status", value: status, options: ["paid", "open", "overdue"], onChange: setStatus }}
      />

      <StatRow>
        <StatTile label="Invoices" value={rows.length} icon={<DocumentIcon />} />
        <StatTile label="Outstanding" value={`₹${outstanding.toLocaleString()}`} icon={<TrendingUpIcon />} sub={`${overdueCount} overdue`} />
        <StatTile label="Avg invoice" value={`₹${avgInvoice.toLocaleString()}`} icon={<ReceiptIcon />} />
        <StatTile label="Customers" value={customers} icon={<UsersIcon />} />
      </StatRow>

      <DataTable
        title="By month"
        meta="Invoiced amount across the selected range"
        columns={[
          { key: "month", header: "Month" },
          { key: "count", header: "Invoices", align: "right" },
          { key: "amount", header: "Amount", align: "right", render: (m) => `₹${Number(m.amount).toLocaleString()}` },
        ]}
        rows={byMonth}
        rowKey={(m) => String(m.month)}
      />

      <div className="chart-grid">
        <div className="panel chart-panel">
          <h2>By status</h2>
          <ResponsiveContainer width="100%" height={200}>
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

        <div className="panel chart-panel">
          <h2>Invoiced by month</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byMonth} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={chartColors.grid} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: chartColors.muted }} axisLine={{ stroke: chartColors.grid }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: chartColors.muted }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: 8, borderColor: chartColors.grid, fontSize: 13 }} />
              <Bar isAnimationActive={false} dataKey="amount" name="Amount" fill={chartColors.accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <DataTable
        title="Latest data"
        meta={`Showing ${latest.length} of ${rows.length.toLocaleString()}`}
        columns={[
          { key: "invoice_no", header: "Invoice" },
          { key: "customer_name", header: "Customer" },
          { key: "invoice_date", header: "Date" },
          { key: "amount", header: "Amount", align: "right", render: (r) => `₹${r.amount.toLocaleString()}` },
          {
            key: "status",
            header: "Status",
            render: (r) => (
              <span className={`pill ${r.status === "paid" ? "pill-on" : r.status === "overdue" ? "pill-critical" : "pill-off"}`}>{r.status}</span>
            ),
          },
        ]}
        rows={latest}
        rowKey={(r) => r.invoice_no}
      />
    </div>
  );
}
