import React from "react";

const FAQS: [string, string][] = [
  [
    "¿El comensal necesita descargar una app?",
    "No. Escanea el QR de la mesa y la carta se abre en el navegador del celular. Sin instalar nada ni crear cuenta.",
  ],
  [
    "¿Cómo llega el pedido al local?",
    "Cada pedido aparece al instante en el panel del local (recepción y cocina) por una conexión en vivo. No hace falta refrescar la pantalla.",
  ],
  [
    "¿Qué necesito para empezar?",
    "Una cuenta, tu carta cargada y los QR impresos por mesa. Se configura en minutos; para catálogos grandes está la carga masiva por Excel/CSV.",
  ],
  [
    "¿Hay un plan gratis?",
    "Sí. El plan Free cubre 1 sucursal, hasta 10 mesas y 30 productos. El plan Pro suma sucursales, mesas y carta ilimitadas, pantalla de cocina, métricas y personalización de marca.",
  ],
  [
    "¿Se puede pagar desde el celular?",
    "Por ahora el comensal arma y confirma el pedido, y el pago se hace en el local. La integración de pago online está en el roadmap.",
  ],
  [
    "¿Funciona con impresora de comandas?",
    "Sí. La pantalla de cocina (KDS) permite imprimir la comanda en impresora térmica de 58/80 mm, con reintento manual si la impresión falla.",
  ],
];

export default function LandingFAQ() {
  return (
    <section id="faq" className="py-80 md:py-120 bg-canvas-white">
      <div className="max-w-4xl mx-auto px-24">
        <h2 className="display text-32 md:text-44 text-ash-graphite mb-28">Preguntas frecuentes</h2>

        <div className="border-t border-ash-graphite">
          {FAQS.map(([q, a], i) => (
            <details key={q} className="group border-b border-concrete" open={i === 0}>
              <summary className="flex items-center gap-20 py-22 cursor-pointer list-none text-18 font-medium text-ash-graphite [&::-webkit-details-marker]:hidden">
                <span className="flex-1">{q}</span>
                <span className="relative w-20 h-20 shrink-0">
                  <span className="absolute left-0 top-[9px] w-20 h-[2px] bg-ash-graphite" />
                  <span className="absolute left-[9px] top-0 w-[2px] h-20 bg-ash-graphite transition-transform group-open:scale-y-0" />
                </span>
              </summary>
              <p className="pb-24 pr-44 text-15 text-deep-forest max-w-[70ch]">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
