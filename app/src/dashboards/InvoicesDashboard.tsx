import { DemoNotice } from "../components/DemoBadge";
import { StatRow, StatTile } from "../components/StatTiles";
import { mockInvoices } from "./mockData";

const STATUS_PILL: Record<string, string> = {
  paid: "pill-on",
  open: "pill-off",
  overdue: "pill-critical",
};

export function InvoicesDashboard() {
  const rows = mockInvoices;
  const outstanding = rows.filter((r) => r.status !== "paid").reduce((sum, r) => sum + r.amount, 0);
  const overdue = rows.filter((r) => r.status === "overdue").reduce((sum, r) => sum + r.amount, 0);
  const paid = rows.filter((r) => r.status === "paid").reduce((sum, r) => sum + r.amount, 0);

  return (
    <div>
      <h1>Invoice & Payment Ledger</h1>
      <DemoNotice dashboardKey="invoices" />

      <StatRow>
        <StatTile label="Outstanding" value={`₹${outstanding.toLocaleString()}`} color="var(--accent)" />
        <StatTile label="Overdue" value={`₹${overdue.toLocaleString()}`} color="var(--critical)" />
        <StatTile label="Paid" value={`₹${paid.toLocaleString()}`} color="var(--mint)" />
        <StatTile label="Invoices" value={rows.length} />
      </StatRow>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Invoice date</th>
              <th>Due date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.invoice_no}>
                <td>{row.invoice_no}</td>
                <td>{row.customer_name}</td>
                <td>{row.invoice_date}</td>
                <td>{row.due_date}</td>
                <td>₹{row.amount.toLocaleString()}</td>
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
