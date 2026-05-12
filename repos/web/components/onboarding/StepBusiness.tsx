import React from "react";

interface StepBusinessProps {
  onNext: () => void;
}

export default function StepBusiness({ onNext }: StepBusinessProps) {
  return (
    <div className="space-y-24">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
        className="space-y-24"
      >
        <div className="bg-vanilla-cream p-24 rounded-lg border border-system-black shadow-sm space-y-20">
          <div className="flex items-center gap-8 text-ash-graphite mb-8">
            <span className="material-symbols-outlined text-[20px]">store</span>
            <h3 className="font-medium text-13 font-mono uppercase tracking-wider">
              Información General
            </h3>
          </div>

          <div className="space-y-16">
            <div className="space-y-8">
              <label className="text-13 font-mono text-sage-green uppercase tracking-wider px-1">
                Nombre del Dueño
              </label>
              <input
                type="text"
                required
                placeholder="Juan Pérez"
                className="w-full h-40 px-12 bg-canvas-white border border-ash-graphite rounded-md focus:border-plain-green outline-none transition-all text-15"
              />
            </div>

            <div className="space-y-8">
              <label className="text-13 font-mono text-sage-green uppercase tracking-wider px-1">
                Nombre del Negocio
              </label>
              <input
                type="text"
                required
                placeholder="Café de la Esquina"
                className="w-full h-40 px-12 bg-canvas-white border border-ash-graphite rounded-md focus:border-plain-green outline-none transition-all text-15"
              />
            </div>

            <div className="space-y-8">
              <label className="text-13 font-mono text-sage-green uppercase tracking-wider px-1">
                Rubro
              </label>
              <div className="relative">
                <select 
                  defaultValue=""
                  className="w-full h-40 pl-12 pr-40 bg-canvas-white border border-ash-graphite rounded-md focus:border-plain-green outline-none appearance-none transition-all text-15"
                >
                  <option value="" disabled>
                    Selecciona un rubro
                  </option>
                  <option>Cafetería</option>
                  <option>Restaurante</option>
                  <option>Comida Rápida</option>
                  <option>Bar / Pub</option>
                </select>
                <span className="material-symbols-outlined absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none text-ash-graphite">
                  expand_more
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-vanilla-cream p-24 rounded-lg border border-system-black shadow-sm space-y-16">
          <div className="flex items-center gap-8 text-ash-graphite mb-8">
            <span className="material-symbols-outlined text-[20px]">description</span>
            <h3 className="font-medium text-13 font-mono uppercase tracking-wider">
              Descripción
            </h3>
          </div>
          <textarea
            required
            rows={4}
            placeholder="Cuéntanos un poco sobre tu negocio..."
            className="w-full p-12 bg-canvas-white border border-ash-graphite rounded-md focus:border-plain-green outline-none transition-all text-15 resize-none"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full h-40 bg-plain-green text-ash-graphite font-medium rounded-md hover:bg-plain-green-muted transition-all flex items-center justify-center gap-8 mt-24"
        >
          Guardar y Continuar
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </form>
    </div>
  );
}
