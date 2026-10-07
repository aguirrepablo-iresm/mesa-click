import React from "react";
import SessionCta from "@/components/landing/SessionCta";

export default function LandingFinalCta() {
  return (
    <section className="final-cta">
      <div>
        <span className="hero-kicker light"><i /> Empezá hoy</span>
        <h2>Tu próximo servicio puede ser más simple</h2>
        <p>Probá Mesa CLICK con tu equipo y descubrí una operación más ágil, clara y conectada.</p>
      </div>
      <div>
        <SessionCta href="/registro" label="Probar gratis" className="landing-cta light-button" />
        <small>Plan Free sin tarjeta · Configuración en minutos</small>
      </div>
    </section>
  );
}
