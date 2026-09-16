"use client";

import { useEffect, useMemo, useState } from "react";
import type { VariantePublica } from "@/lib/api";

export interface ArticuloPersonalizable {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  variantes?: VariantePublica[];
}

interface Props {
  articulo: ArticuloPersonalizable;
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: (cantidad: number, variantesSeleccionadas: VariantePublica[], nota: string) => void;
}

interface GrupoVariantes {
  nombre: string;
  seleccionUnica: boolean;
  variantes: VariantePublica[];
}

export default function ModalPersonalizacion({
  articulo,
  isOpen,
  onClose,
  onConfirmar,
}: Props) {
  const [cantidad, setCantidad] = useState(1);
  const [seleccionadas, setSeleccionadas] = useState<Map<string, VariantePublica>>(new Map());
  const [nota, setNota] = useState("");

  // Agrupar variantes por grupo
  const grupos = useMemo(() => {
    const list = articulo.variantes ?? [];
    const map = new Map<string, GrupoVariantes>();

    list.forEach(v => {
      const gNombre = v.grupo?.trim() || "Opciones";
      const actual = map.get(gNombre);
      if (actual) {
        actual.variantes.push(v);
        // Si al menos una es seleccion_unica, el grupo se comporta como radio
        if (v.seleccion_unica) actual.seleccionUnica = true;
      } else {
        map.set(gNombre, {
          nombre: gNombre,
          seleccionUnica: v.seleccion_unica,
          variantes: [v],
        });
      }
    });

    return Array.from(map.values());
  }, [articulo.variantes]);

  // Al abrir, inicializar cantidad en 1, nota vacía y preseleccionar la primera opción de cada grupo de selección única
  useEffect(() => {
    if (!isOpen) return;

    setCantidad(1);
    setNota("");

    const initial = new Map<string, VariantePublica>();
    grupos.forEach(g => {
      if (g.seleccionUnica && g.variantes.length > 0) {
        initial.set(g.variantes[0].id, g.variantes[0]);
      }
    });
    setSeleccionadas(initial);
  }, [isOpen, grupos]);

  // Bloquear scroll de fondo y soportar Escape
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggleOpcion = (grupo: GrupoVariantes, variante: VariantePublica) => {
    const next = new Map(seleccionadas);

    if (grupo.seleccionUnica) {
      // Remover cualquier otra opción de este grupo
      grupo.variantes.forEach(v => next.delete(v.id));
      next.set(variante.id, variante);
    } else {
      if (next.has(variante.id)) {
        next.delete(variante.id);
      } else {
        next.set(variante.id, variante);
      }
    }

    setSeleccionadas(next);
  };

  const adicionalesUnitarios = Array.from(seleccionadas.values()).reduce(
    (sum, v) => sum + (v.precio_adicional || 0),
    0
  );
  const precioUnitarioTotal = articulo.precio + adicionalesUnitarios;
  const subtotalTotal = precioUnitarioTotal * cantidad;

  const handleConfirmar = () => {
    onConfirmar(cantidad, Array.from(seleccionadas.values()), nota.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity sm:items-center sm:p-16"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-personalizacion-title"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="mesa-background flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border-t mesa-border shadow-2xl animate-in slide-in-from-bottom duration-200 sm:rounded-2xl sm:border"
        onClick={e => e.stopPropagation()}
      >
        {/* Header con nombre del artículo y cerrar */}
        <header className="flex shrink-0 items-start justify-between border-b mesa-border p-16">
          <div className="min-w-0 flex-1 pr-12">
            <h2 id="modal-personalizacion-title" className="mesa-text text-18 font-semibold leading-tight">
              {articulo.nombre}
            </h2>
            {articulo.descripcion && (
              <p className="mesa-muted mt-4 text-12 leading-relaxed">
                {articulo.descripcion}
              </p>
            )}
            <p className="mesa-primary mt-6 text-14 font-mono font-medium">
              ${articulo.precio.toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar personalización"
            className="mesa-muted mesa-subtle-surface flex h-48 w-48 shrink-0 items-center justify-center rounded-full text-18 font-medium transition-colors hover:text-[var(--mesa-primary)]"
          >
            ✕
          </button>
        </header>

        {/* Opciones y grupos */}
        <div className="min-h-0 flex-1 overflow-y-auto p-16 space-y-20 overscroll-contain">
          {grupos.map(grupo => (
            <div key={grupo.nombre} className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="mesa-text text-14 font-semibold tracking-tight">
                  {grupo.nombre}
                </h3>
                <span className="mesa-muted text-11">
                  {grupo.seleccionUnica ? "Elegí 1 opción" : "Opcionales"}
                </span>
              </div>

              <div className="space-y-8">
                {grupo.variantes.map(variante => {
                  const estaSeleccionada = seleccionadas.has(variante.id);
                  return (
                    <button
                      key={variante.id}
                      type="button"
                      onClick={() => handleToggleOpcion(grupo, variante)}
                      className={`mesa-surface mesa-border flex min-h-48 w-full items-center justify-between rounded-xl border p-12 text-left transition-all active:scale-[0.99] ${
                        estaSeleccionada
                          ? "border-[var(--mesa-primary)] bg-[var(--mesa-primary)]/5"
                          : "hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-12 min-w-0">
                        <div
                          className={`flex h-20 w-20 shrink-0 items-center justify-center border transition-colors ${
                            grupo.seleccionUnica ? "rounded-full" : "rounded-md"
                          } ${
                            estaSeleccionada
                              ? "mesa-primary-bg border-transparent text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {estaSeleccionada && (
                            <span className="text-11 font-bold">✓</span>
                          )}
                        </div>
                        <span className="mesa-text text-13 font-medium leading-snug">
                          {variante.nombre}
                        </span>
                      </div>

                      {variante.precio_adicional > 0 ? (
                        <span className="mesa-primary shrink-0 text-13 font-mono font-medium">
                          +${variante.precio_adicional.toLocaleString()}
                        </span>
                      ) : (
                        <span className="mesa-muted shrink-0 text-12 font-mono">
                          Sin cargo
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Campo de notas libres para cocina */}
          <div className="space-y-6 pt-4 border-t mesa-border">
            <label htmlFor="nota-cocina" className="mesa-text block text-13 font-semibold">
              Aclaración para la cocina (opcional)
            </label>
            <input
              id="nota-cocina"
              className="mesa-subtle-surface mesa-muted mesa-border w-full rounded-lg border px-12 py-10 text-13 outline-none transition-colors placeholder:text-slate-400 focus:border-[var(--mesa-primary)] focus:bg-[var(--mesa-surface)]"
              placeholder="Ej: sin cebolla, salsa aparte, bien cocido..."
              value={nota}
              onChange={e => setNota(e.target.value)}
            />
          </div>

          {/* Selector de cantidad */}
          <div className="flex items-center justify-between pt-4 border-t mesa-border">
            <span className="mesa-text text-14 font-semibold">Cantidad</span>
            <div className="mesa-subtle-surface mesa-border flex items-center gap-12 rounded-full border p-2">
              <button
                type="button"
                onClick={() => setCantidad(c => Math.max(1, c - 1))}
                disabled={cantidad <= 1}
                aria-label="Disminuir cantidad"
                className="mesa-surface mesa-muted flex h-48 w-48 items-center justify-center rounded-full text-18 font-semibold shadow-2xs transition-transform active:scale-90 disabled:opacity-40"
              >
                −
              </button>
              <span className="mesa-text w-24 text-center text-15 font-mono font-semibold">
                {cantidad}
              </span>
              <button
                type="button"
                onClick={() => setCantidad(c => c + 1)}
                aria-label="Aumentar cantidad"
                className="mesa-primary-bg flex h-48 w-48 items-center justify-center rounded-full text-18 font-semibold shadow-2xs transition-transform active:scale-90"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Footer con subtotal en vivo y botón confirmar */}
        <footer className="mesa-surface mesa-border border-t p-16 space-y-10 shadow-lg">
          <div className="mesa-text flex items-center justify-between text-15 font-medium">
            <span>Subtotal</span>
            <span className="mesa-primary text-18 font-mono font-semibold">
              ${subtotalTotal.toLocaleString()}
            </span>
          </div>
          <button
            type="button"
            onClick={handleConfirmar}
            className="mesa-primary-bg flex min-h-52 w-full items-center justify-center gap-8 rounded-xl px-16 py-14 text-15 font-semibold shadow-md transition-all active:scale-[0.98]"
          >
            <span>Agregar al pedido</span>
            <span className="font-mono text-14 opacity-90">(${subtotalTotal.toLocaleString()})</span>
            <span className="text-16" aria-hidden="true">→</span>
          </button>
        </footer>
      </div>
    </div>
  );
}
