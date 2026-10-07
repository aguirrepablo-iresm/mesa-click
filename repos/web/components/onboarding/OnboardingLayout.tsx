import React from "react";
import AuthShell from "@/components/auth/AuthShell";
import LandingIcon from "@/components/landing/LandingIcon";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

const STEP_LABELS = ["Cuenta", "Negocio", "Sucursal"];

export default function OnboardingLayout({
  children,
  step,
  totalSteps,
  title,
  subtitle,
  onBack,
}: OnboardingLayoutProps) {
  return (
    <AuthShell
      image="https://images.unsplash.com/photo-1485182708500-e8f1f318ba72?auto=format&fit=crop&w=1100&q=84"
      imageAlt="Personas disfrutando en un restaurante"
      visualTitle="Tu próximo servicio puede ser más simple"
      visualText="Creá la cuenta de administrador, definí el perfil público y cargá la primera sucursal."
      cardLabel="Registro"
      cardTitle={`Paso ${step} de ${totalSteps} · ${STEP_LABELS[step - 1] ?? ""}`}
    >
      <span className="hero-kicker"><i /> Registro de negocio · Paso {step}/{totalSteps}</span>
      <h1>{title}</h1>
      {subtitle && <p className="auth-sub">{subtitle}</p>}

      <div className="auth-steps">
        {STEP_LABELS.map((label, index) => {
          const paso = index + 1;
          const estado = paso === step ? "active" : paso < step ? "done" : "";
          return (
            <div key={label} className={`auth-step ${estado}`}>
              <span>{paso < step ? <LandingIcon name="check" size={12} /> : paso}</span>
              {label}
            </div>
          );
        })}
      </div>

      {onBack && (
        <button type="button" onClick={onBack} className="auth-step-back">
          Volver al paso anterior
        </button>
      )}
      <div className="auth-content">{children}</div>
    </AuthShell>
  );
}
