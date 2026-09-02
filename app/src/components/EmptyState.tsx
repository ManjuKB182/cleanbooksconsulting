import type { ReactNode } from "react";

export function EmptyState({ icon, title, message, action }: { icon: ReactNode; title: string; message: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">{icon}</span>
      <p className="empty-state-title">{title}</p>
      <p className="empty-state-message">{message}</p>
      {action}
    </div>
  );
}
