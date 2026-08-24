import { CartItem, EstadoPedido } from "@/app/mesa/[token]/page";

interface Props {
  items: CartItem[];
  estadoPedido: EstadoPedido;
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
  items,
  estadoPedido,
  cuentaSolicitada,
  mesa,
  onAgregarMas,
  onPedirCuenta,
}: Props) {
  const total = items.reduce((n, i) => n + i.precio * i.cantidad, 0);
  const pasoActual = PASOS.indexOf(estadoPedido);

  return (
    <div className="min-h-screen bg-slate-50 font-inter pb-32">
      <header className="bg-white border-b border-slate-200 px-16 py-14 shadow-2xs">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="text-11 text-slate-500 font-mono uppercase tracking-wider">Mesa {mesa}</p>
            <h1 className="text-16 font-medium text-slate-900">Estado de tu pedido</h1>
          </div>
          <div className="flex items-center gap-6 px-10 py-4 bg-green-50 text-green-700 text-11 font-mono rounded-full border border-green-200">
            <span className="w-6 h-6 rounded-full bg-green-500 animate-pulse" />
            <span>En vivo</span>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-16 py-20 space-y-16">
        {/* Stepper Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-20 space-y-16 shadow-2xs">
          <h2 className="text-14 font-medium text-slate-900">Progreso del pedido</h2>
          <div className="space-y-16">
            {PASOS.map((paso, i) => {
              const activo = i === pasoActual;
              const completado = i < pasoActual;
              return (
                <div key={paso} className="flex items-start gap-14">
                  <div
                    className={`w-28 h-28 rounded-full flex items-center justify-center flex-shrink-0 text-13 font-semibold mt-1 transition-all ${
                      completado
                        ? 'bg-green-500 text-white shadow-xs'
                        : activo
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 ring-4 ring-blue-100'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {completado ? '✓' : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-14 font-medium ${
                        activo
                          ? 'text-slate-900 font-semibold'
                          : completado
                          ? 'text-green-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {PASO_LABELS[paso]}
                    </p>
                    {activo && (
                      <p className="text-12 text-blue-600 font-medium mt-2 bg-blue-50 px-8 py-2 rounded inline-block">
                        {DEMORA_LABELS[paso]}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="bg-white rounded-lg border border-slate-200 p-20 space-y-10 shadow-2xs">
          <h3 className="text-13 font-medium text-slate-900">Resumen de la comanda</h3>
          <div className="divide-y divide-slate-100">
            {items.map(item => (
              <div key={item.id} className="py-6 flex justify-between text-13 text-slate-700">
                <span>{item.cantidad}× {item.nombre}</span>
                <span className="font-mono text-slate-900 font-medium">${(item.precio * item.cantidad).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-14 font-semibold text-slate-900 border-t border-slate-200 pt-10">
            <span>Total</span>
            <span className="font-mono text-blue-600 font-semibold">${total.toLocaleString()}</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="space-y-10 pt-4">
          <button
            onClick={onAgregarMas}
            className="w-full py-12 border border-slate-300 text-slate-700 text-13 font-medium rounded-lg hover:bg-white active:scale-98 transition-all flex items-center justify-center gap-6 shadow-2xs"
          >
            <span className="text-16 font-semibold">+</span>
            <span>Agregar más ítems</span>
          </button>

          {!cuentaSolicitada ? (
            <button
              onClick={onPedirCuenta}
              className="w-full py-14 bg-slate-900 text-white text-14 font-semibold rounded-lg hover:bg-slate-800 active:scale-98 transition-all flex items-center justify-center gap-6 shadow-md"
            >
              <span>Pedir la cuenta</span>
              <span className="text-16">🧾</span>
            </button>
          ) : (
            <div className="w-full py-16 bg-green-50 border border-green-200 rounded-lg text-center shadow-xs animate-in fade-in">
              <p className="text-14 font-semibold text-green-800">✓ El mozo fue notificado</p>
              <p className="text-12 text-green-700 mt-2">Enseguida se acerca con el ticket a tu mesa.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
