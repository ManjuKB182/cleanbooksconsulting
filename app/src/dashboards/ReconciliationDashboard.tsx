import { DemoNotice } from "../components/DemoBadge";
import { StatRow, StatTile } from "../components/StatTiles";
import { mockReconciliation } from "./mockData";

export function ReconciliationDashboard() {
  const rows = mockReconciliation;
  const gross = rows.reduce((sum, r) => sum + r.gross_amount, 0);
  const fees = rows.reduce((sum, r) => sum + r.fees, 0);
  const net = rows.reduce((sum, r) => sum + r.net_amount, 0);
  const pending = rows.filter((r) => r.status === "pending").length;

  return (
    <div>
      <h1>Marketplace Reconciliation</h1>
      <DemoNotice dashboardKey="reconciliation" />

      <StatRow>
        <StatTile label="Gross sales" value={`₹${gross.toLocaleString()}`} />
        <StatTile label="Marketplace fees" value={`₹${fees.toLocaleString()}`} color="var(--warning)" />
        <StatTile label="Net payable" value={`₹${net.toLocaleString()}`} color="var(--mint)" />
        <StatTile label="Orders pending" value={pending} />
      </StatRow>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Marketplace</th>
              <th>Period</th>
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
                <td>{row.period}</td>
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
