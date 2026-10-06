"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { obtenerToken } from "@/lib/api";
import LandingIcon from "@/components/landing/LandingIcon";

export const PANEL_LABEL = "Ir a mi panel";

// El token vive en localStorage: un JWT vencido no cuenta como sesión activa.
function tieneSesionActiva(): boolean {
  const token = obtenerToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp !== "number" || payload.exp * 1000 > Date.now();
  } catch {
    return true;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

// En el servidor (y en el primer render) se asume visitante sin sesión.
export function useSesionActiva(): boolean {
  return useSyncExternalStore(subscribe, tieneSesionActiva, () => false);
}

interface SessionCtaProps {
  href: string;
  label: string;
  className: string;
  icon?: "chevron" | "none";
  iconSize?: number;
  iconFirst?: boolean;
}

// CTA de la landing: para visitantes lleva a registro/login; con sesión activa, al panel.
export default function SessionCta({ href, label, className, icon = "chevron", iconSize = 20, iconFirst = false }: SessionCtaProps) {
  const conSesion = useSesionActiva();
  const destino = conSesion ? "/dashboard" : href;
  const texto = conSesion ? PANEL_LABEL : label;
  const iconNode = icon === "chevron" ? <LandingIcon name="chevron" size={iconSize} /> : null;

  if (iconFirst) {
    return <Link href={destino} className={className}><span>{iconNode}</span> {texto}</Link>;
  }
  return <Link href={destino} className={className}>{texto} {iconNode}</Link>;
}

// Acciones del header: con sesión activa se reemplazan "Ingresar" y "Probar gratis" por un único acceso al panel.
export function LandingHeaderActions() {
  const conSesion = useSesionActiva();

  if (conSesion) {
    return (
      <div className="landing-header-actions">
        <Link href="/dashboard" className="landing-cta small">{PANEL_LABEL} <LandingIcon name="chevron" size={16} /></Link>
      </div>
    );
  }
  return (
    <div className="landing-header-actions">
      <Link href="/login" className="landing-login">Ingresar</Link>
      <Link href="/onboarding" className="landing-cta small">Probar gratis <LandingIcon name="chevron" size={16} /></Link>
    </div>
  );
}
