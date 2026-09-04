import React, { useState } from "react";

type DiaKey = "lunes" | "martes" | "miercoles" | "jueves" | "viernes" | "sabado" | "domingo";

type TramoHorario = {
  apertura: string;
  cierre: string;
};

type DiaHorario = {
  abierto: boolean;
  tramos: TramoHorario[];
};

type HorariosSemana = Record<DiaKey, DiaHorario>;

const DIAS: Array<{ key: DiaKey; label: string; corto: string }> = [
  { key: "lunes", label: "Lunes", corto: "Lun" },
  { key: "martes", label: "Martes", corto: "Mar" },
  { key: "miercoles", label: "Miércoles", corto: "Mié" },
  { key: "jueves", label: "Jueves", corto: "Jue" },
  { key: "viernes", label: "Viernes", corto: "Vie" },
  { key: "sabado", label: "Sábado", corto: "Sáb" },
  { key: "domingo", label: "Domingo", corto: "Dom" },
];

const DEFAULT_TRAMO: TramoHorario = { apertura: "08:00", cierre: "00:00" };
const SEGUNDO_TRAMO: TramoHorario = { apertura: "15:00", cierre: "23:00" };

function crearHorarioDefault(): HorariosSemana {
  return DIAS.reduce((acc, dia) => {
    acc[dia.key] = { abierto: true, tramos: [{ ...DEFAULT_TRAMO }] };
    return acc;
  }, {} as HorariosSemana);
}

function limpiarTramos(tramos: TramoHorario[]) {
  const base = tramos.length > 0 ? tramos : [DEFAULT_TRAMO];
  return base.slice(0, 2).map((tramo) => ({
    apertura: tramo.apertura || DEFAULT_TRAMO.apertura,
    cierre: tramo.cierre || DEFAULT_TRAMO.cierre,
  }));
}

function esHorarioSemana(value: unknown): value is HorariosSemana {
  if (typeof value !== "object" || value === null) return false;
  return DIAS.every((dia) => {
    const item = (value as Record<string, unknown>)[dia.key];
    if (typeof item !== "object" || item === null) return false;
    const abierto = (item as Record<string, unknown>).abierto;
    const tramos = (item as Record<string, unknown>).tramos;
    return typeof abierto === "boolean" && Array.isArray(tramos);
  });
}

function normalizarHorarios(horarios: HorariosSemana): HorariosSemana {
  return DIAS.reduce((acc, dia) => {
    const diaHorario = horarios[dia.key];
    acc[dia.key] = {
      abierto: diaHorario.abierto,
      tramos: limpiarTramos(diaHorario.tramos),
    };
    return acc;
  }, {} as HorariosSemana);
}

function parseHorarios(horarios: string): HorariosSemana {
  try {
    const parsed: unknown = JSON.parse(horarios);
    if (esHorarioSemana(parsed)) return normalizarHorarios(parsed);
  } catch {
    // Compatibilidad con el formato anterior: "Lun a Dom: 08:00 a 00:00".
  }

  const horas = horarios.match(/\b(?:[01]\d|2[0-3]):[0-5]\d\b/g);
  const base = crearHorarioDefault();
  if (horas?.[0] && horas?.[1]) {
    DIAS.forEach((dia) => {
      base[dia.key] = { abierto: true, tramos: [{ apertura: horas[0], cierre: horas[1] }] };
    });
  }
  return base;
}

function serializeHorarios(horarios: HorariosSemana) {
  return JSON.stringify(horarios);
}

function mismosTramos(a: TramoHorario[], b: TramoHorario[]) {
  const left = limpiarTramos(a);
  const right = limpiarTramos(b);
  return (
    left.length === right.length &&
    left.every((tramo, index) => (
      tramo.apertura === right[index].apertura && tramo.cierre === right[index].cierre
    ))
  );
}

function resumenDia(horario: DiaHorario) {
  if (!horario.abierto) return "Cerrado";
  return limpiarTramos(horario.tramos)
    .map((tramo) => `${tramo.apertura}-${tramo.cierre}`)
    .join(", ");
}

function resumenHorarios(horarios: HorariosSemana) {
  const abiertos = DIAS.filter((dia) => horarios[dia.key].abierto);
  if (abiertos.length === 0) return "Sin días abiertos";

  const primerHorario = horarios[abiertos[0].key].tramos;
  const todosIguales = abiertos.every((dia) => mismosTramos(horarios[dia.key].tramos, primerHorario));

  if (todosIguales) {
    return `${abiertos.map((dia) => dia.corto).join(", ")} · ${resumenDia(horarios[abiertos[0].key])}`;
  }

  return DIAS.map((dia) => `${dia.corto}: ${resumenDia(horarios[dia.key])}`).join(" · ");
}

