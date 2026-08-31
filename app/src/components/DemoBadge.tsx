export function DemoNotice({ dashboardKey }: { dashboardKey: string }) {
  return (
    <p className="demo-notice">
      <span className="pill pill-demo">Demo data</span>
      This dashboard's ingestion pipeline isn't connected yet — these rows are illustrative. Real data
      appears once a PDF parser exists for it (
      <code>cleanbooks-api/ingestion/transform/{dashboardKey}.py</code>).
    </p>
  );
}
