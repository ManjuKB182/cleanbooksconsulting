import type { ReactNode } from "react";

export function StatRow({ children }: { children: ReactNode }) {
  return <div className="stat-row">{children}</div>;
}

export function StatTile({
  label,
  value,
  sub,
  color = "var(--accent)",
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="stat-tile" style={{ borderTopColor: color }}>
      <div className="stat-tile-head">
        {icon && (
          <span className="stat-icon" style={{ background: `color-mix(in srgb, ${color} 16%, white)`, color }}>
            {icon}
          </span>
        )}
        <span className="stat-label">{label}</span>
      </div>
      <span className="stat-value" style={{ color }}>
        {value}
      </span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  );
}
