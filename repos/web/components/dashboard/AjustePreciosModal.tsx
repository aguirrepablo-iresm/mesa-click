"use client";

import { useEffect, useMemo, useState } from "react";
import {
  api,
  ArticuloAPI,
  CategoriaAPI,
  getErrorMessage,
  RedondeoAjustePrecios,
} from "@/lib/api";

type CategoriaConItems = CategoriaAPI & { items: ArticuloAPI[] };

interface AjustePreciosModalProps {
  categorias: CategoriaConItems[];
  onClose: () => void;
  onApplied: (actualizados: number) => void | Promise<void>;
}

const formatoPrecio = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
});

export function calcularPrecioAjustado(
  precio: number,
  porcentaje: number,
  redondeo: RedondeoAjustePrecios,
) {
  const ajustado = precio * (1 + porcentaje / 100);
  if (redondeo === "10") return Math.round(ajustado / 10) * 10;
  if (redondeo === "100") return Math.round(ajustado / 100) * 100;
  return Math.round((ajustado + Number.EPSILON) * 100) / 100;
}

export default function AjustePreciosModal({
  categorias,
  onClose,
  onApplied,
}: AjustePreciosModalProps) {
  const [alcance, setAlcance] = useState("toda");
  const [porcentaje, setPorcentaje] = useState("10");
  const [redondeo, setRedondeo] = useState<RedondeoAjustePrecios>("ninguno");
  const [confirmando, setConfirmando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const porcentajeNumero = Number(porcentaje);
  const porcentajeValido =
    Number.isFinite(porcentajeNumero) &&
    porcentajeNumero !== 0 &&
    porcentajeNumero >= -100 &&
    porcentajeNumero <= 1000;

  const itemsAfectados = useMemo(() => {
    if (alcance === "toda") return categorias.flatMap((categoria) => categoria.items);
    return categorias.find((categoria) => categoria.id === alcance)?.items ?? [];
  }, [alcance, categorias]);

  const ejemplos = itemsAfectados.slice(0, 4);
  const categoriaSeleccionada = categorias.find((categoria) => categoria.id === alcance);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !guardando) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [guardando, onClose]);

  const resetConfirmacion = () => {
    setConfirmando(false);
    setError("");
  };

  const aplicarAjuste = async () => {
    if (!porcentajeValido || itemsAfectados.length === 0) return;

    try {
      setGuardando(true);
      setError("");
      const resultado = await api.ajustarPrecios({
        categoria_id: alcance === "toda" ? undefined : alcance,
        porcentaje: porcentajeNumero,
        redondeo,
      });
      await onApplied(resultado.actualizados);
      onClose();
    } catch (err: unknown) {
      setConfirmando(false);
      setError(getErrorMessage(err, "No pudimos actualizar los precios."));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-system-black/45 p-12 flex items-center justify-center"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !guardando) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="ajuste-precios-title"
        className="w-[min(720px,calc(100vw-24px))] h-[min(640px,calc(100dvh-24px))] bg-canvas-white border border-concrete rounded-xl shadow-2xl overflow-hidden flex flex-col"
      >
        <header className="px-20 sm:px-24 py-16 border-b border-concrete flex items-start justify-between gap-16 shrink-0">
          <div>
            <div className="text-10 font-mono uppercase tracking-wider text-stone">
              Ajuste masivo
            </div>
            <h3 id="ajuste-precios-title" className="text-18 font-semibold text-ash-graphite mt-4">
              Actualizar precios
            </h3>
            <p className="text-12 text-sage-green mt-4">
              Previsualizá el resultado antes de modificar la carta.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="h-40 w-40 min-h-40 min-w-40 rounded-md flex items-center justify-center text-sage-green hover:bg-ghost-fog disabled:opacity-40"
            aria-label="Cerrar ajuste de precios"
          >
            <span className="material-symbols-outlined text-20">close</span>
          </button>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto p-16 sm:p-24 space-y-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            <label className="space-y-6">
              <span className="block text-10 font-mono uppercase tracking-wider text-sage-green">
                Aplicar a
              </span>
              <select
                value={alcance}
                disabled={guardando}
                onChange={(event) => {
                  setAlcance(event.target.value);
                  resetConfirmacion();
                }}
                className="w-full h-44 px-12 bg-canvas-white border border-ash-graphite rounded-md text-13"
              >
                <option value="toda">Toda la carta</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-6">
              <span className="block text-10 font-mono uppercase tracking-wider text-sage-green">
                Porcentaje
              </span>
              <div className="relative">
                <input
                  type="number"
                  min="-100"
                  max="1000"
                  step="0.1"
                  value={porcentaje}
                  disabled={guardando}
                  onChange={(event) => {
                    setPorcentaje(event.target.value);
                    resetConfirmacion();
                  }}
                  className={`w-full h-44 px-12 pr-40 bg-canvas-white border rounded-md text-14 font-mono ${
                    porcentajeValido ? "border-ash-graphite" : "border-alert-red"
                  }`}
                  aria-invalid={!porcentajeValido}
                />
                <span className="absolute inset-y-0 right-12 flex items-center text-13 text-sage-green">%</span>
              </div>
            </label>
          </div>

          {!porcentajeValido && (
            <p className="text-11 text-alert-red">
              Ingresá un porcentaje distinto de cero, entre -100 y 1000.
            </p>
          )}

          <fieldset className="space-y-8">
            <legend className="text-10 font-mono uppercase tracking-wider text-sage-green">
              Redondeo del precio final
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8" role="radiogroup" aria-label="Redondeo del precio final">
              {([
                ["ninguno", "Sin redondeo"],
                ["10", "Múltiplo de 10"],
                ["100", "Múltiplo de 100"],
              ] as Array<[RedondeoAjustePrecios, string]>).map(([valor, etiqueta]) => (
                <button
                  type="button"
                  key={valor}
                  role="radio"
                  aria-checked={redondeo === valor}
                  disabled={guardando}
                  onClick={() => {
                    setRedondeo(valor);
                    resetConfirmacion();
                  }}
                  className={`h-48 min-h-48 px-12 rounded-lg border flex items-center gap-8 text-left text-12 transition-all disabled:opacity-40 ${
                    redondeo === valor
                      ? "border-concrete bg-vanilla-cream text-ash-graphite shadow-sm"
                      : "border-concrete bg-canvas-white text-sage-green hover:bg-ghost-fog"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-16 w-16 min-h-16 min-w-16 rounded-full border flex items-center justify-center ${
                      redondeo === valor ? "border-ash-graphite" : "border-stone"
                    }`}
                  >
                    {redondeo === valor && (
                      <span className="h-8 w-8 min-h-8 min-w-8 rounded-full bg-ash-graphite" />
                    )}
                  </span>
                  <span className="leading-tight">{etiqueta}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="rounded-lg border border-concrete overflow-hidden">
            <div className="px-14 py-10 bg-vanilla-cream flex items-center justify-between gap-12">
              <div>
                <div className="text-12 font-semibold text-ash-graphite">Previsualización</div>
                <div className="text-11 text-sage-green mt-2">
                  {alcance === "toda" ? "Toda la carta" : categoriaSeleccionada?.nombre}
                </div>
              </div>
              <span className="text-11 font-mono text-sage-green whitespace-nowrap">
                {itemsAfectados.length} {itemsAfectados.length === 1 ? "producto" : "productos"}
              </span>
            </div>

            {ejemplos.length > 0 && porcentajeValido ? (
              <div className="divide-y divide-ghost-fog">
                {ejemplos.map((item) => {
                  const nuevoPrecio = calcularPrecioAjustado(item.precio, porcentajeNumero, redondeo);
                  return (
                    <div key={item.id} className="px-14 py-10 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-12 gap-y-4 text-12">
                      <span className="truncate text-ash-graphite">{item.nombre}</span>
                      <div className="flex items-center justify-between gap-12 sm:contents">
                        <span className="font-mono text-sage-green line-through whitespace-nowrap">
                          {formatoPrecio.format(item.precio)}
                        </span>
                        <span className="font-mono font-semibold text-ash-graphite whitespace-nowrap">
                          {formatoPrecio.format(nuevoPrecio)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {itemsAfectados.length > ejemplos.length && (
                  <div className="px-14 py-8 text-11 text-center text-sage-green">
                    y {itemsAfectados.length - ejemplos.length} productos más
                  </div>
                )}
              </div>
            ) : (
              <div className="px-14 py-16 text-12 text-center text-sage-green">
                {itemsAfectados.length === 0
                  ? "No hay productos en este alcance."
                  : "Ingresá un porcentaje válido para ver el resultado."}
              </div>
            )}
          </div>

          {error && (
            <div className="p-12 border border-alert-red/30 bg-red-50 rounded-md text-12 text-alert-red">
              {error}
            </div>
          )}

          {confirmando && (
            <div className="p-14 border border-system-black rounded-md bg-ghost-fog">
              <div className="flex items-start gap-10">
                <span className="material-symbols-outlined text-20 text-ash-graphite">warning</span>
                <div>
                  <p className="text-12 font-semibold text-ash-graphite">
                    ¿Confirmás la actualización de {itemsAfectados.length} {itemsAfectados.length === 1 ? "producto" : "productos"}?
                  </p>
                  <p className="text-11 text-sage-green mt-4">
                    Los precios actuales se reemplazarán por los valores previsualizados.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="px-16 sm:px-24 py-12 border-t border-concrete bg-canvas-white flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-8 shrink-0">
          <button
            type="button"
            onClick={confirmando ? () => setConfirmando(false) : onClose}
            disabled={guardando}
            className="h-44 px-16 rounded-md border border-concrete text-12 font-medium text-ash-graphite hover:bg-ghost-fog disabled:opacity-40"
          >
            {confirmando ? "Volver" : "Cancelar"}
          </button>
          <button
            type="button"
            onClick={confirmando ? aplicarAjuste : () => setConfirmando(true)}
            disabled={!porcentajeValido || itemsAfectados.length === 0 || guardando}
            className="h-44 px-20 rounded-md bg-plain-green text-canvas-white text-12 font-semibold hover:bg-plain-green-muted disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-6"
          >
            {guardando ? (
              <>
                <span className="animate-spin material-symbols-outlined text-16">progress_activity</span>
                Actualizando
              </>
            ) : confirmando ? (
              "Confirmar actualización"
            ) : (
              "Continuar"
            )}
          </button>
        </footer>
      </section>
    </div>
  );
}
