import React from "react";

export interface ProgressProps {
  valor: number;
  max: number;
  etiqueta?: string;
  tono?: "default" | "warning" | "success";
  className?: string;
}

export function Progress({
  valor,
  max,
  etiqueta,
  tono = "default",
  className = "",
}: ProgressProps) {
  const porcentaje = max > 0 ? Math.min(100, Math.max(0, (valor / max) * 100)) : 0;

  const barColor =
    tono === "success"
      ? "bg-success"
      : tono === "warning"
      ? "bg-deep-forest"
      : "bg-ash-graphite";

  return (
    <div className={`w-full ${className}`}>
      {etiqueta && (
        <div className="flex justify-between items-center mb-6 text-12 font-medium text-ash-graphite">
          <span>{etiqueta}</span>
          <span className="font-mono text-11 text-sage-green">
            {valor}/{max}
          </span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={valor}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={etiqueta || "Progreso de cuota"}
        className="w-full bg-concrete h-[6px] rounded-full overflow-hidden relative"
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ease-in-out ${barColor}`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  );
}

export default Progress;

