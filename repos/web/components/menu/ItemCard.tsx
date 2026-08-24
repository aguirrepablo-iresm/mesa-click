export interface ItemCardData {
  id: string;
  nombre: string;
  precio: number;
  descripcion?: string;
  disponible?: boolean;
  activo?: boolean;
}

interface Props {
  item: ItemCardData;
  cantidad: number;
  onAgregar: () => void;
}

export default function ItemCard({ item, cantidad, onAgregar }: Props) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-16 flex items-start justify-between gap-12 hover:border-slate-300 transition-colors shadow-2xs">
      <div className="flex-1 min-w-0">
        <h3 className="text-14 font-medium text-slate-900">{item.nombre}</h3>
        {item.descripcion && (
          <p className="text-12 text-slate-500 mt-2 leading-relaxed">{item.descripcion}</p>
        )}
        <p className="text-14 font-medium text-blue-600 mt-8 font-mono">${item.precio.toLocaleString()}</p>
      </div>
      <button
        onClick={onAgregar}
        aria-label={`Agregar ${item.nombre}`}
        className={`flex-shrink-0 w-36 h-36 rounded-full flex items-center justify-center text-16 font-semibold transition-all active:scale-90 ${
          cantidad > 0
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
      >
        {cantidad > 0 ? cantidad : '+'}
      </button>
    </div>
  );
}
