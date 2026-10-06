import React from "react";

export type LandingIconName = "bell" | "check" | "chevron" | "kitchen" | "qr" | "clock" | "table";

const PATHS: Record<LandingIconName, React.ReactNode> = {
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  kitchen: <><path d="M4 5h16v10H4zM7 15v4M17 15v4M8 9h8" /><path d="M7 3v2M12 3v2M17 3v2" /></>,
  qr: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M15 14h2v3h-3v4M19 14h2v2M19 19h2v2" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  table: <path d="M4 10h16M6 10l-1 10M18 10l1 10M8 10V5h8v5" />,
};

export default function LandingIcon({ name, size = 20, className = "" }: { name: LandingIconName; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
