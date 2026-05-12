import React from "react";

interface StepBranchProps {
  onComplete: () => void;
}

export default function StepBranch({ onComplete }: StepBranchProps) {
  return (
    <div className="space-y-24">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onComplete();
        }}
        className="space-y-24"
      >
        <div className="bg-vanilla-cream p-24 rounded-lg border border-system-black shadow-sm space-y-20">
          <div className="flex items-center gap-8 text-ash-graphite mb-8">
            <span className="material-symbols-outlined text-[20px]">location_on</span>
            <h3 className="font-medium text-13 font-mono uppercase tracking-wider">
              Detalles de la Sucursal
            </h3>
          </div>

          <div className="space-y-16">
            <div className="space-y-8">
              <label className="text-13 font-mono text-sage-green uppercase tracking-wider px-1">
                Nombre de la sucursal
              </label>
              <input
                type="text"
                required
                placeholder="Sucursal Centro"
                className="w-full h-40 px-12 bg-canvas-white border border-ash-graphite rounded-md focus:border-plain-green outline-none transition-all text-15"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-8">
                <label className="text-13 font-mono text-sage-green uppercase tracking-wider px-1">
                  WhatsApp de Contacto
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+54 9 ..."
                  className="w-full h-40 px-12 bg-canvas-white border border-ash-graphite rounded-md focus:border-plain-green outline-none transition-all text-15"
                />
              </div>
              <div className="space-y-8">
                <label className="text-13 font-mono text-sage-green uppercase tracking-wider px-1">
                  Email de la sucursal
                </label>
                <input
                  type="email"
                  required
                  placeholder="sucursal@workbench.com"
                  className="w-full h-40 px-12 bg-canvas-white border border-ash-graphite rounded-md focus:border-plain-green outline-none transition-all text-15"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-vanilla-cream p-24 rounded-lg border border-system-black shadow-sm space-y-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-8 text-ash-graphite">
              <span className="material-symbols-outlined text-[20px]">schedule</span>
              <h3 className="font-medium text-13 font-mono uppercase tracking-wider">
                Horarios de atención
              </h3>
            </div>
            <button
              type="button"
              className="text-plain-green text-12 font-mono font-medium hover:underline uppercase tracking-wider"
            >
              CONFIGURAR
            </button>
          </div>
          <div className="flex gap-8 flex-wrap">
            <span className="px-12 py-4 bg-ghost-fog text-ash-graphite text-12 font-mono rounded-md border border-system-black">
              Lun-Dom: 08:00 AM - 11:00 PM
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-40 bg-plain-green text-ash-graphite font-medium rounded-md hover:bg-plain-green-muted transition-all flex items-center justify-center gap-8 mt-24"
        >
          Finalizar Registro
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
        </button>
      </form>
    </div>
  );
}
