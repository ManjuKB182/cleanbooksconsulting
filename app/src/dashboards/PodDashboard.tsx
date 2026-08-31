import { useEffect, useMemo, useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { StatRow, StatTile } from "../components/StatTiles";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { PodStatusRow } from "../lib/types";
import { chartColors } from "../lib/chartColors";
import { DASHBOARD_META } from "./dashboardMeta";

export function PodDashboard() {
  const { session } = useAuth();
  const [rows, setRows] = useState<PodStatusRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!session) return;
    api
      .podDashboard(session.accessToken)
      .then(setRows)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load POD data."));
  }, [session]);

  const filtered = rows?.filter((row) => {
    const haystack = `${row.invoice_no} ${row.customer_name} ${row.partner} ${row.sku} ${row.lr_number}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const received = rows?.filter((r) => r.pod_received).length ?? 0;
  const pending = (rows?.length ?? 0) - received;
  const breakdown = useMemo(
    () => [
      { name: "Received", value: received },
      { name: "Pending", value: pending },
    ],
    [received, pending]
  );

  return (
    <div>
      <h1>POD & Delivery Status</h1>
      {error && <p className="error-text">{error}</p>}

      <StatRow>
        <StatTile label="Total invoices" value={rows?.length ?? "—"} color={DASHBOARD_META.pod.color} />
        <StatTile label="POD received" value={rows ? received : "—"} color="var(--mint)" />
        <StatTile label="POD pending" value={rows ? pending : "—"} color="var(--warning)" />
      </StatRow>

      {rows && rows.length > 0 && (
        <div className="panel chart-panel">
          <h2>Received vs. pending</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3} isAnimationActive={false}>
                <Cell fill="#059669" />
                <Cell fill={chartColors.warning} />
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, borderColor: chartColors.grid, fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <input
        className="search-input"
        placeholder="Search invoice, customer, partner, SKU, LR…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Partner</th>
              <th>SKU</th>
              <th>Value</th>
              <th>LR Number</th>
              <th>POD</th>
            </tr>
          </thead>
          <tbody>
            {filtered?.map((row) => (
              <tr key={row.invoice_no}>
                <td>{row.invoice_no}</td>
                <td>{row.customer_name}</td>
                <td>{row.partner}</td>
                <td>{row.sku}</td>
                <td>₹{row.invoice_value.toLocaleString()}</td>
                <td>{row.lr_number}</td>
                <td>
                  <span className={`pill ${row.pod_received ? "pill-on" : "pill-off"}`}>
                    {row.pod_received ? "Received" : "Pending"}
                  </span>
                </td>
              </tr>
            ))}
            {rows && filtered?.length === 0 && (
              <tr>
                <td colSpan={7} className="muted">
                  No matching invoices.
                </td>
              </tr>
            )}
            {rows && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="muted">
                  No POD data yet — this dashboard is wired to live ingestion, and nothing has synced for this
                  client so far.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
