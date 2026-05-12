"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import StepAccount from "@/components/onboarding/StepAccount";
import StepBusiness from "@/components/onboarding/StepBusiness";
import StepBranch from "@/components/onboarding/StepBranch";

const TOTAL_STEPS = 3;

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const handleNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleComplete = () => {
    // Aquí iría la lógica para persistir los datos
    router.push("/dashboard");
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <StepAccount onNext={handleNext} />;
      case 2:
        return <StepBusiness onNext={handleNext} />;
      case 3:
        return (
          <StepBranch
            onComplete={handleComplete}
          />
        );
      default:
        return null;
    }
  };

  const getStepMetadata = () => {
    switch (step) {
      case 1:
        return {
          title: "Crea tu cuenta",
          subtitle: "Comienza tu viaje con Mesa CLICK hoy mismo.",
        };
      case 2:
        return {
          title: "Perfil del Negocio",
          subtitle: "Cuéntanos sobre tu establecimiento gastronómico.",
        };
      case 3:
        return {
          title: "Detalles de Sucursal",
          subtitle: "Configura tu primera sucursal para empezar a recibir pedidos.",
        };
      default:
        return { title: "", subtitle: "" };
    }
  };

  const metadata = getStepMetadata();

  return (
    <OnboardingLayout
      step={step}
      totalSteps={TOTAL_STEPS}
      title={metadata.title}
      subtitle={metadata.subtitle}
      onBack={step > 1 ? handleBack : undefined}
    >
      {renderStep()}
    </OnboardingLayout>
  );
}
