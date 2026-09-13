"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui";

export interface TourStep {
  id: string;
  section: "configuracion" | "mesas" | "carta" | "recepcionista";
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  bullets: string[];
  tip: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "step-configuracion",
    section: "configuracion",
    badge: "Paso 1 de 4",
    title: "Configurá tu Negocio y Sucursales",
    subtitle: "Identidad, horarios y datos operativos",
    description:
      "Personalizá el nombre comercial, logo, colores de marca y datos fiscales. Además, definí los horarios de atención y turnos de tus sucursales para habilitar la recepción de pedidos.",
    icon: "settings",
    bullets: [
      "Branding y apariencia de la carta para tus comensales",
      "Horarios semanales y turnos de apertura por sucursal",
      "Datos fiscales (CUIT, razón social) y perfil de usuario",
    ],
    tip: "Asegurate de configurar los horarios de atención de la sucursal para que el salón pueda operar sin interrupciones.",
  },
  {
    id: "step-mesas",
    section: "mesas",
    badge: "Paso 2 de 4",
    title: "Creá tus Mesas y Códigos QR",
    subtitle: "El punto de acceso para los clientes",
    description:
      "Organizá las mesas de tu salón o barra. Cada mesa cuenta con su código QR único y descargable para que los clientes lo escaneen y hagan pedidos desde su propio celular sin instalar aplicaciones.",
    icon: "table_restaurant",
    bullets: [
      "Creación ágil de mesas con número identificador y sector",
      "Generación y descarga de códigos QR en alta calidad",
      "Enlace público directo para probar el menú desde tu navegador",
    ],
    tip: "Imprimí los códigos QR y colócalos en los tarjeteros acrílicos o stickers de cada mesa de tu local.",
  },
  {
    id: "step-carta",
    section: "carta",
    badge: "Paso 3 de 4",
    title: "Armá tu Carta Digital",
    subtitle: "Categorías, productos, precios y fotos",
    description:
      "Estructurá tu menú en categorías claras (Entradas, Platos, Bebidas, Postres) y creá los productos con descripciones atractivas, fotos, precios actualizados y control de disponibilidad en un solo clic.",
    icon: "restaurant_menu",
    bullets: [
      "Organización en categorías para una navegación mobile fluida",
      "Artículos con precios, fotos, detalles y alérgenos",
      "Control de disponibilidad instantáneo (disponible / pausado)",
    ],
    tip: "Una carta con fotos nítidas y descripciones completas puede aumentar el ticket promedio hasta un 30%.",
  },
  {
    id: "step-recepcionista",
    section: "recepcionista",
    badge: "Paso 4 de 4",
    title: "Gestioná Pedidos en Tiempo Real",
    subtitle: "Panel en vivo para mozos y recepción",
    description:
      "Visualizá los pedidos que envían los comensales al instante mediante Server-Sent Events (SSE). Recibí alertas sonoras y actualizá el estado de los pedidos en cada fase de la preparación.",
    icon: "receipt_long",
    bullets: [
      "Recepción instantánea de pedidos con alerta sonora y visual",
      "Flujo de estados: Recibido → En preparación → Entregado → Pagado",
      "El comensal ve el progreso de su pedido en su celular en vivo",
    ],
    tip: "Mantené este panel abierto en la tablet de la barra o recepción para no demorar la atención a las mesas.",
  },
];

export const TOUR_STORAGE_KEY = "mesaclick_admin_tour_completed";

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: "carta" | "mesas" | "recepcionista" | "configuracion";
  onNavigateSection: (
    section: "carta" | "mesas" | "recepcionista" | "configuracion"
  ) => void;
  tenantName?: string;
  tenantId?: string;
}

