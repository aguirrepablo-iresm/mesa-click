import React from "react";

interface StepAccountProps {
  data: {
    nombreAdmin: string;
    emailAdmin: string;
  };
  errors?: Partial<Record<"nombreAdmin" | "emailAdmin", string>>;
  onChange: (fields: Partial<{ nombreAdmin: string; emailAdmin: string }>) => void;
  onNext: () => void;
}

export default function StepAccount({ data, errors = {}, onChange, onNext }: StepAccountProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.emailAdmin.trim() || !data.nombreAdmin.trim()) return;
    onNext();
  };

  return (
    <div className="space-y-24 font-inter">
      <form onSubmit={handleSubmit} className="space-y-20">
        <div className="space-y-8">
          <label
            htmlFor="nombreAdmin"
            className="text-11 font-mono text-sage-green uppercase tracking-wider px-1"
          >
            Nombre completo del responsable
          </label>
          <input
            id="nombreAdmin"
            type="text"
            required
            value={data.nombreAdmin}
            onChange={(e) => onChange({ nombreAdmin: e.target.value })}
            placeholder="Ej: Pablo Aguirre"
            aria-invalid={Boolean(errors.nombreAdmin)}
            className={`w-full h-40 px-12 bg-canvas-white border rounded-md focus:border-plain-green outline-none transition-all text-14 ${
              errors.nombreAdmin ? "border-alert-red" : "border-ash-graphite"
            }`}
          />
          {errors.nombreAdmin && (
            <p className="text-11 text-alert-red px-1">{errors.nombreAdmin}</p>
          )}
        </div>

        <div className="space-y-8">
          <label
            htmlFor="emailAdmin"
            className="text-11 font-mono text-sage-green uppercase tracking-wider px-1"
          >
            Email de acceso
          </label>
          <input
            id="emailAdmin"
            type="email"
            required
            value={data.emailAdmin}
            onChange={(e) => onChange({ emailAdmin: e.target.value })}
            placeholder="admin@minegocio.com"
            aria-invalid={Boolean(errors.emailAdmin)}
            className={`w-full h-40 px-12 bg-canvas-white border rounded-md focus:border-plain-green outline-none transition-all text-14 ${
              errors.emailAdmin ? "border-alert-red" : "border-ash-graphite"
            }`}
          />
          {errors.emailAdmin && (
            <p className="text-11 text-alert-red px-1">{errors.emailAdmin}</p>
          )}
        </div>

        <div className="p-12 bg-ghost-fog rounded-md border border-ghost-fog text-12 text-sage-green space-y-4">
          <div className="flex items-center gap-6 font-medium text-ash-graphite">
            <span className="material-symbols-outlined text-16 text-plain-green">verified_user</span>
            <span>Autenticación sin contraseñas</span>
          </div>
          <p className="text-11 leading-normal">
            Tu cuenta utilizará enlaces mágicos (Magic Link) enviados a tu correo para iniciar sesión de forma segura y directa.
          </p>
        </div>

        <button
          type="submit"
          className="w-full h-40 bg-plain-green text-canvas-white font-medium rounded-md hover:bg-plain-green-muted transition-all flex items-center justify-center gap-8 mt-24"
        >
          Continuar
          <span className="material-symbols-outlined text-16">arrow_forward</span>
        </button>
      </form>
    </div>
  );
}
