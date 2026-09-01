import React from "react";

export default function LandingFeatures() {
  return (
    <section id="features" className="py-80 md:py-120 bg-ash-graphite text-canvas-white">
      <div className="max-w-7xl mx-auto px-24">
        <h2 className="display text-32 md:text-44 text-center mb-48">Ridículamente simple</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-32 md:gap-40">
          <Step
            text="Escaneás el QR de la mesa y ves la carta al instante."
            icon={
              <>
                <rect x="6" y="6" width="14" height="14" rx="1" />
                <rect x="28" y="6" width="14" height="14" rx="1" />
                <rect x="6" y="28" width="14" height="14" rx="1" />
                <path d="M28 28h6v6M42 34v8M34 42h8M40 28h2" />
              </>
            }
          />
          <Step
            text="Pedís desde el celular, sin descargar ninguna app."
            icon={
              <>
                <rect x="14" y="4" width="20" height="40" rx="3" />
                <line x1="14" y1="36" x2="34" y2="36" />
                <path d="M20 16h8M20 22h8M20 28h5" />
              </>
            }
          />
          <Step
            text="La cocina y el mozo reciben la comanda en vivo."
            icon={
              <>
                <path d="M24 6c-7 0-12 5-12 12v9l-4 6h32l-4-6v-9c0-7-5-12-12-12Z" />
                <path d="M20 39a4 4 0 0 0 8 0" />
                <line x1="24" y1="3" x2="24" y2="6" />
              </>
            }
          />
        </div>
      </div>
    </section>
  );
}

function Step({ text, icon }: { text: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center gap-16">
      <svg
        className="w-[92px] h-[92px]"
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon}
      </svg>
      <p className="text-16 max-w-[26ch]">{text}</p>
    </div>
  );
}
