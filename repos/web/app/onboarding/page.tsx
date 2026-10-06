"use client";

import React, { useState } from "react";
import Link from "next/link";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import AuthShell from "@/components/auth/AuthShell";
import LandingIcon from "@/components/landing/LandingIcon";
import StepAccount from "@/components/onboarding/StepAccount";
import StepBusiness from "@/components/onboarding/StepBusiness";
import StepBranch from "@/components/onboarding/StepBranch";
import { ApiError, api, getErrorMessage } from "@/lib/api";

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

type OnboardingFormData = {
  nombreAdmin: string;
  emailAdmin: string;
  password: string;
  confirmarPassword: string;
  nombreNegocio: string;
  nombreFantasia: string;
  slug: string;
  rubro: string;
  descripcion: string;
  sucursalNombre: string;
  whatsapp: string;
  emailSucursal: string;
  horarios: string;
};

type FieldErrors = Partial<Record<keyof OnboardingFormData, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emailValido(email: string) {
  return EMAIL_RE.test(email.trim());
}

function pasoParaCampo(campo: keyof OnboardingFormData) {
  if (
    campo === "nombreAdmin" ||
    campo === "emailAdmin" ||
    campo === "password" ||
    campo === "confirmarPassword"
  ) return 1;
  if (
    campo === "nombreNegocio" ||
    campo === "nombreFantasia" ||
    campo === "slug" ||
    campo === "rubro" ||
    campo === "descripcion"
  ) {
    return 2;
  }
  return 3;
}

