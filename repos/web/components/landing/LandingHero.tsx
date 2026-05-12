import React from "react";
import Link from "next/link";

export default function LandingHero() {
  return (
    <section className="py-80 md:py-120 bg-canvas-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-24 flex flex-col md:flex-row items-center gap-64">
        <div className="flex-1 space-y-32 text-center md:text-left">
          <div className="inline-flex items-center gap-8 px-12 py-4 bg-ghost-fog rounded-full border border-plain-green/20 text-plain-green text-12 font-mono uppercase tracking-widest">
            <span className="relative flex h-8 w-8">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-plain-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-8 w-8 bg-plain-green"></span>
            </span>
            Nueva Era Gastronómica
          </div>
          
          <h2 className="text-40 md:text-64 font-medium leading-tight text-ash-graphite tracking-tight">
            Moderniza tu restaurante <br />
            <span className="text-plain-green">en 3 clics.</span>
          </h2>
          
          <p className="text-18 md:text-20 text-sage-green leading-relaxed max-w-xl mx-auto md:mx-0">
            Menús digitales con QR y gestión de pedidos en tiempo real. 
            Sin hardware complicado, sin comisiones ocultas.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-16 justify-center md:justify-start pt-16">
            <Link 
              href="/onboarding" 
              className="w-full sm:w-auto px-32 py-16 bg-plain-green text-ash-graphite text-16 font-bold rounded-lg hover:bg-plain-green-muted transition-all shadow-lg shadow-plain-green/10 flex items-center justify-center gap-8 group"
            >
              Crear mi cuenta gratis
              <span className="material-symbols-outlined group-hover:translate-x-4 transition-transform">arrow_forward</span>
            </Link>
            <Link 
              href="#features" 
              className="w-full sm:w-auto px-32 py-16 bg-vanilla-cream text-ash-graphite text-16 font-medium rounded-lg border border-ash-graphite/10 hover:border-ash-graphite transition-all flex items-center justify-center"
            >
              Ver cómo funciona
            </Link>
          </div>
        </div>

        <div className="flex-1 relative w-full max-w-md md:max-w-none">
          {/* Abstract Visual Placeholder */}
          <div className="relative z-10 bg-vanilla-cream border-2 border-system-black rounded-2xl shadow-2xl p-16 aspect-[4/3] flex flex-col gap-12 overflow-hidden">
            <div className="h-24 w-full bg-ghost-fog rounded-md border border-ash-graphite/10"></div>
            <div className="flex-1 grid grid-cols-3 gap-8">
              <div className="bg-canvas-white border border-ash-graphite/10 rounded-md"></div>
              <div className="bg-canvas-white border border-ash-graphite/10 rounded-md"></div>
              <div className="bg-canvas-white border border-ash-graphite/10 rounded-md"></div>
              <div className="col-span-2 bg-canvas-white border border-ash-graphite/10 rounded-md"></div>
              <div className="bg-plain-green/10 border border-plain-green/20 rounded-md"></div>
            </div>
            {/* Mobile Scan Mockup */}
            <div className="absolute bottom-[-20px] right-[-20px] w-120 md:w-160 aspect-[1/2] bg-ash-graphite rounded-[30px] border-4 border-system-black shadow-2xl p-8 flex flex-col gap-4 overflow-hidden transform rotate-[-12deg]">
              <div className="h-4 w-12 bg-white/20 rounded-full mx-auto mb-4"></div>
              <div className="flex-1 bg-plain-green rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-canvas-white text-32">qr_code_2</span>
              </div>
            </div>
          </div>
          {/* Background shapes */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-ghost-fog rounded-full -z-10 blur-3xl opacity-50"></div>
        </div>
      </div>
    </section>
  );
}
