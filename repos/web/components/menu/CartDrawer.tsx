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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-16 py-12 flex items-center gap-12 sticky top-0 z-10">
        <button
          onClick={onVolver}
          className="text-slate-600 hover:text-slate-900 text-20 leading-none"
        >
          ←
        </button>
        <h2 className="text-15 font-medium text-slate-900">Tu pedido</h2>
        <span className="text-13 text-slate-500">({items.length} {items.length === 1 ? 'ítem' : 'ítems'})</span>
      </header>

      <div className="flex-1 px-16 py-16 max-w-lg mx-auto w-full space-y-12">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-lg border border-slate-200 p-16 space-y-10">
            <div className="flex items-center justify-between">
              <span className="text-14 font-medium text-slate-900">{item.nombre}</span>
              <span className="text-14 font-medium text-slate-700">
                ${(item.precio * item.cantidad).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-12 text-slate-500">${item.precio.toLocaleString()} c/u</span>
              <div className="flex items-center gap-12">
                <button
                  onClick={() => onSetCantidad(item.id, item.cantidad - 1)}
                  className="w-28 h-28 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 text-16 leading-none"
                >
                  −
                </button>
                <span className="text-14 font-medium text-slate-900 w-16 text-center">
                  {item.cantidad}
                </span>
                <button
                  onClick={() => onSetCantidad(item.id, item.cantidad + 1)}
                  className="w-28 h-28 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 text-16 leading-none"
                >
                  +
                </button>
              </div>
            </div>
            <input
              className="w-full px-10 py-6 text-12 text-slate-600 border border-slate-200 rounded-md bg-slate-50 placeholder-slate-400 outline-none focus:border-blue-400"
              placeholder="Nota para la cocina (opcional)"
              value={item.nota}
              onChange={e => onSetNota(item.id, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="bg-white border-t border-slate-200 px-16 py-16 max-w-lg mx-auto w-full space-y-12">
        <div className="flex items-center justify-between text-15 font-medium text-slate-900">
          <span>Total</span>
          <span>${totalPrecio.toLocaleString()}</span>
        </div>
        <button
          onClick={onConfirmar}
          className="w-full py-14 bg-green-600 text-white text-15 font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          Enviar pedido
        </button>
      </div>
    </div>
  );
}
