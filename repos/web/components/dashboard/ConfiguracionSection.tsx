"use client";

import React, { useEffect, useMemo, useState } from "react";
import { api, Tenant, Sucursal, getErrorMessage } from "@/lib/api";
import { DEFAULT_MESA_PRIMARY } from "@/components/menu/BrandHeader";
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
    <div className="h-full space-y-24 overflow-y-auto bg-ghost-fog/45 p-16 font-inter sm:p-24 md:p-32">
      <header className="flex flex-col gap-16 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h2 className="text-24 font-semibold tracking-[-0.02em] text-ash-graphite sm:text-32">Configuración</h2>
          <p className="mt-4 text-13 text-sage-green sm:text-14">
            Administrá negocio, apariencia del menú, equipo y sucursales.
          </p>
        </div>
        {sucursales.length > 0 && (
          <select
            value={sucursalSelId}
            onChange={(e) => setSucursalSelId(e.target.value)}
            className="h-44 rounded-lg border border-concrete bg-canvas-white px-12 text-13 shadow-sm outline-none focus:border-system-black"
          >
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>
                Sucursal: {s.nombre}
              </option>
            ))}
          </select>
        )}
      </header>

      <nav className="flex max-w-full gap-6 overflow-x-auto rounded-xl border border-concrete bg-canvas-white p-6 shadow-sm no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`h-44 shrink-0 rounded-lg border px-14 text-12 font-semibold transition-colors ${
              tab === t
                ? "bg-ash-graphite text-canvas-white border-ash-graphite"
                : "border-transparent text-sage-green hover:bg-ghost-fog hover:text-ash-graphite"
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
    <section className="overflow-hidden rounded-xl border border-concrete bg-canvas-white shadow-sm">
      <div className="border-b border-concrete/70 px-16 py-14 sm:px-20">
        <p className="text-13 font-semibold text-ash-graphite">{titulo}</p>
      </div>
      <div className="space-y-16 p-16 sm:p-20">{children}</div>
    </section>
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
  "w-full h-44 px-12 text-14 rounded-lg border border-concrete bg-canvas-white outline-none focus:border-system-black";



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
      className="h-44 rounded-lg bg-plain-green px-16 text-12 font-semibold text-canvas-white transition-colors hover:bg-plain-green-muted disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

/* ─────────────────────────── tab: Negocio ─────────────────────────── */

const RUBROS = ["Cafetería", "Bar", "Restaurante", "Cervecería", "Pizzería", "Otro"];

