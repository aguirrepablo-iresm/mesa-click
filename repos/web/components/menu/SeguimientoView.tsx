import { useState } from "react";
import type { CartItem, EstadoPedido } from "@/app/mesa/[token]/page";
import BrandHeader from "./BrandHeader";
import type { MesaBranding } from "./BrandHeader";

interface Props {
  branding: MesaBranding;
  items: CartItem[];
  estadoPedido: EstadoPedido;
  todosListos: boolean;
  cuentaSolicitada: boolean;
  mesa: number;
  onAgregarMas: () => void;
  onPedirCuenta: () => Promise<void> | void;
}

const PASOS: EstadoPedido[] = ['recibido', 'preparando', 'listo'];

const PASO_LABELS: Record<EstadoPedido, string> = {
  recibido: 'Pedido recibido',
  preparando: 'En preparación',
  listo: '¡Listo para retirar!',
  cerrado: 'Pedido finalizado',
};

const DEMORA_LABELS: Record<EstadoPedido, string> = {
  recibido: 'Estimado: ~15 min',
  preparando: 'Estimado: ~8 min',
  listo: '¡Tu pedido está listo!',
  cerrado: 'Mesa cerrada',
};

export default function SeguimientoView({
  branding,
  items,
  estadoPedido,
  todosListos,
  cuentaSolicitada,
  mesa,
  onAgregarMas,
  onPedirCuenta,
}: Props) {
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [solicitandoCuenta, setSolicitandoCuenta] = useState(false);
  const total = items.reduce((n, i) => n + i.precio * i.cantidad, 0);
  const pasoActual = PASOS.indexOf(estadoPedido);

  const confirmarSolicitudCuenta = async () => {
    setSolicitandoCuenta(true);
    try {
      await onPedirCuenta();
      setMostrarConfirmacion(false);
    } catch {
      // El flujo que invoca la API muestra el error al comensal.
    } finally {
      setSolicitandoCuenta(false);
    }
  };

  return (
    <div className="mesa-background min-h-screen pb-32 font-inter">
      <BrandHeader branding={branding} mesa={mesa} title="Estado de tu pedido" />

      <div className="max-w-lg mx-auto px-16 py-20 space-y-16">
        {/* Stepper Card */}
        <div className="mesa-surface mesa-border space-y-16 rounded-lg border p-20 shadow-2xs">
          <h2 className="mesa-text text-14 font-medium">Progreso del pedido</h2>
          <div className="space-y-16">
            {PASOS.map((paso, i) => {
              const activo = i === pasoActual;
              const completado = i < pasoActual;
              return (
                <div key={paso} className="flex items-start gap-14">
                  <div
                    className={`w-28 h-28 rounded-full flex items-center justify-center flex-shrink-0 text-13 font-semibold mt-1 transition-all ${
                    completado
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : activo
                        ? 'mesa-primary-bg shadow-md ring-4 ring-[var(--mesa-primary-soft)]'
                        : 'mesa-subtle-surface mesa-subtle-text'
                    }`}
                  >
                    {completado ? '✓' : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-14 font-medium ${
                        activo
                          ? 'mesa-text font-semibold'
                          : completado
                          ? 'text-emerald-700'
                          : 'mesa-subtle-text'
                      }`}
                    >
                      {PASO_LABELS[paso]}
                    </p>
                    {activo && (
                      <p className="mesa-primary mesa-primary-soft mt-2 inline-block rounded px-8 py-2 text-12 font-medium">
                        {DEMORA_LABELS[paso]}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {todosListos && (
          <div className="mesa-primary-soft mesa-border rounded-lg border px-16 py-14 text-center shadow-xs">
            <p className="mesa-primary text-14 font-semibold">✓ No hay pedidos pendientes</p>
            <p className="mesa-muted mt-2 text-12">Todos los pedidos de esta mesa están listos.</p>
          </div>
        )}

        {/* Resumen del pedido */}
        <div className="mesa-surface mesa-border space-y-10 rounded-lg border p-20 shadow-2xs">
          <h3 className="mesa-text text-13 font-medium">Resumen de la mesa</h3>
          <div className="divide-y divide-[var(--mesa-border)]">
            {items.map((item, index) => (
              <div key={`${item.id}-${index}`} className="mesa-muted flex justify-between py-6 text-13">
                <span>{item.cantidad}× {item.nombre}</span>
                <span className="mesa-text font-mono font-medium">${(item.precio * item.cantidad).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="mesa-text flex justify-between border-t pt-10 text-14 font-semibold mesa-border">
            <span>Total</span>
            <span className="mesa-primary font-mono font-semibold">${total.toLocaleString()}</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="space-y-10 pt-4">
          {items.length > 0 && (
            <div className="mesa-primary-soft mesa-border w-full rounded-lg border py-16 text-center shadow-xs">
              <p className="mesa-primary text-14 font-semibold">✓ Pedido realizado con éxito</p>
              <p className="mesa-muted mt-2 text-12">Nuestro equipo ya está trabajando en tu pedido.</p>
            </div>
          )}

          {!cuentaSolicitada && (
            <button
              onClick={onAgregarMas}
              className="mesa-surface mesa-muted mesa-border flex min-h-52 w-full items-center justify-center gap-6 rounded-lg border py-12 text-13 font-medium shadow-2xs transition-all hover:border-[var(--mesa-primary)] active:scale-[0.98]"
            >
              <span className="text-16 font-semibold">+</span>
              <span>Agregar más ítems</span>
            </button>
          )}

          {!cuentaSolicitada ? (
            <button
              onClick={() => setMostrarConfirmacion(true)}
              className="mesa-primary-bg flex min-h-52 w-full items-center justify-center gap-6 rounded-lg py-14 text-14 font-semibold shadow-md transition-all active:scale-[0.98]"
            >
              <span>Pedir la cuenta</span>
              <span className="text-16">🧾</span>
            </button>
          ) : (
            <div className="mesa-primary-soft mesa-border w-full rounded-lg border py-16 text-center shadow-xs animate-in fade-in">
              <p className="mesa-primary text-14 font-semibold">✓ Solicitud de cuenta enviada</p>
              <p className="mesa-muted mt-2 text-12">La cuenta queda asociada a todos los pedidos de esta mesa.</p>
            </div>
          )}
        </div>
      </div>

      {mostrarConfirmacion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-16"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget && !solicitandoCuenta) {
              setMostrarConfirmacion(false);
            }
          }}
        >
          <section
            className="mesa-surface mesa-border w-full max-w-sm rounded-xl border p-20 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmar-cuenta-titulo"
          >
            <h2 id="confirmar-cuenta-titulo" className="mesa-text text-16 font-semibold">
              ¿Solicitar la cuenta?
            </h2>
            <p className="mesa-muted mt-8 text-13 leading-relaxed">
              Una vez solicitada, no vas a poder agregar más ítems a esta cuenta. El mozo confirmará el cierre cuando se realice el pago.
            </p>
            <div className="mt-20 flex flex-col-reverse gap-8 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setMostrarConfirmacion(false)}
                disabled={solicitandoCuenta}
                className="mesa-surface mesa-muted mesa-border min-h-44 rounded-md border px-14 py-8 text-13 font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void confirmarSolicitudCuenta()}
                disabled={solicitandoCuenta}
                className="mesa-primary-bg min-h-44 rounded-md px-14 py-8 text-13 font-semibold disabled:opacity-50"
              >
                {solicitandoCuenta ? 'Enviando...' : 'Sí, solicitar cuenta'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
