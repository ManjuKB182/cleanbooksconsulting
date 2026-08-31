import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DateRangeFilter, presetRange } from "../components/DateRangeFilter";
import { DemoNotice } from "../components/DemoBadge";
import { StatRow, StatTile } from "../components/StatTiles";
import { CATEGORY_PALETTE, chartColors } from "../lib/chartColors";
import { countBy, withinRange } from "./chartUtils";
import { DASHBOARD_META } from "./dashboardMeta";
import { RETURNS_EARLIEST, mockReturns } from "./mockData";

const STATUS_PILL: Record<string, string> = {
  approved: "pill-on",
  pending: "pill-off",
  rejected: "pill-critical",
};

export function ReturnsDashboard() {
  const [range, setRange] = useState(() => presetRange(183, RETURNS_EARLIEST));
  const rows = useMemo(
    () => mockReturns.filter((r) => withinRange(r.return_date, range)).sort((a, b) => (a.return_date < b.return_date ? 1 : -1)),
    [range]
  );
  const byReason = useMemo(() => countBy(rows, (r) => r.reason, (r) => r.refund_amount).sort((a, b) => b.value - a.value), [rows]);

  const refundValue = rows.reduce((sum, r) => sum + r.refund_amount, 0);
  const pending = rows.filter((r) => r.status === "pending").length;

  return (
    <div>
      <h1>Returns & Chargebacks</h1>
      <DemoNotice dashboardKey="returns" />

      <DateRangeFilter range={range} onChange={setRange} earliest={RETURNS_EARLIEST} />

      <StatRow>
        <StatTile label="Total returns" value={rows.length} color={DASHBOARD_META.returns.color} />
        <StatTile label="Refund value" value={`₹${refundValue.toLocaleString()}`} color="var(--warning)" />
        <StatTile label="Pending review" value={pending} color="var(--critical)" />
      </StatRow>

      <div className="panel chart-panel">
        <h2>Refund value by reason</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={byReason} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
            <CartesianGrid stroke={chartColors.grid} horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12, fill: chartColors.muted }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
            <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12, fill: chartColors.muted }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: 8, borderColor: chartColors.grid, fontSize: 13 }} />
            <Bar isAnimationActive={false} dataKey="value" name="Refund value" radius={[0, 4, 4, 0]}>
              {byReason.map((entry, i) => (
                <Cell key={entry.name} fill={CATEGORY_PALETTE[i % CATEGORY_PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Return</th>
              <th>Order</th>
              <th>SKU</th>
              <th>Reason</th>
              <th>Date</th>
              <th>Refund</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.return_id}>
                <td>{row.return_id}</td>
                <td>{row.order_id}</td>
                <td>{row.sku}</td>
                <td>{row.reason}</td>
                <td>{row.return_date}</td>
                <td>₹{row.refund_amount.toLocaleString()}</td>
                <td>
                  <span className={`pill ${STATUS_PILL[row.status]}`}>{row.status}</span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="muted">
                  No returns in this date range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
