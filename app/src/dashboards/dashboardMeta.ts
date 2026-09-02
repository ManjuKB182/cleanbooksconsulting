import { BoxIcon, CycleIcon, DocumentIcon, ReceiptIcon, TagIcon, WalletIcon } from "../components/icons";
import type { IconComponent } from "../components/icons";

// One place tying each dashboard's catalog key to its route and sidebar icon.
export interface DashboardMeta {
  route: string;
}

export const DASHBOARD_META: Record<string, DashboardMeta> = {
  pod: { route: "/dashboards/pod" },
  reconciliation: { route: "/dashboards/reconciliation" },
  invoices: { route: "/dashboards/invoices" },
  invoice_lifecycle: { route: "/dashboards/invoice-lifecycle" },
  returns: { route: "/dashboards/returns" },
  cash_flow: { route: "/dashboards/cash-flow" },
};

export const DASHBOARD_ICON: Record<string, IconComponent> = {
  pod: DocumentIcon,
  reconciliation: TagIcon,
  invoices: ReceiptIcon,
  invoice_lifecycle: CycleIcon,
  returns: BoxIcon,
  cash_flow: WalletIcon,
};
