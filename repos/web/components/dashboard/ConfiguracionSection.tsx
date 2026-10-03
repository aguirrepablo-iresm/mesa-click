"use client";

import React, { useEffect, useMemo, useState } from "react";
import { api, Tenant, Sucursal, getErrorMessage, getApiBaseUrl } from "@/lib/api";
import { DEFAULT_MESA_PRIMARY } from "@/components/menu/BrandHeader";
import EquipoSection from "./EquipoSection";
import PlanesSection from "./PlanesSection";
import UpgradeModal from "./UpgradeModal";

/* ─────────────────────────── contenedor ─────────────────────────── */

const TABS = ["negocio", "apariencia", "equipo", "sucursales", "planes", "mercadopago"] as const;
type Tab = (typeof TABS)[number];
const TAB_LABELS: Record<Tab, string> = {
  negocio: "Negocio",
  apariencia: "Apariencia",
  equipo: "Equipo de trabajo",
  sucursales: "Sucursales",
  planes: "Planes y Suscripción",
  mercadopago: "Mercado Pago",
};

export default function ConfiguracionSection({
  initialTab,
  onTenantUpdate,
}: {
  initialTab?: Tab;
  onTenantUpdate?: (t: Tenant) => void;
} = {}) {
  const [tab, setTab] = useState<Tab>(initialTab || "negocio");

  useEffect(() => {
    if (initialTab) {
      setTab(initialTab);
    }
  }, [initialTab]);

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
            Administrá negocio, apariencia del menú, equipo, sucursales y cobros digitales.
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

      {tab === "negocio" && (
        <NegocioTab
          key={tenant?.id ?? "sin-tenant"}
          tenant={tenant}
          onIrAMercadoPago={() => setTab("mercadopago")}
          onIrAPlanes={() => setTab("planes")}
        />
      )}
      {tab === "apariencia" && (
        <AparienciaTab
          key={`${tenant?.id ?? "sin-tenant"}-${sucursalSel?.id ?? "sin-sucursal"}`}
          sucursal={sucursalSel}
          tenant={tenant}
          onTenantUpdate={(actualizado) => {
            setTenant(actualizado);
            if (onTenantUpdate) onTenantUpdate(actualizado);
          }}
        />
      )}
      {tab === "equipo" && <EquipoTab />}
      {tab === "sucursales" && (
        <SucursalesTab
          key={sucursalSelId || "sin-sucursal"}
          tenant={tenant}
          sucursales={sucursales}
          setSucursales={setSucursales}
          selId={sucursalSelId}
          setSelId={setSucursalSelId}
          onIrAMercadoPago={() => setTab("mercadopago")}
          onIrAPlanes={() => setTab("planes")}
        />
      )}
      {tab === "planes" && (
        <PlanesSection
          key={tenant?.id ?? "sin-tenant"}
          tenant={tenant}
          onTenantUpdate={(actualizado) => {
            setTenant(actualizado);
            if (onTenantUpdate) onTenantUpdate(actualizado);
          }}
        />
      )}
      {tab === "mercadopago" && (
        <MercadoPagoTab
          key={`${tenant?.id ?? "sin-tenant"}-${sucursalSel?.id ?? "sin-sucursal"}`}
          tenant={tenant}
          setTenant={setTenant}
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

function NegocioTab({
  tenant,
  onIrAMercadoPago,
  onIrAPlanes,
}: {
  tenant: Tenant | null;
  onIrAMercadoPago?: () => void;
  onIrAPlanes?: () => void;
}) {
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

          <div className="pt-16 border-t border-concrete flex flex-col sm:flex-row sm:items-center sm:justify-between gap-12">
            <div>
              <p className="text-12 font-mono text-sage-green uppercase tracking-wider">
                Cobros con Mercado Pago
              </p>
              <p className="text-12 text-sage-green mt-2">
                Habilitá pagos desde la mesa, cargá credenciales y revisá las URLs de webhook en la pestaña dedicada.
              </p>
            </div>
            {onIrAMercadoPago && (
              <button
                type="button"
                onClick={onIrAMercadoPago}
                className="h-44 shrink-0 rounded-lg border border-concrete bg-ghost-fog/40 px-14 text-12 font-semibold text-ash-graphite hover:border-ash-graphite hover:bg-canvas-white transition-colors cursor-pointer"
              >
                Configurar Mercado Pago →
              </button>
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
            <div className="flex items-center gap-8">
              <p className="text-16 font-bold text-ash-graphite">
                {tenant?.plan === "pro" ? "Plan Pro" : "Plan Free"}
              </p>
              <span
                className={`inline-flex items-center px-8 py-2 rounded-full text-10 font-mono font-semibold uppercase ${
                  tenant?.plan === "pro"
                    ? "bg-ash-graphite text-canvas-white"
                    : "bg-ghost-fog border border-concrete text-ash-graphite"
                }`}
              >
                {tenant?.plan === "pro" ? "Activo" : "Gratuito"}
              </span>
            </div>
            <p className="text-13 text-sage-green mt-4">
              {tenant?.plan === "pro"
                ? "Disfrutás de sucursales, mesas y productos ilimitados."
                : "Plan con límites de hasta 1 sucursal, 10 mesas y 30 productos."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-8 pt-4">
            <button
              type="button"
              onClick={onIrAPlanes}
              className="h-44 rounded-lg border border-concrete bg-canvas-white px-16 text-12 font-medium text-ash-graphite hover:bg-ghost-fog active:scale-95 transition-all cursor-pointer"
            >
              Ver límites y suscripción →
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
  colorSecundario: string;
  tipoFuente: string;
  mostrarMarcaAgua: boolean;
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
    colorSecundario: tenant?.color_secundario && esColorHex(tenant.color_secundario) ? tenant.color_secundario : "",
    tipoFuente: tenant?.tipo_fuente ?? "Inter",
    mostrarMarcaAgua: tenant?.mostrar_marca_agua ?? true,
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
      colorSecundario: typeof data.colorSecundario === "string" ? data.colorSecundario : fallback.colorSecundario,
      tipoFuente: typeof data.tipoFuente === "string" ? data.tipoFuente : fallback.tipoFuente,
      mostrarMarcaAgua: typeof data.mostrarMarcaAgua === "boolean" ? data.mostrarMarcaAgua : fallback.mostrarMarcaAgua,
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

function AparienciaTab({
  sucursal,
  tenant,
  onTenantUpdate,
}: {
  sucursal: Sucursal | null;
  tenant: Tenant | null;
  onTenantUpdate?: (t: Tenant) => void;
}) {
  const esPro = tenant?.plan === "pro";
  const [modalUpgradeOpen, setModalUpgradeOpen] = useState(false);

  const storageKey = `mesa-click:apariencia:${tenant?.id ?? "sin-tenant"}:${sucursal?.id ?? "sin-sucursal"}`;
  const [apariencia, setApariencia] = useState(() =>
    leerAparienciaGuardada(storageKey, aparienciaDefault(sucursal, tenant)),
  );
  const [arrastrandoLogo, setArrastrandoLogo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { nombreVisible, color, estilo, logoUrl, colorSecundario, tipoFuente, mostrarMarcaAgua } = apariencia;

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
        const actualizado = await api.actualizarMiTenant({
          nombre_fantasia: nombreVisible.trim() || undefined,
          color_primario: esColorHex(color) ? color : undefined,
          estilo_visual: estilo,
          logo_url: logoUrl || undefined,
          color_secundario: esPro ? (colorSecundario.trim() || undefined) : undefined,
          tipo_fuente: esPro ? tipoFuente : undefined,
          mostrar_marca_agua: esPro ? mostrarMarcaAgua : undefined,
        });
        if (onTenantUpdate) onTenantUpdate(actualizado);
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
  const colorAcentoSecundario = esColorHex(colorSecundario) ? colorSecundario : undefined;
  const phoneScreenBg = oscuro ? "#111611" : "#f7f7f7";
  const phonePanelBg = oscuro ? "#18201b" : "#ffffff";
  const phoneHeaderBg = oscuro ? "#0c100d" : "#ffffff";
  const phoneText = oscuro ? "#f5f5f5" : "#0a0a0a";
  const phoneMutedText = oscuro ? "#b8beb9" : "#595959";
  const phoneBorder = oscuro ? "#283229" : "#e6e6e6";
  const previewFont =
    tipoFuente === "system-ui"
      ? "system-ui, sans-serif"
      : tipoFuente
      ? `${tipoFuente}, sans-serif`
      : "inherit";

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
                style={{ backgroundColor: colorPrincipal }}
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

        {/* ─── Personalización Avanzada Pro (US-71) ─── */}
        <div className="pt-16 border-t border-concrete space-y-14">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <span className="text-12 font-mono text-ash-graphite font-semibold uppercase tracking-wider">
                Personalización de Marca
              </span>
              <span className="rounded-full bg-ash-graphite text-canvas-white px-8 py-2 text-10 font-mono font-semibold uppercase">
                Pro
              </span>
            </div>
            {!esPro && (
              <button
                type="button"
                onClick={() => setModalUpgradeOpen(true)}
                className="text-11 font-medium text-ash-graphite hover:underline flex items-center gap-4 cursor-pointer"
              >
                <span className="material-symbols-outlined text-14 text-stone">lock</span>
                Desbloquear con Pro
              </button>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-12">
            {/* Color secundario */}
            <Campo label="Color secundario / Acentos (Opcional)">
              {esPro ? (
                <div className="h-72 w-full px-12 rounded-md border border-concrete bg-canvas-white flex items-center gap-12">
                  <div
                    className="relative w-48 h-48 rounded-md border border-concrete overflow-hidden shrink-0"
                    style={{ backgroundColor: colorAcentoSecundario || "transparent" }}
                  >
                    <input
                      type="color"
                      value={colorAcentoSecundario || "#1A1A1A"}
                      aria-label="Elegir color secundario"
                      onChange={(e) => {
                        setApariencia((prev) => ({ ...prev, colorSecundario: e.target.value }));
                        setOk(false);
                      }}
                      className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <input
                    className="h-48 min-w-0 flex-1 rounded-lg border border-concrete bg-canvas-white px-12 text-13 font-mono outline-none focus:border-system-black"
                    placeholder="#Opcional"
                    value={colorSecundario.toUpperCase()}
                    onChange={(e) => {
                      setApariencia((prev) => ({ ...prev, colorSecundario: e.target.value }));
                      setOk(false);
                    }}
                  />
                  {colorSecundario && (
                    <button
                      type="button"
                      onClick={() => {
                        setApariencia((prev) => ({ ...prev, colorSecundario: "" }));
                        setOk(false);
                      }}
                      className="text-11 text-sage-green hover:text-alert-red px-6 py-4 cursor-pointer"
                      title="Quitar color secundario"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => setModalUpgradeOpen(true)}
                  className="h-72 w-full px-12 rounded-md border border-concrete/70 bg-ghost-fog/40 flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-10">
                    <div className="w-48 h-48 rounded-md border border-concrete bg-concrete/40 grid place-items-center">
                      <span className="material-symbols-outlined text-18 text-stone">palette</span>
                    </div>
                    <div>
                      <span className="block text-12 font-medium text-ash-graphite">Personalizar acentos</span>
                      <span className="block text-10 text-sage-green">Disponible en plan Pro</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-16 text-stone group-hover:text-ash-graphite">lock</span>
                </div>
              )}
            </Campo>

            {/* Tipografía de la carta */}
            <Campo label="Tipografía de la carta digital">
              {esPro ? (
                <select
                  className={INPUT}
                  value={tipoFuente}
                  onChange={(e) => {
                    setApariencia((prev) => ({ ...prev, tipoFuente: e.target.value }));
                    setOk(false);
                  }}
                >
                  <option value="Inter">Inter (Predeterminada / Moderna)</option>
                  <option value="Space Grotesk">Space Grotesk (Técnica / Urbana)</option>
                  <option value="Playfair Display">Playfair Display (Elegante / Carta Clásica)</option>
                  <option value="system-ui">Sistema (system-ui / Nativa)</option>
                </select>
              ) : (
                <div
                  onClick={() => setModalUpgradeOpen(true)}
                  className="h-44 w-full px-12 rounded-lg border border-concrete/70 bg-ghost-fog/40 flex items-center justify-between cursor-pointer group"
                >
                  <span className="text-13 text-sage-green font-sans">Inter (Moderna)</span>
                  <div className="flex items-center gap-4 text-stone group-hover:text-ash-graphite">
                    <span className="text-10 font-mono uppercase font-semibold">Pro</span>
                    <span className="material-symbols-outlined text-16">lock</span>
                  </div>
                </div>
              )}
            </Campo>
          </div>

          {/* Toggle Marca de Agua */}
          <div className="pt-4">
            <div
              className={`p-14 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-12 transition-colors ${
                esPro
                  ? "border-concrete bg-canvas-white"
                  : "border-concrete/70 bg-ghost-fog/30 cursor-pointer"
              }`}
              onClick={!esPro ? () => setModalUpgradeOpen(true) : undefined}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-6">
                  <p className="text-13 font-semibold text-ash-graphite">
                    Marca de agua &quot;Potenciado por Mesa CLICK&quot;
                  </p>
                  {!esPro && (
                    <span className="material-symbols-outlined text-16 text-stone">lock</span>
                  )}
                </div>
                <p className="text-12 text-sage-green max-w-lg">
                  {esPro
                    ? "Activá o desactivá el crédito de Mesa CLICK al pie de la carta digital de tus comensales."
                    : "En el plan Free, la carta incluye un pie discreto 'Potenciado por Mesa CLICK'. Actualizá a Pro para una experiencia 100% marca blanca."}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-8">
                {esPro ? (
                  <label className="flex items-center gap-8 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={mostrarMarcaAgua}
                      onChange={(e) => {
                        setApariencia((prev) => ({ ...prev, mostrarMarcaAgua: e.target.checked }));
                        setOk(false);
                      }}
                      className="h-18 w-18 rounded border-concrete accent-plain-green cursor-pointer"
                    />
                    <span className="text-12 font-medium text-ash-graphite">
                      {mostrarMarcaAgua ? "Visible" : "Oculta (Marca blanca)"}
                    </span>
                  </label>
                ) : (
                  <button
                    type="button"
                    onClick={() => setModalUpgradeOpen(true)}
                    className="h-36 px-12 rounded-lg border border-ash-graphite bg-canvas-white text-11 font-semibold text-ash-graphite hover:bg-ghost-fog transition-colors cursor-pointer"
                  >
                    Quitar marca de agua
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && <p className="text-12 text-alert-red">{error}</p>}
        <div className="flex items-center gap-16 pt-8">
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
              style={{ background: phoneScreenBg, color: phoneText, fontFamily: previewFont }}
            >
              <div className="relative flex h-[32px] shrink-0 items-start justify-between px-[16px] pt-[9px] text-[10px] font-bold leading-none font-sans">
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
                    style={{ background: phonePanelBg, borderColor: colorAcentoSecundario || phoneBorder }}
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
                    style={{
                      color: phoneMutedText,
                      borderColor: colorAcentoSecundario || phoneBorder,
                      background: phonePanelBg,
                    }}
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

              {mostrarMarcaAgua && (
                <div
                  className="px-[12px] py-[4px] text-center text-[9px] font-mono tracking-wider opacity-60 shrink-0"
                  style={{ color: phoneMutedText }}
                >
                  ⚡ Potenciado por <span className="font-bold">Mesa CLICK</span>
                </div>
              )}

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

      <UpgradeModal
        isOpen={modalUpgradeOpen}
        onClose={() => setModalUpgradeOpen(false)}
        recurso="personalizacion"
      />
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
  tenant,
  sucursales,
  setSucursales,
  selId,
  setSelId,
  onIrAMercadoPago,
  onIrAPlanes,
}: {
  tenant: Tenant | null;
  sucursales: Sucursal[];
  setSucursales: React.Dispatch<React.SetStateAction<Sucursal[]>>;
  selId: string;
  setSelId: (id: string) => void;
  onIrAMercadoPago?: () => void;
  onIrAPlanes?: () => void;
}) {
  const sel = useMemo(() => sucursales.find((s) => s.id === selId) ?? null, [sucursales, selId]);
  const horariosIniciales = parseHorarios(sel?.horarios);

  const [nuevaSucursalNombre, setNuevaSucursalNombre] = useState("");
  const [nuevaSucursalWhatsapp, setNuevaSucursalWhatsapp] = useState("");
  const [creandoSucursal, setCreandoSucursal] = useState(false);
  const [errorCrearSucursal, setErrorCrearSucursal] = useState<string | null>(null);

  const handleCrearSucursalPro = async () => {
    if (!nuevaSucursalNombre.trim()) return;
    setCreandoSucursal(true);
    setErrorCrearSucursal(null);
    try {
      const nueva = await api.crearSucursal({
        tenant_id: tenant?.id,
        nombre: nuevaSucursalNombre.trim(),
        whatsapp: nuevaSucursalWhatsapp.trim() || undefined,
      });
      setSucursales((prev) => [...prev, nueva]);
      setSelId(nueva.id);
      setNuevaSucursalNombre("");
      setNuevaSucursalWhatsapp("");
    } catch (err) {
      setErrorCrearSucursal(getErrorMessage(err, "No se pudo crear la sucursal."));
    } finally {
      setCreandoSucursal(false);
    }
  };

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
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
                <div>
                  <span className="block text-11 font-mono text-sage-green uppercase tracking-wider mb-2">
                    Cobro con Mercado Pago en esta sucursal
                  </span>
                  <p className="text-12 text-sage-green">
                    Podés heredar la cuenta configurada a nivel negocio, asignar credenciales propias para esta sucursal o deshabilitar el cobro digital aquí.
                  </p>
                </div>
                {onIrAMercadoPago && (
                  <button
                    type="button"
                    onClick={onIrAMercadoPago}
                    className="h-36 shrink-0 rounded-lg border border-concrete bg-ghost-fog/40 px-12 text-11 font-semibold text-ash-graphite hover:border-ash-graphite hover:bg-canvas-white transition-colors cursor-pointer"
                  >
                    Ver panel de Mercado Pago →
                  </button>
                )}
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
      {tenant?.plan === "pro" ? (
        <aside className="space-y-12 rounded-xl border border-concrete bg-canvas-white p-20 shadow-sm">
          <div className="flex items-center gap-8">
            <p className="text-13 font-bold text-ash-graphite">Crear sucursal PRO</p>
            <span className="rounded-full bg-ash-graphite text-canvas-white px-8 py-2 text-10 font-mono font-semibold uppercase">
              Pro
            </span>
          </div>
          <p className="text-12 text-sage-green">Agregá una nueva sucursal física para tu negocio.</p>
          <Campo label="Nombre">
            <input
              className={INPUT}
              placeholder="Sucursal nueva"
              value={nuevaSucursalNombre}
              onChange={(e) => setNuevaSucursalNombre(e.target.value)}
            />
          </Campo>
          <Campo label="Contacto / WhatsApp">
            <input
              className={INPUT}
              placeholder="+54 9 ..."
              value={nuevaSucursalWhatsapp}
              onChange={(e) => setNuevaSucursalWhatsapp(e.target.value)}
            />
          </Campo>
          {errorCrearSucursal && (
            <p className="text-12 text-alert-red">{errorCrearSucursal}</p>
          )}
          <button
            type="button"
            onClick={handleCrearSucursalPro}
            disabled={creandoSucursal || !nuevaSucursalNombre.trim()}
            className="h-44 w-full rounded-lg bg-plain-green px-16 text-12 font-semibold text-canvas-white transition-colors hover:bg-plain-green-muted disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            {creandoSucursal ? "Creando..." : "Crear sucursal"}
          </button>
        </aside>
      ) : (
        <aside className="space-y-12 rounded-xl border border-concrete bg-canvas-white p-20 shadow-sm">
          <div className="flex items-center gap-8">
            <p className="text-13 font-bold text-ash-graphite">Crear sucursal PRO</p>
            <span className="material-symbols-outlined text-16 text-stone">lock</span>
          </div>
          <p className="text-12 text-sage-green">
            El plan Free incluye 1 sucursal activa. Para gestionar múltiples sucursales con horarios y menús independientes, actualizá a Pro.
          </p>
          <Campo label="Nombre">
            <input className={INPUT} placeholder="Sucursal nueva" disabled />
          </Campo>
          <Campo label="Contacto">
            <input className={INPUT} placeholder="+54 9 ..." disabled />
          </Campo>
          <button
            type="button"
            onClick={onIrAPlanes}
            className="h-44 w-full rounded-lg border border-ash-graphite bg-ash-graphite text-11 font-semibold text-canvas-white hover:bg-plain-green-muted transition-colors cursor-pointer"
          >
            Solicitar Upgrade Pro
          </button>
        </aside>
      )}
    </div>
  );
}

/* ─────────────────────────── pestaña mercado pago ─────────────────────────── */

function MercadoPagoTab({
  tenant,
  setTenant,
  sucursales,
  setSucursales,
  selId,
  setSelId,
}: {
  tenant: Tenant | null;
  setTenant?: React.Dispatch<React.SetStateAction<Tenant | null>>;
  sucursales: Sucursal[];
  setSucursales: React.Dispatch<React.SetStateAction<Sucursal[]>>;
  selId: string;
  setSelId: (id: string) => void;
}) {
  // Estado negocio (default)
  const [tenantMpActivo, setTenantMpActivo] = useState(tenant?.mp_activo ?? false);
  const [tenantAccessToken, setTenantAccessToken] = useState(tenant?.mp_access_token ?? "");
  const [tenantPublicKey, setTenantPublicKey] = useState(tenant?.mp_public_key ?? "");
  const [mostrarTenantToken, setMostrarTenantToken] = useState(false);
  const [guardandoTenant, setGuardandoTenant] = useState(false);
  const [msgTenant, setMsgTenant] = useState("");
  const [errTenant, setErrTenant] = useState("");

  // Sucursal seleccionada
  const sucursalSel = useMemo(
    () => sucursales.find((s) => s.id === selId) ?? sucursales[0] ?? null,
    [sucursales, selId],
  );
  const [mpModoSucursal, setMpModoSucursal] = useState<"heredar" | "propia" | "deshabilitar">(() => {
    if (sucursalSel?.mp_activo === false) return "deshabilitar";
    if (sucursalSel?.mp_activo === true || (sucursalSel?.mp_access_token && sucursalSel.mp_access_token.trim() !== "")) {
      return "propia";
    }
    return "heredar";
  });
  const [sucursalAccessToken, setSucursalAccessToken] = useState(sucursalSel?.mp_access_token ?? "");
  const [sucursalPublicKey, setSucursalPublicKey] = useState(sucursalSel?.mp_public_key ?? "");
  const [mostrarSucursalToken, setMostrarSucursalToken] = useState(false);
  const [guardandoSucursal, setGuardandoSucursal] = useState(false);
  const [msgSucursal, setMsgSucursal] = useState("");
  const [errSucursal, setErrSucursal] = useState("");

  // Estado de portapapeles
  const [copiadoWebhook, setCopiadoWebhook] = useState(false);

  useEffect(() => {
    if (sucursalSel) {
      if (sucursalSel.mp_activo === false) {
        setMpModoSucursal("deshabilitar");
      } else if (
        sucursalSel.mp_activo === true ||
        (sucursalSel.mp_access_token && sucursalSel.mp_access_token.trim() !== "")
      ) {
        setMpModoSucursal("propia");
      } else {
        setMpModoSucursal("heredar");
      }
      setSucursalAccessToken(sucursalSel.mp_access_token ?? "");
      setSucursalPublicKey(sucursalSel.mp_public_key ?? "");
      setMsgSucursal("");
      setErrSucursal("");
    }
  }, [sucursalSel]);

  const apiBase = getApiBaseUrl();
  const webhookUrl = `${apiBase}/publica/pago/mercadopago/webhook`;

  const copiarWebhook = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopiadoWebhook(true);
      setTimeout(() => setCopiadoWebhook(false), 2500);
    } catch {
      const input = document.createElement("textarea");
      input.value = webhookUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopiadoWebhook(true);
      setTimeout(() => setCopiadoWebhook(false), 2500);
    }
  };

  const guardarTenantMP = async () => {
    setGuardandoTenant(true);
    setMsgTenant("");
    setErrTenant("");
    try {
      const resp = await api.actualizarMiTenant({
        mp_activo: tenantMpActivo,
        mp_access_token: tenantAccessToken.trim() || undefined,
        mp_public_key: tenantPublicKey.trim() || undefined,
      });
      if (setTenant) setTenant((prev) => (prev ? { ...prev, ...resp } : resp));
      setMsgTenant("Credenciales del negocio guardadas correctamente.");
    } catch (err: unknown) {
      setErrTenant(getErrorMessage(err, "No se pudieron guardar las credenciales."));
    } finally {
      setGuardandoTenant(false);
    }
  };

  const guardarSucursalMP = async () => {
    if (!sucursalSel) return;
    setGuardandoSucursal(true);
    setMsgSucursal("");
    setErrSucursal("");
    try {
      let mpPayload: Partial<Sucursal> = {};
      if (mpModoSucursal === "heredar") {
        mpPayload = { mp_activo: null, mp_access_token: null, mp_public_key: null };
      } else if (mpModoSucursal === "deshabilitar") {
        mpPayload = { mp_activo: false, mp_access_token: null, mp_public_key: null };
      } else {
        mpPayload = {
          mp_activo: true,
          mp_access_token: sucursalAccessToken.trim() || null,
          mp_public_key: sucursalPublicKey.trim() || null,
        };
      }
      const actualizada = await api.actualizarSucursal(sucursalSel.id, mpPayload);
      setSucursales((prev) => prev.map((s) => (s.id === sucursalSel.id ? { ...s, ...actualizada } : s)));
      setMsgSucursal("Configuración de la sucursal actualizada.");
    } catch (err: unknown) {
      setErrSucursal(getErrorMessage(err, "No se pudo actualizar la sucursal."));
    } finally {
      setGuardandoSucursal(false);
    }
  };

  const renderBadgeEntorno = (activo: boolean, token: string) => {
    if (!activo) {
      return (
        <span className="inline-flex items-center gap-4 rounded-full bg-concrete/60 px-8 py-2 text-11 font-mono font-medium text-sage-green">
          <span className="h-6 w-6 rounded-full bg-sage-green/60" />
          Deshabilitado
        </span>
      );
    }
    const t = token.trim();
    if (!t) {
      return (
        <span className="inline-flex items-center gap-4 rounded-full bg-amber-500/10 px-8 py-2 text-11 font-mono font-medium text-amber-700">
          <span className="h-6 w-6 rounded-full bg-amber-500" />
          Sin token
        </span>
      );
    }
    if (t.startsWith("TEST-")) {
      return (
        <span className="inline-flex items-center gap-4 rounded-full bg-blue-500/10 px-8 py-2 text-11 font-mono font-medium text-blue-700">
          <span className="h-6 w-6 rounded-full bg-blue-500" />
          Sandbox (Pruebas)
        </span>
      );
    }
    if (t.startsWith("APP_USR-")) {
      return (
        <span className="inline-flex items-center gap-4 rounded-full bg-plain-green/15 px-8 py-2 text-11 font-mono font-medium text-plain-green">
          <span className="h-6 w-6 rounded-full bg-plain-green" />
          Producción
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-4 rounded-full bg-concrete/80 px-8 py-2 text-11 font-mono font-medium text-ash-graphite">
        Token personalizado
      </span>
    );
  };

  return (
    <div className="grid items-start gap-16 xl:grid-cols-[minmax(0,1fr)_380px]">
      {/* Columna Principal: Negocio y Sucursal */}
      <div className="space-y-16">
        {/* 1. Negocio General */}
        <Card titulo="Cuenta General de Mercado Pago (Predeterminada)">
          <div className="space-y-14">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-10">
              <p className="text-13 text-sage-green">
                Habilita el cobro de pedidos desde el celular de los comensales mediante Checkout Pro. Todas las sucursales usarán esta cuenta salvo que configures una propia abajo.
              </p>
              <div className="flex items-center gap-10 shrink-0">
                {renderBadgeEntorno(tenantMpActivo, tenantAccessToken)}
                <label className="flex items-center gap-8 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={tenantMpActivo}
                    onChange={(e) => setTenantMpActivo(e.target.checked)}
                    className="h-18 w-18 rounded border-concrete accent-plain-green cursor-pointer"
                  />
                  <span className="text-13 font-semibold text-ash-graphite">
                    {tenantMpActivo ? "Habilitado" : "Deshabilitado"}
                  </span>
                </label>
              </div>
            </div>

            <div className="space-y-12 pt-6">
              <Campo label="Access Token del Negocio">
                <div className="relative">
                  <input
                    type={mostrarTenantToken ? "text" : "password"}
                    className={`${INPUT} pr-80 font-mono text-13`}
                    value={tenantAccessToken}
                    onChange={(e) => setTenantAccessToken(e.target.value)}
                    placeholder="TEST-... o APP_USR-..."
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarTenantToken((prev) => !prev)}
                    className="absolute right-8 top-1/2 -translate-y-1/2 text-11 font-mono text-sage-green hover:text-ash-graphite px-8 py-4 rounded cursor-pointer"
                  >
                    {mostrarTenantToken ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                <span className="block text-11 text-sage-green mt-4">
                  Token privado generado en Mercado Pago Developers. Si comienza con <code className="font-mono text-ash-graphite">TEST-</code> opera en modo sandbox de pruebas sin dinero real.
                </span>
              </Campo>

              <Campo label="Public Key del Negocio (Opcional)">
                <input
                  type="text"
                  className={`${INPUT} font-mono text-13`}
                  value={tenantPublicKey}
                  onChange={(e) => setTenantPublicKey(e.target.value)}
                  placeholder="TEST-... o APP_USR-..."
                />
                <span className="block text-11 text-sage-green mt-4">
                  Clave pública asociada a tu aplicación de Mercado Pago.
                </span>
              </Campo>
            </div>

            <div className="pt-8 flex items-center gap-12">
              <PillPrimaria onClick={guardarTenantMP} disabled={guardandoTenant}>
                {guardandoTenant ? "Guardando…" : "Guardar credenciales del negocio"}
              </PillPrimaria>
              {msgTenant && <span className="text-12 font-medium text-success-muted">{msgTenant}</span>}
              {errTenant && <span className="text-12 font-medium text-alert-red">{errTenant}</span>}
            </div>
          </div>
        </Card>

        {/* 2. Sucursales */}
        <Card titulo="Configuración por Sucursal Física">
          <div className="space-y-14">
            <p className="text-13 text-sage-green">
              Si tu local tiene distintas razones sociales, cuentas bancarias o dueños por sucursal, podés cargar credenciales individuales para cada una.
            </p>

            {sucursales.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-8 items-center">
                  <span className="text-11 font-mono text-sage-green uppercase tracking-wider">Sucursal:</span>
                  <div className="flex flex-wrap gap-6">
                    {sucursales.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelId(s.id)}
                        className={`h-36 px-12 rounded-lg border text-12 font-medium transition-colors cursor-pointer ${
                          s.id === sucursalSel?.id
                            ? "border-ash-graphite bg-ghost-fog text-ash-graphite font-semibold shadow-xs"
                            : "border-concrete text-sage-green hover:border-stone hover:bg-canvas-white"
                        }`}
                      >
                        {s.nombre}
                        {s.mp_activo === false ? (
                          <span className="ml-6 text-10 font-mono text-sage-green">(Inactivo)</span>
                        ) : s.mp_activo === true ? (
                          <span className="ml-6 text-10 font-mono text-plain-green">(Propio)</span>
                        ) : (
                          <span className="ml-6 text-10 font-mono text-sage-green">(Hereda)</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {sucursalSel && (
                  <div className="rounded-xl border border-concrete/80 bg-ghost-fog/20 p-14 sm:p-16 space-y-14">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8 pb-10 border-b border-concrete/60">
                      <div>
                        <p className="text-13 font-semibold text-ash-graphite">{sucursalSel.nombre}</p>
                        <p className="text-11 text-sage-green">{sucursalSel.direccion || "Sin dirección cargada"}</p>
                      </div>
                      <div>
                        {renderBadgeEntorno(
                          mpModoSucursal === "deshabilitar"
                            ? false
                            : mpModoSucursal === "propia"
                            ? true
                            : tenantMpActivo,
                          mpModoSucursal === "propia" ? sucursalAccessToken : tenantAccessToken,
                        )}
                      </div>
                    </div>

                    <div className="space-y-10">
                      <label className="flex items-start gap-8 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="mp_modo_sucursal"
                          value="heredar"
                          checked={mpModoSucursal === "heredar"}
                          onChange={() => setMpModoSucursal("heredar")}
                          className="mt-2 accent-plain-green cursor-pointer"
                        />
                        <div>
                          <span className="text-13 text-ash-graphite font-medium">
                            Heredar configuración del negocio (recomendado)
                          </span>
                          <p className="text-11 text-sage-green">
                            Cobra en la cuenta general cargada arriba ({tenantAccessToken ? (tenantAccessToken.startsWith("TEST-") ? "Sandbox" : "Producción") : "Sin credenciales"}).
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start gap-8 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="mp_modo_sucursal"
                          value="propia"
                          checked={mpModoSucursal === "propia"}
                          onChange={() => setMpModoSucursal("propia")}
                          className="mt-2 accent-plain-green cursor-pointer"
                        />
                        <div>
                          <span className="text-13 text-ash-graphite font-medium">
                            Usar cuenta propia de Mercado Pago para esta sucursal
                          </span>
                          <p className="text-11 text-sage-green">
                            Los cobros de las mesas de {sucursalSel.nombre} se transferirán a este Access Token individual.
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start gap-8 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="mp_modo_sucursal"
                          value="deshabilitar"
                          checked={mpModoSucursal === "deshabilitar"}
                          onChange={() => setMpModoSucursal("deshabilitar")}
                          className="mt-2 accent-plain-green cursor-pointer"
                        />
                        <div>
                          <span className="text-13 text-ash-graphite font-medium">
                            Deshabilitar cobro con Mercado Pago en esta sucursal
                          </span>
                          <p className="text-11 text-sage-green">
                            Los comensales de este local no verán la opción de abonar por Mercado Pago (solo pago presencial al mozo).
                          </p>
                        </div>
                      </label>
                    </div>

                    {mpModoSucursal === "propia" && (
                      <div className="grid sm:grid-cols-2 gap-12 pt-8 border-t border-concrete/60">
                        <Campo label="Access Token de la Sucursal">
                          <div className="relative">
                            <input
                              type={mostrarSucursalToken ? "text" : "password"}
                              className={`${INPUT} pr-80 font-mono text-13`}
                              value={sucursalAccessToken}
                              onChange={(e) => setSucursalAccessToken(e.target.value)}
                              placeholder="TEST-... o APP_USR-..."
                            />
                            <button
                              type="button"
                              onClick={() => setMostrarSucursalToken((prev) => !prev)}
                              className="absolute right-8 top-1/2 -translate-y-1/2 text-11 font-mono text-sage-green hover:text-ash-graphite px-8 py-4 rounded cursor-pointer"
                            >
                              {mostrarSucursalToken ? "Ocultar" : "Mostrar"}
                            </button>
                          </div>
                          <span className="block text-11 text-sage-green mt-4">
                            Token de la cuenta de MP de esta sucursal.
                          </span>
                        </Campo>
                        <Campo label="Public Key de la Sucursal (Opcional)">
                          <input
                            type="text"
                            className={`${INPUT} font-mono text-13`}
                            value={sucursalPublicKey}
                            onChange={(e) => setSucursalPublicKey(e.target.value)}
                            placeholder="TEST-... o APP_USR-..."
                          />
                          <span className="block text-11 text-sage-green mt-4">
                            Clave pública de la sucursal.
                          </span>
                        </Campo>
                      </div>
                    )}

                    <div className="pt-4 flex items-center gap-12">
                      <PillPrimaria onClick={guardarSucursalMP} disabled={guardandoSucursal}>
                        {guardandoSucursal ? "Guardando…" : `Guardar configuración de ${sucursalSel.nombre}`}
                      </PillPrimaria>
                      {msgSucursal && <span className="text-12 font-medium text-success-muted">{msgSucursal}</span>}
                      {errSucursal && <span className="text-12 font-medium text-alert-red">{errSucursal}</span>}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-13 text-sage-green">No hay sucursales registradas aún.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Columna Lateral: URLs a Configurar y Guía */}
      <div className="space-y-16">
        <section className="overflow-hidden rounded-xl border border-concrete bg-canvas-white shadow-sm">
          <div className="border-b border-concrete/70 px-16 py-14">
            <p className="text-13 font-semibold text-ash-graphite flex items-center gap-6">
              <span className="material-symbols-outlined text-18 text-plain-green">link</span>
              URLs a configurar en Mercado Pago
            </p>
          </div>
          <div className="p-16 space-y-16">
            {/* Webhook URL */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <span className="text-11 font-mono text-sage-green uppercase tracking-wider">
                  Webhook URL (IPN)
                </span>
                <span className="text-10 font-mono rounded bg-plain-green/15 text-plain-green px-6 py-1 font-semibold">
                  Obligatorio
                </span>
              </div>
              <p className="text-12 text-sage-green">
                Mercado Pago notificará a este endpoint cada vez que un comensal confirme un pago:
              </p>
              <div className="relative rounded-lg border border-concrete bg-ghost-fog p-10 font-mono text-11 break-all text-ash-graphite">
                {webhookUrl}
              </div>
              <button
                type="button"
                onClick={copiarWebhook}
                className="w-full h-38 rounded-lg border border-concrete bg-canvas-white text-12 font-semibold text-ash-graphite hover:border-ash-graphite hover:bg-ghost-fog transition-colors flex items-center justify-center gap-6 cursor-pointer"
              >
                <span className="material-symbols-outlined text-16">
                  {copiadoWebhook ? "done" : "content_copy"}
                </span>
                {copiadoWebhook ? "¡URL Copiada al Portapapeles!" : "Copiar Webhook URL"}
              </button>
            </div>

            {/* Pasos en Mercado Pago */}
            <div className="pt-12 border-t border-concrete/60 space-y-8">
              <p className="text-11 font-mono text-sage-green uppercase tracking-wider">
                Configuración en Mercado Pago:
              </p>
              <ol className="text-12 text-sage-green space-y-6 list-decimal list-inside leading-relaxed">
                <li>
                  Ingresá a{" "}
                  <a
                    href="https://www.mercadopago.com.ar/developers/panel/app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-ash-graphite font-medium hover:text-plain-green"
                  >
                    Mercado Pago Developers
                  </a>.
                </li>
                <li>Abrí tu aplicación y hacé clic en <strong>Webhooks</strong>.</li>
                <li>Pegá la <strong>Webhook URL</strong> indicada arriba.</li>
                <li>
                  En eventos a escuchar, tildá únicamente <strong>Pagos (payments)</strong>.
                </li>
              </ol>
            </div>

            {/* Redirección automática */}
            <div className="pt-12 border-t border-concrete/60 space-y-8">
              <div className="flex items-center justify-between">
                <span className="text-11 font-mono text-sage-green uppercase tracking-wider">
                  Redirección de retorno (back_urls)
                </span>
                <span className="text-10 font-mono rounded bg-ghost-fog text-sage-green px-6 py-1 font-semibold">
                  Automático
                </span>
              </div>
              <p className="text-12 text-sage-green leading-relaxed">
                <strong>No tenés que configurar URLs de retorno en el panel de Mercado Pago.</strong> Mesa CLICK inyecta dinámicamente las rutas de retorno hacia la comanda de la mesa (<code className="text-11 font-mono text-ash-graphite">/mesa/[qr_token]?pago=exitoso</code>).
              </p>
              <p className="text-12 text-sage-green leading-relaxed">
                Al pagar o cancelar, Mercado Pago redirige de inmediato al comensal a su mesa, donde el pedido se actualiza en tiempo real vía SSE.
              </p>
            </div>
          </div>
        </section>

        {/* Card: Sandbox y Pruebas */}
        <section className="overflow-hidden rounded-xl border border-concrete bg-canvas-white shadow-sm p-16 space-y-12">
          <p className="text-13 font-semibold text-ash-graphite flex items-center gap-6">
            <span className="material-symbols-outlined text-18 text-amber-600">science</span>
            Modo Sandbox (Pruebas)
          </p>
          <p className="text-12 text-sage-green leading-relaxed">
            Podés realizar pruebas completas de cobro sin debitar dinero real:
          </p>
          <ul className="text-12 text-sage-green space-y-4 list-disc list-inside">
            <li>
              Cargá un Access Token que empiece con <code className="font-mono text-ash-graphite">TEST-</code>.
            </li>
            <li>
              En el portal de Mercado Pago, creá una <strong>cuenta de prueba de comprador</strong> para pagar con saldo ficticio o tarjetas de test.
            </li>
            <li>
              Al cambiar al token <code className="font-mono text-ash-graphite">APP_USR-</code> el sistema empezará a cobrar dinero real automáticamente.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
