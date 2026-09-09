"use client";

import { useState, type CSSProperties } from "react";

export interface MesaBranding {
  nombre: string;
  logo_url?: string | null;
  color_primario?: string | null;
  estilo_visual?: string | null;
}

export interface MesaTheme {
  primaryColor: string;
  visualStyle: "claro" | "oscuro";
  style: CSSProperties;
}

export const DEFAULT_MESA_PRIMARY = "#F54927";

function isHexColor(value: string | null | undefined): value is string {
  return !!value && /^#[0-9a-f]{6}$/i.test(value);
}

function hexToRgb(hex: string) {
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  };
}

function getContrastColor(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = [r, g, b]
    .map((channel) => channel / 255)
    .map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
    .reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0);

  const contrastWithDark = (luminance + 0.05) / 0.05;
  const contrastWithWhite = 1.05 / (luminance + 0.05);
  return contrastWithDark >= contrastWithWhite ? "#0f172a" : "#ffffff";
}

export function buildMesaTheme(branding: MesaBranding): MesaTheme {
  const primaryColor = isHexColor(branding.color_primario)
    ? branding.color_primario
    : DEFAULT_MESA_PRIMARY;
  const visualStyle = branding.estilo_visual === "claro" ? "claro" : "oscuro";
  const { r, g, b } = hexToRgb(primaryColor);
  const dark = visualStyle === "oscuro";

  return {
    primaryColor,
    visualStyle,
    style: {
      "--mesa-primary": primaryColor,
      "--mesa-primary-contrast": getContrastColor(primaryColor),
      "--mesa-primary-soft": `rgba(${r}, ${g}, ${b}, 0.14)`,
      // Mantener estos valores alineados con la vista previa de Configuración.
      "--mesa-background": dark ? "#111611" : "#f7f7f7",
      "--mesa-header": dark ? "#0c100d" : "#ffffff",
      "--mesa-surface": dark ? "#18201b" : "#ffffff",
      "--mesa-subtle-surface": dark ? "#202a23" : "#f0f0f0",
      "--mesa-text": dark ? "#f5f5f5" : "#0a0a0a",
      "--mesa-muted": dark ? "#b8beb9" : "#595959",
      "--mesa-subtle-text": dark ? "#8f9891" : "#737373",
      "--mesa-border": dark ? "#283229" : "#e6e6e6",
    } as CSSProperties,
  };
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return initials || "MC";
}

export function BrandMark({ branding, className = "h-44 w-44" }: { branding: MesaBranding; className?: string }) {
  const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null);
  const nombre = branding.nombre.trim() || "Tu negocio";
  const logoUrl = branding.logo_url?.trim();
  const logoFailed = !!logoUrl && failedLogoUrl === logoUrl;

  return (
    <div
      className={`${className} mesa-surface mesa-border grid shrink-0 place-items-center overflow-hidden rounded-lg border font-semibold`}
      role="img"
      aria-label={logoUrl && !logoFailed ? `Logo de ${nombre}` : nombre}
    >
      {logoUrl && !logoFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" className="h-full w-full object-cover" onError={() => setFailedLogoUrl(logoUrl)} />
      ) : (
        <span className="mesa-primary text-14" aria-hidden="true">
          {getInitials(nombre)}
        </span>
      )}
    </div>
  );
}

interface BrandHeaderProps {
  branding: MesaBranding;
  mesa: number;
  title?: string;
  sticky?: boolean;
}

export default function BrandHeader({ branding, mesa, title, sticky = true }: BrandHeaderProps) {
  const nombre = branding.nombre.trim() || "Tu negocio";

  return (
    <header className={`${sticky ? "sticky top-0 z-20" : ""} mesa-header mesa-border min-h-[68px] border-b px-16 py-12`}>
      <div className="mx-auto flex max-w-lg items-center justify-between gap-12">
        <div className="flex min-w-0 items-center gap-12">
          <BrandMark branding={{ ...branding, nombre }} />
          <div className="min-w-0">
            <p className="mesa-text truncate text-14 font-bold leading-tight">{nombre}</p>
            {title && <h1 className="mesa-text truncate text-13 font-medium leading-tight">{title}</h1>}
            <p className="mesa-muted mt-2 text-12">Mesa {mesa}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
