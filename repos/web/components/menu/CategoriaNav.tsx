import { Categoria } from "@/lib/mock/menu";

interface Props {
  categorias: Categoria[];
  activa: string;
  onSelect: (id: string) => void;
}

export default function CategoriaNav({ categorias, activa, onSelect }: Props) {
  return (
    <div className="flex gap-8 overflow-x-auto px-16 py-12">
      {categorias.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`flex-shrink-0 px-16 py-8 text-13 font-medium rounded-full border transition-colors ${
            activa === cat.id
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
          }`}
        >
          {cat.nombre}
        </button>
      ))}
    </div>
  );
}
