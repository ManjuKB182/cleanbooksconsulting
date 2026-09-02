import { useMemo, useState } from "react";
import { CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DataTable } from "../components/DataTable";
import { DashboardHeader } from "../components/DashboardHeader";
import { FilterBar, presetRange } from "../components/FilterBar";
import { ClockIcon, DocumentIcon, PercentIcon, TrendingUpIcon } from "../components/icons";
import { StatRow, StatTile } from "../components/StatTiles";
import { CATEGORY_PALETTE, chartColors } from "../lib/chartColors";
import { downloadCsv } from "../lib/csv";
import { useRefreshable } from "../lib/useRefreshable";
import { aggregateMonthly, countBy, withinRange } from "./chartUtils";
import { RECONCILIATION_EARLIEST, mockReconciliation } from "./mockData";

export function ReconciliationDashboard() {
  const [range, setRange] = useState(() => presetRange(183, RECONCILIATION_EARLIEST));
  const [search, setSearch] = useState("");
  const [marketplace, setMarketplace] = useState("all");
  const { refreshing, refresh } = useRefreshable(() => new Promise((resolve) => setTimeout(resolve, 500)));

  const marketplaces = useMemo(() => Array.from(new Set(mockReconciliation.map((r) => r.marketplace))).sort(), []);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mockReconciliation
      .filter((r) => withinRange(r.order_date, range))
      .filter((r) => marketplace === "all" || r.marketplace === marketplace)
      .filter((r) => !q || r.order_id.toLowerCase().includes(q))
      .sort((a, b) => (a.order_date < b.order_date ? 1 : -1));
  }, [range, search, marketplace]);

  const byMonth = useMemo(
    () => aggregateMonthly(rows.map((r) => ({ ...r, count: 1 })), "order_date", ["count", "gross_amount", "fees", "net_amount"]),
    [rows]
  );
  const byMarketplace = useMemo(
    () => countBy(rows, (r) => r.marketplace, (r) => r.gross_amount).sort((a, b) => b.value - a.value),
    [rows]
  );

  const gross = rows.reduce((sum, r) => sum + r.gross_amount, 0);
  const fees = rows.reduce((sum, r) => sum + r.fees, 0);
  const pending = rows.filter((r) => r.status === "pending").length;
  const avgOrder = rows.length ? Math.round(gross / rows.length) : 0;
  const feeRate = gross ? ((fees / gross) * 100).toFixed(1) : "0.0";

  const latest = rows.slice(0, 8);

  return (
    <div>
      <DashboardHeader
        title="Marketplace Reconciliation"
        meta={`${rows.length.toLocaleString()} orders across ${marketplaces.length} marketplaces`}
        demo
        onExport={() =>
          downloadCsv(
            "reconciliation.csv",
            [
              { key: "order_id", header: "Order" },
              { key: "marketplace", header: "Marketplace" },
              { key: "order_date", header: "Order date" },
              { key: "gross_amount", header: "Gross" },
              { key: "fees", header: "Fees" },
              { key: "net_amount", header: "Net" },
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
        earliest={RECONCILIATION_EARLIEST}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search order ID"
        select={{ label: "Marketplace", value: marketplace, options: marketplaces, onChange: setMarketplace }}
      />

      <StatRow>
        <StatTile label="Orders pending" value={pending} icon={<ClockIcon />} color={pending > 0 ? "var(--warning)" : undefined} />
        <StatTile label="Total orders" value={rows.length} icon={<DocumentIcon />} />
        <StatTile label="Avg order value" value={`₹${avgOrder.toLocaleString()}`} icon={<TrendingUpIcon />} />
        <StatTile label="Fee rate" value={`${feeRate}%`} icon={<PercentIcon />} />
      </StatRow>

      <DataTable
        title="By month"
        meta="Gross, fees, and net across the selected range"
        columns={[
          { key: "month", header: "Month" },
          { key: "count", header: "Orders", align: "right" },
          { key: "gross_amount", header: "Gross", align: "right", render: (m) => `₹${Number(m.gross_amount).toLocaleString()}` },
          { key: "fees", header: "Fees", align: "right", render: (m) => `₹${Number(m.fees).toLocaleString()}` },
          { key: "net_amount", header: "Net", align: "right", render: (m) => `₹${Number(m.net_amount).toLocaleString()}` },
        ]}
        rows={byMonth}
        rowKey={(m) => String(m.month)}
      />

      <div className="chart-grid">
        <div className="panel chart-panel">
          <h2>Gross by marketplace</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byMarketplace} dataKey="value" nameKey="name" innerRadius={44} outerRadius={70} paddingAngle={3} isAnimationActive={false}>
                {byMarketplace.map((entry, i) => (
                  <Cell key={entry.name} fill={CATEGORY_PALETTE[i % CATEGORY_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: 8, borderColor: chartColors.grid, fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="panel chart-panel">
          <h2>Net payable over time</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={byMonth} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={chartColors.grid} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: chartColors.muted }} axisLine={{ stroke: chartColors.grid }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: chartColors.muted }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: 8, borderColor: chartColors.grid, fontSize: 13 }} />
              <Line isAnimationActive={false} type="monotone" dataKey="net_amount" name="Net" stroke={chartColors.mint} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <DataTable
        title="Latest data"
        meta={`Showing ${latest.length} of ${rows.length.toLocaleString()}`}
        columns={[
          { key: "order_id", header: "Order" },
          { key: "marketplace", header: "Marketplace" },
          { key: "order_date", header: "Date" },
          { key: "net_amount", header: "Net", align: "right", render: (r) => `₹${r.net_amount.toLocaleString()}` },
          {
            key: "status",
            header: "Status",
            render: (r) => <span className={`pill ${r.status === "settled" ? "pill-on" : "pill-off"}`}>{r.status}</span>,
          },
        ]}
        rows={latest}
        rowKey={(r) => r.order_id}
      />
    </div>
  );
}
