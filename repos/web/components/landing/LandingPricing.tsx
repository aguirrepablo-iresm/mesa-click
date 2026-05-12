import React from "react";
import Link from "next/link";

export default function LandingPricing() {
  return (
    <section id="pricing" className="py-80 md:py-120 bg-canvas-white">
      <div className="max-w-7xl mx-auto px-24 space-y-64">
        <div className="text-center space-y-8">
          <h3 className="text-13 font-mono text-plain-green uppercase tracking-widest font-bold">Planes</h3>
          <h2 className="text-32 md:text-40 font-medium text-ash-graphite tracking-tight">Crece con nosotros</h2>
          <p className="text-16 text-sage-green max-w-xl mx-auto">
            Elige el plan que mejor se adapte al tamaño de tu operación. Sin ataduras.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-32 max-w-4xl mx-auto">
          {/* Plan Básico */}
          <div className="p-32 rounded-xl border border-ash-graphite/10 bg-vanilla-cream flex flex-col space-y-24">
            <div className="space-y-8">
              <h4 className="text-18 font-medium text-ash-graphite">Plan Básico</h4>
              <div className="text-32 font-medium text-ash-graphite">$0 <span className="text-14 text-sage-green font-normal">/mes</span></div>
              <p className="text-14 text-sage-green">Ideal para cafeterías y pequeños locales.</p>
            </div>
            
            <ul className="space-y-12 flex-1">
              <PricingItem text="1 Sucursal" />
              <PricingItem text="Menú digital ilimitado" />
              <PricingItem text="Códigos QR dinámicos" />
              <PricingItem text="Soporte por email" />
            </ul>

            <Link 
              href="/onboarding" 
              className="w-full py-12 bg-canvas-white border border-ash-graphite text-ash-graphite text-14 font-medium rounded-md text-center hover:bg-ash-graphite hover:text-canvas-white transition-all"
            >
              Comenzar ahora
            </Link>
          </div>

          {/* Plan Pro */}
          <div className="p-32 rounded-xl border-2 border-plain-green bg-canvas-white flex flex-col space-y-24 relative overflow-hidden shadow-xl shadow-plain-green/5">
            <div className="absolute top-0 right-0 bg-plain-green px-12 py-4 text-10 font-mono font-bold uppercase tracking-widest text-ash-graphite">
              RECOMENDADO
            </div>
            
            <div className="space-y-8">
              <h4 className="text-18 font-medium text-ash-graphite text-plain-green">Plan Pro</h4>
              <div className="text-32 font-medium text-ash-graphite">$2.500 <span className="text-14 text-sage-green font-normal">/mes</span></div>
              <p className="text-14 text-sage-green">Para restaurantes con alta demanda.</p>
            </div>
            
            <ul className="space-y-12 flex-1">
              <PricingItem text="Sucursales ilimitadas" />
              <PricingItem text="Gestión de pedidos en vivo" />
              <PricingItem text="Multi-sector y mozos" />
              <PricingItem text="Analytics avanzado" />
              <PricingItem text="Soporte prioritario 24/7" />
            </ul>

            <Link 
              href="/onboarding" 
              className="w-full py-12 bg-plain-green text-ash-graphite text-14 font-bold rounded-md text-center hover:bg-plain-green-muted transition-all"
            >
              Prueba Pro gratis
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-12 text-14 text-ash-graphite">
      <span className="material-symbols-outlined text-plain-green text-18">check_circle</span>
      {text}
    </li>
  );
}
