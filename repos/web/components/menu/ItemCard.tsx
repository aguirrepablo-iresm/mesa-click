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
      className={`mesa-surface mesa-border flex w-full min-w-0 items-stretch gap-8 overflow-hidden rounded-xl border p-6 shadow-2xs transition-all ${
        agotado
          ? "opacity-60 bg-ghost-fog/40 border-concrete"
          : "hover:-translate-y-px hover:border-[var(--mesa-primary)] hover:shadow-sm"
      }`}
    >
      <div className="mesa-subtle-surface mesa-border relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-lg border">
        {item.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.foto_url} alt={`Foto de ${item.nombre}`} loading="lazy" decoding="async" className={`h-full w-full object-cover ${agotado ? 'grayscale' : ''}`} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[color-mix(in_srgb,var(--mesa-primary)_7%,var(--mesa-subtle-surface))]">
            <span className="mesa-primary flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--mesa-primary)_12%,transparent)]" aria-label="Artículo sin imagen">
              <span className="material-symbols-outlined text-22" aria-hidden="true">{categoriaIcono}</span>
            </span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 py-2">
        <div className="flex items-center gap-6 flex-wrap">
          <h3 className={`break-words text-14 font-semibold leading-tight ${agotado ? "text-stone line-through" : "mesa-text"}`}>
            {item.nombre}
          </h3>
          {agotado ? (
              <span className="inline-flex items-center px-5 py-1 text-9 font-semibold rounded-md bg-stone/15 text-stone border border-stone/30">
              Agotado
            </span>
          ) : (
            tieneVariantes && (
              <span className="inline-flex items-center px-5 py-1 text-9 font-medium rounded-md bg-slate-200/60 text-slate-700">
                Opciones
              </span>
            )
          )}
        </div>
        {item.descripcion && (
          <p className="mesa-muted mt-2 line-clamp-1 max-w-full break-words text-11 leading-relaxed [overflow-wrap:anywhere]">
            {item.descripcion}
          </p>
        )}
        <p className={`mt-4 text-13 font-mono font-semibold ${agotado ? "text-stone" : "mesa-text"}`}>
          ${item.precio.toLocaleString('es-AR')}
        </p>
      </div>

      {agotado ? (
        <div className="flex w-40 shrink-0 items-center justify-center text-stone" title="Este producto se encuentra agotado momentáneamente">
          <span className="flex h-[36px] w-[36px] items-center justify-center rounded-full border border-concrete bg-ghost-fog text-13">✕</span>
        </div>
      ) : (
        <button
          onClick={onAgregar}
          aria-label={`Agregar ${item.nombre}`}
          className={`group flex w-40 shrink-0 items-center justify-center rounded-lg transition-all active:scale-95 ${
            cantidad > 0 ? 'shadow-sm' : 'hover:bg-[var(--mesa-primary-soft)]'
          }`}
        >
          <span className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[var(--mesa-action)] text-[var(--mesa-action-contrast)] text-18 font-medium leading-none shadow-sm transition-transform group-hover:scale-105">
            {cantidad > 0 ? cantidad : '+'}
          </span>
        </button>
      )}
    </div>
  );
}
