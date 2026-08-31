import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DateRangeFilter, presetRange } from "../components/DateRangeFilter";
import { DemoNotice } from "../components/DemoBadge";
import { CheckCircleIcon, ClockIcon, PercentIcon, TagIcon, TrendingUpIcon, WalletIcon } from "../components/icons";
import { StatRow, StatTile } from "../components/StatTiles";
import { chartColors } from "../lib/chartColors";
import { withinRange } from "./chartUtils";
import { DASHBOARD_META } from "./dashboardMeta";
import { CASH_FLOW_EARLIEST, mockCashFlow } from "./mockData";

export function CashFlowDashboard() {
  const [range, setRange] = useState(() => presetRange(null, CASH_FLOW_EARLIEST));
  const rows = useMemo(() => mockCashFlow.filter((r) => withinRange(r.period_date, range)), [range]);

  const latest = rows[rows.length - 1];
  const totalInflow = rows.reduce((sum, r) => sum + r.inflow, 0);
  const totalOutflow = rows.reduce((sum, r) => sum + r.outflow, 0);
  const totalNet = totalInflow - totalOutflow;
  const avgNet = rows.length ? Math.round(totalNet / rows.length) : 0;
  const margin = totalInflow ? ((totalNet / totalInflow) * 100).toFixed(1) : "0.0";
  const bestMonth = rows.reduce((best, r) => (!best || r.net > best.net ? r : best), rows[0]);

  return (
    <div>
      <h1>Cash Flow Summary</h1>
      <DemoNotice dashboardKey="cash_flow" />

      <DateRangeFilter range={range} onChange={setRange} earliest={CASH_FLOW_EARLIEST} defaultPreset="All" />

      <StatRow>
        <StatTile label={latest ? `Net (${latest.period})` : "Net"} value={latest ? `₹${latest.net.toLocaleString()}` : "—"} color="var(--mint)" icon={<CheckCircleIcon />} />
        <StatTile label="Total inflow" value={`₹${totalInflow.toLocaleString()}`} color="var(--accent)" icon={<WalletIcon />} />
        <StatTile label="Total outflow" value={`₹${totalOutflow.toLocaleString()}`} color="var(--warning)" icon={<TrendingUpIcon />} />
        <StatTile label="Avg monthly net" value={`₹${avgNet.toLocaleString()}`} color={DASHBOARD_META.cash_flow.color} icon={<TrendingUpIcon />} />
        <StatTile label="Net margin" value={`${margin}%`} color="#7c3aed" icon={<PercentIcon />} />
        <StatTile
          label="Best month"
          value={bestMonth?.period ?? "—"}
          sub={bestMonth ? `₹${bestMonth.net.toLocaleString()} net` : undefined}
          color="#db2777"
          icon={<TagIcon />}
        />
        <StatTile label="Months tracked" value={rows.length} color="var(--accent)" icon={<ClockIcon />} />
      </StatRow>

      <div className="chart-grid">
        <div className="panel chart-panel">
          <h2>Inflow vs. outflow trend</h2>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={rows} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="inflowFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.accent} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={chartColors.accent} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="outflowFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.warning} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColors.warning} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={chartColors.grid} vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: chartColors.muted }} axisLine={{ stroke: chartColors.grid }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: chartColors.muted }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: 8, borderColor: chartColors.grid, fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area isAnimationActive={false} type="monotone" dataKey="inflow" name="Inflow" stroke={chartColors.accent} fill="url(#inflowFill)" strokeWidth={2} />
              <Area isAnimationActive={false} type="monotone" dataKey="outflow" name="Outflow" stroke={chartColors.warning} fill="url(#outflowFill)" strokeWidth={2} />
              <Line isAnimationActive={false} type="monotone" dataKey="net" name="Net" stroke={chartColors.mint} strokeWidth={2.5} dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="panel chart-panel">
          <h2>Net by month</h2>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={rows} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={chartColors.grid} vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: chartColors.muted }} axisLine={{ stroke: chartColors.grid }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: chartColors.muted }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: 8, borderColor: chartColors.grid, fontSize: 13 }} />
              <Bar isAnimationActive={false} dataKey="net" name="Net" radius={[4, 4, 0, 0]}>
                {rows.map((r) => (
                  <Cell key={r.period} fill={r.net >= 0 ? chartColors.mint : chartColors.critical} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
