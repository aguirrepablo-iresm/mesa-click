"use client";

import { useState, useCallback, useRef, createContext, useContext, ReactNode } from "react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ConfirmOptions {
  titulo?: string;
  mensaje: string;
  labelAceptar?: string;
  labelCancelar?: string;
  variante?: "danger" | "warning" | "default";
}

interface ConfirmContextValue {
  confirmar: (opts: ConfirmOptions) => Promise<boolean>;
}

// ─── Contexto ─────────────────────────────────────────────────────────────────

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [abierto, setAbierto] = useState(false);
  const [opciones, setOpciones] = useState<ConfirmOptions>({ mensaje: "" });
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirmar = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOpciones(opts);
    setAbierto(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const responder = (valor: boolean) => {
    setAbierto(false);
    resolverRef.current?.(valor);
    resolverRef.current = null;
  };

  return (
    <ConfirmContext.Provider value={{ confirmar }}>
      {children}
      {abierto && (
        <ConfirmDialog
          opciones={opciones}
          onAceptar={() => responder(true)}
          onCancelar={() => responder(false)}
        />
      )}
    </ConfirmContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useConfirm(): (opts: ConfirmOptions) => Promise<boolean> {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm debe usarse dentro de <ConfirmProvider>");
  return ctx.confirmar;
}

// ─── Dialog interno ───────────────────────────────────────────────────────────
// Sigue rigurosamente el sistema de diseño monocromático (Negro / Gris / Blanco):
// - Modal: bg-canvas-white, borde border-concrete, rounded-xl, sombra shadow-xl
// - Botón principal (Aceptar): bg-ash-graphite text-canvas-white rounded-md (Negro)
// - Botón secundario (Cancelar): border border-concrete bg-canvas-white text-ash-graphite rounded-md (Gris/Blanco)

interface DialogProps {
  opciones: ConfirmOptions;
  onAceptar: () => void;
  onCancelar: () => void;
}

function ConfirmDialog({ opciones, onAceptar, onCancelar }: DialogProps) {
  const { titulo, mensaje, labelAceptar, labelCancelar } = opciones;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-system-black/60 p-16 backdrop-blur-[2px] transition-all"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancelar();
      }}
    >
      <div
        className="flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-concrete bg-canvas-white shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Encabezado ────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-concrete px-20 py-16">
          <div className="flex items-center gap-10">
            <div className="flex h-32 w-32 items-center justify-center rounded-md bg-ghost-fog text-ash-graphite">
              <span className="material-symbols-outlined text-18">
                help
              </span>
            </div>
            <h2 id="confirm-dialog-title" className="text-14 font-semibold text-ash-graphite">
              {titulo ?? "Confirmar acción"}
            </h2>
          </div>
          <button
            onClick={onCancelar}
            aria-label="Cerrar"
            className="flex h-28 w-28 items-center justify-center rounded-md text-stone hover:bg-ghost-fog hover:text-ash-graphite transition-colors text-14"
          >
            ✕
          </button>
        </div>

        {/* ── Cuerpo / Mensaje ─────────────────────────────────── */}
        <div className="px-20 py-18">
          <p className="text-13 leading-relaxed text-deep-forest">
            {mensaje}
          </p>
        </div>

        {/* ── Acciones (Paleta Negro / Gris) ────────────────────── */}
        <div className="flex items-center justify-end gap-10 border-t border-concrete bg-ghost-fog px-20 py-14">
          <button
            onClick={onCancelar}
            autoFocus
            type="button"
            className="rounded-md border border-concrete bg-canvas-white px-16 py-8 text-13 font-medium text-ash-graphite hover:bg-vanilla-cream hover:border-stone/40 transition-colors cursor-pointer"
          >
            {labelCancelar ?? "Cancelar"}
          </button>
          <button
            onClick={onAceptar}
            type="button"
            className="rounded-md bg-ash-graphite px-16 py-8 text-13 font-medium text-canvas-white hover:bg-plain-green-muted transition-colors shadow-xs cursor-pointer"
          >
            {labelAceptar ?? "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
