import React from "react";
import Link from "next/link";

export default function LandingPricing() {
  return (
    <section id="pricing" className="py-80 md:py-120 bg-canvas-white">
      <div className="max-w-7xl mx-auto px-24">
        <h2 className="display text-[34px] md:text-56 text-ash-graphite mb-12 text-center">Planes</h2>
        <p className="text-16 text-deep-forest max-w-xl mx-auto mb-48 text-center">
          Elegí el plan según el tamaño de tu operación. Sin ataduras.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 max-w-4xl mx-auto">
          {/* Free */}
          <div className="p-32 rounded-lg border border-ash-graphite bg-canvas-white flex flex-col">
            <h4 className="text-12 font-bold uppercase tracking-widest text-sage-green">Plan Free</h4>
            <div className="mt-8 text-32 font-bold text-ash-graphite">
              $0 <span className="text-14 font-normal text-sage-green">/ mes</span>
            </div>
            <p className="mt-4 text-14 text-sage-green">Ideal para cafeterías y locales chicos.</p>
            <ul className="mt-24 pt-20 border-t border-concrete space-y-12 flex-1">
              <Item text="1 sucursal activa" />
              <Item text="Hasta 10 mesas con QR" />
              <Item text="Hasta 30 productos" />
              <Item text="Pedidos y dashboard en tiempo real" />
              <Item text="Disponibilidad de ítems (86) en vivo" />
            </ul>
            <Link
              href="/onboarding"
              className="mt-24 w-full py-14 rounded-full border border-ash-graphite text-ash-graphite text-12 font-bold uppercase tracking-wide text-center hover:bg-ash-graphite hover:text-canvas-white transition-colors"
            >
              Comenzar gratis
            </Link>
          </div>

          {/* Pro (invertida) */}
          <div className="p-32 rounded-lg bg-ash-graphite text-canvas-white flex flex-col relative">
            <span className="absolute top-0 right-0 bg-canvas-white text-ash-graphite text-10 font-bold uppercase tracking-widest px-12 py-4 rounded-bl-lg">
              Recomendado
            </span>
            <h4 className="text-12 font-bold uppercase tracking-widest text-canvas-white/60">Plan Pro</h4>
            <div className="mt-8 text-32 font-bold">
              $2.500 <span className="text-14 font-normal text-canvas-white/60">/ mes</span>
            </div>
            <p className="mt-4 text-14 text-canvas-white/70">Para restaurantes y bares con alta demanda.</p>
            <ul className="mt-24 pt-20 border-t border-canvas-white/20 space-y-12 flex-1">
              <Item dark text="Multi-sucursal, mesas y carta ilimitadas" />
              <Item dark text="Carga masiva Excel/CSV + ajuste de precios" />
              <Item dark text="Pantalla de cocina (KDS) e impresión" />
              <Item dark text="Métricas y analítica de negocio" />
              <Item dark text="Personalización de marca del menú" />
            </ul>
            <Link
              href="/onboarding"
              className="mt-24 w-full py-14 rounded-full bg-canvas-white text-ash-graphite text-12 font-bold uppercase tracking-wide text-center hover:opacity-85 transition-opacity"
            >
              Probar Pro
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Item({ text, dark = false }: { text: string; dark?: boolean }) {
  return (
    <li className="flex items-start gap-10 text-14">
      <span className={`mt-[2px] font-bold ${dark ? "text-canvas-white" : "text-ash-graphite"}`}>✓</span>
      <span className={dark ? "text-canvas-white/85" : "text-deep-forest"}>{text}</span>
    </li>
  );
}
