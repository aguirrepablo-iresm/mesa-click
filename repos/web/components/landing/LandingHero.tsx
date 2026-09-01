import React from "react";
import Link from "next/link";

const ITEMS: [string, string, string][] = [
  ["Milanesa napolitana", "x1 · sin sal", "$8.500"],
  ["Papas rústicas", "x1 · para compartir", "$3.200"],
  ["Limonada de menta", "x1", "$2.100"],
];

export default function LandingHero() {
  return (
    <section className="py-64 md:py-85 bg-canvas-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-24 grid md:grid-cols-2 gap-48 items-center">
        {/* Copy */}
        <div>
          <h2 className="display text-44 md:text-88 text-ash-graphite">
            Tu mesa<br />Tu carta<br />Un&nbsp;click
          </h2>
          <p className="mt-24 text-18 text-deep-forest max-w-md">
            Pedidos por QR sin apps ni esperas. El local ve cada comanda en tiempo real.
          </p>
          <div className="mt-28 flex flex-wrap items-center gap-16">
            <Link
              href="/onboarding"
              className="inline-flex items-center rounded-full px-28 py-16 bg-plain-green text-canvas-white text-13 font-bold uppercase tracking-wide hover:opacity-85 transition-opacity"
            >
              Empezar gratis
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center rounded-full px-28 py-16 border border-ash-graphite text-ash-graphite text-13 font-bold uppercase tracking-wide hover:bg-ash-graphite hover:text-canvas-white transition-colors"
            >
              Ver cómo funciona
            </Link>
          </div>
          <p className="mt-20 text-14 text-sage-green">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="font-bold text-ash-graphite border-b border-ash-graphite">
              Iniciá sesión
            </Link>
          </p>
        </div>

        {/* Phone mockup */}
        <div className="bg-vanilla-cream rounded-lg p-40 flex justify-center">
          <div className="w-[288px] bg-[#0b0b0b] rounded-[46px] p-[10px] relative shadow-[0_14px_34px_-14px_rgba(0,0,0,0.3)]">
            <span className="absolute top-[20px] left-1/2 -translate-x-1/2 bg-[#0b0b0b] rounded-[14px] z-10 w-[92px] h-[24px]" />
            <div className="bg-canvas-white rounded-[38px] overflow-hidden pb-[8px]">
              {/* status bar */}
              <div className="flex justify-between items-center px-[26px] pt-[13px] pb-[4px] text-12 font-bold text-ash-graphite">
                <span>9:41</span>
                <span className="flex items-center gap-[5px]">
                  <svg width="16" height="12" viewBox="0 0 20 12" fill="currentColor"><rect x="0" y="7" width="3" height="5" rx="1" /><rect x="5" y="5" width="3" height="7" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="1" width="3" height="11" rx="1" /></svg>
                  <svg width="20" height="12" viewBox="0 0 24 12" fill="none"><rect x="1" y="1" width="20" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.2" /><rect x="3" y="3" width="14" height="6" rx="1" fill="currentColor" /><rect x="22" y="4" width="2" height="4" rx="1" fill="currentColor" /></svg>
                </span>
              </div>

              {/* app top */}
              <div className="px-[20px] pt-[12px] pb-[16px] flex items-center gap-[12px] text-ash-graphite">
                <svg className="w-[20px] h-[20px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
                <div className="flex-1 min-w-0">
                  <div className="text-[10.5px] tracking-widest uppercase text-stone">Mesa 12 · La Esquina</div>
                  <div className="text-[17px] font-bold mt-[2px]">Tu pedido</div>
                </div>
                <span className="text-[9.5px] font-bold tracking-wide uppercase px-[9px] py-[5px] border border-ash-graphite rounded-full whitespace-nowrap">En preparación</span>
              </div>

              {/* items */}
              <div className="px-[20px]">
                {ITEMS.map(([name, meta, price], i) => (
                  <div key={name} className={`flex items-center gap-[13px] py-[14px] ${i > 0 ? "border-t border-ghost-fog" : ""}`}>
                    <span className="w-[44px] h-[44px] rounded-[12px] bg-ghost-fog shrink-0 grid place-items-center text-deep-forest">
                      <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></svg>
                    </span>
                    <span className="flex-1 min-w-0 text-ash-graphite">
                      <span className="block text-[13.5px] font-medium">{name}</span>
                      <span className="block text-[11.5px] text-stone mt-[2px]">{meta}</span>
                    </span>
                    <span className="text-[13.5px] font-bold whitespace-nowrap text-ash-graphite">{price}</span>
                  </div>
                ))}
              </div>

              {/* total */}
              <div className="mx-[20px] mt-[6px] pt-[13px] border-t border-concrete flex justify-between text-15 font-bold text-ash-graphite">
                <span>Total</span><span>$13.800</span>
              </div>

              {/* confirm toast */}
              <div className="mx-[14px] mt-[14px] mb-[2px] bg-success rounded-[18px] px-[15px] py-[13px] flex items-center gap-[12px] shadow-[0_12px_26px_-10px_rgba(26,211,121,0.6)]">
                <span className="w-[30px] h-[30px] rounded-full bg-ash-graphite text-success grid place-items-center shrink-0">
                  <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                </span>
                <span>
                  <span className="block text-[12.5px] font-bold text-ash-graphite">Pedido confirmado</span>
                  <span className="block text-[10.5px] text-black/60 mt-[1px]">Te avisamos cuando esté listo · ~15 min</span>
                </span>
              </div>

              <div className="w-[116px] h-[5px] rounded-full bg-ash-graphite/80 mx-auto mt-[10px] mb-[6px]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
