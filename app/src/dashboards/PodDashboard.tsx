import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { StatRow, StatTile } from "../components/StatTiles";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { PodStatusRow } from "../lib/types";

export function PodDashboard() {
  const { session } = useAuth();
  const [rows, setRows] = useState<PodStatusRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const isStaffAdmin = session?.role === "staff_admin";

  useEffect(() => {
    if (!session || isStaffAdmin) return;
    api
      .podDashboard(session.accessToken)
      .then(setRows)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load POD data."));
  }, [session, isStaffAdmin]);

  if (isStaffAdmin) return <Navigate to="/dashboards" replace />;

  const filtered = rows?.filter((row) => {
    const haystack = `${row.invoice_no} ${row.customer_name} ${row.partner} ${row.sku} ${row.lr_number}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const received = rows?.filter((r) => r.pod_received).length ?? 0;
  const pending = (rows?.length ?? 0) - received;

  return (
    <div>
      <h1>POD & Delivery Status</h1>
      {error && <p className="error-text">{error}</p>}

      <StatRow>
        <StatTile label="Total invoices" value={rows?.length ?? "—"} />
        <StatTile label="POD received" value={rows ? received : "—"} color="var(--mint)" />
        <StatTile label="POD pending" value={rows ? pending : "—"} color="var(--warning)" />
      </StatRow>

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
          </tbody>
        </table>
      </div>
    </div>
  );
}
