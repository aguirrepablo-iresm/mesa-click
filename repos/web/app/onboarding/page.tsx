"use client";

import React, { useState } from "react";
import Link from "next/link";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import StepAccount from "@/components/onboarding/StepAccount";
import StepBusiness from "@/components/onboarding/StepBusiness";
import StepBranch from "@/components/onboarding/StepBranch";
import { api, getErrorMessage } from "@/lib/api";

const TOTAL_STEPS = 3;
const HORARIOS_DEFAULT = JSON.stringify({
  lunes: { abierto: true, tramos: [{ apertura: "08:00", cierre: "00:00" }] },
  martes: { abierto: true, tramos: [{ apertura: "08:00", cierre: "00:00" }] },
  miercoles: { abierto: true, tramos: [{ apertura: "08:00", cierre: "00:00" }] },
  jueves: { abierto: true, tramos: [{ apertura: "08:00", cierre: "00:00" }] },
  viernes: { abierto: true, tramos: [{ apertura: "08:00", cierre: "00:00" }] },
  sabado: { abierto: true, tramos: [{ apertura: "08:00", cierre: "00:00" }] },
  domingo: { abierto: true, tramos: [{ apertura: "08:00", cierre: "00:00" }] },
});

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [completado, setCompletado] = useState(false);
  // Resultado real del envío del magic link de primer acceso: si falla no
  // podemos afirmar "revisá tu casilla".
  const [linkEnviado, setLinkEnviado] = useState(false);
  const [linkDev, setLinkDev] = useState("");

  const [formData, setFormData] = useState({
    nombreAdmin: "",
    emailAdmin: "",
    nombreNegocio: "",
    nombreFantasia: "",
    slug: "",
    rubro: "cafeteria",
    descripcion: "",
    sucursalNombre: "Casa central",
    whatsapp: "",
    emailSucursal: "",
    horarios: HORARIOS_DEFAULT,
  });

  const handleUpdate = (fields: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleNext = () => {
    setError("");
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleComplete = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Crear el tenant en la base de datos
      await api.crearTenant({
        nombre: formData.nombreNegocio,
        nombre_fantasia: formData.nombreFantasia || formData.nombreNegocio,
        slug: formData.slug,
        rubro: formData.rubro,
        email_admin: formData.emailAdmin,
        nombre_admin: formData.nombreAdmin,
        sucursal_nombre: formData.sucursalNombre,
        email_sucursal: formData.emailSucursal,
        whatsapp: formData.whatsapp,
        horarios: formData.horarios,
      });

      // 2. Solicitar automáticamente el magic link de primer acceso
      try {
        const res = await api.solicitarMagicLink(formData.emailAdmin);
        setLinkEnviado(true);
        if (res?.magic_link_dev) setLinkDev(res.magic_link_dev);
      } catch (linkErr) {
        console.warn("No se pudo enviar magic link automático:", linkErr);
        setLinkEnviado(false);
      }

      setCompletado(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Error al crear el negocio. Por favor verifica los datos."));
    } finally {
      setLoading(false);
    }
  };

  if (completado) {
    return (
      <div className="min-h-screen bg-canvas-white flex flex-col items-center justify-center p-24 font-inter">
        <div className="w-full max-w-md bg-vanilla-cream p-32 rounded-xl border border-system-black shadow-sm text-center space-y-24">
          <span className="material-symbols-outlined text-48 text-plain-green">
            celebration
          </span>
          <div className="space-y-8">
            <h2 className="text-20 font-medium text-ash-graphite">
              ¡Negocio creado con éxito!
            </h2>
            <p className="text-13 text-sage-green leading-relaxed">
              Registramos <strong className="text-ash-graphite">{formData.nombreNegocio}</strong> en Mesa CLICK.
            </p>
            {linkEnviado ? (
              <div className="p-16 bg-ghost-fog border border-ghost-fog rounded-lg text-left text-12 text-ash-graphite space-y-6">
                <div className="flex items-center gap-6 text-plain-green font-medium">
                  <span className="material-symbols-outlined text-18">mark_email_unread</span>
                  <span>Revisá tu casilla de correo</span>
                </div>
                <p className="text-sage-green text-11">
                  Enviamos un Magic Link de acceso a <strong className="font-mono text-ash-graphite">{formData.emailAdmin}</strong> para que ingreses directamente al panel de control sin contraseñas.
                </p>
              </div>
            ) : (
              <div className="p-16 bg-red-50 border border-alert-red/30 rounded-lg text-left text-12 space-y-6">
                <div className="flex items-center gap-6 text-alert-red font-medium">
                  <span className="material-symbols-outlined text-18">report</span>
                  <span>No pudimos enviar el enlace de acceso</span>
                </div>
                <p className="text-sage-green text-11">
                  Tu negocio quedó registrado. Entrá a <strong className="text-ash-graphite">Iniciar Sesión</strong> y pedí el Magic Link de nuevo con <strong className="font-mono text-ash-graphite">{formData.emailAdmin}</strong>.
                </p>
              </div>
            )}

            {linkDev && (
              <div className="p-16 bg-vanilla-cream border border-dashed border-ash-graphite/30 rounded-lg text-left space-y-6">
                <div className="flex items-center gap-6 text-11 font-mono uppercase tracking-wider text-sage-green">
                  <span className="material-symbols-outlined text-16">construction</span>
                  <span>Modo desarrollo — sin email configurado</span>
                </div>
                <a
                  href={linkDev}
                  className="block text-11 font-mono text-plain-green break-all hover:underline"
                >
                  {linkDev}
                </a>
              </div>
            )}
          </div>
          <div className="pt-8 flex flex-col gap-12">
            <Link
              href="/login"
              className="w-full h-40 bg-plain-green text-ash-graphite font-bold rounded-md hover:bg-plain-green-muted transition-all flex items-center justify-center gap-8 text-13"
            >
              Ir a Iniciar Sesión
              <span className="material-symbols-outlined text-16">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <StepAccount
            data={{
              nombreAdmin: formData.nombreAdmin,
              emailAdmin: formData.emailAdmin,
            }}
            onChange={handleUpdate}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <StepBusiness
            data={{
              nombreNegocio: formData.nombreNegocio,
              nombreFantasia: formData.nombreFantasia,
              slug: formData.slug,
              rubro: formData.rubro,
              descripcion: formData.descripcion,
            }}
            onChange={handleUpdate}
            onNext={handleNext}
          />
        );
      case 3:
        return (
          <StepBranch
            data={{
              sucursalNombre: formData.sucursalNombre,
              whatsapp: formData.whatsapp,
              emailSucursal: formData.emailSucursal,
              horarios: formData.horarios,
            }}
            loading={loading}
            error={error}
            onChange={handleUpdate}
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
          title: "Crea tu cuenta de Administrador",
          subtitle: "Datos personales para el responsable del local gastronómico.",
        };
      case 2:
        return {
          title: "Perfil del Negocio",
          subtitle: "Configura el nombre y rubro de tu establecimiento.",
        };
      case 3:
        return {
          title: "Primera Sucursal",
          subtitle: "Detalles de contacto y horarios de atención.",
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
