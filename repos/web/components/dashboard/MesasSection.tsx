"use client";
import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { mockMesas, Mesa } from "@/lib/mock/mesas";

function QRCanvas({ token }: { token: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const url = `${window.location.origin}/mesa/${token}`;
    QRCode.toCanvas(canvasRef.current, url, { width: 150, margin: 1 });
  }, [token]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qr-mesa-${token}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <canvas ref={canvasRef} className="rounded-md" />
      <button
        onClick={handleDownload}
        className="w-full px-10 py-6 text-12 font-medium text-plain-green-muted border border-plain-green-muted rounded-md hover:bg-ghost-fog transition-colors"
      >
        ↓ Descargar QR
      </button>
    </div>
  );
}

export default function MesasSection() {
  const [mesas] = useState<Mesa[]>(mockMesas);
  const ocupadas = mesas.filter(m => m.estado === 'ocupada').length;

  return (
    <div className="p-24 md:p-32 space-y-24">
      <div>
        <h2 className="text-20 font-medium text-ash-graphite">Mesas & QR</h2>
        <p className="text-13 text-sage-green mt-4">
          {mesas.length} mesas · {ocupadas} ocupadas · {mesas.length - ocupadas} libres
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-16">
        {mesas.map(mesa => (
          <div key={mesa.id} className="border border-ash-graphite rounded-lg p-16 space-y-12">
            <div className="flex items-center justify-between">
              <span className="text-15 font-medium text-ash-graphite">Mesa {mesa.numero}</span>
              <span
                className={`px-8 py-2 text-10 font-medium rounded-md border ${
                  mesa.estado === 'ocupada'
                    ? 'bg-vanilla-cream text-ash-graphite border-ash-graphite'
                    : 'bg-ghost-fog text-plain-green-muted border-plain-green-muted'
                }`}
              >
                {mesa.estado === 'ocupada' ? 'Ocupada' : 'Libre'}
              </span>
            </div>
            <QRCanvas token={mesa.token} />
            <p className="text-9 font-mono text-sage-green text-center break-all">{mesa.token}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