export default function OnboardingTour({
  isOpen,
  onClose,
  activeSection,
  onNavigateSection,
  tenantName,
  tenantId,
}: OnboardingTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const toast = useToast();

  // Sincronizar sección activa al cambiar de paso
  const goToStep = useCallback(
    (index: number) => {
      const step = TOUR_STEPS[index];
      if (!step) return;
      setCurrentStepIndex(index);
      if (activeSection !== step.section) {
        onNavigateSection(step.section);
      }
    },
    [activeSection, onNavigateSection]
  );

  // Al abrir el tour, comenzar en el primer paso y sincronizar sección
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      onNavigateSection(TOUR_STEPS[0].section);
    }
  }, [isOpen, onNavigateSection]);

  // Manejo de teclado (Flecha izq/der y Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSkip();
      } else if (e.key === "ArrowRight") {
        if (currentStepIndex < TOUR_STEPS.length - 1) {
          goToStep(currentStepIndex + 1);
        }
      } else if (e.key === "ArrowLeft") {
        if (currentStepIndex > 0) {
          goToStep(currentStepIndex - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStepIndex, goToStep]);

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      goToStep(currentStepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1);
    }
  };

  const handleComplete = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(TOUR_STORAGE_KEY, "true");
        if (tenantId) {
          localStorage.setItem(`mesaclick_tour_seen_${tenantId}`, "true");
        }
      } catch (err) {
        console.warn("No se pudo guardar estado del tour:", err);
      }
    }
    toast.success("¡Recorrido completado! Podés volver a hacerlo cuando quieras desde 'Hacer el recorrido de nuevo'.");
    onClose();
  };

  const handleSkip = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(TOUR_STORAGE_KEY, "true");
        if (tenantId) {
          localStorage.setItem(`mesaclick_tour_seen_${tenantId}`, "true");
        }
      } catch (err) {
        console.warn("No se pudo guardar estado del tour:", err);
      }
    }
    toast.info("Recorrido omitido. Podés volver a hacerlo cuando quieras con el botón 'Hacer el recorrido de nuevo'.");
    onClose();
  };

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-16 sm:p-24 overflow-y-auto bg-system-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-xl bg-canvas-white border border-system-black rounded-lg shadow-2xl overflow-hidden flex flex-col my-auto transition-all transform animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Tour */}
        <div className="px-20 pt-20 pb-16 border-b border-concrete/60 bg-vanilla-cream/40 flex items-start justify-between gap-12">
          <div className="flex items-center gap-12">
            <div className="w-40 h-40 rounded-md bg-ash-graphite text-canvas-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-22">
                {currentStep.icon}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-8 flex-wrap">
                <span className="inline-flex items-center px-8 py-2 rounded-full text-10 font-bold uppercase tracking-wider bg-ash-graphite text-canvas-white">
                  {currentStep.badge}
                </span>
                <span className="inline-flex items-center px-8 py-2 rounded-full text-10 font-mono font-medium tracking-wide bg-vanilla-cream border border-concrete text-deep-forest">
                  Recorrido Opcional
                </span>
                {tenantName && (
                  <span className="text-11 font-mono text-sage-green truncate max-w-160">
                    {tenantName}
                  </span>
                )}
              </div>
              <h2
                id="tour-modal-title"
                className="text-16 sm:text-18 font-bold text-ash-graphite mt-4 tracking-tight leading-snug"
              >
                {currentStep.title}
              </h2>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-sage-green hover:text-ash-graphite p-4 rounded-md hover:bg-vanilla-cream transition-colors cursor-pointer"
            aria-label="Cerrar y omitir tour"
            title="Cerrar recorrido (es opcional)"
          >
            <span className="material-symbols-outlined text-20">close</span>
          </button>
        </div>

        {/* Barra de Progreso de Pasos */}
        <div className="grid grid-cols-4 gap-4 px-20 pt-12 pb-4 bg-canvas-white">
          {TOUR_STEPS.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <button
                key={step.id}
                onClick={() => goToStep(idx)}
                className="group flex flex-col gap-4 text-left focus:outline-hidden cursor-pointer"
                title={`Ir al paso ${idx + 1}: ${step.title}`}
              >
                <div
                  className={`h-4 rounded-full transition-all duration-200 ${
                    isDone
                      ? "bg-ash-graphite"
                      : isCurrent
                      ? "bg-ash-graphite ring-2 ring-ash-graphite/20"
                      : "bg-concrete hover:bg-stone/40"
                  }`}
                />
                <span
                  className={`text-10 font-mono hidden sm:inline-block truncate ${
                    isCurrent
                      ? "text-ash-graphite font-bold"
                      : "text-stone group-hover:text-ash-graphite"
                  }`}
                >
                  {idx + 1}. {step.section}
                </span>
              </button>
            );
          })}
        </div>

        {/* Contenido Principal */}
        <div className="px-20 py-16 space-y-14 overflow-y-auto max-h-[60vh]">
          {/* Mensaje de cortesía sobre la naturaleza opcional */}
          <div className="flex items-center gap-8 py-6 px-10 bg-ghost-fog border border-concrete/70 rounded text-11 text-sage-green">
            <span className="material-symbols-outlined text-16 text-stone shrink-0">
              visibility
            </span>
            <span>
              Este recorrido es <strong>opcional</strong>. Podés avanzar para conocer los módulos o salir en cualquier momento. Siempre podés volver a hacerlo con el botón <strong>&apos;Hacer el recorrido de nuevo&apos;</strong>.
            </span>
          </div>

          <div>
            <p className="text-12 font-medium text-sage-green uppercase tracking-wide">
              {currentStep.subtitle}
            </p>
            <p className="text-14 text-ash-graphite leading-relaxed mt-4">
              {currentStep.description}
            </p>
          </div>

          {/* Viñetas con valor clave */}
          <div className="bg-ghost-fog/80 border border-concrete/70 rounded-md p-14 space-y-10">
            <span className="text-11 font-bold text-ash-graphite uppercase tracking-wider block">
              Qué podés hacer en este módulo:
            </span>
            <ul className="space-y-6">
              {currentStep.bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-8 text-13 text-deep-forest leading-snug">
                  <span className="material-symbols-outlined text-16 text-ash-graphite shrink-0 mt-2">
                    check_circle
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Consejo / Tip rápido */}
          <div className="flex items-start gap-10 p-12 bg-vanilla-cream/70 border border-concrete/70 rounded-md text-12 text-ash-graphite">
            <span className="material-symbols-outlined text-18 text-ash-graphite shrink-0 mt-1">
              lightbulb
            </span>
            <p className="leading-snug">
              <strong className="font-semibold">Consejo: </strong>
              {currentStep.tip}
            </p>
          </div>
        </div>

        {/* Pie de navegación y acciones */}
        <div className="px-20 py-16 border-t border-concrete/60 bg-vanilla-cream/30 flex flex-col sm:flex-row items-center justify-between gap-12 shrink-0">
          <button
            onClick={handleSkip}
            className="text-12 font-medium text-sage-green hover:text-ash-graphite transition-colors underline decoration-dotted underline-offset-4 cursor-pointer"
          >
            Omitir recorrido (podés hacerlo luego)
          </button>

          <div className="flex items-center gap-8 w-full sm:w-auto justify-end">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="px-14 py-8 rounded-md border border-concrete text-ash-graphite text-13 font-medium hover:bg-vanilla-cream hover:border-ash-graphite transition-all flex items-center gap-4 cursor-pointer"
              >
                <span className="material-symbols-outlined text-16">
                  arrow_back
                </span>
                <span>Anterior</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-18 py-8 rounded-md bg-plain-green text-canvas-white text-13 font-medium hover:bg-plain-green-muted transition-all shadow-sm flex items-center gap-6 cursor-pointer"
            >
              <span>{isLastStep ? "¡Entendido, empezar!" : "Siguiente"}</span>
              <span className="material-symbols-outlined text-16">
                {isLastStep ? "done_all" : "arrow_forward"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
