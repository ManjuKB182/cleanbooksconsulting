import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatRow, StatTile } from "../components/StatTiles";
import { AlertIcon, BoxIcon, CheckCircleIcon, ClockIcon, DocumentIcon, PercentIcon, UsersIcon, WalletIcon } from "../components/icons";
import { api, ApiError } from "../lib/api";
import { chartColors } from "../lib/chartColors";
import { useAuth } from "../lib/auth";
import type { PodStatusRow } from "../lib/types";
import { countBy } from "./chartUtils";
import { DASHBOARD_META } from "./dashboardMeta";

export function PodDashboard() {
  const { session } = useAuth();
  const [rows, setRows] = useState<PodStatusRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    api
      .podDashboard(session.accessToken)
      .then(setRows)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load POD data."));
  }, [session]);

  const received = rows?.filter((r) => r.pod_received).length ?? 0;
  const pending = (rows?.length ?? 0) - received;
  const totalValue = rows?.reduce((sum, r) => sum + r.invoice_value, 0) ?? 0;
  const receivedValue = rows?.filter((r) => r.pod_received).reduce((sum, r) => sum + r.invoice_value, 0) ?? 0;
  const pendingValue = totalValue - receivedValue;
  const completion = rows && rows.length > 0 ? Math.round((received / rows.length) * 100) : 0;
  const partners = new Set(rows?.map((r) => r.partner).filter(Boolean)).size;
  const customers = new Set(rows?.map((r) => r.customer_name).filter(Boolean)).size;

  const breakdown = useMemo(
    () => [
      { name: "Received", value: received },
      { name: "Pending", value: pending },
    ],
    [received, pending]
  );
  const byPartner = useMemo(
    () => (rows ? countBy(rows, (r) => r.partner || "Unknown").sort((a, b) => b.value - a.value).slice(0, 6) : []),
    [rows]
  );

  return (
    <div>
      <h1>POD & Delivery Status</h1>
      {error && <p className="error-text">{error}</p>}
      {rows && rows.length === 0 && (
        <p className="muted">
          No POD data yet — this dashboard is wired to live ingestion, and nothing has synced for this client so
          far.
        </p>
      )}

      <StatRow>
        <StatTile label="Total invoices" value={rows?.length ?? "—"} color={DASHBOARD_META.pod.color} icon={<DocumentIcon />} />
        <StatTile label="POD received" value={rows ? received : "—"} color="var(--mint)" icon={<CheckCircleIcon />} />
        <StatTile label="POD pending" value={rows ? pending : "—"} color="var(--warning)" icon={<ClockIcon />} />
        <StatTile label="Completion" value={rows ? `${completion}%` : "—"} color="#7c3aed" icon={<PercentIcon />} />
        <StatTile label="Total invoice value" value={`₹${totalValue.toLocaleString()}`} color="var(--accent)" icon={<WalletIcon />} />
        <StatTile label="Received value" value={`₹${receivedValue.toLocaleString()}`} color="var(--mint)" icon={<CheckCircleIcon />} />
        <StatTile label="Pending value" value={`₹${pendingValue.toLocaleString()}`} color="var(--warning)" icon={<AlertIcon />} />
        <StatTile label="Partners" value={partners} color="#0891b2" icon={<BoxIcon />} />
        <StatTile label="Customers" value={customers} color="#db2777" icon={<UsersIcon />} />
      </StatRow>

      {rows && rows.length > 0 && (
        <div className="chart-grid">
          <div className="panel chart-panel">
            <h2>Received vs. pending</h2>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={44} outerRadius={70} paddingAngle={3} isAnimationActive={false}>
                  <Cell fill="#059669" />
                  <Cell fill={chartColors.warning} />
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: chartColors.grid, fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="panel chart-panel">
            <h2>Invoices by partner</h2>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={byPartner} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 0 }}>
                <CartesianGrid stroke={chartColors.grid} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: chartColors.muted }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: chartColors.muted }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: chartColors.grid, fontSize: 13 }} />
                <Bar dataKey="value" name="Invoices" fill={DASHBOARD_META.pod.color} radius={[0, 4, 4, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
