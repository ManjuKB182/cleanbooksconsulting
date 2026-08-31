import type { ReactNode } from "react";

export function StatRow({ children }: { children: ReactNode }) {
  return <div className="stat-row">{children}</div>;
}

export function StatTile({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="stat-tile" style={color ? { borderTopColor: color } : undefined}>
      <span className="stat-label">{label}</span>
      <span className="stat-value" style={color ? { color } : undefined}>
        {value}
      </span>
    </div>
  );
}
