export interface CategoriaItemNav {
  id: string;
  nombre: string;
}

interface Props {
  categorias: CategoriaItemNav[];
  activa: string;
  onSelect: (id: string) => void;
}

export default function CategoriaNav({ categorias, activa, onSelect }: Props) {
  return (
    <div className="sticky top-[57px] z-10 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200/60 shadow-xs">
      <div className="flex gap-8 overflow-x-auto px-16 py-12 no-scrollbar scroll-smooth">
        {categorias.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`flex-shrink-0 px-16 py-8 text-13 font-medium rounded-full border transition-all active:scale-95 ${
              activa === cat.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}
          >
            {cat.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}
