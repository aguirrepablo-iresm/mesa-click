"use client";

import { useState, useMemo } from "react";
import ComensalIcon from "@/components/menu/ComensalIcon";
import type { EstadoPedido, PedidoSesion } from "@/app/mesa/[token]/page";
import { agruparPorComensal } from "@/lib/desgloseCuenta";

interface GuestOrderStatusViewProps {
  mesaNumero: number;
  sector?: string;
  pedidos: PedidoSesion[];
  estadoPedido: EstadoPedido;
  cuentaSolicitada: boolean;
  pagoHabilitado?: boolean;
  mercadopagoHabilitado?: boolean;
  comensalId?: string;
  comensalNombre?: string;
  onVolverCarta: () => void;
  onPedirCuenta: () => Promise<void> | void;
  onPagarMercadoPago?: () => Promise<void> | void;
  pagandoMP?: boolean;
  pagoExitoso?: boolean;
  pagoError?: boolean;
  todosListos?: boolean;
  yaCalificado?: boolean;
  onCalificar?: () => void;
  formatPrice?: (price: number) => string;
}

export default function GuestOrderStatusView({
  mesaNumero,
  sector,
  pedidos,
  estadoPedido,
  cuentaSolicitada,
  pagoHabilitado = false,
  mercadopagoHabilitado = false,
  comensalId,
  comensalNombre,
  onVolverCarta,
  onPedirCuenta,
  onPagarMercadoPago,
  pagandoMP = false,
  pagoExitoso = false,
  pagoError = false,
  todosListos = false,
  yaCalificado = false,
  onCalificar,
  formatPrice = (p) => `$ ${p.toLocaleString("es-AR")}`,
}: GuestOrderStatusViewProps) {
  const [solicitandoCuenta, setSolicitandoCuenta] = useState(false);
  const [verDesglose, setVerDesglose] = useState(false);

  const todosLosItems = useMemo(
    () => pedidos.flatMap((p) => p.items),
    [pedidos]
  );
  const totalMesa = useMemo(
    () => todosLosItems.reduce((acc, i) => acc + i.precio * i.cantidad, 0),
    [todosLosItems]
  );

  const comandaId = useMemo(() => {
    const ultimo = pedidos[pedidos.length - 1];
    return ultimo ? ultimo.id.slice(-4).toUpperCase() : `${mesaNumero}A1`;
  }, [pedidos, mesaNumero]);

  // Stepper state
  const esListo = estadoPedido === "listo" || todosListos;
  const esPreparando = estadoPedido === "preparando" || esListo;

  const gruposComensales = useMemo(() => {
    const nombres = new Map<string, string>();
    if (comensalId?.trim() && comensalNombre?.trim()) {
      nombres.set(comensalId.trim(), comensalNombre.trim());
    }
    return agruparPorComensal(todosLosItems, nombres);
  }, [comensalId, comensalNombre, todosLosItems]);

  const handleSolicitarCuenta = async () => {
    setSolicitandoCuenta(true);
    try {
      await onPedirCuenta();
    } finally {
      setSolicitandoCuenta(false);
    }
  };

  return (
    <section className="order-status">
      <span className="status-check">
        <ComensalIcon name={esListo ? "spark" : "check"} size={32} />
      </span>

      <span className="table-chip">
        <ComensalIcon name="table" size={14} /> Comanda #{comandaId} · Mesa {mesaNumero}
        {sector ? ` · ${sector}` : ""}
      </span>

      <h1>
        {esListo
          ? "¡Tu pedido está listo!"
          : esPreparando
          ? "Tu pedido ya está en cocina"
          : "Pedido recibido"}
      </h1>

      <p>
        {esListo
          ? "El equipo de salón te lo llevará en breve a la mesa. ¡Que lo disfrutes!"
          : "Te avisamos cuando esté listo. Mientras tanto, podés seguir agregando lo que quieras."}
      </p>

      {/* Stepper de estado */}
      <div className="order-stepper">
        <div className="done">
          <i>
            <ComensalIcon name="check" size={13} />
          </i>
          <span>
            <strong>Pedido recibido</strong>
            <small>Comanda confirmada</small>
          </span>
        </div>

        <div className={esListo ? "done" : esPreparando ? "active" : ""}>
          <i>
            {esListo ? (
              <ComensalIcon name="check" size={13} />
            ) : esPreparando ? (
              <span className="block w-2.5 h-2.5 rounded-full bg-[var(--green)]" />
            ) : null}
          </i>
          <span>
            <strong>En preparación</strong>
            <small>
              {esPreparando ? "Cocina comenzó tu pedido" : "En espera de cocina"}
            </small>
          </span>
        </div>

        <div className={esListo ? "active" : ""}>
          <i>
            {esListo ? (
              <span className="block w-2.5 h-2.5 rounded-full bg-[var(--green)]" />
            ) : null}
          </i>
          <span>
            <strong>Listo para servir</strong>
            <small>{esListo ? "¡Listo en mesa!" : "Te avisaremos"}</small>
          </span>
        </div>
      </div>

      {/* Notificaciones de Pago */}
      {pagoExitoso && (
        <div className="w-full mb-16 p-14 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-12 text-left font-medium">
          ✅ Pago digital confirmado con éxito. ¡Gracias por tu visita!
        </div>
      )}

      {pagoError && (
        <div className="w-full mb-16 p-14 rounded-xl border border-red-300 bg-red-50 text-red-800 text-12 text-left font-medium">
          ⚠️ El pago no se pudo completar. Podés reintentar o solicitar el cobro al mozo.
        </div>
      )}

      {/* Resumen acumulado */}
      <div className="order-breakdown-card">
        <div className="flex items-center justify-between pb-8 border-b border-[var(--line)]">
          <div>
            <span className="text-11 uppercase font-bold text-[var(--muted)]">Consumo acumulado</span>
            <p className="text-15 font-bold text-[var(--ink)] mt-1">{formatPrice(totalMesa)}</p>
          </div>
          <button
            type="button"
            className="text-11 font-semibold text-[var(--brand)] underline underline-offset-2"
            onClick={() => setVerDesglose((v) => !v)}
          >
            {verDesglose ? "Ocultar detalle" : `Ver detalle (${todosLosItems.length})`}
          </button>
        </div>

        {verDesglose && (
          <div className="mt-12 space-y-12">
            {gruposComensales.map((grupo) => (
              <div key={grupo.id} className="pt-8 first:pt-0">
                <p className="text-11 font-bold text-[var(--ink)] flex items-center gap-6">
                  <span className="w-18 h-18 rounded-full bg-[var(--brand-soft)] text-[var(--brand)] text-9 grid place-items-center font-bold">
                    {grupo.nombre.slice(0, 1).toUpperCase()}
                  </span>
                  {grupo.nombre}
                  <span className="ml-auto text-11 font-semibold text-[var(--muted)]">
                    {formatPrice(grupo.subtotal)}
                  </span>
                </p>
                <div className="mt-4 pl-24 space-y-4">
                  {grupo.items.map((i) => (
                    <div key={i.id} className="text-11 flex justify-between text-[var(--muted)]">
                      <span>{i.cantidad}× {i.nombre}</span>
                      <span>{formatPrice(i.precio * i.cantidad)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botones de acción principales */}
      <div className="w-full space-y-10">
        <button
          type="button"
          className="guest-primary"
          onClick={onVolverCarta}
          disabled={cuentaSolicitada}
        >
          <ComensalIcon name="book" size={18} /> Pedir algo más
        </button>

        {/* Mercado Pago si el pago fue habilitado por el mozo */}
        {cuentaSolicitada && pagoHabilitado && mercadopagoHabilitado && onPagarMercadoPago && !pagoExitoso && (
          <button
            type="button"
            className="guest-primary"
            style={{ background: "#009ee3", borderColor: "#009ee3" }}
            onClick={() => onPagarMercadoPago()}
            disabled={pagandoMP}
          >
            <ComensalIcon name="card" size={18} />
            {pagandoMP ? "Conectando Mercado Pago..." : "Pagar con Mercado Pago"}
          </button>
        )}

        {/* Botón para pedir la cuenta al mozo */}
        {!cuentaSolicitada ? (
          <button
            type="button"
            className="guest-secondary"
            onClick={handleSolicitarCuenta}
            disabled={solicitandoCuenta}
          >
            <ComensalIcon name="card" size={18} />
            {solicitandoCuenta ? "Solicitando..." : "Pedir la cuenta"}
          </button>
        ) : (
          <div className="p-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-12 font-medium text-center">
            🔔 Cuenta solicitada al salón. El mozo se acercará con la cuenta.
          </div>
        )}

        {/* Smart Google Review Funnel */}
        {esListo && !yaCalificado && onCalificar && (
          <button
            type="button"
            className="guest-secondary border-dashed"
            onClick={onCalificar}
          >
            <ComensalIcon name="spark" size={16} /> Calificar experiencia
          </button>
        )}
      </div>
    </section>
  );
}
