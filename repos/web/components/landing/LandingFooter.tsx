import React from "react";
import Link from "next/link";
import Logo from "@/components/brand/Logo";

export default function LandingFooter() {
  return (
    <footer className="bg-canvas-white border-t border-concrete">
      <div className="max-w-7xl mx-auto px-24 py-48">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-24">
          <div className="col-span-2 md:col-span-1 flex items-center gap-10 text-ash-graphite">
            <Logo className="w-28 h-28" />
            <span className="text-16 font-bold uppercase tracking-tight">Mesa CLICK</span>
          </div>

          <FootCol title="Producto" links={[["Cómo funciona", "#features"], ["Precios", "#pricing"], ["FAQ", "#faq"]]} />
          <FootCol title="Soporte" links={[["FAQ", "#faq"], ["Contacto", "#"], ["Estado", "#"]]} />
          <FootCol title="Legal" links={[["Términos", "#"], ["Privacidad", "#"]]} />
        </div>

        <div className="mt-40 pt-20 border-t border-concrete flex flex-wrap justify-between items-center gap-10 text-12 text-stone">
          <span>© 2026 Mesa CLICK · Práctica Profesionalizante I · IRESM</span>
          <span>Hecho en Argentina</span>
        </div>
      </div>
    </footer>
  );
}

function FootCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h5 className="text-13 font-bold text-ash-graphite mb-14">{title}</h5>
      <ul>
        {links.map(([label, href]) => (
          <li key={label} className="mb-10">
            <Link href={href} className="text-14 text-sage-green hover:text-ash-graphite transition-colors">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
