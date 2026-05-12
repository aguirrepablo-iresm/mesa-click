import React from "react";

export default function LandingFooter() {
  return (
    <footer className="py-64 bg-vanilla-cream border-t border-ghost-fog">
      <div className="max-w-7xl mx-auto px-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-40 pb-40">
          <div className="col-span-1 md:col-span-2 space-y-16">
            <div className="flex items-center gap-8">
              <span className="material-symbols-outlined text-plain-green">restaurant</span>
              <span className="text-16 font-medium tracking-tight text-ash-graphite">Mesa CLICK</span>
            </div>
            <p className="text-14 text-sage-green max-w-xs leading-relaxed">
              La plataforma definitiva para digitalizar la experiencia en tu restaurante. 
              Hecho para el trabajo real, día a día.
            </p>
          </div>
          
          <div className="space-y-16">
            <h5 className="text-12 font-mono text-ash-graphite uppercase tracking-widest font-bold">Producto</h5>
            <ul className="space-y-8">
              <li><a href="#" className="text-14 text-sage-green hover:text-plain-green transition-colors">Menú Digital</a></li>
              <li><a href="#" className="text-14 text-sage-green hover:text-plain-green transition-colors">Gestión QR</a></li>
              <li><a href="#" className="text-14 text-sage-green hover:text-plain-green transition-colors">Pedidos</a></li>
            </ul>
          </div>

          <div className="space-y-16">
            <h5 className="text-12 font-mono text-ash-graphite uppercase tracking-widest font-bold">Legal</h5>
            <ul className="space-y-8">
              <li><a href="#" className="text-14 text-sage-green hover:text-plain-green transition-colors">Términos</a></li>
              <li><a href="#" className="text-14 text-sage-green hover:text-plain-green transition-colors">Privacidad</a></li>
              <li><a href="#" className="text-14 text-sage-green hover:text-plain-green transition-colors">Contacto</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-32 border-t border-ash-graphite/5 flex flex-col md:flex-row justify-between items-center gap-16">
          <p className="text-12 font-mono text-sage-green">
            © 2026 Mesa CLICK. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-24">
            <span className="material-symbols-outlined text-ash-graphite hover:text-plain-green cursor-pointer">language</span>
            <span className="material-symbols-outlined text-ash-graphite hover:text-plain-green cursor-pointer">share</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
