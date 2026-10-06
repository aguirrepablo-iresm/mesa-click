/* eslint-disable @next/next/no-img-element -- imágenes de referencia de la maqueta (Unsplash) */
import React from "react";
import Link from "next/link";
import { LandingBrand } from "@/components/landing/LandingHeader";
import LandingIcon from "@/components/landing/LandingIcon";
import "@/components/landing/landing.css";

interface AuthShellProps {
  children: React.ReactNode;
  image: string;
  imageAlt: string;
  visualTitle: string;
  visualText: string;
  cardLabel: string;
  cardTitle: string;
}

// Contenedor de login y registro con el lenguaje visual de la landing (docs/diseño/maqueta).
export default function AuthShell({ children, image, imageAlt, visualTitle, visualText, cardLabel, cardTitle }: AuthShellProps) {
  return (
    <div className="landing auth-page font-inter antialiased">
      <main className="auth-main">
        <div className="auth-top">
          <LandingBrand />
          <Link href="/" className="auth-back">← Volver al inicio</Link>
        </div>
        <div className="auth-body">
          <div className="auth-card">{children}</div>
        </div>
        <p className="auth-legal">
          Al continuar aceptás los <Link href="/terminos">Términos del Servicio</Link> y la <Link href="/privacidad">Política de Privacidad</Link>.
        </p>
      </main>

      <aside className="auth-visual" aria-hidden="true">
        <div className="hero-photo"><img src={image} alt={imageAlt} /></div>
        <div className="hero-order-card">
          <span className="landing-mini-icon"><LandingIcon name="bell" size={18} /></span>
          <span><small>{cardLabel}</small><strong>{cardTitle}</strong></span>
          <i><LandingIcon name="check" size={14} /></i>
        </div>
        <div className="auth-visual-copy">
          <h2>{visualTitle}</h2>
          <p>{visualText}</p>
        </div>
      </aside>
    </div>
  );
}
