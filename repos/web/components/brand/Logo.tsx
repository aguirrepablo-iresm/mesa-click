import React from "react";

/**
 * Marca Mesa CLICK — "mesa cenital" (docs/diseño, concepto E).
 * Monocromática: hereda el color con `currentColor`.
 */
export default function Logo({
  className = "w-28 h-28",
  title = "Mesa CLICK",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      role="img"
      aria-label={title}
    >
      <rect x="16" y="16" width="68" height="68" rx="16" stroke="currentColor" strokeWidth="10" />
      <circle cx="50" cy="33" r="5.5" fill="currentColor" />
      <circle cx="67" cy="50" r="5.5" fill="currentColor" />
      <circle cx="50" cy="67" r="5.5" fill="currentColor" />
      <circle cx="33" cy="50" r="5.5" fill="currentColor" />
    </svg>
  );
}

/** Logo + palabra, para cabeceras. */
export function Wordmark({
  className = "",
  markClassName = "w-24 h-24",
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-8 ${className}`}>
      <Logo className={markClassName} />
      <span className="text-16 font-bold tracking-tight uppercase">Mesa CLICK</span>
    </span>
  );
}
