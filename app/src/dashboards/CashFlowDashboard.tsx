import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DateRangeFilter, presetRange } from "../components/DateRangeFilter";
import { DemoNotice } from "../components/DemoBadge";
import { StatRow, StatTile } from "../components/StatTiles";
import { chartColors } from "../lib/chartColors";
import { withinRange } from "./chartUtils";
import { CASH_FLOW_EARLIEST, mockCashFlow } from "./mockData";

export function CashFlowDashboard() {
  const [range, setRange] = useState(() => presetRange(null, CASH_FLOW_EARLIEST));
  const rows = useMemo(() => mockCashFlow.filter((r) => withinRange(r.period_date, range)), [range]);

  const latest = rows[rows.length - 1];
  const totalInflow = rows.reduce((sum, r) => sum + r.inflow, 0);
  const totalOutflow = rows.reduce((sum, r) => sum + r.outflow, 0);

  return (
    <div>
      <h1>Cash Flow Summary</h1>
      <DemoNotice dashboardKey="cash_flow" />

      <DateRangeFilter range={range} onChange={setRange} earliest={CASH_FLOW_EARLIEST} defaultPreset="All" />

      <StatRow>
        <StatTile label={latest ? `Net (${latest.period})` : "Net"} value={latest ? `₹${latest.net.toLocaleString()}` : "—"} color="var(--mint)" />
        <StatTile label="Total inflow" value={`₹${totalInflow.toLocaleString()}`} color="var(--accent)" />
        <StatTile label="Total outflow" value={`₹${totalOutflow.toLocaleString()}`} color="var(--warning)" />
      </StatRow>

      <div className="panel chart-panel">
        <h2>Inflow vs. outflow trend</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
            <XAxis dataKey="period" tick={{ fontSize: 12, fill: chartColors.muted }} axisLine={{ stroke: chartColors.grid }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: chartColors.muted }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: 8, borderColor: chartColors.grid, fontSize: 13 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area isAnimationActive={false} type="monotone" dataKey="inflow" name="Inflow" stroke={chartColors.accent} fill="url(#inflowFill)" strokeWidth={2} />
            <Area isAnimationActive={false} type="monotone" dataKey="outflow" name="Outflow" stroke={chartColors.warning} fill="url(#outflowFill)" strokeWidth={2} />
            <Line isAnimationActive={false} type="monotone" dataKey="net" name="Net" stroke={chartColors.mint} strokeWidth={2.5} dot={{ r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Period</th>
              <th>Inflow</th>
              <th>Outflow</th>
              <th>Net</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.period}>
                <td>{row.period}</td>
                <td>₹{row.inflow.toLocaleString()}</td>
                <td>₹{row.outflow.toLocaleString()}</td>
                <td style={{ color: row.net >= 0 ? "var(--mint)" : "var(--critical)", fontWeight: 600 }}>
                  ₹{row.net.toLocaleString()}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">
                  No periods in this date range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
