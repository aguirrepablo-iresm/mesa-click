import React from "react";
import Link from "next/link";
import LandingIcon from "@/components/landing/LandingIcon";

const FREE = [
  "1 sucursal activa",
  "Hasta 10 mesas con QR",
  "Hasta 30 productos",
  "Pedidos y dashboard en tiempo real",
  "Disponibilidad de ítems (86) en vivo",
];

const PRO = [
  "Multi-sucursal, mesas y carta ilimitadas",
  "Carga masiva Excel/CSV + ajuste de precios",
  "Pantalla de cocina (KDS)",
  "Métricas y analítica de negocio",
  "Personalización de marca del menú",
];

export default function LandingPricing() {
  return (
    <section className="landing-section" id="planes">
      <div className="section-intro">
        <span className="landing-eyebrow">Planes</span>
        <h2>Elegí el plan según el tamaño de tu operación</h2>
        <p>Empezá gratis y pasate a Pro cuando lo necesites. Sin ataduras.</p>
      </div>
      <div className="pricing-grid">
        <article className="plan-card">
          <small>Plan Free</small>
          <strong>$0 <span>/ mes</span></strong>
          <p>Ideal para cafeterías y locales chicos.</p>
          <ul>
            {FREE.map((item) => <li key={item}><span><LandingIcon name="check" size={12} /></span>{item}</li>)}
          </ul>
          <Link href="/onboarding" className="landing-cta outline">Comenzar gratis</Link>
        </article>
        <article className="plan-card pro">
          <span className="plan-badge">Recomendado</span>
          <small>Plan Pro</small>
          <strong>$2.500 <span>/ mes</span></strong>
          <p>Para restaurantes y bares con alta demanda.</p>
          <ul>
            {PRO.map((item) => <li key={item}><span><LandingIcon name="check" size={12} /></span>{item}</li>)}
          </ul>
          <Link href="/onboarding" className="landing-cta light-button">Probar Pro <LandingIcon name="chevron" size={16} /></Link>
        </article>
      </div>
    </section>
  );
}
