export function ComingSoon({ title }: { title: string }) {
  return (
    <div>
      <h1>{title}</h1>
      <p className="muted">
        This dashboard is enabled for your account, but its data pipeline isn't built yet — see the
        ingestion/transform stubs in cleanbooks-api for what's left.
      </p>
    </div>
  );
}