function NegocioTab({ tenant }: { tenant: Tenant | null }) {
  const rubro = tenant?.rubro;
  const rubroNormalizado = useMemo(() => {
    if (!rubro) return RUBROS[0];
    const clean = rubro.toLowerCase().replace(/í/g, "i").replace(/é/g, "e");
    const found = RUBROS.find((r) => r.toLowerCase().replace(/í/g, "i").replace(/é/g, "e") === clean);
    return found ?? RUBROS[0];
  }, [rubro]);

  const fiscalData = (tenant?.datos_fiscales ?? {}) as Record<string, string>;

  const [form, setForm] = useState(() => ({
    nombre: tenant?.nombre ?? "",
    rubro: rubroNormalizado,
    emailContacto: tenant?.email_contacto ?? "",
    whatsapp: tenant?.whatsapp ?? "",
    descripcion: tenant?.descripcion ?? "",
    googleReviewUrl: tenant?.google_review_url ?? "",
    razonSocial: typeof fiscalData.razon_social === "string" ? fiscalData.razon_social : "",
    cuit: typeof fiscalData.cuit === "string" ? fiscalData.cuit : "",
    condicionIva: typeof fiscalData.condicion_iva === "string" ? fiscalData.condicion_iva : "",
    mpAccessToken: tenant?.mp_access_token ?? "",
    mpPublicKey: tenant?.mp_public_key ?? "",
    mpActivo: tenant?.mp_activo ?? false,
  }));
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  const linkBase = `mesa-click-web.onrender.com/${tenant?.slug ?? "tu-negocio"}`;
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setOk(false);
    setError("");
  };

  const handleGuardar = async () => {
    setLoading(true);
    setError("");
    setOk(false);
    try {
      await api.actualizarMiTenant({
        nombre: form.nombre,
        rubro: form.rubro,
        email_contacto: form.emailContacto,
        whatsapp: form.whatsapp,
        descripcion: form.descripcion,
        google_review_url: form.googleReviewUrl,
        datos_fiscales: {
          razon_social: form.razonSocial,
          cuit: form.cuit,
          condicion_iva: form.condicionIva,
        },
        mp_access_token: form.mpAccessToken || undefined,
        mp_public_key: form.mpPublicKey || undefined,
        mp_activo: form.mpActivo,
      });
      setOk(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Error al guardar los datos del negocio."));
    } finally {
      setLoading(false);
    }
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
            <Campo label="Email de contacto">
              <input
                type="email"
                className={INPUT}
                value={form.emailContacto}
                onChange={(e) => set("emailContacto", e.target.value)}
                placeholder="contacto@minegocio.com"
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
          <Campo label="Enlace / Place ID de Google Reviews (Smart Funnel)">
            <input
              className={INPUT}
              value={form.googleReviewUrl}
              onChange={(e) => set("googleReviewUrl", e.target.value)}
              placeholder="https://g.page/r/.../review o enlace de Google Maps"
            />
            <span className="block text-11 text-sage-green mt-4">
              Usado para el Smart Funnel: comensales que califiquen con 4 o 5 estrellas serán invitados a recomendarte en Google Maps.
            </span>
          </Campo>

          <div className="pt-16 border-t border-concrete space-y-12">
            <p className="text-12 font-mono text-sage-green uppercase tracking-wider">
              Datos fiscales y facturación (opcional)
            </p>
            <div className="grid sm:grid-cols-2 gap-12">
              <Campo label="Razón social">
                <input
                  className={INPUT}
                  value={form.razonSocial}
                  onChange={(e) => set("razonSocial", e.target.value)}
                  placeholder="Ej: Gastronómica Central S.R.L."
                />
              </Campo>
              <Campo label="CUIT / CUIL">
                <input
                  className={INPUT}
                  value={form.cuit}
                  onChange={(e) => set("cuit", e.target.value)}
                  placeholder="30-12345678-9"
                />
              </Campo>
              <Campo label="Condición frente al IVA">
                <select
                  className={INPUT}
                  value={form.condicionIva}
                  onChange={(e) => set("condicionIva", e.target.value)}
                >
                  <option value="">Sin especificar</option>
                  <option value="Responsable Inscripto">Responsable Inscripto</option>
                  <option value="Monotributo">Monotributo</option>
                  <option value="Exento">Exento</option>
                  <option value="Consumidor Final">Consumidor Final</option>
                </select>
              </Campo>
            </div>
          </div>

          <div className="pt-16 border-t border-concrete space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
              <div>
                <p className="text-12 font-mono text-sage-green uppercase tracking-wider">
                  Mercado Pago (Configuración por Defecto)
                </p>
                <p className="text-12 text-sage-green mt-2">
                  Permite a los comensales pagar su cuenta desde el celular mediante Checkout Pro (Sandbox o Producción). Las sucursales usan estos datos salvo que definan una cuenta propia.
                </p>
              </div>
              <label className="flex items-center gap-8 cursor-pointer select-none shrink-0">
                <input
                  type="checkbox"
                  checked={form.mpActivo}
                  onChange={(e) => set("mpActivo", e.target.checked)}
                  className="h-18 w-18 rounded border-concrete accent-plain-green cursor-pointer"
                />
                <span className="text-13 font-semibold text-ash-graphite">
                  {form.mpActivo ? "Habilitado" : "Deshabilitado"}
                </span>
              </label>
            </div>

            {form.mpActivo && (
              <div className="grid sm:grid-cols-2 gap-12 pt-4">
                <Campo label="Access Token de Mercado Pago">
                  <input
                    type="password"
                    className={INPUT}
                    value={form.mpAccessToken}
                    onChange={(e) => set("mpAccessToken", e.target.value)}
                    placeholder="TEST-... o APP_USR-..."
                  />
                  <span className="block text-11 text-sage-green mt-4">
                    Token de prueba (Sandbox) o credenciales productivas.
                  </span>
                </Campo>
                <Campo label="Public Key (Opcional)">
                  <input
                    className={INPUT}
                    value={form.mpPublicKey}
                    onChange={(e) => set("mpPublicKey", e.target.value)}
                    placeholder="TEST-... o APP_USR-..."
                  />
                  <span className="block text-11 text-sage-green mt-4">
                    Clave pública para checkout integrado.
                  </span>
                </Campo>
              </div>
            )}
          </div>

          {error && <p className="text-12 text-alert-red">{error}</p>}
          <div className="flex items-center gap-16">
            <PillPrimaria onClick={handleGuardar} disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </PillPrimaria>
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
              className="h-44 cursor-not-allowed rounded-lg border border-concrete px-12 text-12 text-ash-graphite opacity-50"
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

const COLOR_DEFAULT = DEFAULT_MESA_PRIMARY;

function esColorHex(valor: string) {
  return /^#[0-9a-fA-F]{6}$/.test(valor);
}

function aparienciaDefault(sucursal: Sucursal | null, tenant: Tenant | null): AparienciaForm {
  const base = tenant?.nombre_fantasia || tenant?.nombre || "Tu negocio";
  return {
    nombreVisible: sucursal ? `${base} - ${sucursal.nombre}` : base,
    color: tenant?.color_primario && esColorHex(tenant.color_primario) ? tenant.color_primario : COLOR_DEFAULT,
    estilo: tenant?.estilo_visual === "claro" || tenant?.estilo_visual === "oscuro" ? tenant.estilo_visual : "oscuro",
    logoUrl: tenant?.logo_url ?? "",
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
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { nombreVisible, color, estilo, logoUrl } = apariencia;

  useEffect(() => {
    guardarAparienciaLocal(storageKey, apariencia);
  }, [storageKey, apariencia]);

  const handleGuardar = async () => {
    setGuardando(true);
    setError(null);
    setOk(false);
    try {
      guardarAparienciaLocal(storageKey, apariencia);
      if (tenant) {
        await api.actualizarMiTenant({
          nombre_fantasia: nombreVisible.trim() || undefined,
          color_primario: esColorHex(color) ? color : undefined,
          estilo_visual: estilo,
          logo_url: logoUrl || undefined,
        });
      }
      setOk(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Error al guardar la apariencia del menú."));
    } finally {
      setGuardando(false);
    }
  };

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
                className="h-48 min-w-0 flex-1 rounded-lg border border-concrete bg-canvas-white px-12 text-13 font-mono outline-none focus:border-system-black"
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
                className={`h-44 rounded-lg border px-14 text-12 font-semibold capitalize ${
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

        {error && <p className="text-12 text-alert-red">{error}</p>}
        <div className="flex items-center gap-16">
          <PillPrimaria onClick={handleGuardar} disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar apariencia"}
          </PillPrimaria>
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
      <aside className="space-y-16 rounded-xl border border-concrete bg-canvas-white p-20 shadow-sm">
        <p className="text-13 font-bold text-ash-graphite">Roles disponibles</p>
        {ROLES.map(([r, d]) => (
          <div key={r}>
            <p className="text-13 font-semibold text-ash-graphite">{r}</p>
            <p className="text-12 text-sage-green mt-2 leading-normal">{d}</p>
          </div>
        ))}
      </aside>
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
  const [mpModo, setMpModo] = useState<"heredar" | "propia" | "deshabilitar">(() => {
    if (sel?.mp_activo === false) return "deshabilitar";
    if (sel?.mp_activo === true || (sel?.mp_access_token && sel.mp_access_token.trim() !== "")) return "propia";
    return "heredar";
  });
  const [mpAccessToken, setMpAccessToken] = useState(sel?.mp_access_token ?? "");
  const [mpPublicKey, setMpPublicKey] = useState(sel?.mp_public_key ?? "");
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (sel) {
      setForm({
        nombre: sel.nombre ?? "",
        whatsapp: sel.whatsapp ?? "",
        email: sel.email ?? "",
      });
      const h = parseHorarios(sel.horarios);
      setAbiertos(h.abiertos);
      setTurnos(h.turnos.length ? h.turnos : [{ apertura: "08:00", cierre: "00:00" }]);
      if (sel.mp_activo === false) {
        setMpModo("deshabilitar");
      } else if (sel.mp_activo === true || (sel.mp_access_token && sel.mp_access_token.trim() !== "")) {
        setMpModo("propia");
      } else {
        setMpModo("heredar");
      }
      setMpAccessToken(sel.mp_access_token ?? "");
      setMpPublicKey(sel.mp_public_key ?? "");
      setMsg("");
    }
  }, [sel]);

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
      let mpPayload: Partial<Sucursal> = {};
      if (mpModo === "heredar") {
        mpPayload = { mp_activo: null, mp_access_token: null, mp_public_key: null };
      } else if (mpModo === "deshabilitar") {
        mpPayload = { mp_activo: false, mp_access_token: null, mp_public_key: null };
      } else {
        mpPayload = {
          mp_activo: true,
          mp_access_token: mpAccessToken.trim() || null,
          mp_public_key: mpPublicKey.trim() || null,
        };
      }

      const payload: Partial<Sucursal> = {
        nombre: form.nombre,
        whatsapp: form.whatsapp,
        email: form.email,
        horarios: serializeHorarios(abiertos, turnos),
        ...mpPayload,
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
    <div className="grid items-start gap-16 xl:grid-cols-[240px_minmax(0,1fr)_260px]">
      {/* lista */}
      <Card titulo="Sucursales actuales">
        <div className="space-y-8">
          {sucursales.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelId(s.id)}
              className={`w-full rounded-lg border px-12 py-10 text-left transition-colors ${
                s.id === selId
                  ? "border-ash-graphite bg-ghost-fog shadow-sm"
                  : "border-concrete hover:border-stone hover:bg-ghost-fog/50"
              }`}
            >
              <p className="text-13 font-semibold text-ash-graphite">{s.nombre}</p>
              <div className="flex items-center gap-6 mt-2">
                <span className="text-11 text-sage-green">{s.activa ? "Abierto" : "Cerrado"}</span>
                {s.mp_activo === false ? (
                  <span className="text-10 rounded bg-concrete px-4 py-1 text-sage-green font-mono">MP inactivo</span>
                ) : s.mp_activo === true ? (
                  <span className="text-10 rounded bg-plain-green/15 px-4 py-1 text-plain-green font-mono font-medium">MP propio</span>
                ) : (
                  <span className="text-10 rounded bg-ghost-fog px-4 py-1 text-sage-green font-mono">MP negocio</span>
                )}
              </div>
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
                    className={`h-44 w-44 rounded-lg border text-11 font-mono uppercase ${
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
                          className="h-44 w-120 max-w-full rounded-lg border border-concrete bg-canvas-white px-10 text-13 font-mono outline-none focus:border-system-black"
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
                          className="h-44 w-120 max-w-full rounded-lg border border-concrete bg-canvas-white px-10 text-13 font-mono outline-none focus:border-system-black"
                        />
                        {turnos.length > 1 && (
                          <button
                            onClick={() => setTurnos((prev) => prev.filter((_, j) => j !== i))}
                            className="grid h-44 w-44 place-items-center rounded-lg text-12 text-alert-red hover:bg-warm-pink/20"
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
                    className="h-44 rounded-lg border border-concrete px-12 text-11 font-semibold text-ash-graphite hover:border-stone hover:bg-ghost-fog md:mt-4 md:shrink-0"
                  >
                    + Agregar segundo turno
                  </button>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-16 border-t border-concrete space-y-12">
              <div>
                <span className="block text-11 font-mono text-sage-green uppercase tracking-wider mb-2">
                  Cobro con Mercado Pago en esta sucursal
                </span>
                <p className="text-12 text-sage-green">
                  Podés heredar la cuenta configurada a nivel negocio, asignar credenciales propias para esta sucursal o deshabilitar el cobro digital aquí.
                </p>
              </div>

              <div className="space-y-8">
                <label className="flex items-center gap-8 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="mp_modo"
                    value="heredar"
                    checked={mpModo === "heredar"}
                    onChange={() => setMpModo("heredar")}
                    className="accent-plain-green cursor-pointer"
                  />
                  <span className="text-13 text-ash-graphite font-medium">
                    Heredar configuración del negocio (recomendado)
                  </span>
                </label>

                <label className="flex items-center gap-8 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="mp_modo"
                    value="propia"
                    checked={mpModo === "propia"}
                    onChange={() => setMpModo("propia")}
                    className="accent-plain-green cursor-pointer"
                  />
                  <span className="text-13 text-ash-graphite font-medium">
                    Usar cuenta propia de Mercado Pago para esta sucursal
                  </span>
                </label>

                <label className="flex items-center gap-8 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="mp_modo"
                    value="deshabilitar"
                    checked={mpModo === "deshabilitar"}
                    onChange={() => setMpModo("deshabilitar")}
                    className="accent-plain-green cursor-pointer"
                  />
                  <span className="text-13 text-ash-graphite font-medium">
                    Deshabilitar cobro con Mercado Pago en esta sucursal
                  </span>
                </label>
              </div>

              {mpModo === "propia" && (
                <div className="grid sm:grid-cols-2 gap-12 pt-8 animate-in fade-in">
                  <Campo label="Access Token de la sucursal">
                    <input
                      type="password"
                      className={INPUT}
                      value={mpAccessToken}
                      onChange={(e) => setMpAccessToken(e.target.value)}
                      placeholder="TEST-... o APP_USR-..."
                    />
                    <span className="block text-11 text-sage-green mt-4">
                      Los pagos de las mesas de esta sucursal se acreditarán en esta cuenta.
                    </span>
                  </Campo>
                  <Campo label="Public Key de la sucursal (Opcional)">
                    <input
                      className={INPUT}
                      value={mpPublicKey}
                      onChange={(e) => setMpPublicKey(e.target.value)}
                      placeholder="TEST-... o APP_USR-..."
                    />
                    <span className="block text-11 text-sage-green mt-4">
                      Clave pública de la cuenta de esta sucursal.
                    </span>
                  </Campo>
                </div>
              )}
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
      <aside className="space-y-12 rounded-xl border border-concrete bg-canvas-white p-20 shadow-sm">
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
          className="h-44 w-full cursor-not-allowed rounded-lg border border-concrete text-11 font-semibold text-ash-graphite opacity-50"
          title="Disponible con el plan Pro (Sprint 16)"
        >
          Actualizar a Pro
        </button>
      </aside>
    </div>
  );
}
