import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DataTable } from "../components/DataTable";
import { DashboardHeader } from "../components/DashboardHeader";
import { FilterBar, presetRange } from "../components/FilterBar";
import { AlertIcon, BoxIcon, DocumentIcon, WalletIcon } from "../components/icons";
import { StatRow, StatTile } from "../components/StatTiles";
import { CATEGORY_PALETTE, chartColors } from "../lib/chartColors";
import { downloadCsv } from "../lib/csv";
import { useRefreshable } from "../lib/useRefreshable";
import { countBy, withinRange } from "./chartUtils";
import { RETURNS_EARLIEST, mockReturns } from "./mockData";

const STATUS_COLOR: Record<string, string> = {
  approved: chartColors.mint,
  pending: chartColors.warning,
  rejected: chartColors.critical,
};

interface ReasonAgg {
  reason: string;
  count: number;
  value: number;
}

export function ReturnsDashboard() {
  const [range, setRange] = useState(() => presetRange(183, RETURNS_EARLIEST));
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const { refreshing, refresh } = useRefreshable(() => new Promise((resolve) => setTimeout(resolve, 500)));

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mockReturns
      .filter((r) => withinRange(r.return_date, range))
      .filter((r) => status === "all" || r.status === status)
      .filter((r) => !q || r.return_id.toLowerCase().includes(q) || r.sku.toLowerCase().includes(q))
      .sort((a, b) => (a.return_date < b.return_date ? 1 : -1));
  }, [range, search, status]);

  const byStatus = useMemo(() => countBy(rows, (r) => r.status), [rows]);
  const byReason = useMemo(() => {
    const map = new Map<string, ReasonAgg>();
    for (const row of rows) {
      const agg = map.get(row.reason) ?? { reason: row.reason, count: 0, value: 0 };
      agg.count += 1;
      agg.value += row.refund_amount;
      map.set(row.reason, agg);
    }
    return Array.from(map.values()).sort((a, b) => b.value - a.value);
  }, [rows]);

  const refundValue = rows.reduce((sum, r) => sum + r.refund_amount, 0);
  const rejected = rows.filter((r) => r.status === "rejected").length;
  const avgRefund = rows.length ? Math.round(refundValue / rows.length) : 0;
  const skus = new Set(rows.map((r) => r.sku)).size;

  const latest = rows.slice(0, 8);

  return (
    <div>
      <DashboardHeader
        title="Returns & Chargebacks"
        meta={`${rows.length.toLocaleString()} returns · ₹${refundValue.toLocaleString()} refunded`}
        demo
        onExport={() =>
          downloadCsv(
            "returns.csv",
            [
              { key: "return_id", header: "Return" },
              { key: "order_id", header: "Order" },
              { key: "sku", header: "SKU" },
              { key: "reason", header: "Reason" },
              { key: "return_date", header: "Return date" },
              { key: "refund_amount", header: "Refund" },
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
        earliest={RETURNS_EARLIEST}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search return ID or SKU"
        select={{ label: "Status", value: status, options: ["approved", "pending", "rejected"], onChange: setStatus }}
      />

      <StatRow>
        <StatTile label="Total returns" value={rows.length} icon={<DocumentIcon />} />
        <StatTile label="Rejected" value={rejected} icon={<AlertIcon />} color={rejected > 0 ? "var(--critical)" : undefined} />
        <StatTile label="Avg refund" value={`₹${avgRefund.toLocaleString()}`} icon={<WalletIcon />} />
        <StatTile label="SKUs affected" value={skus} icon={<BoxIcon />} />
      </StatRow>

      <DataTable
        title="By reason"
        meta="Refund value and count per reason"
        columns={[
          { key: "reason", header: "Reason" },
          { key: "count", header: "Returns", align: "right" },
          { key: "value", header: "Refund value", align: "right", render: (r) => `₹${r.value.toLocaleString()}` },
        ]}
        rows={byReason}
        rowKey={(r) => r.reason}
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
              <Tooltip contentStyle={{ borderRadius: 8, borderColor: chartColors.grid, fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="panel chart-panel">
          <h2>Refund value by reason</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byReason.slice(0, 6)} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={chartColors.grid} vertical={false} />
              <XAxis dataKey="reason" tick={{ fontSize: 10, fill: chartColors.muted }} axisLine={{ stroke: chartColors.grid }} tickLine={false} interval={0} angle={-18} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11, fill: chartColors.muted }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: 8, borderColor: chartColors.grid, fontSize: 13 }} />
              <Bar isAnimationActive={false} dataKey="value" name="Refund value" fill={chartColors.warning} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <DataTable
        title="Latest data"
        meta={`Showing ${latest.length} of ${rows.length.toLocaleString()}`}
        columns={[
          { key: "return_id", header: "Return" },
          { key: "sku", header: "SKU" },
          { key: "reason", header: "Reason" },
          { key: "return_date", header: "Date" },
          { key: "refund_amount", header: "Refund", align: "right", render: (r) => `₹${r.refund_amount.toLocaleString()}` },
          {
            key: "status",
            header: "Status",
            render: (r) => (
              <span className={`pill ${r.status === "approved" ? "pill-on" : r.status === "rejected" ? "pill-critical" : "pill-off"}`}>{r.status}</span>
            ),
          },
        ]}
        rows={latest}
        rowKey={(r) => r.return_id}
      />
    </div>
  );
}
