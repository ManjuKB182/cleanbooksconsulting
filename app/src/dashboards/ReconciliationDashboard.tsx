import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DateRangeFilter, presetRange } from "../components/DateRangeFilter";
import { DemoNotice } from "../components/DemoBadge";
import { AlertIcon, CheckCircleIcon, ClockIcon, DocumentIcon, PercentIcon, TagIcon, TrendingUpIcon, WalletIcon } from "../components/icons";
import { StatRow, StatTile } from "../components/StatTiles";
import { CATEGORY_PALETTE, chartColors } from "../lib/chartColors";
import { aggregateMonthly, countBy, withinRange } from "./chartUtils";
import { DASHBOARD_META } from "./dashboardMeta";
import { RECONCILIATION_EARLIEST, mockReconciliation } from "./mockData";

export function ReconciliationDashboard() {
  const [range, setRange] = useState(() => presetRange(183, RECONCILIATION_EARLIEST));
  const rows = useMemo(
    () => mockReconciliation.filter((r) => withinRange(r.order_date, range)).sort((a, b) => (a.order_date < b.order_date ? 1 : -1)),
    [range]
  );
  const trend = useMemo(() => aggregateMonthly(rows, "order_date", ["gross_amount", "fees", "net_amount"]), [rows]);
  const byMarketplace = useMemo(
    () => countBy(rows, (r) => r.marketplace, (r) => r.gross_amount).sort((a, b) => b.value - a.value),
    [rows]
  );

  const gross = rows.reduce((sum, r) => sum + r.gross_amount, 0);
  const fees = rows.reduce((sum, r) => sum + r.fees, 0);
  const net = rows.reduce((sum, r) => sum + r.net_amount, 0);
  const pending = rows.filter((r) => r.status === "pending").length;
  const avgOrder = rows.length ? Math.round(gross / rows.length) : 0;
  const feeRate = gross ? ((fees / gross) * 100).toFixed(1) : "0.0";
  const topMarketplace = byMarketplace[0];

  return (
    <div>
      <h1>Marketplace Reconciliation</h1>
      <DemoNotice dashboardKey="reconciliation" />

      <DateRangeFilter range={range} onChange={setRange} earliest={RECONCILIATION_EARLIEST} />

      <StatRow>
        <StatTile label="Gross sales" value={`₹${gross.toLocaleString()}`} color="var(--accent)" icon={<WalletIcon />} />
        <StatTile label="Marketplace fees" value={`₹${fees.toLocaleString()}`} color="var(--warning)" icon={<AlertIcon />} />
        <StatTile label="Net payable" value={`₹${net.toLocaleString()}`} color="var(--mint)" icon={<CheckCircleIcon />} />
        <StatTile label="Orders pending" value={pending} color={DASHBOARD_META.reconciliation.color} icon={<ClockIcon />} />
        <StatTile label="Total orders" value={rows.length} color="#0891b2" icon={<DocumentIcon />} />
        <StatTile label="Avg order value" value={`₹${avgOrder.toLocaleString()}`} color="var(--accent)" icon={<TrendingUpIcon />} />
        <StatTile label="Fee rate" value={`${feeRate}%`} color={DASHBOARD_META.reconciliation.color} icon={<PercentIcon />} />
        <StatTile
          label="Top marketplace"
          value={topMarketplace?.name ?? "—"}
          sub={topMarketplace ? `₹${topMarketplace.value.toLocaleString()} gross` : undefined}
          color="#db2777"
          icon={<TagIcon />}
        />
      </StatRow>

      <div className="chart-grid">
        <div className="panel chart-panel">
          <h2>Gross vs. net by month</h2>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={trend} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={chartColors.grid} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: chartColors.muted }} axisLine={{ stroke: chartColors.grid }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: chartColors.muted }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: 8, borderColor: chartColors.grid, fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar isAnimationActive={false} dataKey="gross_amount" name="Gross" fill={chartColors.accent} radius={[4, 4, 0, 0]} />
              <Bar isAnimationActive={false} dataKey="fees" name="Fees" fill={chartColors.warning} radius={[4, 4, 0, 0]} />
              <Bar isAnimationActive={false} dataKey="net_amount" name="Net" fill={chartColors.mint} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel chart-panel">
          <h2>Gross by marketplace</h2>
          <ResponsiveContainer width="100%" height={190}>
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
      </div>
    </div>
  );
}
