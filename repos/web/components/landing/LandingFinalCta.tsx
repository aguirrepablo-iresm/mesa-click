import React from "react";
import Link from "next/link";
import LandingIcon from "@/components/landing/LandingIcon";

export default function LandingFinalCta() {
  return (
    <section className="final-cta">
      <div>
        <span className="hero-kicker light"><i /> Empezá hoy</span>
        <h2>Tu próximo servicio puede ser más simple</h2>
        <p>Probá Mesa CLICK con tu equipo y descubrí una operación más ágil, clara y conectada.</p>
      </div>
      <div>
        <Link href="/onboarding" className="landing-cta light-button">Probar gratis <LandingIcon name="chevron" /></Link>
        <small>Plan Free sin tarjeta · Configuración en minutos</small>
      </div>
    </section>
  );
}
