import type { ReactNode } from "react";

export function StatRow({ children }: { children: ReactNode }) {
  return <div className="stat-row">{children}</div>;
}

export function StatTile({
  label,
  value,
  unit,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  color?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="stat-tile">
      <div className="stat-tile-head">
        {icon && <span className="stat-icon">{icon}</span>}
        <span className="stat-label">{label}</span>
      </div>
      <span className="stat-value" style={color ? { color } : undefined}>
        {value}
        {unit && <span className="unit">{unit}</span>}
      </span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  );
}
