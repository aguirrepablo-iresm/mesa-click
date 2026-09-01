"use client";

import React, { useState } from "react";
import Link from "next/link";
import Logo from "@/components/brand/Logo";

const LINKS: [string, string][] = [
  ["Cómo funciona", "#features"],
  ["Precios", "#pricing"],
  ["FAQ", "#faq"],
];

export default function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-concrete bg-canvas-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-24 h-64 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-10 text-ash-graphite">
          <Logo className="w-28 h-28" />
          <span className="text-18 font-bold uppercase tracking-tight">Mesa CLICK</span>
        </Link>

        {/* Desktop: menú alineado a la derecha */}
        <nav className="hidden md:flex items-center gap-24">
          {LINKS.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="text-14 text-ash-graphite hover:opacity-60 transition-opacity"
            >
              {label}
            </Link>
          ))}
          <div className="flex items-center gap-10 pl-4">
            <Link
              href="/login"
              className="text-14 text-ash-graphite hover:opacity-60 transition-opacity"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/onboarding"
              className="h-32 px-14 inline-flex items-center rounded-full bg-ash-graphite text-canvas-white text-11 font-bold uppercase tracking-wide hover:opacity-85 transition-opacity"
            >
              Registrarse
            </Link>
          </div>
        </nav>

        {/* Mobile: solo el botón de menú */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-8 -mr-8 text-ash-graphite focus:outline-none"
          aria-label="Abrir menú"
        >
          <span className="material-symbols-outlined block">
            {mobileMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-canvas-white border-b border-concrete px-24 py-16">
          <nav className="flex flex-col space-y-12">
            {LINKS.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-14 text-ash-graphite py-4"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-14 text-ash-graphite py-4"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/onboarding"
              onClick={() => setMobileMenuOpen(false)}
              className="h-32 px-14 inline-flex items-center justify-center rounded-full bg-ash-graphite text-canvas-white text-11 font-bold uppercase tracking-wide"
            >
              Registrarse
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