function puedeOmitirPrevalidacionEmail(err: unknown) {
  // La creación final vuelve a validar el correo de forma autoritativa. Si el
  // chequeo previo no está disponible o el servidor está despertando, no
  // bloqueamos el formulario: un duplicado igualmente vuelve al paso 1 con
  // el mensaje específico que devuelve POST /tenants.
  if (err instanceof ApiError && (err.status === 404 || err.status === 408)) return true;
  if (err instanceof TypeError) return true;

  const message = err instanceof Error ? err.message.trim().toLowerCase() : "";
  return message === "failed to fetch" || message.includes("networkerror");
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [validandoEmail, setValidandoEmail] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [completado, setCompletado] = useState(false);

  const [formData, setFormData] = useState<OnboardingFormData>({
    nombreAdmin: "",
    emailAdmin: "",
    password: "",
    confirmarPassword: "",
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

  const handleUpdate = (fields: Partial<OnboardingFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      (Object.keys(fields) as Array<keyof OnboardingFormData>).forEach((field) => {
        delete next[field];
      });
      return next;
    });
    if (error) setError("");
  };

  const handleNext = () => {
    setError("");
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleAccountNext = async () => {
    const errors: FieldErrors = {};

    if (!formData.nombreAdmin.trim()) {
      errors.nombreAdmin = "Ingresá el nombre del responsable.";
    }
    if (!formData.emailAdmin.trim()) {
      errors.emailAdmin = "Ingresá el correo de acceso.";
    } else if (!emailValido(formData.emailAdmin)) {
      errors.emailAdmin = "Ingresá un correo de acceso válido.";
    }
    if (formData.password.length < 10) {
      errors.password = "Usá al menos 10 caracteres.";
    } else if (!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(formData.password) || !/\d/.test(formData.password)) {
      errors.password = "Incluí al menos una letra y un número.";
    }
    if (formData.confirmarPassword !== formData.password) {
      errors.confirmarPassword = "Las contraseñas no coinciden.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Revisá los campos marcados para continuar.");
      return;
    }

    setValidandoEmail(true);
    setError("");

    try {
      const res = await api.verificarEmailAdminDisponible(formData.emailAdmin);
      if (!res.disponible) {
        const mensaje =
          "Ese correo de acceso ya está asociado a un negocio. Usá otro correo o iniciá sesión.";
        setFieldErrors({ emailAdmin: mensaje });
        setError(mensaje);
        return;
      }

      handleNext();
    } catch (err: unknown) {
      if (puedeOmitirPrevalidacionEmail(err)) {
        handleNext();
        return;
      }

      const mensaje = getErrorMessage(
        err,
        "No pudimos validar el correo de acceso. Intentá nuevamente.",
      );
      setFieldErrors({ emailAdmin: mensaje });
      setError(mensaje);
    } finally {
      setValidandoEmail(false);
    }
  };

  const handleBack = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
  };

  const validarFormulario = () => {
    const errors: FieldErrors = {};

    if (!formData.nombreAdmin.trim()) {
      errors.nombreAdmin = "Ingresá el nombre del responsable.";
    }
    if (!formData.emailAdmin.trim()) {
      errors.emailAdmin = "Ingresá el correo de acceso.";
    } else if (!emailValido(formData.emailAdmin)) {
      errors.emailAdmin = "Ingresá un correo de acceso válido.";
    }
    if (formData.password.length < 10) {
      errors.password = "Usá al menos 10 caracteres.";
    } else if (!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(formData.password) || !/\d/.test(formData.password)) {
      errors.password = "Incluí al menos una letra y un número.";
    }
    if (formData.confirmarPassword !== formData.password) {
      errors.confirmarPassword = "Las contraseñas no coinciden.";
    }
    if (!formData.nombreNegocio.trim()) {
      errors.nombreNegocio = "Ingresá el nombre del negocio.";
    }
    if (!formData.slug.trim()) {
      errors.slug = "Elegí el nombre que va a aparecer en la URL.";
    }
    if (!formData.sucursalNombre.trim()) {
      errors.sucursalNombre = "Ingresá el nombre de la sucursal.";
    }
    if (formData.emailSucursal.trim() && !emailValido(formData.emailSucursal)) {
      errors.emailSucursal = "Ingresá un correo de sucursal válido.";
    }

    const primerCampo = (Object.keys(errors) as Array<keyof OnboardingFormData>)[0];
    if (!primerCampo) return true;

    setFieldErrors(errors);
    setStep(pasoParaCampo(primerCampo));
    setError("Revisá los campos marcados para continuar.");
    return false;
  };

  const mostrarErrorDeCreacion = (err: unknown) => {
    const mensaje = getErrorMessage(
      err,
      "No pudimos crear el negocio. Revisá los datos e intentá nuevamente.",
    );
    const normalizado = mensaje.toLowerCase();
    const errors: FieldErrors = {};
    let nextStep = step;

    if (normalizado.includes("correo de acceso")) {
      errors.emailAdmin = mensaje;
      nextStep = 1;
    } else if (normalizado.includes("nombre en url")) {
      errors.slug = mensaje;
      nextStep = 2;
    }

    setFieldErrors((prev) => ({ ...prev, ...errors }));
    setStep(nextStep);
    setError(mensaje);
  };

  const handleComplete = async () => {
    if (!validarFormulario()) return;

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
        password: formData.password,
        sucursal_nombre: formData.sucursalNombre,
        email_sucursal: formData.emailSucursal,
        whatsapp: formData.whatsapp,
        horarios: formData.horarios,
      });

      setCompletado(true);
    } catch (err: unknown) {
      mostrarErrorDeCreacion(err);
    } finally {
      setLoading(false);
    }
  };

  if (completado) {
    return (
      <AuthShell
        image="https://images.unsplash.com/photo-1485182708500-e8f1f318ba72?auto=format&fit=crop&w=1100&q=84"
        imageAlt="Personas disfrutando en un restaurante"
        visualTitle="Tu próximo servicio puede ser más simple"
        visualText="Ya podés cargar tu carta, generar los QR de tus mesas y recibir pedidos en vivo."
        cardLabel="Registro completo"
        cardTitle={formData.nombreNegocio}
      >
        <span className="auth-success-icon"><LandingIcon name="check" size={26} /></span>
        <h1>¡Negocio creado con éxito!</h1>
        <p className="auth-sub">
          Registramos <strong className="text-ash-graphite">{formData.nombreNegocio}</strong> en Mesa CLICK.
        </p>
        <div className="auth-note">
          <span><LandingIcon name="check" size={14} /></span>
          <p>
            <strong>Tu acceso ya está listo.</strong> Ingresá con <strong className="font-mono">{formData.emailAdmin}</strong> y la contraseña que acabás de crear, o utilizá Google con ese mismo correo.
          </p>
        </div>
        <Link href="/login" className="landing-cta">
          Ir a iniciar sesión <LandingIcon name="chevron" size={18} />
        </Link>
      </AuthShell>
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
              password: formData.password,
              confirmarPassword: formData.confirmarPassword,
            }}
            errors={{
              nombreAdmin: fieldErrors.nombreAdmin,
              emailAdmin: fieldErrors.emailAdmin,
              password: fieldErrors.password,
              confirmarPassword: fieldErrors.confirmarPassword,
            }}
            loading={validandoEmail}
            onChange={handleUpdate}
            onNext={handleAccountNext}
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
            errors={{
              nombreNegocio: fieldErrors.nombreNegocio,
              slug: fieldErrors.slug,
              rubro: fieldErrors.rubro,
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
            errors={{
              sucursalNombre: fieldErrors.sucursalNombre,
              emailSucursal: fieldErrors.emailSucursal,
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
          title: "Crear cuenta",
          subtitle: "Datos personales del responsable del local gastronómico.",
        };
      case 2:
        return {
          title: "Tu negocio",
          subtitle: "Nombre, rubro y link público para que tus clientes encuentren el menú.",
        };
      case 3:
        return {
          title: "Sucursal",
          subtitle: "Contacto y horarios de atención de la primera sede.",
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
      {error && step !== 3 && (
        <div className="mb-16 p-12 bg-red-50 border border-alert-red/30 rounded text-12 text-alert-red">
          {error}
        </div>
      )}
      {renderStep()}
    </OnboardingLayout>
  );
}
