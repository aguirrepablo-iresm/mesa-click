/* eslint-disable @next/next/no-img-element -- imágenes de referencia de la maqueta (Unsplash) */
import React from "react";
import LandingIcon from "@/components/landing/LandingIcon";

export default function LandingFeatures() {
  return (
    <section className="landing-section how-section" id="como-funciona">
      <div className="section-intro">
        <span className="landing-eyebrow">Todo conectado</span>
        <h2>Una experiencia fluida,<br />de la mesa a la cocina</h2>
        <p>Cada persona recibe la información que necesita, en el momento indicado. Sin gritos, papeles ni pasos innecesarios.</p>
      </div>
      <div className="flow-grid">
        <article className="flow-card guest-flow">
          <span className="flow-number">01</span>
          <span className="flow-icon"><LandingIcon name="qr" /></span>
          <h3>El comensal pide</h3>
          <p>Escanea el QR, explora la carta y envía su pedido desde el celular.</p>
          <div className="mini-phone">
            <div><span>Bajo Limonero</span><b>Mesa 14</b></div>
            <img src="https://images.unsplash.com/photo-1643757343278-5d50309dfa44?auto=format&fit=crop&w=700&q=82" alt="" />
            <span>Smash Limonero <b>$ 9.200</b></span>
          </div>
        </article>
        <article className="flow-card kitchen-flow">
          <span className="flow-number">02</span>
          <span className="flow-icon"><LandingIcon name="kitchen" /></span>
          <h3>Cocina se organiza</h3>
          <p>La comanda aparece al instante, con tiempos, notas y prioridades claras.</p>
          <div className="mini-kds">
            <span><i /> EN PREPARACIÓN <b>08:42</b></span>
            <strong>Mesa 14</strong>
            <small>2× Smash Limonero</small>
            <small>1× Ensalada tibia</small>
            <span>Marcar como listo</span>
          </div>
        </article>
        <article className="flow-card team-flow">
          <span className="flow-number">03</span>
          <span className="flow-icon"><LandingIcon name="bell" /></span>
          <h3>El equipo entrega</h3>
          <p>Salón recibe la alerta, entrega a tiempo y cobra sin demoras.</p>
          <div className="mini-ready">
            <span><LandingIcon name="bell" /></span>
            <div><small>LISTO PARA RETIRAR</small><strong>Mesa 14</strong><p>3 platos · Terraza</p></div>
            <i><LandingIcon name="chevron" size={16} /></i>
          </div>
        </article>
      </div>
    </section>
  );
}
