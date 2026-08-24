"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="h-64 border-b border-ghost-fog bg-canvas-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-24 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-8">
          <span className="material-symbols-outlined text-plain-green text-24">restaurant</span>
          <h1 className="text-18 font-medium tracking-tight text-ash-graphite">Mesa CLICK</h1>
        </Link>
        
        <nav className="hidden md:flex items-center gap-32">
          <Link href="#features" className="text-14 font-medium text-sage-green hover:text-ash-graphite transition-colors">Características</Link>
          <Link href="#pricing" className="text-14 font-medium text-sage-green hover:text-ash-graphite transition-colors">Planes</Link>
          <Link
            href="/login"
            className="px-16 py-8 border border-ash-graphite/20 text-14 font-medium text-ash-graphite rounded-md hover:border-ash-graphite hover:text-plain-green transition-all"
          >
            Iniciar Sesión
          </Link>
          <Link 
            href="/onboarding" 
            className="px-16 py-8 bg-plain-green text-ash-graphite text-14 font-semibold rounded-md hover:bg-plain-green-muted transition-all shadow-sm"
          >
            Comenzar Gratis
          </Link>
        </nav>

        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden material-symbols-outlined text-ash-graphite p-8 focus:outline-none"
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? 'close' : 'menu'}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-canvas-white border-b border-ash-graphite/10 px-24 py-16 space-y-16 shadow-lg animate-in fade-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-12">
            <Link 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-14 font-medium text-sage-green hover:text-ash-graphite py-4"
            >
              Características
            </Link>
            <Link 
              href="#pricing" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-14 font-medium text-sage-green hover:text-ash-graphite py-4"
            >
              Planes
            </Link>
            <Link 
              href="/login" 
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-16 py-10 border border-ash-graphite/20 text-14 font-medium text-ash-graphite rounded-md hover:border-ash-graphite hover:text-plain-green transition-all block"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/onboarding" 
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-16 py-10 bg-plain-green text-ash-graphite text-14 font-semibold rounded-md hover:bg-plain-green-muted transition-all shadow-sm block"
            >
              Comenzar Gratis
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
