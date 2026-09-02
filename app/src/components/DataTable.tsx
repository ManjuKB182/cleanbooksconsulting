import type { ReactNode } from "react";
import type { CSSProperties } from "react";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: "left" | "right";
  render?: (row: T) => ReactNode;
}

/** One table shape for both the "Aggregates" rollup and the "Latest data" raw-row
 * sections — every dashboard feeds it different columns/rows but renders the same way. */
export function DataTable<T>({
  title,
  meta,
  columns,
  rows,
  rowKey,
}: {
  title: string;
  meta?: string;
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
}) {
  return (
    <div className="agg-table-card">
      <div className="agg-table-head">
        <h2>{title}</h2>
        {meta && <span className="muted">{meta}</span>}
      </div>
      <table className="agg-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={col.align === "right" ? { textAlign: "right" } : undefined}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={rowKey(row)} className="stagger-row" style={{ "--row-index": i } as CSSProperties}>
              {columns.map((col) => (
                <td key={col.key} style={col.align === "right" ? { textAlign: "right" } : undefined}>
                  {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="muted">
                No rows in this range.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
