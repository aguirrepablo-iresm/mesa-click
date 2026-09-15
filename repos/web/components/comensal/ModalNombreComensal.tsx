"use client";

import { useState } from "react";

interface Props {
  nombreInicial?: string;
  editando?: boolean;
  onConfirmar: (nombre: string) => void;
  onCancelar?: () => void;
}

export default function ModalNombreComensal({
  nombreInicial = "",
  editando = false,
  onConfirmar,
  onCancelar,
}: Props) {
  const [nombre, setNombre] = useState(nombreInicial);
  const nombreValido = nombre.trim().length > 0;

  const confirmar = () => {
    if (!nombreValido) return;
    onConfirmar(nombre.trim());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 p-12 sm:items-center sm:p-24">
      <section
        className="mesa-surface mesa-border w-full max-w-sm rounded-xl border p-20 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nombre-comensal-titulo"
      >
        <div className="mesa-primary-soft flex h-48 w-48 items-center justify-center rounded-full text-24" aria-hidden="true">
          👋
        </div>
        <h2 id="nombre-comensal-titulo" className="mesa-text mt-16 text-18 font-semibold">
          {editando ? "Cambiar nombre" : "¿Cómo te llamás?"}
        </h2>
        <p className="mesa-muted mt-6 text-13 leading-relaxed">
          Usaremos este nombre para identificar tus consumos dentro de esta mesa.
        </p>

        <label htmlFor="nombre-comensal" className="mesa-text mt-18 block text-12 font-medium">
          Nombre o alias
        </label>
        <input
          id="nombre-comensal"
          type="text"
          autoComplete="nickname"
          autoFocus
          maxLength={100}
          value={nombre}
          onChange={event => setNombre(event.target.value)}
          onKeyDown={event => {
            if (event.key === "Enter") confirmar();
          }}
          placeholder="Ej. Mateo"
          className="mesa-surface mesa-text mesa-border mt-6 min-h-48 w-full rounded-lg border px-14 py-10 text-16 outline-none focus:border-[var(--mesa-primary)]"
        />

        <div className="mt-20 flex flex-col-reverse gap-8 sm:flex-row sm:justify-end">
          {editando && onCancelar && (
            <button
              type="button"
              onClick={onCancelar}
              className="mesa-surface mesa-muted mesa-border min-h-44 rounded-md border px-14 py-8 text-13 font-medium"
            >
              Cancelar
            </button>
          )}
          <button
            type="button"
            onClick={confirmar}
            disabled={!nombreValido}
            className="mesa-primary-bg min-h-48 rounded-md px-18 py-10 text-14 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {editando ? "Guardar" : "Comenzar a pedir"}
          </button>
        </div>
      </section>
    </div>
  );
}
