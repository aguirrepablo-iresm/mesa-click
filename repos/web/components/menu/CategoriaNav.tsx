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
    <div className="mesa-background mesa-border sticky top-[68px] z-10 isolate border-b shadow-xs">
      <div className="flex gap-8 overflow-x-auto px-16 py-12 no-scrollbar scroll-smooth">
        {categorias.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`flex min-h-44 flex-shrink-0 items-center rounded-full border px-16 py-8 text-13 font-medium transition-all active:scale-95 ${
              activa === cat.id
                ? 'mesa-primary-bg border-transparent shadow-sm'
                : 'mesa-surface mesa-muted mesa-border hover:border-[var(--mesa-primary)]'
            }`}
          >
            {cat.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}
