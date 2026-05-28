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
};

const DEMORA_LABELS: Record<EstadoPedido, string> = {
  recibido: 'Estimado: ~15 min',
  preparando: 'Estimado: ~8 min',
  listo: '¡Tu pedido está listo!',
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
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-16 py-12">
        <div className="max-w-lg mx-auto">
          <p className="text-11 text-slate-500 font-mono">Mesa {mesa}</p>
          <h1 className="text-16 font-medium text-slate-900">Estado de tu pedido</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-16 py-24 space-y-20">
        {/* Stepper */}
        <div className="bg-white rounded-lg border border-slate-200 p-20 space-y-16">
          <h2 className="text-14 font-medium text-slate-900">Estado actual</h2>
          <div className="space-y-14">
            {PASOS.map((paso, i) => {
              const activo = i === pasoActual;
              const completado = i < pasoActual;
              return (
                <div key={paso} className="flex items-start gap-12">
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0 text-12 font-medium mt-1 ${
                      completado
                        ? 'bg-green-500 text-white'
                        : activo
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {completado ? '✓' : i + 1}
                  </div>
                  <div>
                    <p
                      className={`text-13 font-medium ${
                        activo
                          ? 'text-slate-900'
                          : completado
                          ? 'text-green-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {PASO_LABELS[paso]}
                    </p>
                    {activo && (
                      <p className="text-12 text-slate-500 mt-1">{DEMORA_LABELS[paso]}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="bg-white rounded-lg border border-slate-200 p-20 space-y-8">
          <h3 className="text-13 font-medium text-slate-900">Resumen</h3>
          {items.map(item => (
            <div key={item.id} className="flex justify-between text-13 text-slate-600">
              <span>{item.cantidad}× {item.nombre}</span>
              <span>${(item.precio * item.cantidad).toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between text-13 font-medium text-slate-900 border-t border-slate-100 pt-8">
            <span>Total</span>
            <span>${total.toLocaleString()}</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="space-y-8">
          <button
            onClick={onAgregarMas}
            className="w-full py-12 border border-slate-300 text-slate-700 text-13 font-medium rounded-lg hover:bg-white transition-colors"
          >
            + Agregar más ítems
          </button>

          {!cuentaSolicitada ? (
            <button
              onClick={onPedirCuenta}
              className="w-full py-12 bg-slate-900 text-white text-13 font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              Pedir la cuenta
            </button>
          ) : (
            <div className="w-full py-12 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-13 font-medium text-green-700">✓ El mozo fue notificado</p>
              <p className="text-12 text-green-600 mt-2">Enseguida se acerca a tu mesa</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
