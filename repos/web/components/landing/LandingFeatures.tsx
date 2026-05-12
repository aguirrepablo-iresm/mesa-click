import React from "react";

export default function LandingFeatures() {
  return (
    <section id="features" className="py-80 md:py-120 bg-ghost-fog">
      <div className="max-w-7xl mx-auto px-24 space-y-64">
        <div className="text-center space-y-8">
          <h3 className="text-13 font-mono text-plain-green uppercase tracking-widest font-bold">Proceso</h3>
          <h2 className="text-32 md:text-40 font-medium text-ash-graphite tracking-tight">Simple. Digital. Eficiente.</h2>
          <p className="text-16 text-sage-green max-w-xl mx-auto">
            Hemos diseñado Mesa CLICK para que puedas digitalizar tu operación en minutos, no días.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-24 md:gap-40">
          <FeatureStep 
            number="01"
            icon="app_registration"
            title="Regístrate"
            description="Crea tu cuenta y configura los detalles de tu negocio y sucursales en segundos."
          />
          <FeatureStep 
            number="02"
            icon="restaurant_menu"
            title="Carga tu Menú"
            description="Sube tus platos, precios y categorías. Genera QRs únicos para cada mesa automáticamente."
          />
          <FeatureStep 
            number="03"
            icon="cell_tower"
            title="Gestiona"
            description="Recibe pedidos en tiempo real en tu dashboard y mejora la rotación de tus mesas."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureStep({ number, icon, title, description }: { number: string; icon: string; title: string; description: string }) {
  return (
    <div className="bg-canvas-white p-32 rounded-xl border border-ash-graphite/5 hover:border-plain-green transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-16 text-40 font-mono text-ash-graphite/5 font-bold group-hover:text-plain-green/5 transition-colors">
        {number}
      </div>
      <div className="space-y-16 relative z-10">
        <div className="w-48 h-48 bg-vanilla-cream rounded-lg flex items-center justify-center border border-ash-graphite/5 group-hover:bg-plain-green transition-colors">
          <span className="material-symbols-outlined text-ash-graphite group-hover:text-canvas-white transition-colors">
            {icon}
          </span>
        </div>
        <h4 className="text-18 font-medium text-ash-graphite">{title}</h4>
        <p className="text-15 text-sage-green leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
