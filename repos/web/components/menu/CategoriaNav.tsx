export interface CategoriaItemNav {
  id: string;
  nombre: string;
  icono?: string;
  disponible?: boolean;
}

interface Props {
  categorias: CategoriaItemNav[];
  activa: string;
  onSelect: (id: string) => void;
}

export default function CategoriaNav({ categorias, activa, onSelect }: Props) {
  return (
    <div className="mesa-background mesa-border sticky top-[68px] z-10 isolate border-b shadow-xs">
      <div className="flex gap-8 overflow-x-auto px-16 py-10 no-scrollbar scroll-smooth">
        <button
          id="nav-cat-todos"
          onClick={() => onSelect('todos')}
          className={`flex min-h-46 flex-shrink-0 items-center gap-7 rounded-full border px-15 py-8 text-12 font-semibold transition-all active:scale-95 ${
            activa === 'todos'
              ? 'border-transparent bg-[var(--mesa-category)] text-[var(--mesa-category-contrast)] shadow-sm'
              : 'mesa-surface mesa-muted mesa-border hover:border-[var(--mesa-category)]'
          }`}
        >
          <span className="material-symbols-outlined text-18">apps</span>
          <span>Todos</span>
        </button>
        {categorias.map(cat => (
          <button
            key={cat.id}
            id={`nav-cat-${cat.id}`}
            onClick={() => onSelect(cat.id)}
            className={`flex min-h-46 flex-shrink-0 items-center gap-7 rounded-full border px-15 py-8 text-12 font-semibold transition-all active:scale-95 ${
              activa === cat.id
                ? 'border-transparent bg-[var(--mesa-category)] text-[var(--mesa-category-contrast)] shadow-sm'
                : 'mesa-surface mesa-muted mesa-border hover:border-[var(--mesa-category)]'
            }`}
          >
            <span className="material-symbols-outlined text-18" aria-hidden="true">{cat.icono || 'restaurant'}</span>
            <span>{cat.nombre}</span>
            {cat.disponible === false && (
              <span className="material-symbols-outlined ml-6 text-15 opacity-70" aria-label="Fuera de horario">schedule</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
