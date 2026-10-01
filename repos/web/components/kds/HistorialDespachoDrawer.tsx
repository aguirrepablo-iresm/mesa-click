// repos/web/components/kds/HistorialDespachoDrawer.tsx
"use client";
import React, { useState } from "react";
import { PedidoAPI } from "@/lib/api";

export interface HistorialDespachoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pedidosDespachados: PedidoAPI[];
  mesasMap: Record<string, { numero: number; sector?: string }>;
  onReabrir: (pedidoId: string) => Promise<void>;
}

export function HistorialDespachoDrawer({
  isOpen,
  onClose,
  pedidosDespachados,
  mesasMap,
  onReabrir,
}: HistorialDespachoDrawerProps) {
  const [reabriendoId, setReabriendoId] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleReabrir(pedidoId: string) {
    if (reabriendoId) return;
    try {
      setReabriendoId(pedidoId);
      await onReabrir(pedidoId);
    } finally {
      setReabriendoId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside className="relative flex w-full max-w-md flex-col bg-neutral-900 border-l border-neutral-800 text-white shadow-2xl z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-20 py-16 bg-neutral-950/80">
          <div>
            <h2 className="text-18 font-black tracking-tight text-white flex items-center gap-8">
              <span>📋</span> Historial de Despachos
            </h2>
            <p className="text-12 text-neutral-400 mt-2">
              Últimas comandas despachadas / retiradas de cocina
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-36 w-36 items-center justify-center rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer text-18 font-bold"
            title="Cerrar panel"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-16 space-y-12">
          {pedidosDespachados.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-neutral-400">
              <span className="text-36 mb-8">🍳</span>
              <p className="font-semibold text-15 text-neutral-300">Sin comandas despachadas aún</p>
              <p className="text-12 text-neutral-400 mt-2 max-w-xs">
                A medida que despaches pedidos completados, aparecerán aquí para poder reabrirlos si hubo algún error.
              </p>
            </div>
          ) : (
            pedidosDespachados.map((pedido) => {
              const mesaInfo = mesasMap[pedido.mesa_id];
              const numeroMesa = mesaInfo?.numero ?? "?";
              const sector = mesaInfo?.sector;
              const hora = new Date(pedido.updated_at || pedido.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              const esReabriendo = reabriendoId === pedido.id;

              return (
                <div
                  key={pedido.id}
                  className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-14 space-y-10 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <span className="font-black text-16 text-emerald-400">
                        MESA {numeroMesa}
                      </span>
                      {sector && (
                        <span className="text-11 text-neutral-400">
                          ({sector})
                        </span>
                      )}
                      <span className="rounded bg-neutral-800 px-6 py-1 font-mono text-10 text-neutral-400">
                        #{pedido.id.slice(0, 6)}
                      </span>
                    </div>
                    <span className="text-11 font-mono text-neutral-400">
                      🕒 {hora}
                    </span>
                  </div>

                  {/* Resumen de ítems */}
                  <div className="border-t border-neutral-900 pt-8 space-y-3">
                    {pedido.items && pedido.items.length > 0 ? (
                      pedido.items.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="flex items-center justify-between text-12 text-neutral-300"
                        >
                          <span className="truncate pr-8">
                            <strong className="text-neutral-100 font-mono">{item.cantidad}×</strong>{" "}
                            {item.nombre_articulo || "Artículo"}
                          </span>
                          <span className="shrink-0 text-10 text-emerald-400 font-mono">
                            ✓ Listo
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-12 text-neutral-400 italic">Comanda sin ítems</span>
                    )}
                  </div>

                  {/* Botón Reabrir / Deshacer (US-66) */}
                  <div className="pt-6">
                    <button
                      type="button"
                      onClick={() => handleReabrir(pedido.id)}
                      disabled={esReabriendo}
                      className="w-full min-h-[40px] rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 active:scale-[0.98] font-bold text-12 text-amber-300 transition-all flex items-center justify-center gap-6 cursor-pointer disabled:opacity-50"
                    >
                      {esReabriendo ? (
                        <span>Reabriendo comanda...</span>
                      ) : (
                        <>
                          <span>↩️</span>
                          <span>Reabrir / Devolver a Cocina</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-800 p-16 bg-neutral-950/80 text-center">
          <p className="text-11 text-neutral-400">
            KDS Mesa CLICK · Pantalla dedicada de cocina
          </p>
        </div>
      </aside>
    </div>
  );
}
