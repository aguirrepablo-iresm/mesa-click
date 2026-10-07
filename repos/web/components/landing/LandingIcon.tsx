import React from "react";

export type LandingIconName =
  | "bell"
  | "book"
  | "brand"
  | "card"
  | "check"
  | "chevron"
  | "clock"
  | "help"
  | "kitchen"
  | "lock"
  | "menu"
  | "more"
  | "qr"
  | "spark"
  | "table"
  | "users";

const PATHS: Record<LandingIconName, React.ReactNode> = {
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" /><path d="M8 7h8M8 11h6" /></>,
  brand: <path d="M5 3v8a3 3 0 0 0 6 0V3M8 3v18M16 3v18M16 3c4 2 4 8 0 10" />,
  card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.7 2.7 0 1 1 4.4 2.1c-1.1.8-1.9 1.3-1.9 2.9M12 18h.01" /></>,
  kitchen: <><path d="M4 5h16v10H4zM7 15v4M17 15v4M8 9h8" /><path d="M7 3v2M12 3v2M17 3v2" /></>,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
  qr: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M15 14h2v3h-3v4M19 14h2v2M19 19h2v2" /></>,
  spark: <path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5zM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z" />,
  table: <path d="M4 10h16M6 10l-1 10M18 10l1 10M8 10V5h8v5" />,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
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
