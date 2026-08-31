import { DemoNotice } from "../components/DemoBadge";
import { StatRow, StatTile } from "../components/StatTiles";
import { mockReturns } from "./mockData";

const STATUS_PILL: Record<string, string> = {
  approved: "pill-on",
  pending: "pill-off",
  rejected: "pill-critical",
};

export function ReturnsDashboard() {
  const rows = mockReturns;
  const refundValue = rows.reduce((sum, r) => sum + r.refund_amount, 0);
  const pending = rows.filter((r) => r.status === "pending").length;

  return (
    <div>
      <h1>Returns & Chargebacks</h1>
      <DemoNotice dashboardKey="returns" />

      <StatRow>
        <StatTile label="Total returns" value={rows.length} />
        <StatTile label="Refund value" value={`₹${refundValue.toLocaleString()}`} color="var(--warning)" />
        <StatTile label="Pending review" value={pending} />
      </StatRow>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Return</th>
              <th>Order</th>
              <th>SKU</th>
              <th>Reason</th>
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
                <td>₹{row.refund_amount.toLocaleString()}</td>
                <td>
                  <span className={`pill ${STATUS_PILL[row.status]}`}>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
