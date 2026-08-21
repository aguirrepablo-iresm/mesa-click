import React from "react";

interface StepBranchProps {
  data: {
    sucursalNombre: string;
    whatsapp: string;
    emailSucursal: string;
    horarios: string;
  };
  loading: boolean;
  error: string;
  onChange: (fields: Partial<{
    sucursalNombre: string;
    whatsapp: string;
    emailSucursal: string;
    horarios: string;
  }>) => void;
  onComplete: () => void;
}

export default function StepBranch({ data, loading, error, onChange, onComplete }: StepBranchProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete();
  };

  return (
    <div className="space-y-24 font-inter">
      <form onSubmit={handleSubmit} className="space-y-20">
        <div className="bg-vanilla-cream p-20 rounded-lg border border-system-black shadow-sm space-y-16">
          <div className="flex items-center gap-8 text-ash-graphite mb-4">
            <span className="material-symbols-outlined text-20">location_on</span>
            <h3 className="font-medium text-11 font-mono uppercase tracking-wider">
              Primera Sucursal
            </h3>
          </div>

          <div className="space-y-14">
            <div className="space-y-6">
              <label className="text-11 font-mono text-sage-green uppercase tracking-wider px-1">
                Nombre de la Sucursal
              </label>
              <input
                type="text"
                required
                value={data.sucursalNombre}
                onChange={(e) => onChange({ sucursalNombre: e.target.value })}
                placeholder="Ej: Casa central"
                className="w-full h-40 px-12 bg-canvas-white border border-ash-graphite rounded-md focus:border-plain-green outline-none transition-all text-14"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <label className="text-11 font-mono text-sage-green uppercase tracking-wider px-1">
                  WhatsApp de Contacto (Opcional)
                </label>
                <input
                  type="tel"
                  value={data.whatsapp}
                  onChange={(e) => onChange({ whatsapp: e.target.value })}
                  placeholder="+54 9 11 1234-5678"
                  className="w-full h-40 px-12 bg-canvas-white border border-ash-graphite rounded-md focus:border-plain-green outline-none transition-all text-14"
                />
              </div>

              <div className="space-y-6">
                <label className="text-11 font-mono text-sage-green uppercase tracking-wider px-1">
                  Email de Sucursal (Opcional)
                </label>
                <input
                  type="email"
                  value={data.emailSucursal}
                  onChange={(e) => onChange({ emailSucursal: e.target.value })}
                  placeholder="sucursal@minegocio.com"
                  className="w-full h-40 px-12 bg-canvas-white border border-ash-graphite rounded-md focus:border-plain-green outline-none transition-all text-14"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-vanilla-cream p-20 rounded-lg border border-system-black shadow-sm space-y-12">
          <div className="flex items-center gap-8 text-ash-graphite">
            <span className="material-symbols-outlined text-20">schedule</span>
            <h3 className="font-medium text-11 font-mono uppercase tracking-wider">
              Horarios de Atención
            </h3>
          </div>
          <input
            type="text"
            value={data.horarios}
            onChange={(e) => onChange({ horarios: e.target.value })}
            placeholder="Lun a Dom: 08:00 a 00:00"
            className="w-full h-40 px-12 bg-canvas-white border border-ash-graphite rounded-md focus:border-plain-green outline-none transition-all text-14 font-mono text-13"
          />
        </div>

        {error && (
          <div className="p-12 bg-red-50 border border-alert-red/30 rounded text-12 text-alert-red">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-44 bg-plain-green text-ash-graphite font-bold rounded-md hover:bg-plain-green-muted active:scale-95 transition-all shadow-lg shadow-plain-green/10 flex items-center justify-center gap-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="animate-spin material-symbols-outlined text-20">progress_activity</span>
          ) : (
            <>
              Finalizar y Crear Negocio
              <span className="material-symbols-outlined text-18">check_circle</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
