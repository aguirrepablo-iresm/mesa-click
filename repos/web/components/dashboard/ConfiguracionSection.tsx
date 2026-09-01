"use client";

import React, { useEffect, useMemo, useState } from "react";
import { api, Tenant, Sucursal } from "@/lib/api";
import EquipoSection from "./EquipoSection";

/* ─────────────────────────── contenedor ─────────────────────────── */

const TABS = ["negocio", "apariencia", "equipo", "sucursales"] as const;
type Tab = (typeof TABS)[number];
const TAB_LABELS: Record<Tab, string> = {
  negocio: "Negocio",
  apariencia: "Apariencia",
  equipo: "Equipo de trabajo",
  sucursales: "Sucursales",
};

export default function ConfiguracionSection() {
  const [tab, setTab] = useState<Tab>("negocio");
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalSelId, setSucursalSelId] = useState("");

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const t = await api.obtenerMiTenant();
        if (vivo) setTenant(t);
      } catch {
        /* sin tenant: la vista sigue funcionando con datos vacíos */
      }
      try {
        const s = await api.listarSucursales();
        if (vivo && s && s.length) {
          setSucursales(s);
          setSucursalSelId(s[0].id);
        }
      } catch {
        /* sin sucursales */
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  const sucursalSel = sucursales.find((s) => s.id === sucursalSelId) ?? null;

  return (
    <div className="p-24 md:p-32 space-y-24 font-inter">
      <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-16">
        <div>
          <h2 className="text-24 font-semibold text-ash-graphite">Configuración</h2>
          <p className="text-13 text-sage-green mt-4">
            Administrá negocio, apariencia del menú, equipo y sucursales.
          </p>
        </div>
        {sucursales.length > 0 && (
          <select
            value={sucursalSelId}
            onChange={(e) => setSucursalSelId(e.target.value)}
            className="h-40 px-12 text-13 rounded-md border border-ash-graphite bg-canvas-white outline-none focus:border-system-black"
          >
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>
                Sucursal: {s.nombre}
              </option>
            ))}
          </select>
        )}
      </header>

      <nav className="flex flex-wrap gap-8">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`h-36 px-16 text-13 font-medium rounded-md border transition-colors ${
              tab === t
                ? "bg-ash-graphite text-canvas-white border-ash-graphite"
                : "border-concrete text-ash-graphite hover:border-ash-graphite"
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </nav>

      {tab === "negocio" && <NegocioTab key={tenant?.id ?? "sin-tenant"} tenant={tenant} />}
      {tab === "apariencia" && (
        <AparienciaTab
          key={`${tenant?.id ?? "sin-tenant"}-${sucursalSel?.id ?? "sin-sucursal"}`}
          sucursal={sucursalSel}
          tenant={tenant}
        />
      )}
      {tab === "equipo" && <EquipoTab />}
      {tab === "sucursales" && (
        <SucursalesTab
          key={sucursalSelId || "sin-sucursal"}
          sucursales={sucursales}
          setSucursales={setSucursales}
          selId={sucursalSelId}
          setSelId={setSucursalSelId}
        />
      )}
    </div>
  );
}

/* ─────────────────────────── piezas comunes ─────────────────────────── */

function Card({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="border border-ash-graphite rounded-lg overflow-hidden bg-canvas-white">
      <div className="px-20 py-10 bg-vanilla-cream border-b border-ash-graphite">
        <p className="text-11 font-mono text-sage-green uppercase tracking-wider">{titulo}</p>
      </div>
      <div className="p-20 space-y-16">{children}</div>
    </div>
  );
}

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-11 font-mono text-sage-green uppercase tracking-wider mb-6">{label}</span>
      {children}
    </label>
  );
}

const INPUT =
  "w-full h-40 px-12 text-14 rounded-md border border-ash-graphite bg-canvas-white outline-none focus:border-system-black";

function PendienteBackend({ us }: { us: string }) {
  return (
    <div className="flex items-start gap-8 p-12 bg-vanilla-cream border border-dashed border-concrete rounded-md text-12 text-sage-green">
      <span className="material-symbols-outlined text-16 shrink-0">construction</span>
      <span>
        Los cambios se guardan solo en esta pantalla. La persistencia real depende de {us} (backend Go),
        todavía pendiente.
      </span>
    </div>
  );
}

function Guardado({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <p className="flex items-center gap-6 text-12 font-medium text-success-muted">
      <span className="material-symbols-outlined text-16">check</span>
      Cambios guardados en la pantalla.
    </p>
  );
}

function PillPrimaria({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-40 px-20 rounded-full bg-plain-green text-canvas-white text-12 font-bold uppercase tracking-wide hover:opacity-85 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

/* ─────────────────────────── tab: Negocio ─────────────────────────── */

const RUBROS = ["Cafetería", "Bar", "Restaurante", "Cervecería", "Pizzería", "Otro"];

function NegocioTab({ tenant }: { tenant: Tenant | null }) {
  const [form, setForm] = useState(() => ({
    nombre: tenant?.nombre ?? "",
    rubro: RUBROS[0],
    emailAdmin: "",
    whatsapp: "",
    descripcion: "",
  }));
  const [ok, setOk] = useState(false);

  const linkBase = `mesa-click-web.onrender.com/${tenant?.slug ?? "tu-negocio"}`;
  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setOk(false);
  };

  return (
    <div className="space-y-16">
      <div className="grid lg:grid-cols-[1fr_320px] gap-16 items-start">
        <Card titulo="Datos del negocio">
          <div className="grid sm:grid-cols-2 gap-12">
            <Campo label="Nombre del negocio">
              <input className={INPUT} value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
            </Campo>
            <Campo label="Rubro">
              <select className={INPUT} value={form.rubro} onChange={(e) => set("rubro", e.target.value)}>
                {RUBROS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Campo>
            <Campo label="Email administrativo">
              <input
                type="email"
                className={INPUT}
                value={form.emailAdmin}
                onChange={(e) => set("emailAdmin", e.target.value)}
                placeholder="admin@minegocio.com"
              />
            </Campo>
            <Campo label="WhatsApp general">
              <input
                className={INPUT}
                value={form.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
                placeholder="+54 9 ..."
              />
            </Campo>
          </div>
          <Campo label="Link público base">
            <input className={`${INPUT} font-mono text-13`} value={linkBase} readOnly />
          </Campo>
          <Campo label="Descripción breve">
            <input
              className={INPUT}
              value={form.descripcion}
              onChange={(e) => set("descripcion", e.target.value)}
              placeholder="Café de especialidad, meriendas y opciones rápidas."
            />
          </Campo>
          <PendienteBackend us="US-51" />
          <div className="flex items-center gap-16">
            <PillPrimaria onClick={() => setOk(true)}>Guardar cambios</PillPrimaria>
            <Guardado visible={ok} />
          </div>
        </Card>

        <Card titulo="Estado del plan">
          <div>
            <p className="text-16 font-bold text-ash-graphite">Plan Free</p>
            <p className="text-13 text-sage-green mt-4">
              Incluye una sucursal activa y configuración básica del menú.
            </p>
          </div>
          <div className="flex flex-wrap gap-8">
            <span className="px-10 py-6 text-12 rounded-md border border-concrete text-sage-green">
              1 sucursal activa
            </span>
            <button
              disabled
              className="px-10 py-6 text-12 rounded-md border border-ash-graphite text-ash-graphite opacity-50 cursor-not-allowed"
              title="Disponible con el modelo Freemium (Sprint 16)"
            >
              Upgrade Pro
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─────────────────────────── tab: Apariencia ─────────────────────────── */

function AparienciaTab({ sucursal, tenant }: { sucursal: Sucursal | null; tenant: Tenant | null }) {
  const [nombreVisible, setNombreVisible] = useState(() => {
    const base = tenant?.nombre ?? "Tu negocio";
    return sucursal ? `${base} - ${sucursal.nombre}` : base;
  });
  const [color, setColor] = useState("#F54927");
  const [estilo, setEstilo] = useState<"claro" | "oscuro">("oscuro");
  const [logoUrl, setLogoUrl] = useState("");
  const [ok, setOk] = useState(false);

  const onLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setLogoUrl(URL.createObjectURL(file));
    setOk(false);
  };

  const oscuro = estilo === "oscuro";

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-16 items-start">
      <Card titulo="Apariencia del menú">
        <Campo label="Nombre visible en el menú">
          <input
            className={INPUT}
            value={nombreVisible}
            onChange={(e) => {
              setNombreVisible(e.target.value);
              setOk(false);
            }}
          />
        </Campo>

        <div className="grid sm:grid-cols-2 gap-12">
          <Campo label="Logo">
            <div className="flex items-center gap-12">
              <div className="w-52 h-52 rounded-md border border-concrete grid place-items-center overflow-hidden bg-vanilla-cream shrink-0">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-20 text-stone">image</span>
                )}
              </div>
              <label className="h-36 px-12 flex items-center text-12 font-medium rounded-md border border-ash-graphite cursor-pointer hover:bg-vanilla-cream">
                Subir logo
                <input type="file" accept="image/*" onChange={onLogo} className="hidden" />
              </label>
            </div>
          </Campo>

          <Campo label="Color principal del menú">
            <div className="flex items-center gap-12">
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                  setOk(false);
                }}
                className="w-40 h-40 p-0 border border-concrete rounded-md bg-canvas-white"
              />
              <input
                className={`${INPUT} font-mono text-13`}
                value={color.toUpperCase()}
                onChange={(e) => {
                  setColor(e.target.value);
                  setOk(false);
                }}
              />
            </div>
          </Campo>
        </div>

        <Campo label="Estilo visual">
          <div className="flex gap-8">
            {(["claro", "oscuro"] as const).map((op) => (
              <button
                key={op}
                onClick={() => {
                  setEstilo(op);
                  setOk(false);
                }}
                className={`h-36 px-16 text-13 font-medium rounded-md border capitalize ${
                  estilo === op
                    ? "bg-ash-graphite text-canvas-white border-ash-graphite"
                    : "border-concrete text-ash-graphite hover:border-ash-graphite"
                }`}
              >
                {op}
              </button>
            ))}
          </div>
        </Campo>

        <PendienteBackend us="US-51 / US-53" />
        <div className="flex items-center gap-16">
          <PillPrimaria onClick={() => setOk(true)}>Guardar apariencia</PillPrimaria>
          <Guardado visible={ok} />
        </div>
      </Card>

      {/* Vista previa */}
      <div className="border border-concrete rounded-lg p-16 bg-vanilla-cream">
        <p className="text-12 font-mono text-sage-green uppercase tracking-wider mb-12 text-center">
          Vista previa del menú
        </p>
        <div
          className="rounded-lg overflow-hidden"
          style={{ background: oscuro ? "#141a17" : "#ffffff", border: "1px solid #d9d9d9" }}
        >
          <div className="p-16 text-center" style={{ background: oscuro ? "#0d120f" : "#f4f4f4" }}>
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="w-32 h-32 rounded object-cover mx-auto mb-6" />
            )}
            <p className="text-14 font-bold" style={{ color: oscuro ? "#fff" : "#0a0a0a" }}>
              {nombreVisible || "Tu negocio"}
            </p>
          </div>
          <div className="p-12 flex gap-8">
            <span className="px-10 py-4 text-11 font-medium rounded-full text-white" style={{ background: color }}>
              Cafés
            </span>
            <span
              className="px-10 py-4 text-11 font-medium rounded-full border"
              style={{ color: oscuro ? "#ccc" : "#595959", borderColor: oscuro ? "#333" : "#d9d9d9" }}
            >
              Dulces
            </span>
          </div>
          {["Latte vainilla · $2.800", "Medialuna · $900"].map((t) => (
            <div
              key={t}
              className="mx-12 mb-8 px-12 py-10 rounded-md text-12 flex items-center justify-between"
              style={{
                background: oscuro ? "#1c231f" : "#fff",
                color: oscuro ? "#eee" : "#0a0a0a",
                border: `1px solid ${oscuro ? "#2a332d" : "#eee"}`,
              }}
            >
              <span>{t}</span>
              <span className="w-18 h-18 grid place-items-center rounded-full text-white text-12" style={{ background: color }}>
                +
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── tab: Equipo ─────────────────────────── */

const ROLES = [
  ["Admin", "Acceso completo a configuración, carta, mesas, sucursales y equipo."],
  ["Encargado", "Gestiona la operación diaria: carta, mesas y pedidos de su sucursal."],
  ["Mozo / Recepcionista", "Ve pedidos en vivo, cambia estados y atiende solicitudes de cuenta."],
];

function EquipoTab() {
  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-16 items-start">
      <div>
        <EquipoSection />
      </div>
      <div className="border border-concrete rounded-lg p-20 bg-canvas-white space-y-16">
        <p className="text-13 font-bold text-ash-graphite">Roles disponibles</p>
        {ROLES.map(([r, d]) => (
          <div key={r}>
            <p className="text-13 font-semibold text-ash-graphite">{r}</p>
            <p className="text-12 text-sage-green mt-2 leading-normal">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── tab: Sucursales ─────────────────────────── */

const DIAS = [
  ["lu", "lunes"],
  ["ma", "martes"],
  ["mi", "miercoles"],
  ["ju", "jueves"],
  ["vi", "viernes"],
  ["sa", "sabado"],
  ["do", "domingo"],
] as const;

type Turno = { apertura: string; cierre: string };

function parseHorarios(raw?: string): { abiertos: Set<string>; turnos: Turno[] } {
  const abiertos = new Set<string>();
  let turnos: Turno[] = [{ apertura: "08:00", cierre: "00:00" }];
  if (!raw) return { abiertos: new Set(DIAS.map((d) => d[1])), turnos };
  try {
    const obj = JSON.parse(raw) as Record<string, { abierto?: boolean; tramos?: Turno[] }>;
    DIAS.forEach(([, key]) => {
      if (obj[key]?.abierto) abiertos.add(key);
    });
    const primer = DIAS.map((d) => d[1]).find((k) => obj[k]?.tramos?.length);
    if (primer && obj[primer]?.tramos) turnos = obj[primer]!.tramos as Turno[];
  } catch {
    return { abiertos: new Set(DIAS.map((d) => d[1])), turnos };
  }
  return { abiertos, turnos };
}

function serializeHorarios(abiertos: Set<string>, turnos: Turno[]): string {
  const out: Record<string, { abierto: boolean; tramos: Turno[] }> = {};
  DIAS.forEach(([, key]) => {
    out[key] = { abierto: abiertos.has(key), tramos: turnos };
  });
  return JSON.stringify(out);
}

function SucursalesTab({
  sucursales,
  setSucursales,
  selId,
  setSelId,
}: {
  sucursales: Sucursal[];
  setSucursales: React.Dispatch<React.SetStateAction<Sucursal[]>>;
  selId: string;
  setSelId: (id: string) => void;
}) {
  const sel = useMemo(() => sucursales.find((s) => s.id === selId) ?? null, [sucursales, selId]);
  const horariosIniciales = parseHorarios(sel?.horarios);

  const [form, setForm] = useState(() => ({
    nombre: sel?.nombre ?? "",
    whatsapp: sel?.whatsapp ?? "",
    email: sel?.email ?? "",
  }));
  const [abiertos, setAbiertos] = useState<Set<string>>(() => horariosIniciales.abiertos);
  const [turnos, setTurnos] = useState<Turno[]>(() =>
    horariosIniciales.turnos.length ? horariosIniciales.turnos : [{ apertura: "08:00", cierre: "00:00" }],
  );
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState("");

  const toggleDia = (key: string) =>
    setAbiertos((prev) => {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });

  const guardar = async () => {
    if (!sel) return;
    setGuardando(true);
    setMsg("");
    try {
      const payload: Partial<Sucursal> = {
        nombre: form.nombre,
        whatsapp: form.whatsapp,
        email: form.email,
        horarios: serializeHorarios(abiertos, turnos),
      };
      const actualizada = await api.actualizarSucursal(sel.id, payload);
      setSucursales((prev) => prev.map((s) => (s.id === sel.id ? { ...s, ...actualizada } : s)));
      setMsg("Sucursal guardada.");
    } catch {
      setMsg("No se pudo guardar en el servidor. Revisá la conexión o el soporte de horarios en la API.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[240px_1fr_260px] gap-16 items-start">
      {/* lista */}
      <Card titulo="Sucursales actuales">
        <div className="space-y-8">
          {sucursales.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelId(s.id)}
              className={`w-full text-left px-12 py-10 rounded-md border transition-colors ${
                s.id === selId
                  ? "border-ash-graphite bg-vanilla-cream"
                  : "border-concrete hover:border-ash-graphite"
              }`}
            >
              <p className="text-13 font-semibold text-ash-graphite">{s.nombre}</p>
              <p className="text-11 text-sage-green mt-2">{s.activa ? "Abierto" : "Cerrado"}</p>
            </button>
          ))}
          {sucursales.length === 0 && (
            <p className="text-12 text-sage-green">Sin sucursales cargadas.</p>
          )}
        </div>
      </Card>

      {/* datos */}
      <Card titulo="Datos de la sucursal">
        {sel ? (
          <>
            <div className="grid sm:grid-cols-2 gap-12">
              <Campo label="Nombre de sucursal">
                <input
                  className={INPUT}
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                />
              </Campo>
              <Campo label="WhatsApp / Teléfono">
                <input
                  className={INPUT}
                  value={form.whatsapp}
                  onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                />
              </Campo>
            </div>
            <Campo label="Email de contacto">
              <input
                type="email"
                className={INPUT}
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </Campo>

            <div>
              <span className="block text-11 font-mono text-sage-green uppercase tracking-wider mb-6">
                Días abiertos
              </span>
              <div className="flex flex-wrap gap-6">
                {DIAS.map(([abrev, key]) => (
                  <button
                    key={key}
                    onClick={() => toggleDia(key)}
                    className={`w-40 h-32 text-11 font-mono uppercase rounded-md border ${
                      abiertos.has(key)
                        ? "bg-ash-graphite text-canvas-white border-ash-graphite"
                        : "border-concrete text-sage-green hover:border-ash-graphite"
                    }`}
                  >
                    {abrev}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-11 font-mono text-sage-green uppercase tracking-wider mb-6">
                Horario para días abiertos
              </span>
              <div className="space-y-8">
                {turnos.map((t, i) => (
                  <div key={i} className="flex items-center gap-8">
                    <input
                      type="time"
                      value={t.apertura}
                      onChange={(e) =>
                        setTurnos((prev) => prev.map((x, j) => (j === i ? { ...x, apertura: e.target.value } : x)))
                      }
                      className="h-36 px-10 text-13 rounded-md border border-ash-graphite bg-canvas-white outline-none focus:border-system-black"
                    />
                    <span className="text-12 text-sage-green">a</span>
                    <input
                      type="time"
                      value={t.cierre}
                      onChange={(e) =>
                        setTurnos((prev) => prev.map((x, j) => (j === i ? { ...x, cierre: e.target.value } : x)))
                      }
                      className="h-36 px-10 text-13 rounded-md border border-ash-graphite bg-canvas-white outline-none focus:border-system-black"
                    />
                    {turnos.length > 1 && (
                      <button
                        onClick={() => setTurnos((prev) => prev.filter((_, j) => j !== i))}
                        className="text-12 text-alert-red hover:opacity-70"
                        title="Quitar turno"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                {turnos.length < 2 && (
                  <button
                    onClick={() => setTurnos((prev) => [...prev, { apertura: "16:00", cierre: "00:00" }])}
                    className="h-32 px-10 text-11 font-mono uppercase tracking-wider rounded-md border border-concrete hover:border-ash-graphite"
                  >
                    + Agregar segundo turno
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-12">
              <PillPrimaria onClick={guardar} disabled={guardando}>
                {guardando ? "Guardando…" : "Guardar sucursal"}
              </PillPrimaria>
              {msg && <span className="text-12 text-sage-green">{msg}</span>}
            </div>
          </>
        ) : (
          <p className="text-13 text-sage-green">Elegí una sucursal de la lista.</p>
        )}
      </Card>

      {/* crear PRO */}
      <div className="border border-concrete rounded-lg p-20 bg-canvas-white space-y-12">
        <p className="text-13 font-bold text-ash-graphite">Crear sucursal PRO</p>
        <p className="text-12 text-sage-green">Disponible para negocios con más de un local físico.</p>
        <Campo label="Nombre">
          <input className={INPUT} placeholder="Sucursal nueva" disabled />
        </Campo>
        <Campo label="Contacto">
          <input className={INPUT} placeholder="+54 9 ..." disabled />
        </Campo>
        <button
          disabled
          className="w-full h-40 rounded-full border border-ash-graphite text-ash-graphite text-12 font-bold uppercase tracking-wide opacity-50 cursor-not-allowed"
          title="Disponible con el plan Pro (Sprint 16)"
        >
          Actualizar a Pro
        </button>
      </div>
    </div>
  );
}
