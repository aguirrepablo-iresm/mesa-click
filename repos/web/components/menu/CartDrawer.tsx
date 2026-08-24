import { CartItem } from "@/app/mesa/[token]/page";

interface Props {
  items: CartItem[];
  totalPrecio: number;
  onSetCantidad: (id: string, cantidad: number) => void;
  onSetNota: (id: string, nota: string) => void;
  onVolver: () => void;
  onConfirmar: () => void;
}

export default function CartDrawer({
  items,
  totalPrecio,
  onSetCantidad,
  onSetNota,
  onVolver,
  onConfirmar,
}: Props) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
      <header className="bg-white border-b border-slate-200 px-16 py-14 flex items-center justify-between sticky top-0 z-10 shadow-2xs">
        <div className="flex items-center gap-12">
          <button
            onClick={onVolver}
            aria-label="Volver al menú"
            className="w-32 h-32 flex items-center justify-center text-slate-700 hover:text-slate-900 text-20 leading-none rounded-full hover:bg-slate-100 transition-colors"
          >
            ←
          </button>
          <div>
            <h2 className="text-15 font-medium text-slate-900 leading-tight">Tu pedido</h2>
            <span className="text-12 text-slate-500 font-mono">({items.length} {items.length === 1 ? 'ítem' : 'ítems'})</span>
          </div>
        </div>
        <button
          onClick={onVolver}
          className="text-12 text-blue-600 font-medium hover:underline"
        >
          + Agregar más
        </button>
      </header>

      <div className="flex-1 px-16 py-16 max-w-lg mx-auto w-full space-y-12">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-lg border border-slate-200 p-16 space-y-12 shadow-2xs">
            <div className="flex items-center justify-between gap-8">
              <span className="text-14 font-medium text-slate-900">{item.nombre}</span>
              <span className="text-14 font-medium text-slate-900 font-mono">
                ${(item.precio * item.cantidad).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-12 text-slate-500 font-mono">${item.precio.toLocaleString()} c/u</span>
              <div className="flex items-center gap-12 bg-slate-50 p-2 rounded-full border border-slate-200">
                <button
                  onClick={() => onSetCantidad(item.id, item.cantidad - 1)}
                  aria-label="Disminuir cantidad"
                  className="w-32 h-32 rounded-full bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100 text-16 font-semibold shadow-2xs active:scale-90 transition-transform"
                >
                  −
                </button>
                <span className="text-14 font-medium text-slate-900 w-20 text-center font-mono">
                  {item.cantidad}
                </span>
                <button
                  onClick={() => onSetCantidad(item.id, item.cantidad + 1)}
                  aria-label="Aumentar cantidad"
                  className="w-32 h-32 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 text-16 font-semibold shadow-2xs active:scale-90 transition-transform"
                >
                  +
                </button>
              </div>
            </div>
            <input
              className="w-full px-12 py-8 text-12 text-slate-700 border border-slate-200 rounded-md bg-slate-50 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-colors"
              placeholder="Nota para la cocina (ej: sin sal, hielo aparte)..."
              value={item.nota}
              onChange={e => onSetNota(item.id, e.target.value)}
            />
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-48 text-slate-400 text-13">
            El carrito está vacío.
          </div>
        )}
      </div>

      <div className="bg-white border-t border-slate-200 px-16 py-16 max-w-lg mx-auto w-full space-y-12 sticky bottom-0 z-10 shadow-lg">
        <div className="flex items-center justify-between text-16 font-medium text-slate-900">
          <span>Total a pagar</span>
          <span className="font-mono text-18 text-blue-600 font-semibold">${totalPrecio.toLocaleString()}</span>
        </div>
        <button
          onClick={onConfirmar}
          disabled={items.length === 0}
          className="w-full py-14 bg-green-600 text-white text-15 font-semibold rounded-lg hover:bg-green-700 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-green-600/10 flex items-center justify-center gap-8"
        >
          <span>Enviar pedido a cocina</span>
          <span className="text-16">→</span>
        </button>
      </div>
    </div>
  );
}