function TimeField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block text-10 font-mono text-sage-green uppercase tracking-wider px-1">
        {label}
      </label>
      <input
        type="time"
        required
        step="900"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-40 w-120 max-w-full px-8 bg-canvas-white border border-ash-graphite rounded-md focus:border-plain-green outline-none transition-all text-12 font-mono disabled:opacity-50"
      />
    </div>
  );
}

interface StepBranchProps {
  data: {
    sucursalNombre: string;
    whatsapp: string;
    emailSucursal: string;
    horarios: string;
  };
  errors?: Partial<Record<"sucursalNombre" | "emailSucursal", string>>;
  loading: boolean;
  error: string;
  onChange: (fields: Partial<{
    sucursalNombre: string;
    whatsapp: string;
    emailSucursal: string;
    horarios: string;
  }>) => void;
  onComplete: () => void;
}

export default function StepBranch({
  data,
  errors = {},
  loading,
  error,
  onChange,
  onComplete,
}: StepBranchProps) {
  const [mostrarAvanzado, setMostrarAvanzado] = useState(false);
  const [diaEditando, setDiaEditando] = useState<DiaKey | null>(null);
  const horarios = parseHorarios(data.horarios);
  const diasAbiertos = DIAS.filter((dia) => horarios[dia.key].abierto);
  const tramosBase = limpiarTramos(
    diasAbiertos.length > 0 ? horarios[diasAbiertos[0].key].tramos : [DEFAULT_TRAMO],
  );

  const updateHorarios = (next: HorariosSemana) => {
    onChange({ horarios: serializeHorarios(next) });
  };

  const aplicarTramosADiasAbiertos = (tramos: TramoHorario[]) => {
    const tramosLimpios = limpiarTramos(tramos);
    const next = DIAS.reduce((acc, dia) => {
      const diaHorario = horarios[dia.key];
      acc[dia.key] = {
        ...diaHorario,
        tramos: diaHorario.abierto ? tramosLimpios.map((tramo) => ({ ...tramo })) : diaHorario.tramos,
      };
      return acc;
    }, {} as HorariosSemana);
    updateHorarios(next);
  };

  const toggleDia = (diaKey: DiaKey) => {
    const dia = horarios[diaKey];
    updateHorarios({
      ...horarios,
      [diaKey]: {
        abierto: !dia.abierto,
        tramos: dia.tramos.length > 0 ? dia.tramos : tramosBase,
      },
    });
  };

  const updateTramoBase = (tramoIndex: number, campo: keyof TramoHorario, value: string) => {
    aplicarTramosADiasAbiertos(
      tramosBase.map((tramo, index) =>
        index === tramoIndex ? { ...tramo, [campo]: value } : tramo,
      ),
    );
  };

  const agregarTramoBase = () => {
    if (tramosBase.length >= 2) return;
    aplicarTramosADiasAbiertos([...tramosBase, { ...SEGUNDO_TRAMO }]);
  };

  const quitarTramoBase = (tramoIndex: number) => {
    aplicarTramosADiasAbiertos(tramosBase.filter((_, index) => index !== tramoIndex));
  };

  const updateTramoDia = (
    diaKey: DiaKey,
    tramoIndex: number,
    campo: keyof TramoHorario,
    value: string,
  ) => {
    const dia = horarios[diaKey];
    updateHorarios({
      ...horarios,
      [diaKey]: {
        ...dia,
        tramos: limpiarTramos(dia.tramos).map((tramo, index) =>
          index === tramoIndex ? { ...tramo, [campo]: value } : tramo,
        ),
      },
    });
  };

  const agregarTramoDia = (diaKey: DiaKey) => {
    const dia = horarios[diaKey];
    const tramos = limpiarTramos(dia.tramos);
    if (tramos.length >= 2) return;
    updateHorarios({
      ...horarios,
      [diaKey]: {
        ...dia,
        abierto: true,
        tramos: [...tramos, { ...SEGUNDO_TRAMO }],
      },
    });
  };

  const quitarTramoDia = (diaKey: DiaKey, tramoIndex: number) => {
    const dia = horarios[diaKey];
    const tramos = limpiarTramos(dia.tramos).filter((_, index) => index !== tramoIndex);
    updateHorarios({
      ...horarios,
      [diaKey]: {
        ...dia,
        tramos: limpiarTramos(tramos),
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete();
  };

  return (
    <div className="space-y-24 font-inter">
      <form onSubmit={handleSubmit} className="space-y-20">
        <div className="bg-vanilla-cream p-20 rounded-lg border border-system-black shadow-sm space-y-16">
          <div className="flex items-center gap-8 text-ash-graphite mb-4">
            <span className="material-symbols-outlined text-20">location_on</span>
            <h3 className="font-medium text-11 font-mono uppercase tracking-wider">
              Primera Sucursal
            </h3>
          </div>

          <div className="space-y-14">
            <div className="space-y-6">
              <label className="text-11 font-mono text-sage-green uppercase tracking-wider px-1">
                Nombre de la Sucursal
              </label>
              <input
                type="text"
                required
                value={data.sucursalNombre}
                onChange={(e) => onChange({ sucursalNombre: e.target.value })}
                placeholder="Ej: Casa central"
                aria-invalid={Boolean(errors.sucursalNombre)}
                className={`w-full h-40 px-12 bg-canvas-white border rounded-md focus:border-plain-green outline-none transition-all text-14 ${
                  errors.sucursalNombre ? "border-alert-red" : "border-ash-graphite"
                }`}
              />
              {errors.sucursalNombre && (
                <p className="text-11 text-alert-red px-1">{errors.sucursalNombre}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <label className="text-11 font-mono text-sage-green uppercase tracking-wider px-1">
                  WhatsApp de Contacto (Opcional)
                </label>
                <input
                  type="tel"
                  value={data.whatsapp}
                  onChange={(e) => onChange({ whatsapp: e.target.value })}
                  placeholder="+54 9 11 1234-5678"
                  className="w-full h-40 px-12 bg-canvas-white border border-ash-graphite rounded-md focus:border-plain-green outline-none transition-all text-14"
                />
              </div>

              <div className="space-y-6">
                <label className="text-11 font-mono text-sage-green uppercase tracking-wider px-1">
                  Email de Sucursal (Opcional)
                </label>
                <input
                  type="email"
                  value={data.emailSucursal}
                  onChange={(e) => onChange({ emailSucursal: e.target.value })}
                  placeholder="sucursal@minegocio.com"
                  aria-invalid={Boolean(errors.emailSucursal)}
                  className={`w-full h-40 px-12 bg-canvas-white border rounded-md focus:border-plain-green outline-none transition-all text-14 ${
                    errors.emailSucursal ? "border-alert-red" : "border-ash-graphite"
                  }`}
                />
                {errors.emailSucursal && (
                  <p className="text-11 text-alert-red px-1">{errors.emailSucursal}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-vanilla-cream p-20 rounded-lg border border-system-black shadow-sm space-y-14">
          <div className="flex items-center justify-between gap-12">
            <div className="flex items-center gap-8 text-ash-graphite">
              <span className="material-symbols-outlined text-20">schedule</span>
              <h3 className="font-medium text-11 font-mono uppercase tracking-wider">
                Horarios de Atención
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setMostrarAvanzado((value) => !value)}
              className="h-32 px-10 rounded-md border border-ash-graphite/30 text-11 font-mono uppercase tracking-wider flex items-center gap-6 hover:border-plain-green"
            >
              <span className="material-symbols-outlined text-16">
                {mostrarAvanzado ? "expand_less" : "tune"}
              </span>
              {mostrarAvanzado ? "Ocultar" : "Personalizar"}
            </button>
          </div>

          <div className="space-y-8">
            <span className="block text-10 font-mono text-sage-green uppercase tracking-wider px-1">
              Días abiertos
            </span>
            <div className="flex flex-wrap gap-6">
              {DIAS.map((dia) => {
                const abierto = horarios[dia.key].abierto;
                return (
                  <button
                    key={dia.key}
                    type="button"
                    onClick={() => toggleDia(dia.key)}
                    aria-pressed={abierto}
                    className={`h-32 min-w-44 px-10 rounded-md border text-11 font-mono uppercase tracking-wider transition-all ${
                      abierto
                        ? "bg-plain-green text-canvas-white border-plain-green"
                        : "bg-canvas-white text-sage-green border-ash-graphite/30"
                    }`}
                  >
                    {dia.corto}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-10">
            <div className="flex items-center justify-between gap-12">
              <span className="text-10 font-mono text-sage-green uppercase tracking-wider px-1">
                Horario para días abiertos
              </span>
              {diasAbiertos.length === 0 && (
                <span className="text-10 text-alert-red">Marcá al menos un día abierto</span>
              )}
            </div>

            <div className="flex flex-col md:flex-row md:items-start gap-12 md:justify-between">
              <div className="space-y-8">
                {tramosBase.map((tramo, index) => (
                  <div key={index} className="flex flex-wrap items-end gap-8">
                    <TimeField
                      label="Apertura"
                      value={tramo.apertura}
                      disabled={diasAbiertos.length === 0}
                      onChange={(value) => updateTramoBase(index, "apertura", value)}
                    />
                    <TimeField
                      label="Cierre"
                      value={tramo.cierre}
                      disabled={diasAbiertos.length === 0}
                      onChange={(value) => updateTramoBase(index, "cierre", value)}
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => quitarTramoBase(index)}
                        title="Quitar turno"
                        className="h-40 w-40 rounded-md border border-ash-graphite/30 flex items-center justify-center hover:border-alert-red hover:text-alert-red"
                      >
                        <span className="material-symbols-outlined text-18">remove</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {tramosBase.length < 2 && diasAbiertos.length > 0 && (
                <button
                  type="button"
                  onClick={agregarTramoBase}
                  className="h-32 px-10 rounded-md border border-ash-graphite/30 text-11 font-mono uppercase tracking-wider flex items-center gap-6 hover:border-plain-green md:mt-16 md:shrink-0"
                >
                  <span className="material-symbols-outlined text-16">add</span>
                  Agregar segundo turno
                </button>
              )}
            </div>
          </div>

          <div className="rounded-md bg-ghost-fog px-12 py-10 text-11 text-sage-green font-mono break-words">
            {resumenHorarios(horarios)}
          </div>

          {mostrarAvanzado && (
            <div className="border-t border-ash-graphite/20 pt-10 space-y-2">
              {DIAS.map((dia) => {
                const diaHorario = horarios[dia.key];
                const editando = diaEditando === dia.key;
                const tramosDia = limpiarTramos(diaHorario.tramos);
                return (
                  <div key={dia.key} className="border-b border-ash-graphite/10 py-8 last:border-b-0">
                    <div className="flex items-center justify-between gap-10">
                      <div className="min-w-0">
                        <div className="text-12 font-medium text-ash-graphite">{dia.label}</div>
                        <div className="text-11 text-sage-green font-mono truncate">
                          {resumenDia(diaHorario)}
                        </div>
                      </div>
                      <div className="flex items-center gap-8 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleDia(dia.key)}
                          className={`h-30 px-8 rounded-md border text-10 font-mono uppercase tracking-wider ${
                            diaHorario.abierto
                              ? "bg-plain-green text-canvas-white border-plain-green"
                              : "bg-canvas-white text-sage-green border-ash-graphite/30"
                          }`}
                        >
                          {diaHorario.abierto ? "Abierto" : "Cerrado"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiaEditando(editando ? null : dia.key)}
                          title={`Editar ${dia.label}`}
                          className="h-30 w-30 rounded-md border border-ash-graphite/30 flex items-center justify-center hover:border-plain-green"
                        >
                          <span className="material-symbols-outlined text-16">
                            {editando ? "close" : "edit"}
                          </span>
                        </button>
                      </div>
                    </div>

                    {editando && diaHorario.abierto && (
                      <div className="pt-8 space-y-8">
                        <div className="flex flex-col md:flex-row md:items-start gap-12 md:justify-between">
                          <div className="space-y-8">
                            {tramosDia.map((tramo, index) => (
                              <div key={index} className="flex flex-wrap items-end gap-8">
                                <TimeField
                                  label="Apertura"
                                  value={tramo.apertura}
                                  onChange={(value) =>
                                    updateTramoDia(dia.key, index, "apertura", value)
                                  }
                                />
                                <TimeField
                                  label="Cierre"
                                  value={tramo.cierre}
                                  onChange={(value) =>
                                    updateTramoDia(dia.key, index, "cierre", value)
                                  }
                                />
                                {index > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => quitarTramoDia(dia.key, index)}
                                    title="Quitar turno"
                                    className="h-40 w-40 rounded-md border border-ash-graphite/30 flex items-center justify-center hover:border-alert-red hover:text-alert-red"
                                  >
                                    <span className="material-symbols-outlined text-18">remove</span>
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          {tramosDia.length < 2 && (
                            <button
                              type="button"
                              onClick={() => agregarTramoDia(dia.key)}
                              className="h-32 px-10 rounded-md border border-ash-graphite/30 text-11 font-mono uppercase tracking-wider flex items-center gap-6 hover:border-plain-green md:mt-16 md:shrink-0"
                            >
                              <span className="material-symbols-outlined text-16">add</span>
                              Agregar segundo turno
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {error && (
          <div className="p-12 bg-red-50 border border-alert-red/30 rounded text-12 text-alert-red">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || diasAbiertos.length === 0}
          className="w-full h-52 rounded-full bg-plain-green text-canvas-white text-12 font-bold uppercase tracking-wide hover:bg-plain-green-muted active:scale-95 transition-all shadow-lg shadow-plain-green/10 flex items-center justify-center gap-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="animate-spin material-symbols-outlined text-20">progress_activity</span>
          ) : (
            <>
              Finalizar y Crear Negocio
              <span className="material-symbols-outlined text-18">check_circle</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
