import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DateRangeFilter, presetRange } from "../components/DateRangeFilter";
import { DemoNotice } from "../components/DemoBadge";
import { AlertIcon, BoxIcon, CheckCircleIcon, ClockIcon, DocumentIcon, TagIcon, WalletIcon } from "../components/icons";
import { StatRow, StatTile } from "../components/StatTiles";
import { CATEGORY_PALETTE, chartColors } from "../lib/chartColors";
import { countBy, withinRange } from "./chartUtils";
import { DASHBOARD_META } from "./dashboardMeta";
import { RETURNS_EARLIEST, mockReturns } from "./mockData";

const STATUS_COLOR: Record<string, string> = {
  approved: chartColors.mint,
  pending: chartColors.warning,
  rejected: chartColors.critical,
};

export function ReturnsDashboard() {
  const [range, setRange] = useState(() => presetRange(183, RETURNS_EARLIEST));
  const rows = useMemo(
    () => mockReturns.filter((r) => withinRange(r.return_date, range)).sort((a, b) => (a.return_date < b.return_date ? 1 : -1)),
    [range]
  );
  const byReason = useMemo(() => countBy(rows, (r) => r.reason, (r) => r.refund_amount).sort((a, b) => b.value - a.value), [rows]);
  const byStatus = useMemo(() => countBy(rows, (r) => r.status), [rows]);

  const refundValue = rows.reduce((sum, r) => sum + r.refund_amount, 0);
  const pending = rows.filter((r) => r.status === "pending").length;
  const approved = rows.filter((r) => r.status === "approved").length;
  const rejected = rows.filter((r) => r.status === "rejected").length;
  const avgRefund = rows.length ? Math.round(refundValue / rows.length) : 0;
  const skus = new Set(rows.map((r) => r.sku)).size;
  const topReason = byReason[0];

  return (
    <div>
      <h1>Returns & Chargebacks</h1>
      <DemoNotice dashboardKey="returns" />

      <DateRangeFilter range={range} onChange={setRange} earliest={RETURNS_EARLIEST} />

      <StatRow>
        <StatTile label="Total returns" value={rows.length} color={DASHBOARD_META.returns.color} icon={<DocumentIcon />} />
        <StatTile label="Refund value" value={`₹${refundValue.toLocaleString()}`} color="var(--warning)" icon={<AlertIcon />} />
        <StatTile label="Pending review" value={pending} color="var(--critical)" icon={<ClockIcon />} />
        <StatTile label="Approved" value={approved} color="var(--mint)" icon={<CheckCircleIcon />} />
        <StatTile label="Rejected" value={rejected} color="var(--critical)" icon={<AlertIcon />} />
        <StatTile label="Avg refund" value={`₹${avgRefund.toLocaleString()}`} color="var(--accent)" icon={<WalletIcon />} />
        <StatTile label="SKUs affected" value={skus} color="#0891b2" icon={<BoxIcon />} />
        <StatTile
          label="Top reason"
          value={topReason?.name ?? "—"}
          sub={topReason ? `₹${topReason.value.toLocaleString()} refunded` : undefined}
          color={DASHBOARD_META.returns.color}
          icon={<TagIcon />}
        />
      </StatRow>

      <div className="chart-grid">
        <div className="panel chart-panel">
          <h2>Refund value by reason</h2>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={byReason} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 0 }}>
              <CartesianGrid stroke={chartColors.grid} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: chartColors.muted }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: chartColors.muted }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: 8, borderColor: chartColors.grid, fontSize: 13 }} />
              <Bar isAnimationActive={false} dataKey="value" name="Refund value" radius={[0, 4, 4, 0]}>
                {byReason.map((entry, i) => (
                  <Cell key={entry.name} fill={CATEGORY_PALETTE[i % CATEGORY_PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
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
              <Tooltip contentStyle={{ borderRadius: 8, borderColor: chartColors.grid, fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
