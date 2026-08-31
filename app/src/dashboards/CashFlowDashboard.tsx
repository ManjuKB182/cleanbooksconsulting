import { DemoNotice } from "../components/DemoBadge";
import { StatRow, StatTile } from "../components/StatTiles";
import { mockCashFlow } from "./mockData";

export function CashFlowDashboard() {
  const rows = mockCashFlow;
  const latest = rows[rows.length - 1];
  const totalInflow = rows.reduce((sum, r) => sum + r.inflow, 0);
  const totalOutflow = rows.reduce((sum, r) => sum + r.outflow, 0);

  return (
    <div>
      <h1>Cash Flow Summary</h1>
      <DemoNotice dashboardKey="cash_flow" />

      <StatRow>
        <StatTile label={`Net (${latest.period})`} value={`₹${latest.net.toLocaleString()}`} color="var(--mint)" />
        <StatTile label="Total inflow (4mo)" value={`₹${totalInflow.toLocaleString()}`} color="var(--accent)" />
        <StatTile label="Total outflow (4mo)" value={`₹${totalOutflow.toLocaleString()}`} color="var(--warning)" />
      </StatRow>

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
          </tbody>
        </table>
      </div>
    </div>
  );
}
