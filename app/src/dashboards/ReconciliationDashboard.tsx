import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DemoNotice } from "../components/DemoBadge";
import { DateRangeFilter, presetRange } from "../components/DateRangeFilter";
import { StatRow, StatTile } from "../components/StatTiles";
import { chartColors } from "../lib/chartColors";
import { aggregateMonthly, withinRange } from "./chartUtils";
import { DASHBOARD_META } from "./dashboardMeta";
import { RECONCILIATION_EARLIEST, mockReconciliation } from "./mockData";

export function ReconciliationDashboard() {
  const [range, setRange] = useState(() => presetRange(183, RECONCILIATION_EARLIEST));
  const rows = useMemo(
    () => mockReconciliation.filter((r) => withinRange(r.order_date, range)).sort((a, b) => (a.order_date < b.order_date ? 1 : -1)),
    [range]
  );
  const trend = useMemo(() => aggregateMonthly(rows, "order_date", ["gross_amount", "fees", "net_amount"]), [rows]);

  const gross = rows.reduce((sum, r) => sum + r.gross_amount, 0);
  const fees = rows.reduce((sum, r) => sum + r.fees, 0);
  const net = rows.reduce((sum, r) => sum + r.net_amount, 0);
  const pending = rows.filter((r) => r.status === "pending").length;

  return (
    <div>
      <h1>Marketplace Reconciliation</h1>
      <DemoNotice dashboardKey="reconciliation" />

      <DateRangeFilter range={range} onChange={setRange} earliest={RECONCILIATION_EARLIEST} />

      <StatRow>
        <StatTile label="Gross sales" value={`₹${gross.toLocaleString()}`} />
        <StatTile label="Marketplace fees" value={`₹${fees.toLocaleString()}`} color="var(--warning)" />
        <StatTile label="Net payable" value={`₹${net.toLocaleString()}`} color="var(--mint)" />
        <StatTile label="Orders pending" value={pending} color={DASHBOARD_META.reconciliation.color} />
      </StatRow>

      <div className="panel chart-panel">
        <h2>Gross vs. net by month</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={trend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={chartColors.grid} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: chartColors.muted }} axisLine={{ stroke: chartColors.grid }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: chartColors.muted }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: 8, borderColor: chartColors.grid, fontSize: 13 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar isAnimationActive={false} dataKey="gross_amount" name="Gross" fill={chartColors.accent} radius={[4, 4, 0, 0]} />
            <Bar isAnimationActive={false} dataKey="fees" name="Fees" fill={chartColors.warning} radius={[4, 4, 0, 0]} />
            <Bar isAnimationActive={false} dataKey="net_amount" name="Net" fill={chartColors.mint} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Marketplace</th>
              <th>Date</th>
              <th>Gross</th>
              <th>Fees</th>
              <th>Net</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.order_id}>
                <td>{row.order_id}</td>
                <td>{row.marketplace}</td>
                <td>{row.order_date}</td>
                <td>₹{row.gross_amount.toLocaleString()}</td>
                <td>₹{row.fees.toLocaleString()}</td>
                <td>₹{row.net_amount.toLocaleString()}</td>
                <td>
                  <span className={`pill ${row.status === "settled" ? "pill-on" : "pill-off"}`}>
                    {row.status === "settled" ? "Settled" : "Pending"}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="muted">
                  No orders in this date range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
