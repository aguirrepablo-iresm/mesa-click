"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  qrToken: string;
  googleReviewUrl?: string | null;
  onResenaEnviada: () => void;
}

export function resolverGoogleReviewUrl(input?: string | null): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Si ya tiene protocolo absoluto http:// o https://
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Quitar puntos finales accidentales (ej: "ChIJb6e6_fK0vJURbZ0S9RCRvO0.")
  const sinPuntos = trimmed.replace(/\.+$/, "");

  // Si es un Google Place ID (comienza con ChIJ o no tiene barras ni dominio)
  if (sinPuntos.startsWith("ChIJ") || (!sinPuntos.includes("/") && !sinPuntos.includes("."))) {
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(sinPuntos)}`;
  }

  // Si es un dominio como g.page/r/... o maps.google.com/... sin protocolo
  return `https://${trimmed}`;
}

const ETIQUETAS_ESTRELLAS: Record<number, string> = {
  1: "Muy mala",
  2: "Mala",
  3: "Regular",
  4: "Muy buena",
  5: "¡Excelente!",
};

export default function ModalResena({
  isOpen,
  onClose,
  qrToken,
  googleReviewUrl,
  onResenaEnviada,
}: Props) {
  const [estrellas, setEstrellas] = useState<number>(0);
  const [hoverEstrellas, setHoverEstrellas] = useState<number>(0);
  const [comentario, setComentario] = useState<string>("");
  const [enviando, setEnviando] = useState<boolean>(false);
  const [enviado, setEnviado] = useState<boolean>(false);
  const [estrellasEnviadas, setEstrellasEnviadas] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [googleClickeado, setGoogleClickeado] = useState<boolean>(false);

  if (!isOpen) return null;

  const estrellasActivas = hoverEstrellas || estrellas;

  const handleEnviar = async () => {
    if (estrellas < 1 || estrellas > 5) return;
    setEnviando(true);
    setError(null);

    try {
      await api.crearResena(qrToken, {
        estrellas,
        comentario: comentario.trim() || undefined,
      });
      setEstrellasEnviadas(estrellas);
      setEnviado(true);
      onResenaEnviada();
    } catch (err: unknown) {
      // Si ya fue calificada (409), tratarlo como completado para no generar fricción
      const mensaje = err instanceof Error ? err.message : String(err);
      if (mensaje.includes("409") || mensaje.toLowerCase().includes("ya existe una reseña")) {
        setEstrellasEnviadas(estrellas);
        setEnviado(true);
        onResenaEnviada();
      } else {
        setError(mensaje || "Hubo un error al enviar tu calificación. Probá de nuevo.");
      }
    } finally {
      setEnviando(false);
    }
  };

  const handleGoogleClick = () => {
    setGoogleClickeado(true);
    void api.registrarClickGoogle(qrToken);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 p-12 sm:items-center sm:p-24 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-resena-titulo"
    >
      <section className="mesa-surface mesa-border w-full max-w-sm rounded-2xl border p-20 sm:p-24 shadow-2xl relative">
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal de calificación"
          className="absolute top-14 right-14 mesa-muted hover:text-[var(--mesa-text)] p-6 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined text-20 leading-none">close</span>
        </button>

        {!enviado ? (
          <div>
            <div className="mesa-primary-soft flex h-48 w-48 items-center justify-center rounded-full text-24 mb-14" aria-hidden="true">
              ⭐
            </div>

            <h2 id="modal-resena-titulo" className="mesa-text text-18 font-bold">
              ¿Cómo estuvo tu experiencia?
            </h2>
            <p className="mesa-muted mt-4 text-13 leading-relaxed">
              Tu opinión nos ayuda a brindarte el mejor servicio cada día.
            </p>

            {/* Selector de estrellas interactivo */}
            <div className="mt-20 flex flex-col items-center">
              <div
                className="flex items-center gap-6"
                role="radiogroup"
                aria-label="Calificación de 1 a 5 estrellas"
              >
                {[1, 2, 3, 4, 5].map((val) => {
                  const seleccionada = val <= estrellasActivas;
                  return (
                    <button
                      key={val}
                      type="button"
                      role="radio"
                      aria-checked={estrellas === val}
                      aria-label={`${val} de 5 estrellas`}
                      onClick={() => setEstrellas(val)}
                      onMouseEnter={() => setHoverEstrellas(val)}
                      onMouseLeave={() => setHoverEstrellas(0)}
                      className="group flex h-44 w-44 items-center justify-center rounded-full transition-transform active:scale-90 hover:scale-110 focus:outline-hidden"
                    >
                      <span
                        className={`material-symbols-outlined text-34 transition-colors ${
                          seleccionada
                            ? "text-amber-400 fill-1 font-semibold"
                            : "mesa-muted opacity-40 group-hover:opacity-75"
                        }`}
                      >
                        {seleccionada ? "star" : "star_border"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <span className="mt-8 text-13 font-medium text-amber-500 min-h-[20px]">
                {estrellasActivas > 0 ? ETIQUETAS_ESTRELLAS[estrellasActivas] : "Tocá una estrella"}
              </span>
            </div>

            {/* Comentario opcional */}
            <div className="mt-18">
              <label htmlFor="comentario-resena" className="mesa-text block text-12 font-medium mb-6">
                Comentario opcional
              </label>
              <textarea
                id="comentario-resena"
                rows={3}
                maxLength={500}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="¿Qué te pareció la comida, la atención o el ambiente?"
                className="mesa-surface mesa-text mesa-border w-full rounded-xl border p-12 text-13 outline-none resize-none focus:border-[var(--mesa-primary)] placeholder:text-slate-400 transition-colors"
              />
              <div className="mt-4 flex justify-end">
                <span className="mesa-subtle-text text-11">{comentario.length}/500</span>
              </div>
            </div>

            {error && (
              <p className="mt-10 text-12 text-rose-500 font-medium text-center">
                {error}
              </p>
            )}

            {/* Botón Enviar */}
            <div className="mt-20">
              <button
                type="button"
                onClick={handleEnviar}
                disabled={estrellas === 0 || enviando}
                className="mesa-primary-bg min-h-48 w-full rounded-xl px-18 py-10 text-14 font-semibold shadow-xs disabled:cursor-not-allowed disabled:opacity-50 transition-transform active:scale-98"
              >
                {enviando ? "Enviando..." : "Enviar calificación"}
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center animate-in zoom-in-95 duration-200">
            {estrellasEnviadas >= 4 ? (
              <div>
                <div className="mesa-primary-soft mx-auto flex h-56 w-56 items-center justify-center rounded-full text-28 mb-14" aria-hidden="true">
                  🎉
                </div>
                <h2 className="mesa-text text-18 font-bold">
                  ¡Muchas gracias por tu calificación!
                </h2>
                <p className="mesa-muted mt-6 text-13 leading-relaxed">
                  Nos alegra un montón que hayas disfrutado tu experiencia con nosotros.
                </p>

                {/* Smart Google Review Funnel */}
                {(() => {
                  const urlGoogle = resolverGoogleReviewUrl(googleReviewUrl);
                  if (!urlGoogle) return null;
                  return (
                    <div className="mesa-subtle-surface mesa-border mt-18 rounded-xl border p-14 text-center">
                      <p className="mesa-text text-13 font-semibold mb-4">
                        ¿Nos dejás una reseña en Google?
                      </p>
                      <p className="mesa-muted text-12 leading-relaxed mb-12">
                        Nos ayuda muchísimo a que más personas nos conozcan.
                      </p>
                      <a
                        href={urlGoogle}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleGoogleClick}
                        className="inline-flex items-center justify-center gap-8 w-full min-h-44 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white text-13 font-semibold px-16 shadow-xs transition-colors"
                      >
                        <span className="material-symbols-outlined text-18">star</span>
                        <span>{googleClickeado ? "¡Gracias por recomendarnos!" : "Recomendanos en Google"}</span>
                      </a>
                    </div>
                  );
                })()}

                <button
                  type="button"
                  onClick={onClose}
                  className="mt-18 min-h-44 w-full rounded-lg mesa-surface mesa-text mesa-border border text-13 font-medium transition-colors"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <div>
                <div className="mesa-primary-soft mx-auto flex h-56 w-56 items-center justify-center rounded-full text-28 mb-14" aria-hidden="true">
                  🙏
                </div>
                <h2 className="mesa-text text-18 font-bold">
                  Gracias por tu sinceridad
                </h2>
                <p className="mesa-muted mt-8 text-13 leading-relaxed">
                  Tu feedback es privado y lo revisamos directamente con el equipo para corregir cualquier detalle y seguir mejorando.
                </p>

                <button
                  type="button"
                  onClick={onClose}
                  className="mt-20 min-h-48 w-full rounded-xl mesa-primary-bg text-14 font-semibold shadow-xs transition-transform active:scale-98"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

