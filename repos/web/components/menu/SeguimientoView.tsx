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
  onPedirCuenta: () => void;
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
  const total = items.reduce((n, i) => n + i.precio * i.cantidad, 0);
  const pasoActual = PASOS.indexOf(estadoPedido);

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
          <div className="mesa-primary-soft mesa-border w-full rounded-lg border py-16 text-center shadow-xs">
            <p className="mesa-primary text-14 font-semibold">✓ Pedido realizado con éxito</p>
            <p className="mesa-muted mt-2 text-12">Tu pedido fue enviado a cocina para su preparación.</p>
          </div>

          <button
            onClick={onAgregarMas}
            className="mesa-surface mesa-muted mesa-border flex min-h-52 w-full items-center justify-center gap-6 rounded-lg border py-12 text-13 font-medium shadow-2xs transition-all hover:border-[var(--mesa-primary)] active:scale-[0.98]"
          >
            <span className="text-16 font-semibold">+</span>
            <span>Agregar más ítems</span>
          </button>

          {!cuentaSolicitada ? (
            <button
              onClick={onPedirCuenta}
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
    </div>
  );
}
