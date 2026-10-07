import type { VariantePublica } from "@/lib/api";

export interface ItemCardData {
  id: string;
  nombre: string;
  precio: number;
  descripcion?: string;
  foto_url?: string;
  disponible?: boolean;
  activo?: boolean;
  variantes?: VariantePublica[];
}

interface Props {
  item: ItemCardData;
  cantidad: number;
  categoriaIcono?: string;
  onAgregar: () => void;
}

export default function ItemCard({ item, cantidad, categoriaIcono = 'restaurant', onAgregar }: Props) {
  const tieneVariantes = Boolean(item.variantes && item.variantes.length > 0);
  const agotado = item.disponible === false;

  return (
    <div
      className={`mesa-surface mesa-border flex w-full min-w-0 items-stretch gap-12 overflow-hidden rounded-xl border p-10 shadow-2xs transition-all ${
        agotado
          ? "opacity-60 bg-ghost-fog/40 border-concrete"
          : "hover:-translate-y-px hover:border-[var(--mesa-primary)] hover:shadow-sm"
      }`}
    >
      <div className="mesa-subtle-surface mesa-border relative h-[104px] w-[112px] shrink-0 overflow-hidden rounded-lg border">
        {item.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.foto_url} alt={`Foto de ${item.nombre}`} className={`h-full w-full object-cover ${agotado ? 'grayscale' : ''}`} />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 mesa-muted">
            <span className="material-symbols-outlined text-30" aria-hidden="true">{categoriaIcono}</span>
            <span className="text-9 font-medium uppercase tracking-[0.08em]">Sin foto</span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 py-4">
        <div className="flex items-center gap-6 flex-wrap">
          <h3 className={`break-words text-15 font-semibold leading-tight ${agotado ? "text-stone line-through" : "mesa-text"}`}>
            {item.nombre}
          </h3>
          {agotado ? (
            <span className="inline-flex items-center px-6 py-2 text-10 font-semibold rounded-md bg-stone/15 text-stone border border-stone/30">
              Agotado (86)
            </span>
          ) : (
            tieneVariantes && (
              <span className="inline-flex items-center px-6 py-2 text-10 font-medium rounded-md bg-slate-200/60 text-slate-700">
                Personalizable
              </span>
            )
          )}
        </div>
        {item.descripcion && (
          <p className="mesa-muted mt-4 line-clamp-2 max-w-full break-words text-11 leading-relaxed [overflow-wrap:anywhere]">
            {item.descripcion}
          </p>
        )}
        <p className={`mt-8 text-15 font-mono font-semibold ${agotado ? "text-stone" : "mesa-text"}`}>
          ${item.precio.toLocaleString('es-AR')}
        </p>
      </div>

      {agotado ? (
        <div className="flex w-58 shrink-0 flex-col items-center justify-center gap-4 text-stone" title="Este producto se encuentra agotado momentáneamente">
          <span className="flex h-44 w-44 items-center justify-center rounded-full border border-concrete bg-ghost-fog text-14">✕</span>
          <span className="text-9 font-semibold">Agotado</span>
        </div>
      ) : (
        <button
          onClick={onAgregar}
          aria-label={`Agregar ${item.nombre}`}
          className={`group flex w-58 shrink-0 flex-col items-center justify-center gap-5 rounded-lg transition-all active:scale-95 ${
            cantidad > 0 ? 'shadow-sm' : 'hover:bg-[var(--mesa-primary-soft)]'
          }`}
        >
          <span className="flex h-46 w-46 items-center justify-center rounded-full bg-[var(--mesa-action)] text-[var(--mesa-action-contrast)] text-24 font-medium leading-none shadow-sm transition-transform group-hover:scale-105">
            {cantidad > 0 ? cantidad : '+'}
          </span>
          <span className="text-10 font-semibold text-[var(--mesa-action)]">Agregar</span>
        </button>
      )}
    </div>
  );
}
