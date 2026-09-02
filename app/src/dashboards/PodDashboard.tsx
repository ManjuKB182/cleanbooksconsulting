import { useCallback, useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DataTable } from "../components/DataTable";
import { DashboardHeader } from "../components/DashboardHeader";
import { FilterBar } from "../components/FilterBar";
import { StatRow, StatTile } from "../components/StatTiles";
import { CheckCircleIcon, ClockIcon, DocumentIcon, UsersIcon } from "../components/icons";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import { chartColors } from "../lib/chartColors";
import { downloadCsv } from "../lib/csv";
import { useRefreshable } from "../lib/useRefreshable";
import type { PodStatusRow } from "../lib/types";

interface PartnerAgg {
  partner: string;
  invoices: number;
  value: number;
  received: number;
}

export function PodDashboard() {
  const { session } = useAuth();
  const [rows, setRows] = useState<PodStatusRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [partner, setPartner] = useState("all");

  const load = useCallback(async () => {
    if (!session) return;
    try {
      setRows(await api.podDashboard(session.accessToken));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load POD data.");
      throw err;
    }
  }, [session]);

  useEffect(() => {
    load();
  }, [load]);

  const { refreshing, refresh } = useRefreshable(load);

  const partners = useMemo(() => Array.from(new Set((rows ?? []).map((r) => r.partner).filter(Boolean))).sort(), [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (rows ?? []).filter((r) => {
      if (partner !== "all" && r.partner !== partner) return false;
      if (!q) return true;
      return r.invoice_no.toLowerCase().includes(q) || r.customer_name.toLowerCase().includes(q) || r.sku.toLowerCase().includes(q);
    });
  }, [rows, search, partner]);

  const received = filtered.filter((r) => r.pod_received).length;
  const pending = filtered.length - received;
  const completion = filtered.length > 0 ? Math.round((received / filtered.length) * 100) : 0;
  const customers = new Set(filtered.map((r) => r.customer_name).filter(Boolean)).size;

  const breakdown = useMemo(
    () => [
      { name: "Received", value: received },
      { name: "Pending", value: pending },
    ],
    [received, pending]
  );

  const byPartner = useMemo(() => {
    const map = new Map<string, PartnerAgg>();
    for (const row of filtered) {
      const key = row.partner || "Unknown";
      const agg = map.get(key) ?? { partner: key, invoices: 0, value: 0, received: 0 };
      agg.invoices += 1;
      agg.value += row.invoice_value;
      if (row.pod_received) agg.received += 1;
      map.set(key, agg);
    }
    return Array.from(map.values()).sort((a, b) => b.value - a.value);
  }, [filtered]);

  const latest = filtered.slice(0, 8);

  return (
    <div>
      <DashboardHeader
        title="POD & Delivery Status"
        meta={`${filtered.length.toLocaleString()} invoices · proof-of-delivery tracking`}
        onExport={() =>
          downloadCsv(
            "pod-status.csv",
            [
              { key: "invoice_no", header: "Invoice" },
              { key: "customer_name", header: "Customer" },
              { key: "partner", header: "Partner" },
              { key: "sku", header: "SKU" },
              { key: "invoice_value", header: "Value" },
              { key: "lr_number", header: "LR number" },
              { key: "pod_received", header: "POD received", value: (r) => (r.pod_received ? "Yes" : "No") },
            ],
            filtered
          )
        }
        onRefresh={refresh}
        refreshing={refreshing}
      />

      {error && <p className="error-text">{error}</p>}

      {rows && rows.length === 0 && (
        <p className="muted" style={{ margin: "16px 0" }}>
          No POD data yet — nothing has synced for this client so far.
        </p>
      )}

      {rows && rows.length > 0 && (
        <>
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search invoice, customer, SKU"
            select={{ label: "Partner", value: partner, options: partners, onChange: setPartner }}
          />

          <StatRow>
            <StatTile label="Total invoices" value={filtered.length} icon={<DocumentIcon />} />
            <StatTile label="POD received" value={received} sub={`${completion}% complete`} icon={<CheckCircleIcon />} />
            <StatTile
              label="POD pending"
              value={pending}
              icon={<ClockIcon />}
              color={pending > 0 ? "var(--warning)" : undefined}
            />
            <StatTile label="Customers" value={customers} icon={<UsersIcon />} />
          </StatRow>

          <DataTable
            title="By partner"
            meta={`${byPartner.length} logistics partners`}
            columns={[
              { key: "partner", header: "Partner" },
              { key: "invoices", header: "Invoices", align: "right" },
              { key: "value", header: "Value", align: "right", render: (r) => `₹${r.value.toLocaleString()}` },
              {
                key: "received",
                header: "POD received",
                align: "right",
                render: (r) => `${r.received}/${r.invoices} (${Math.round((r.received / r.invoices) * 100)}%)`,
              },
            ]}
            rows={byPartner}
            rowKey={(r) => r.partner}
          />

          <div className="chart-grid">
            <div className="panel chart-panel">
              <h2>Received vs. pending</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={44} outerRadius={70} paddingAngle={3} isAnimationActive={false}>
                    <Cell fill={chartColors.mint} />
                    <Cell fill={chartColors.warning} />
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, borderColor: chartColors.grid, fontSize: 13 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="panel chart-panel">
              <h2>Value by partner</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={byPartner.slice(0, 6)} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={chartColors.grid} vertical={false} />
                  <XAxis dataKey="partner" tick={{ fontSize: 11, fill: chartColors.muted }} axisLine={{ stroke: chartColors.grid }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: chartColors.muted }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: 8, borderColor: chartColors.grid, fontSize: 13 }} />
                  <Bar isAnimationActive={false} dataKey="value" name="Value" fill={chartColors.accent} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <DataTable
            title="Latest data"
            meta={`Showing ${latest.length} of ${filtered.length.toLocaleString()}`}
            columns={[
              { key: "invoice_no", header: "Invoice" },
              { key: "customer_name", header: "Customer" },
              { key: "partner", header: "Partner" },
              { key: "invoice_value", header: "Value", align: "right", render: (r) => `₹${r.invoice_value.toLocaleString()}` },
              {
                key: "pod_received",
                header: "POD",
                render: (r) => <span className={`pill ${r.pod_received ? "pill-on" : "pill-off"}`}>{r.pod_received ? "Received" : "Pending"}</span>,
              },
            ]}
            rows={latest}
            rowKey={(r) => r.invoice_no}
          />
        </>
      )}
    </div>
  );
}
