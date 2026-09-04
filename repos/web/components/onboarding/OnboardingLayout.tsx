import React from "react";
import Link from "next/link";
import Logo from "@/components/brand/Logo";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export default function OnboardingLayout({
  children,
  step,
  totalSteps,
  title,
  subtitle,
  onBack,
}: OnboardingLayoutProps) {
  const progress = (step / totalSteps) * 100;
  const stepLabels = ["Cuenta", "Negocio", "Sucursal"];

  return (
    <div className="min-h-screen grid md:grid-cols-[1.1fr_1fr] font-inter">
      <aside className="bg-ash-graphite text-canvas-white px-32 md:px-56 py-48 md:py-64 flex flex-col justify-between gap-32">
        <Link
          href="/"
          className="text-12 uppercase tracking-widest text-stone hover:text-canvas-white transition-colors"
        >
          ← Volver al inicio
        </Link>
        <div>
          <h1 className="display text-44 md:text-72">
            Registrá
            <br />
            tu negocio
          </h1>
          <p className="mt-20 text-16 text-concrete max-w-[34ch]">
            Creá la cuenta de administrador, definí el perfil público y cargá la primera sucursal.
          </p>
        </div>
        <div className="flex items-center gap-10">
          <Logo className="w-28 h-28" />
          <span className="text-16 font-bold uppercase tracking-tight">Mesa CLICK</span>
        </div>
      </aside>

      <section className="px-32 md:px-56 py-48 md:py-64 flex flex-col justify-center">
        <div className="w-full max-w-[520px] mx-auto">
          <div className="flex items-center justify-between gap-16">
            <div className="text-11 uppercase tracking-widest text-stone">Registro administración</div>
            <span className="text-11 font-mono text-sage-green uppercase tracking-wider shrink-0">
              Paso {step}/{totalSteps}
            </span>
          </div>
          <h2 className="display text-40 mt-6 mb-10 text-ash-graphite">{title}</h2>
          {subtitle && (
            <p className="text-14 text-deep-forest leading-relaxed mb-24">{subtitle}</p>
          )}

          <div className="space-y-10 mb-28">
            <div className="grid grid-cols-3 gap-8">
              {stepLabels.map((label, index) => {
                const paso = index + 1;
                const active = paso <= step;
                return (
                  <div
                    key={label}
                    className={`h-28 rounded-md border flex items-center justify-center text-10 font-mono uppercase tracking-wider ${
                      active
                        ? "border-ash-graphite bg-ash-graphite text-canvas-white"
                        : "border-concrete text-stone"
                    }`}
                  >
                    {label}
                  </div>
                );
              })}
            </div>
            <div className="w-full bg-concrete h-[2px] relative">
              <div
                className="bg-ash-graphite h-[2px] absolute top-0 transition-all duration-500 ease-in-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mb-20 text-12 font-bold uppercase tracking-wide text-ash-graphite border-b border-ash-graphite"
            >
              ← Volver al paso anterior
            </button>
          )}
          {children}
        </div>
      </section>
    </div>
  );
}
