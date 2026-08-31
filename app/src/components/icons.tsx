// Minimal line-icon set for KPI tiles. 20x20, stroke=currentColor, no fill — kept
// deliberately small (one file, ~10 icons) rather than pulling in an icon library.
import type { SVGProps } from "react";

const base = {
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function DocumentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M6 2.5h6l3 3v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-14a1 1 0 0 1 1-1Z" />
      <path d="M12 2.5v3h3" />
      <path d="M7.2 11h5.6M7.2 13.6h5.6" />
    </svg>
  );
}

export function CheckCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="10" r="7.3" />
      <path d="M7 10.2l2 2 4-4.4" />
    </svg>
  );
}

export function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="10" r="7.3" />
      <path d="M10 6v4.3l3 1.8" />
    </svg>
  );
}

export function AlertIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M10 3 2.5 16.2h15L10 3Z" />
      <path d="M10 8.4v3.4" />
      <circle cx="10" cy="14.2" r="0.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PercentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 15.5 15.5 4.5" />
      <circle cx="6" cy="6" r="2" />
      <circle cx="14" cy="14" r="2" />
    </svg>
  );
}

export function UsersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="7.3" cy="7" r="2.6" />
      <path d="M2.5 16.5c.6-2.8 2.4-4.2 4.8-4.2s4.2 1.4 4.8 4.2" />
      <circle cx="13.8" cy="7.6" r="2.1" />
      <path d="M13 12.6c1.9.3 3.2 1.7 3.7 3.9" />
    </svg>
  );
}

export function BoxIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M10 2.6 17 6.3v7.4L10 17.4l-7-3.7V6.3L10 2.6Z" />
      <path d="M3.3 6.4 10 10l6.7-3.6M10 10v7.4" />
    </svg>
  );
}

export function TrendingUpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 13.5 8 8l3 3 6.5-6.5" />
      <path d="M13.8 4h3.7v3.7" />
    </svg>
  );
}

export function TagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M10.5 2.5H16a1 1 0 0 1 1 1v5.5a1 1 0 0 1-.3.7l-7.5 7.5a1 1 0 0 1-1.4 0l-6-6a1 1 0 0 1 0-1.4L9.3 2.8a1 1 0 0 1 .7-.3Z" />
      <circle cx="13.2" cy="6.8" r="1.1" />
    </svg>
  );
}

export function WalletIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 5.8A1.8 1.8 0 0 1 4.3 4h9.4a1.8 1.8 0 0 1 1.8 1.8V6H4.3a1.8 1.8 0 0 0 0 3.6H16v5.6a1.8 1.8 0 0 1-1.8 1.8H4.3a1.8 1.8 0 0 1-1.8-1.8V5.8Z" />
      <path d="M13.3 11.3h1.2" />
    </svg>
  );
}

export function ReceiptIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5 2.6h10v14.8l-2-1.3-1.5 1.3-1.5-1.3-1.5 1.3L7 16.1l-2 1.3V2.6Z" />
      <path d="M7.3 6.5h5.4M7.3 9.3h5.4M7.3 12.1h3.4" />
    </svg>
  );
}
