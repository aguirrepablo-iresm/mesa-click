import type { VariantePublica } from "@/lib/api";

export interface ItemCardData {
  id: string;
  nombre: string;
  precio: number;
  descripcion?: string;
  disponible?: boolean;
  activo?: boolean;
  variantes?: VariantePublica[];
}

interface Props {
  item: ItemCardData;
  cantidad: number;
  onAgregar: () => void;
}

export default function ItemCard({ item, cantidad, onAgregar }: Props) {
  const tieneVariantes = Boolean(item.variantes && item.variantes.length > 0);

  return (
    <div className="mesa-surface mesa-border flex w-full min-w-0 items-start justify-between gap-12 rounded-lg border p-16 shadow-2xs transition-colors hover:border-[var(--mesa-primary)]">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-6 flex-wrap">
          <h3 className="mesa-text break-words text-14 font-medium">{item.nombre}</h3>
          {tieneVariantes && (
            <span className="inline-flex items-center px-6 py-2 text-10 font-medium rounded-md bg-slate-200/60 text-slate-700">
              Personalizable
            </span>
          )}
        </div>
        {item.descripcion && (
          <p className="mesa-muted mt-2 max-w-full break-words whitespace-normal text-12 leading-relaxed [overflow-wrap:anywhere]">
            {item.descripcion}
          </p>
        )}
        <p className="mesa-primary mt-8 text-14 font-mono font-medium">${item.precio.toLocaleString()}</p>
      </div>
      <button
        onClick={onAgregar}
        aria-label={`Agregar ${item.nombre}`}
        className={`mesa-primary-bg flex h-48 w-48 flex-shrink-0 items-center justify-center rounded-full border border-transparent text-16 font-semibold transition-all active:scale-90 ${
          cantidad > 0 ? 'shadow-sm' : 'hover:brightness-95'
        }`}
      >
        {cantidad > 0 ? cantidad : '+'}
      </button>
    </div>
  );
}
