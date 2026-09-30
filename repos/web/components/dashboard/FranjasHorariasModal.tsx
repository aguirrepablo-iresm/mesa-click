"use client";

import { useMemo, useState } from "react";
import { api, FranjaHorariaAPI, getErrorMessage } from "@/lib/api";
import { useConfirm, useToast } from "@/components/ui";
import type { CategoriaConItems } from "./CartaSection";

type Props = {
  categorias: CategoriaConItems[];
  franjas: FranjaHorariaAPI[];
  onClose: () => void;
  onChanged: () => Promise<void>;
};

type FormularioFranja = {
  nombre: string;
  hora_inicio: string;
  hora_fin: string;
};

const formularioInicial: FormularioFranja = {
  nombre: "",
  hora_inicio: "08:00",
  hora_fin: "12:00",
};

function minutos(valor: string) {
  const [hora, minuto] = valor.split(":").map(Number);
  return hora * 60 + minuto;
}

function estaActiva(franja: FranjaHorariaAPI | undefined, hora: string) {
  if (!franja) return true;
  const actual = minutos(hora);
  const inicio = minutos(franja.hora_inicio);
  const fin = minutos(franja.hora_fin);
  return inicio < fin ? actual >= inicio && actual < fin : actual >= inicio || actual < fin;
}

