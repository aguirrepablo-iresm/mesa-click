"use client";

import React, { useState } from "react";
import Link from "next/link";
import Logo from "@/components/brand/Logo";

const PILL =
  "inline-flex items-center justify-center gap-8 rounded-full text-12 font-bold uppercase tracking-wide transition-opacity";

export default function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-concrete bg-canvas-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-24 h-64 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-10 text-ash-graphite">
          <Logo className="w-28 h-28" />
          <span className="text-18 font-bold uppercase tracking-tight">Mesa CLICK</span>
        </Link>

        <nav className="hidden md:flex items-center gap-28">
          <Link href="#features" className="text-14 text-ash-graphite hover:opacity-60 transition-opacity">Cómo funciona</Link>
          <Link href="#pricing" className="text-14 text-ash-graphite hover:opacity-60 transition-opacity">Precios</Link>
          <Link href="#faq" className="text-14 text-sage-green hover:text-ash-graphite transition-colors">FAQ</Link>
          <Link href="/login" className="text-14 text-sage-green hover:text-ash-graphite transition-colors">Iniciar sesión</Link>
          <Link
            href="/onboarding"
            className={`${PILL} px-22 py-12 bg-plain-green text-canvas-white hover:opacity-85`}
          >
            Crear cuenta
          </Link>
        </nav>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden material-symbols-outlined text-ash-graphite p-8 focus:outline-none"
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? "close" : "menu"}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-canvas-white border-b border-concrete px-24 py-16 space-y-12">
          <nav className="flex flex-col space-y-12">
            <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-14 text-ash-graphite py-4">Cómo funciona</Link>
            <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-14 text-ash-graphite py-4">Precios</Link>
            <Link href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-14 text-ash-graphite py-4">FAQ</Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-14 text-ash-graphite py-4">Iniciar sesión</Link>
            <Link
              href="/onboarding"
              onClick={() => setMobileMenuOpen(false)}
              className={`${PILL} w-full px-22 py-12 bg-plain-green text-canvas-white`}
            >
              Crear cuenta
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
