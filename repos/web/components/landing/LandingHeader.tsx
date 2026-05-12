import React from "react";
import Link from "next/link";

export default function LandingHeader() {
  return (
    <header className="h-64 border-b border-ghost-fog bg-canvas-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-24 h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="material-symbols-outlined text-plain-green text-24">restaurant</span>
          <h1 className="text-18 font-medium tracking-tight text-ash-graphite">Mesa CLICK</h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-32">
          <Link href="#features" className="text-14 font-medium text-sage-green hover:text-ash-graphite transition-colors">Características</Link>
          <Link href="#pricing" className="text-14 font-medium text-sage-green hover:text-ash-graphite transition-colors">Planes</Link>
          <Link href="/login" className="text-14 font-medium text-ash-graphite hover:text-plain-green transition-colors">Iniciar Sesión</Link>
          <Link 
            href="/onboarding" 
            className="px-16 py-8 bg-plain-green text-ash-graphite text-14 font-semibold rounded-md hover:bg-plain-green-muted transition-all shadow-sm"
          >
            Comenzar Gratis
          </Link>
        </nav>

        <button className="md:hidden material-symbols-outlined text-ash-graphite">menu</button>
      </div>
    </header>
  );
}