export default function FranjasHorariasModal({ categorias, franjas, onClose, onChanged }: Props) {
  const toast = useToast();
  const confirmar = useConfirm();
  const ahora = new Date();
  const [horaSimulada, setHoraSimulada] = useState(
    `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`,
  );
  const [formulario, setFormulario] = useState<FormularioFranja>(formularioInicial);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const franjasPorId = useMemo(
    () => new Map(franjas.map(franja => [franja.id, franja])),
    [franjas],
  );

  const vistaPrevia = useMemo(
    () => categorias.map(categoria => ({
      ...categoria,
      itemsVisibles: categoria.items.filter(item => {
        if (item.activo === false) return false;
        const franjaId = item.franja_horaria_id || categoria.franja_horaria_id;
        return estaActiva(franjaId ? franjasPorId.get(franjaId) : undefined, horaSimulada);
      }),
    })),
    [categorias, franjasPorId, horaSimulada],
  );

  const guardar = async () => {
    if (!formulario.nombre.trim()) {
      toast.error("Ingresá un nombre para la franja.");
      return;
    }
    if (formulario.hora_inicio === formulario.hora_fin) {
      toast.error("El horario de inicio y fin deben ser distintos.");
      return;
    }

    try {
      setGuardando(true);
      const data = { ...formulario, nombre: formulario.nombre.trim() };
      if (editandoId) {
        await api.actualizarFranjaHoraria(editandoId, data);
        toast.success("Franja actualizada.");
      } else {
        await api.crearFranjaHoraria(data);
        toast.success("Franja creada.");
      }
      setFormulario(formularioInicial);
      setEditandoId(null);
      await onChanged();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "No se pudo guardar la franja horaria."));
    } finally {
      setGuardando(false);
    }
  };

  const editar = (franja: FranjaHorariaAPI) => {
    setEditandoId(franja.id);
    setFormulario({
      nombre: franja.nombre,
      hora_inicio: franja.hora_inicio,
      hora_fin: franja.hora_fin,
    });
  };

  const eliminar = async (franja: FranjaHorariaAPI) => {
    const aceptado = await confirmar({
      titulo: "Eliminar franja horaria",
      mensaje: `¿Eliminás “${franja.nombre}”? Las categorías y productos asociados volverán a quedar sin esa restricción.`,
      labelAceptar: "Sí, eliminar",
      variante: "danger",
    });
    if (!aceptado) return;

    try {
      await api.eliminarFranjaHoraria(franja.id);
      if (editandoId === franja.id) {
        setEditandoId(null);
        setFormulario(formularioInicial);
      }
      await onChanged();
      toast.success("Franja eliminada.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "No se pudo eliminar la franja."));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-0 sm:items-center sm:p-20" role="dialog" aria-modal="true" aria-labelledby="franjas-title">
      <div className="flex max-h-[92dvh] w-full max-w-[920px] flex-col overflow-hidden rounded-t-2xl border border-concrete bg-canvas-white shadow-2xl sm:rounded-2xl">
        <header className="flex items-start justify-between gap-16 border-b border-concrete px-18 py-16 sm:px-24">
          <div>
            <p className="font-mono text-11 uppercase tracking-[0.08em] text-sage-green">Carta dinámica</p>
            <h3 id="franjas-title" className="mt-3 text-20 font-semibold text-ash-graphite">Franjas horarias</h3>
            <p className="mt-3 max-w-[640px] text-12 leading-relaxed text-sage-green sm:text-13">
              Son opcionales. Si no asignás una franja, la categoría o el producto se muestra durante todo el día.
            </p>
          </div>
          <button type="button" onClick={onClose} className="flex h-44 w-44 shrink-0 items-center justify-center rounded-lg text-sage-green hover:bg-ghost-fog hover:text-ash-graphite" aria-label="Cerrar">
            <span className="material-symbols-outlined text-24">close</span>
          </button>
        </header>

        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.85fr)]">
          <section className="space-y-14 border-b border-concrete p-18 sm:p-24 lg:border-b-0 lg:border-r">
            <div>
              <h4 className="text-13 font-semibold text-ash-graphite">{editandoId ? "Editar franja" : "Nueva franja"}</h4>
              <div className="mt-10 grid grid-cols-2 gap-8">
                <input
                  value={formulario.nombre}
                  onChange={event => setFormulario(actual => ({ ...actual, nombre: event.target.value }))}
                  placeholder="Ej. Merienda"
                  className="col-span-2 h-44 rounded-lg border border-concrete px-11 text-13 outline-none focus:border-plain-green"
                />
                <label className="space-y-4 text-10 font-semibold uppercase tracking-wide text-sage-green">
                  <span>Desde</span>
                  <input type="time" value={formulario.hora_inicio} onChange={event => setFormulario(actual => ({ ...actual, hora_inicio: event.target.value }))} className="h-44 w-full rounded-lg border border-concrete px-10 font-mono text-13 text-ash-graphite outline-none focus:border-plain-green" />
                </label>
                <label className="space-y-4 text-10 font-semibold uppercase tracking-wide text-sage-green">
                  <span>Hasta</span>
                  <input type="time" value={formulario.hora_fin} onChange={event => setFormulario(actual => ({ ...actual, hora_fin: event.target.value }))} className="h-44 w-full rounded-lg border border-concrete px-10 font-mono text-13 text-ash-graphite outline-none focus:border-plain-green" />
                </label>
              </div>
              <div className="mt-10 flex justify-end gap-8">
                {editandoId && (
                  <button type="button" onClick={() => { setEditandoId(null); setFormulario(formularioInicial); }} className="h-44 rounded-lg px-12 text-12 font-semibold text-sage-green hover:bg-ghost-fog">Cancelar</button>
                )}
                <button type="button" disabled={guardando} onClick={() => void guardar()} className="h-44 rounded-lg bg-plain-green px-16 text-12 font-semibold text-canvas-white hover:bg-plain-green-muted disabled:opacity-50">
                  {guardando ? "Guardando..." : editandoId ? "Guardar cambios" : "Crear franja"}
                </button>
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="text-13 font-semibold text-ash-graphite">Franjas configuradas</h4>
              {franjas.length === 0 ? (
                <div className="rounded-xl border border-dashed border-concrete bg-ghost-fog/45 p-16 text-center text-12 text-sage-green">
                  Todavía no hay franjas. La carta permanece disponible todo el día.
                </div>
              ) : franjas.map(franja => (
                <div key={franja.id} className="flex items-center justify-between gap-12 rounded-xl border border-concrete px-12 py-10">
                  <div className="min-w-0">
                    <p className="truncate text-13 font-semibold text-ash-graphite">{franja.nombre}</p>
                    <p className="mt-2 font-mono text-11 text-sage-green">{franja.hora_inicio} — {franja.hora_fin}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => editar(franja)} className="flex h-44 w-44 items-center justify-center rounded-lg text-sage-green hover:bg-ghost-fog hover:text-ash-graphite" aria-label={`Editar ${franja.nombre}`}>
                      <span className="material-symbols-outlined text-19">edit</span>
                    </button>
                    <button type="button" onClick={() => void eliminar(franja)} className="flex h-44 w-44 items-center justify-center rounded-lg text-alert-red hover:bg-warm-pink/20" aria-label={`Eliminar ${franja.nombre}`}>
                      <span className="material-symbols-outlined text-19">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-14 bg-ghost-fog/45 p-18 sm:p-24">
            <div className="flex items-end justify-between gap-12">
              <div>
                <h4 className="text-13 font-semibold text-ash-graphite">Vista previa</h4>
                <p className="mt-2 text-11 text-sage-green">Simulá la carta a cualquier hora.</p>
              </div>
              <input type="time" value={horaSimulada} onChange={event => setHoraSimulada(event.target.value)} className="h-44 w-[118px] rounded-lg border border-concrete bg-canvas-white px-10 font-mono text-13 text-ash-graphite outline-none focus:border-plain-green" aria-label="Hora simulada" />
            </div>

            <div className="space-y-8">
              {vistaPrevia.map(categoria => {
                const totalActivos = categoria.items.filter(item => item.activo !== false).length;
                const visible = categoria.itemsVisibles.length;
                return (
                  <div key={categoria.id} className="rounded-xl border border-concrete bg-canvas-white p-12">
                    <div className="flex items-center justify-between gap-10">
                      <p className="truncate text-13 font-semibold text-ash-graphite">{categoria.nombre}</p>
                      <span className={`rounded-full px-8 py-3 text-10 font-semibold ${visible > 0 ? "bg-success/10 text-[#087645]" : "bg-ghost-fog text-sage-green"}`}>
                        {totalActivos === 0 ? "Sin productos" : visible > 0 ? `${visible} visibles` : "Fuera de horario"}
                      </span>
                    </div>
                    {totalActivos > 0 && (
                      <div className="mt-8 h-4 overflow-hidden rounded-full bg-ghost-fog">
                        <div className="h-full rounded-full bg-success-muted transition-all" style={{ width: `${(visible / totalActivos) * 100}%` }} />
                      </div>
                    )}
                  </div>
                );
              })}
              {vistaPrevia.length === 0 && <p className="py-20 text-center text-12 text-sage-green">Creá categorías para previsualizar la carta.</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
