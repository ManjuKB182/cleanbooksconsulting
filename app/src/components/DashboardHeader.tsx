import { DownloadIcon, RefreshIcon } from "./icons";

/** The "Top" block every dashboard starts with: title + meta on the left,
 * Export and Refresh actions on the right. Demo dashboards pass `demo` to
 * fold a small pill next to the title instead of a separate notice banner. */
export function DashboardHeader({
  title,
  meta,
  demo,
  onExport,
  onRefresh,
  refreshing,
}: {
  title: string;
  meta: string;
  demo?: boolean;
  onExport: () => void;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <div className="page-header dash-header">
      <div className="dash-header-title">
        <div className="dash-header-title-row">
          <h1>{title}</h1>
          {demo && <span className="pill pill-demo">Demo data</span>}
        </div>
        <p className="muted">{meta}</p>
      </div>
      <div className="dash-header-actions">
        <button type="button" className="btn-ghost" onClick={onExport}>
          <DownloadIcon width={15} height={15} />
          Export
        </button>
        <button type="button" className="btn-primary" onClick={onRefresh} disabled={refreshing}>
          <RefreshIcon width={15} height={15} className={refreshing ? "spin" : undefined} />
          Refresh
        </button>
      </div>
    </div>
  );
}
