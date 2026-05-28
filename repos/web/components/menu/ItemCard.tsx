import { MenuItem } from "@/lib/mock/menu";

interface Props {
  item: MenuItem;
  cantidad: number;
  onAgregar: () => void;
}

export default function ItemCard({ item, cantidad, onAgregar }: Props) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-16 flex items-start justify-between gap-12">
      <div className="flex-1 min-w-0">
        <h3 className="text-14 font-medium text-slate-900">{item.nombre}</h3>
        {item.descripcion && (
          <p className="text-12 text-slate-500 mt-2">{item.descripcion}</p>
        )}
        <p className="text-14 font-medium text-blue-600 mt-8">${item.precio.toLocaleString()}</p>
      </div>
      <button
        onClick={onAgregar}
        className={`flex-shrink-0 w-32 h-32 rounded-full flex items-center justify-center text-16 font-medium transition-colors ${
          cantidad > 0
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        {cantidad > 0 ? cantidad : '+'}
      </button>
    </div>
  );
}
