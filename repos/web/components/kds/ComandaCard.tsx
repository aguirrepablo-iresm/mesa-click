// repos/web/components/kds/ComandaCard.tsx
"use client";
import React, { useState, useEffect } from "react";
import { PedidoAPI, PedidoItemAPI } from "@/lib/api";

export interface ComandaCardProps {
  pedido: PedidoAPI;
  numeroMesa: number;
  nombreSector?: string;
  onCambiarEstadoItem: (itemId: string, nuevoEstado: "pendiente" | "preparando" | "listo") => Promise<void>;
  onComandaCompletaLista: (pedidoId: string) => Promise<void>;
  onDespacharComanda: (pedidoId: string) => Promise<void>;
}

export function ComandaCard({
  pedido,
  numeroMesa,
  nombreSector,
  onCambiarEstadoItem,
  onComandaCompletaLista,
  onDespacharComanda,
}: ComandaCardProps) {
  const [minutos, setMinutos] = useState<number>(0);
  const [segundosTexto, setSegundosTexto] = useState<string>("00:00");
  const [cargandoAccion, setCargandoAccion] = useState<boolean>(false);
  const [cargandoItemId, setCargandoItemId] = useState<string | null>(null);

  // Temporizador en vivo que calcula la antigüedad de la orden
  useEffect(() => {
    function calcularTiempo() {
      const fechaCreacion = new Date(pedido.created_at).getTime();
      const ahora = Date.now();
      const difSegundos = Math.max(0, Math.floor((ahora - fechaCreacion) / 1000));
      const mins = Math.floor(difSegundos / 60);
      const secs = difSegundos % 60;

      setMinutos(mins);
      setSegundosTexto(`${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
    }

    calcularTiempo();
    const interval = setInterval(calcularTiempo, 1000);
    return () => clearInterval(interval);
  }, [pedido.created_at]);

  // Código cromático US-65: Verde (<10m), Amarillo (10-20m), Rojo (>20m)
  const colorTemporizador =
    minutos < 10
      ? {
          badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
          cardBorder: "border-emerald-500/40 hover:border-emerald-500/70",
          dot: "bg-emerald-400",
        }
      : minutos < 20
      ? {
          badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          cardBorder: "border-amber-500/50 hover:border-amber-500/80",
          dot: "bg-amber-400",
        }
      : {
          badge: "bg-red-500/25 text-red-300 border-red-500/60 animate-pulse",
          cardBorder: "border-red-500/70 hover:border-red-500 shadow-red-950/40 shadow-lg",
          dot: "bg-red-500",
        };

  const items = pedido.items || [];
  const todosListos = items.length > 0 && items.every((i) => i.estado === "listo");
  const estadoPedido = pedido.estado;

  // Manejo de tap táctil por ítem (US-66)
  async function handleItemTap(item: PedidoItemAPI) {
    if (cargandoItemId || cargandoAccion) return;
    const estadoActual = item.estado || "pendiente";

    // Rotación táctil de estados: pendiente -> preparando -> listo -> pendiente
    let nuevoEstado: "pendiente" | "preparando" | "listo" = "preparando";
    if (estadoActual === "pendiente") nuevoEstado = "preparando";
    else if (estadoActual === "preparando") nuevoEstado = "listo";
    else if (estadoActual === "listo") nuevoEstado = "pendiente";

    try {
      setCargandoItemId(item.id);
      await onCambiarEstadoItem(item.id, nuevoEstado);
    } finally {
      setCargandoItemId(null);
    }
  }

  async function handleComandaCompleta() {
    if (cargandoAccion) return;
    try {
      setCargandoAccion(true);
      await onComandaCompletaLista(pedido.id);
    } finally {
      setCargandoAccion(false);
    }
  }

  async function handleDespachar() {
    if (cargandoAccion) return;
    try {
      setCargandoAccion(true);
      await onDespacharComanda(pedido.id);
    } finally {
      setCargandoAccion(false);
    }
  }

  return (
    <article
      className={`flex flex-col rounded-xl border-2 bg-neutral-900 transition-all duration-200 select-none shadow-md ${colorTemporizador.cardBorder} ${
        todosListos ? "ring-2 ring-emerald-500/40" : ""
      }`}
    >
      {/* HEADER DE COMANDA */}
      <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/90 px-14 py-10">
        <div className="flex items-center gap-10">
          <div className="flex flex-col">
            <span className="text-20 font-black tracking-tight text-white leading-none">
              MESA {numeroMesa}
            </span>
            {nombreSector && (
              <span className="text-11 font-medium text-neutral-400 mt-2">
                {nombreSector}
              </span>
            )}
          </div>
          <span className="rounded bg-neutral-800 px-6 py-2 text-10 font-mono text-neutral-300">
            #{pedido.id.slice(0, 6)}
          </span>
        </div>

        {/* TEMPORIZADOR CROMÁTICO */}
        <div
          className={`flex items-center gap-6 rounded-lg border px-10 py-4 font-mono text-14 font-bold ${colorTemporizador.badge}`}
          title="Tiempo transcurrido desde el pedido"
        >
          <span className={`inline-block h-8 w-8 rounded-full ${colorTemporizador.dot}`} />
          <span>{segundosTexto}</span>
        </div>
      </div>

      {/* LISTA DE ÍTEMS CON TAP TÁCTIL */}
      <div className="flex-1 space-y-6 p-12 overflow-y-auto max-h-[360px]">
        {items.map((item) => {
          const est = item.estado || "pendiente";
          const estaListo = est === "listo";
          const estaPreparando = est === "preparando";
          const esItemCargando = cargandoItemId === item.id;

          return (
            <div
              key={item.id}
              onClick={() => handleItemTap(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleItemTap(item);
                }
              }}
              className={`group flex items-start gap-10 rounded-lg p-10 transition-all active:scale-[0.98] cursor-pointer min-h-[52px] border ${
                estaListo
                  ? "bg-emerald-950/20 border-emerald-900/40 text-neutral-400"
                  : estaPreparando
                  ? "bg-amber-950/20 border-amber-500/40 text-neutral-100"
                  : "bg-neutral-800/60 border-neutral-700/60 hover:bg-neutral-800 text-neutral-100"
              }`}
            >
              {/* CHECK / INDICADOR DE ESTADO */}
              <div
                className={`mt-1 flex h-24 w-24 shrink-0 items-center justify-center rounded-md border font-bold text-12 transition-colors ${
                  estaListo
                    ? "border-emerald-500 bg-emerald-500 text-neutral-950"
                    : estaPreparando
                    ? "border-amber-400 bg-amber-400/20 text-amber-300"
                    : "border-neutral-600 bg-neutral-900 text-transparent group-hover:border-neutral-400"
                }`}
              >
                {estaListo ? "✓" : estaPreparando ? "⏱" : "○"}
              </div>

              {/* DETALLE DEL ÍTEM */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-6">
                  <div className="flex items-baseline gap-6">
                    <span className="font-mono text-16 font-extrabold text-white">
                      {item.cantidad}×
                    </span>
                    <span
                      className={`text-14 font-bold ${
                        estaListo ? "line-through text-neutral-400" : "text-white"
                      }`}
                    >
                      {item.nombre_articulo || "Artículo"}
                    </span>
                  </div>

                  <span
                    className={`shrink-0 rounded px-6 py-1 text-10 font-bold uppercase tracking-wider ${
                      estaListo
                        ? "bg-emerald-500/20 text-emerald-400"
                        : estaPreparando
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-neutral-700 text-neutral-300"
                    }`}
                  >
                    {esItemCargando ? "..." : est}
                  </span>
                </div>

                {/* VARIANTES / OPCIONES */}
                {item.variantes && item.variantes.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-4">
                    {item.variantes.map((v) => (
                      <span
                        key={v.variante_id}
                        className="rounded bg-neutral-900 px-6 py-2 text-11 font-medium text-amber-200/90 border border-neutral-700"
                      >
                        + {v.nombre}
                      </span>
                    ))}
                  </div>
                )}

                {/* NOTAS DEL COMENSAL / ALERTA DE COCINA */}
                {item.notas && item.notas.trim() !== "" && (
                  <div className="mt-4 flex items-center gap-4 rounded bg-amber-950/40 px-6 py-2 border border-amber-700/50 text-amber-200 text-11 font-medium">
                    <span className="font-bold">⚠️ Nota:</span>
                    <span>{item.notas}</span>
                  </div>
                )}

                {/* COMENSAL ETIQUETA */}
                {item.comensal_nombre && (
                  <span className="mt-4 inline-block text-10 text-neutral-400 font-mono">
                    👤 {item.comensal_nombre}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER CON BOTONES TÁCTILES RÁPIDOS (US-66) */}
      <div className="border-t border-neutral-800 bg-neutral-950/70 p-10 flex gap-8">
        {!todosListos && estadoPedido !== "listo" ? (
          <button
            type="button"
            onClick={handleComandaCompleta}
            disabled={cargandoAccion}
            className="flex-1 min-h-[44px] rounded-lg bg-amber-600 hover:bg-amber-500 active:scale-[0.98] font-bold text-13 text-neutral-950 transition-all flex items-center justify-center gap-6 shadow-sm cursor-pointer disabled:opacity-50"
          >
            {cargandoAccion ? (
              <span>Actualizando...</span>
            ) : (
              <>
                <span>✓</span>
                <span>Comanda Completa Lista</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleDespachar}
            disabled={cargandoAccion}
            className="flex-1 min-h-[44px] rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] font-black text-13 text-neutral-950 transition-all flex items-center justify-center gap-6 shadow-md cursor-pointer disabled:opacity-50 animate-pulse-slow"
          >
            {cargandoAccion ? (
              <span>Despachando...</span>
            ) : (
              <>
                <span>🛎️</span>
                <span>Despachar / Retirar</span>
              </>
            )}
          </button>
        )}
      </div>
    </article>
  );
}
