import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DataTable } from "../components/DataTable";
import { DashboardHeader } from "../components/DashboardHeader";
import { FilterBar, presetRange } from "../components/FilterBar";
import { ClockIcon, PercentIcon, TagIcon, TrendingUpIcon } from "../components/icons";
import { StatRow, StatTile } from "../components/StatTiles";
import { chartColors } from "../lib/chartColors";
import { downloadCsv } from "../lib/csv";
import { useRefreshable } from "../lib/useRefreshable";
import { withinRange } from "./chartUtils";
import { CASH_FLOW_EARLIEST, mockCashFlow } from "./mockData";

export function CashFlowDashboard() {
  const [range, setRange] = useState(() => presetRange(null, CASH_FLOW_EARLIEST));
  const { refreshing, refresh } = useRefreshable(() => new Promise((resolve) => setTimeout(resolve, 500)));

  const rows = useMemo(() => mockCashFlow.filter((r) => withinRange(r.period_date, range)), [range]);
  const latest = useMemo(() => [...rows].reverse().slice(0, 8), [rows]);

  const totalInflow = rows.reduce((sum, r) => sum + r.inflow, 0);
  const totalOutflow = rows.reduce((sum, r) => sum + r.outflow, 0);
  const totalNet = totalInflow - totalOutflow;
  const avgNet = rows.length ? Math.round(totalNet / rows.length) : 0;
  const margin = totalInflow ? ((totalNet / totalInflow) * 100).toFixed(1) : "0.0";
  const bestMonth = rows.reduce((best, r) => (!best || r.net > best.net ? r : best), rows[0]);

  return (
    <div>
      <DashboardHeader
        title="Cash Flow Summary"
        meta={`${rows.length} months tracked · ₹${totalNet.toLocaleString()} net`}
        demo
        onExport={() =>
          downloadCsv(
            "cash-flow.csv",
            [
              { key: "period", header: "Period" },
              { key: "inflow", header: "Inflow" },
              { key: "outflow", header: "Outflow" },
              { key: "net", header: "Net" },
            ],
            rows
          )
        }
        onRefresh={refresh}
        refreshing={refreshing}
      />

      <FilterBar range={range} onChange={setRange} earliest={CASH_FLOW_EARLIEST} defaultPreset="All" />

      <StatRow>
        <StatTile label="Avg monthly net" value={`₹${avgNet.toLocaleString()}`} icon={<TrendingUpIcon />} />
        <StatTile label="Net margin" value={`${margin}%`} icon={<PercentIcon />} />
        <StatTile
          label="Best month"
          value={bestMonth?.period ?? "—"}
          sub={bestMonth ? `₹${bestMonth.net.toLocaleString()} net` : undefined}
          icon={<TagIcon />}
        />
        <StatTile label="Months tracked" value={rows.length} icon={<ClockIcon />} />
      </StatRow>

      <DataTable
        title="By month"
        meta="Inflow, outflow, and net for the selected range"
        columns={[
          { key: "period", header: "Period" },
          { key: "inflow", header: "Inflow", align: "right", render: (r) => `₹${r.inflow.toLocaleString()}` },
          { key: "outflow", header: "Outflow", align: "right", render: (r) => `₹${r.outflow.toLocaleString()}` },
          {
            key: "net",
            header: "Net",
            align: "right",
            render: (r) => <span style={r.net < 0 ? { color: "var(--critical)", fontWeight: 600 } : { color: "var(--accent-dark)", fontWeight: 600 }}>₹{r.net.toLocaleString()}</span>,
          },
        ]}
        rows={rows}
        rowKey={(r) => r.period}
      />

      <div className="chart-grid">
        <div className="panel chart-panel">
          <h2>Inflow vs. outflow trend</h2>
          <ResponsiveContainer width="100%" height={200}>
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
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={rows} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={chartColors.grid} vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: chartColors.muted }} axisLine={{ stroke: chartColors.grid }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: chartColors.muted }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: 8, borderColor: chartColors.grid, fontSize: 13 }} />
              <Bar isAnimationActive={false} dataKey="net" name="Net" fill={chartColors.mint} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <DataTable
        title="Latest data"
        meta={`Most recent ${latest.length} of ${rows.length} months`}
        columns={[
          { key: "period", header: "Period" },
          { key: "inflow", header: "Inflow", align: "right", render: (r) => `₹${r.inflow.toLocaleString()}` },
          { key: "outflow", header: "Outflow", align: "right", render: (r) => `₹${r.outflow.toLocaleString()}` },
          { key: "net", header: "Net", align: "right", render: (r) => `₹${r.net.toLocaleString()}` },
        ]}
        rows={latest}
        rowKey={(r) => r.period}
      />
    </div>
  );
}
