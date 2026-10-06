import React, { useState } from "react";

interface StepAccountProps {
  data: {
    nombreAdmin: string;
    emailAdmin: string;
    password: string;
    confirmarPassword: string;
  };
  errors?: Partial<Record<"nombreAdmin" | "emailAdmin" | "password" | "confirmarPassword", string>>;
  loading?: boolean;
  onChange: (fields: Partial<{
    nombreAdmin: string;
    emailAdmin: string;
    password: string;
    confirmarPassword: string;
  }>) => void;
  onNext: () => void | Promise<void>;
}

export default function StepAccount({
  data,
  errors = {},
  loading = false,
  onChange,
  onNext,
}: StepAccountProps) {
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.emailAdmin.trim() || !data.nombreAdmin.trim() || !data.password || !data.confirmarPassword) return;
    void onNext();
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
            className={`w-full h-52 px-16 bg-canvas-white border rounded-lg focus:border-plain-green outline-none transition-all text-15 ${
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
            className={`w-full h-52 px-16 bg-canvas-white border rounded-lg focus:border-plain-green outline-none transition-all text-15 ${
              errors.emailAdmin ? "border-alert-red" : "border-ash-graphite"
            }`}
          />
          {errors.emailAdmin && (
            <p className="text-11 text-alert-red px-1">{errors.emailAdmin}</p>
          )}
        </div>

        <div className="grid gap-16 sm:grid-cols-2">
          <div className="space-y-8">
            <label
              htmlFor="password"
              className="text-11 font-mono text-sage-green uppercase tracking-wider px-1"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={mostrarPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={data.password}
                onChange={(e) => onChange({ password: e.target.value })}
                placeholder="Mínimo 10 caracteres"
                aria-invalid={Boolean(errors.password)}
                className={`w-full h-52 px-16 pr-48 bg-canvas-white border rounded-lg focus:border-plain-green outline-none transition-all text-15 ${
                  errors.password ? "border-alert-red" : "border-ash-graphite"
                }`}
              />
              <button
                type="button"
                onClick={() => setMostrarPassword((actual) => !actual)}
                aria-label={mostrarPassword ? "Ocultar contraseñas" : "Mostrar contraseñas"}
                className="absolute inset-y-0 right-0 flex w-44 items-center justify-center text-stone hover:text-ash-graphite"
              >
                <span className="material-symbols-outlined text-20">
                  {mostrarPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {errors.password && <p className="text-11 text-alert-red px-1">{errors.password}</p>}
          </div>

          <div className="space-y-8">
            <label
              htmlFor="confirmarPassword"
              className="text-11 font-mono text-sage-green uppercase tracking-wider px-1"
            >
              Confirmar contraseña
            </label>
            <input
              id="confirmarPassword"
              type={mostrarPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={data.confirmarPassword}
              onChange={(e) => onChange({ confirmarPassword: e.target.value })}
              placeholder="Repetí la contraseña"
              aria-invalid={Boolean(errors.confirmarPassword)}
              className={`w-full h-52 px-16 bg-canvas-white border rounded-lg focus:border-plain-green outline-none transition-all text-15 ${
                errors.confirmarPassword ? "border-alert-red" : "border-ash-graphite"
              }`}
            />
            {errors.confirmarPassword && (
              <p className="text-11 text-alert-red px-1">{errors.confirmarPassword}</p>
            )}
          </div>
        </div>

        <div className="p-16 bg-vanilla-cream rounded-lg text-13 text-sage-green space-y-6">
          <div className="flex items-center gap-6 font-medium text-ash-graphite">
            <span className="material-symbols-outlined text-16 text-plain-green">verified_user</span>
            <span>Acceso seguro</span>
          </div>
          <p className="text-13 leading-normal">
            Creá una contraseña exclusiva para Mesa CLICK. También vas a poder ingresar con Google usando este mismo correo.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-52 rounded-full bg-plain-green text-canvas-white text-12 font-bold uppercase tracking-wide hover:bg-plain-green-muted transition-all flex items-center justify-center gap-8 mt-24 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              Validando correo
              <span className="animate-spin material-symbols-outlined text-16">
                progress_activity
              </span>
            </>
          ) : (
            <>
              Continuar
              <span className="material-symbols-outlined text-16">arrow_forward</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
