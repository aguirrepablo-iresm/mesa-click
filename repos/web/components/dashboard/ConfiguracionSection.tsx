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
            className={`h-32 px-12 text-12 font-medium rounded-md border transition-colors ${
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
      Cambios guardados.
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
      className="h-32 px-16 rounded-full bg-plain-green text-canvas-white text-11 font-bold uppercase tracking-wide hover:opacity-85 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
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

type EstiloVisual = "claro" | "oscuro";

type AparienciaForm = {
  nombreVisible: string;
  color: string;
  estilo: EstiloVisual;
  logoUrl: string;
};

const COLOR_DEFAULT = "#F54927";

function esColorHex(valor: string) {
  return /^#[0-9a-fA-F]{6}$/.test(valor);
}

function aparienciaDefault(sucursal: Sucursal | null, tenant: Tenant | null): AparienciaForm {
  const base = tenant?.nombre ?? "Tu negocio";
  return {
    nombreVisible: sucursal ? `${base} - ${sucursal.nombre}` : base,
    color: COLOR_DEFAULT,
    estilo: "oscuro",
    logoUrl: "",
  };
}

function leerAparienciaGuardada(storageKey: string, fallback: AparienciaForm): AparienciaForm {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return fallback;
    const data = JSON.parse(raw) as Partial<AparienciaForm>;
    return {
      nombreVisible: typeof data.nombreVisible === "string" ? data.nombreVisible : fallback.nombreVisible,
      color: typeof data.color === "string" && esColorHex(data.color) ? data.color : fallback.color,
      estilo: data.estilo === "claro" || data.estilo === "oscuro" ? data.estilo : fallback.estilo,
      logoUrl: typeof data.logoUrl === "string" ? data.logoUrl : fallback.logoUrl,
    };
  } catch {
    return fallback;
  }
}

function guardarAparienciaLocal(storageKey: string, apariencia: AparienciaForm) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(apariencia));
  } catch {
    /* Si el navegador bloquea localStorage, la vista previa sigue funcionando en memoria. */
  }
}

function AparienciaTab({ sucursal, tenant }: { sucursal: Sucursal | null; tenant: Tenant | null }) {
  const storageKey = `mesa-click:apariencia:${tenant?.id ?? "sin-tenant"}:${sucursal?.id ?? "sin-sucursal"}`;
  const [apariencia, setApariencia] = useState(() =>
    leerAparienciaGuardada(storageKey, aparienciaDefault(sucursal, tenant)),
  );
  const [arrastrandoLogo, setArrastrandoLogo] = useState(false);
  const [ok, setOk] = useState(false);
  const { nombreVisible, color, estilo, logoUrl } = apariencia;

  useEffect(() => {
    guardarAparienciaLocal(storageKey, apariencia);
  }, [storageKey, apariencia]);

  const cargarLogo = (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setApariencia((prev) => ({ ...prev, logoUrl: reader.result as string }));
      setOk(false);
    };
    reader.readAsDataURL(file);
  };

  const onLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    cargarLogo(e.target.files?.[0]);
  };

  const onDropLogo = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setArrastrandoLogo(false);
    cargarLogo(e.dataTransfer.files?.[0]);
  };

  const oscuro = estilo === "oscuro";
  const colorPrincipal = esColorHex(color) ? color : COLOR_DEFAULT;
  const phoneScreenBg = oscuro ? "#111611" : "#f7f7f7";
  const phonePanelBg = oscuro ? "#18201b" : "#ffffff";
  const phoneHeaderBg = oscuro ? "#0c100d" : "#ffffff";
  const phoneText = oscuro ? "#f5f5f5" : "#0a0a0a";
  const phoneMutedText = oscuro ? "#b8beb9" : "#595959";
  const phoneBorder = oscuro ? "#283229" : "#e6e6e6";

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-16 items-start">
      <Card titulo="Apariencia del menú">
        <Campo label="Nombre visible en el menú">
          <input
            className={INPUT}
            value={nombreVisible}
            onChange={(e) => {
              setApariencia((prev) => ({ ...prev, nombreVisible: e.target.value }));
              setOk(false);
            }}
          />
        </Campo>

        <div className="grid sm:grid-cols-2 gap-12">
          <Campo label="Logo">
            <div
              onDragEnter={(e) => {
                e.preventDefault();
                setArrastrandoLogo(true);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={() => setArrastrandoLogo(false)}
              onDrop={onDropLogo}
              className={`h-72 w-full px-12 rounded-md border border-dashed flex items-center gap-12 cursor-pointer transition-colors ${
                arrastrandoLogo
                  ? "border-plain-green bg-ghost-fog"
                  : "border-concrete bg-canvas-white hover:border-ash-graphite"
              }`}
            >
              <div className="w-48 h-48 rounded-md border border-concrete grid place-items-center overflow-hidden bg-vanilla-cream shrink-0">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-20 text-stone">image</span>
                )}
              </div>
              <div className="min-w-0">
                <span className="block text-12 font-medium text-ash-graphite">Subir logo</span>
                <span className="block text-10 font-mono uppercase tracking-wider text-stone">PNG / JPG</span>
              </div>
              <input type="file" accept="image/*" onChange={onLogo} className="hidden" />
            </div>
          </Campo>

          <Campo label="Color principal del menú">
            <div className="h-72 w-full px-12 rounded-md border border-concrete bg-canvas-white flex items-center gap-12">
              <div
                className="relative w-48 h-48 rounded-md border border-concrete overflow-hidden shrink-0"
                style={{ backgroundColor: color }}
              >
                <input
                  type="color"
                  value={esColorHex(color) ? color : COLOR_DEFAULT}
                  aria-label="Elegir color principal del menú"
                  onChange={(e) => {
                    setApariencia((prev) => ({ ...prev, color: e.target.value }));
                    setOk(false);
                  }}
                  className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                />
              </div>
              <input
                className="h-48 min-w-0 flex-1 px-12 text-13 font-mono rounded-md border border-ash-graphite bg-canvas-white outline-none focus:border-system-black"
                value={color.toUpperCase()}
                onChange={(e) => {
                  setApariencia((prev) => ({ ...prev, color: e.target.value }));
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
                  setApariencia((prev) => ({ ...prev, estilo: op }));
                  setOk(false);
                }}
                className={`h-32 px-12 text-12 font-medium rounded-md border capitalize ${
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

        <div className="flex items-start gap-8 p-12 bg-vanilla-cream border border-dashed border-concrete rounded-md text-12 text-sage-green">
          <span className="material-symbols-outlined text-16 shrink-0">construction</span>
          <span>
            Los cambios se guardan en este navegador. La persistencia real entre dispositivos depende de US-51 /
            US-53 (backend Go), todavía pendiente.
          </span>
        </div>
        <div className="flex items-center gap-16">
          <PillPrimaria onClick={() => setOk(true)}>Guardar apariencia</PillPrimaria>
          <Guardado visible={ok} />
        </div>
      </Card>

      <div className="flex justify-center lg:justify-end">
        <div className="w-full max-w-[300px]">
          <p className="mb-12 text-center font-mono text-[12px] uppercase text-sage-green">
            Vista previa del menú
          </p>
          <div className="mx-auto w-full max-w-[260px] rounded-[30px] bg-ash-graphite p-[6px] shadow-lg">
            <div
              className="flex h-[430px] flex-col overflow-hidden rounded-[24px]"
              style={{ background: phoneScreenBg, color: phoneText }}
            >
              <div className="relative flex h-[32px] shrink-0 items-start justify-between px-[16px] pt-[9px] text-[10px] font-bold leading-none">
                <div className="absolute left-1/2 top-[12px] h-[4px] w-[64px] -translate-x-1/2 rounded-full bg-system-black opacity-70" />
                <span>9:41</span>
                <div className="flex items-center gap-[4px]">
                  <span className="h-[4px] w-[8px] rounded-full border" style={{ borderColor: phoneText }} />
                  <span className="h-[7px] w-[18px] rounded-sm border" style={{ borderColor: phoneText }}>
                    <span className="block h-full w-[12px]" style={{ background: phoneText }} />
                  </span>
                </div>
              </div>

              <div className="shrink-0 px-[14px] pb-[12px] pt-[8px]" style={{ background: phoneHeaderBg }}>
                <div className="flex items-center gap-[9px]">
                  <div
                    className="h-[38px] w-[38px] shrink-0 overflow-hidden rounded-lg border grid place-items-center"
                    style={{ background: phonePanelBg, borderColor: phoneBorder }}
                  >
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-20" style={{ color: phoneMutedText }}>
                        restaurant_menu
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold leading-[16px]">{nombreVisible || "Tu negocio"}</p>
                    <p className="mt-2 text-[11px] leading-[14px]" style={{ color: phoneMutedText }}>
                      Mesa 12
                    </p>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-hidden px-[12px] py-[12px]">
                <div className="mb-[10px] flex gap-[6px] overflow-hidden">
                  <span
                    className="grid h-[38px] shrink-0 place-items-center rounded-full px-[10px] text-[12px] font-bold leading-none text-white"
                    style={{ background: colorPrincipal }}
                  >
                    Cafés
                  </span>
                  <span
                    className="grid h-[38px] shrink-0 place-items-center rounded-full border px-[10px] text-[12px] font-medium leading-none"
                    style={{ color: phoneMutedText, borderColor: phoneBorder, background: phonePanelBg }}
                  >
                    Dulces
                  </span>
                  <span
                    className="grid h-[38px] shrink-0 place-items-center rounded-full border px-[10px] text-[12px] font-medium leading-none"
                    style={{ color: phoneMutedText, borderColor: phoneBorder, background: phonePanelBg }}
                  >
                    Bebidas
                  </span>
                </div>

                <div className="space-y-[8px]">
                  {[
                    ["Latte vainilla", "Café, leche y vainilla", "$2.800"],
                    ["Medialuna", "Manteca artesanal", "$900"],
                  ].map(([titulo, descripcion, precio]) => (
                    <div
                      key={titulo}
                      className="flex min-h-[78px] items-center gap-[8px] rounded-lg border p-[10px]"
                      style={{ background: phonePanelBg, borderColor: phoneBorder }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-bold leading-[16px]">{titulo}</p>
                        <p className="mt-[3px] truncate text-[11px] leading-[14px]" style={{ color: phoneMutedText }}>
                          {descripcion}
                        </p>
                        <p className="mt-[6px] text-[12px] font-bold leading-[14px]">{precio}</p>
                      </div>
                      <button
                        className="grid h-[36px] w-[36px] shrink-0 place-items-center rounded-full text-[18px] font-medium leading-none text-white"
                        style={{ background: colorPrincipal }}
                        aria-label={`Agregar ${titulo}`}
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="mx-[12px] mb-[12px] flex h-[42px] shrink-0 items-center justify-between rounded-full px-[14px] text-white"
                style={{ background: colorPrincipal }}
              >
                <span className="text-[12px] font-bold leading-none">2 items</span>
                <span className="text-[13px] font-bold leading-none">$3.700</span>
              </div>
            </div>
          </div>
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
        <EquipoSection embedded />
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
                <div className="flex flex-col md:flex-row md:items-start gap-12 md:justify-between">
                  <div className="space-y-8">
                    {turnos.map((t, i) => (
                      <div key={i} className="flex flex-wrap items-center gap-8">
                        <input
                          type="time"
                          value={t.apertura}
                          onChange={(e) =>
                            setTurnos((prev) =>
                              prev.map((x, j) => (j === i ? { ...x, apertura: e.target.value } : x)),
                            )
                          }
                          className="h-40 w-120 max-w-full px-10 text-13 font-mono rounded-md border border-ash-graphite bg-canvas-white outline-none focus:border-system-black"
                        />
                        <span className="text-12 text-sage-green">a</span>
                        <input
                          type="time"
                          value={t.cierre}
                          onChange={(e) =>
                            setTurnos((prev) =>
                              prev.map((x, j) => (j === i ? { ...x, cierre: e.target.value } : x)),
                            )
                          }
                          className="h-40 w-120 max-w-full px-10 text-13 font-mono rounded-md border border-ash-graphite bg-canvas-white outline-none focus:border-system-black"
                        />
                        {turnos.length > 1 && (
                          <button
                            onClick={() => setTurnos((prev) => prev.filter((_, j) => j !== i))}
                            className="h-32 w-32 grid place-items-center rounded-md text-12 text-alert-red hover:bg-red-50"
                            title="Quitar turno"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {turnos.length < 2 && (
                  <button
                    onClick={() => setTurnos((prev) => [...prev, { apertura: "16:00", cierre: "00:00" }])}
                    className="h-32 px-10 text-11 font-mono uppercase tracking-wider rounded-md border border-concrete hover:border-ash-graphite md:mt-4 md:shrink-0"
                  >
                    + Agregar segundo turno
                  </button>
                  )}
                </div>
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
          className="w-full h-32 rounded-full border border-ash-graphite text-ash-graphite text-11 font-bold uppercase tracking-wide opacity-50 cursor-not-allowed"
          title="Disponible con el plan Pro (Sprint 16)"
        >
          Actualizar a Pro
        </button>
      </div>
    </div>
  );
}
