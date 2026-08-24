"use client";

import React, { useEffect, useState } from "react";

interface StepBusinessProps {
  data: {
    nombreNegocio: string;
    nombreFantasia: string;
    slug: string;
    rubro: string;
    descripcion: string;
  };
  onChange: (fields: Partial<{
    nombreNegocio: string;
    nombreFantasia: string;
    slug: string;
    rubro: string;
    descripcion: string;
  }>) => void;
  onNext: () => void;
}

export default function StepBusiness({ data, onChange, onNext }: StepBusinessProps) {
  // El prefijo del slug tiene que ser el dominio donde realmente corre la app
  // (localhost:3000, el dominio de Render, etc.), no un dominio fijo de ejemplo.
  // Se resuelve después del montaje porque `window` no existe en el render del servidor.
  const [host, setHost] = useState("");

  useEffect(() => {
    setHost(window.location.host);
  }, []);

  const handleNombreChange = (val: string) => {
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    
    onChange({
      nombreNegocio: val,
      slug: data.slug && data.slug !== autoSlug ? data.slug : autoSlug,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.nombreNegocio.trim()) return;
    onNext();
  };

  return (
    <div className="space-y-24 font-inter">
      <form onSubmit={handleSubmit} className="space-y-20">
        <div className="bg-vanilla-cream p-20 rounded-lg border border-system-black shadow-sm space-y-16">
          <div className="flex items-center gap-8 text-ash-graphite mb-4">
            <span className="material-symbols-outlined text-20">storefront</span>
            <h3 className="font-medium text-11 font-mono uppercase tracking-wider">
              Identidad del Negocio
            </h3>
          </div>

          <div className="space-y-14">
            <div className="space-y-6">
              <label className="text-11 font-mono text-sage-green uppercase tracking-wider px-1">
                Nombre de la Empresa o Negocio
              </label>
              <input
                type="text"
                required
                value={data.nombreNegocio}
                onChange={(e) => handleNombreChange(e.target.value)}
                placeholder="Ej: Café Bar Central"
                className="w-full h-40 px-12 bg-canvas-white border border-ash-graphite rounded-md focus:border-plain-green outline-none transition-all text-14"
              />
            </div>

            <div className="space-y-6">
              <label className="text-11 font-mono text-sage-green uppercase tracking-wider px-1">
                Identificador URL (Slug)
              </label>
              <div className="flex items-center">
                <span className="h-40 px-12 bg-ghost-fog border border-r-0 border-ash-graphite rounded-l-md text-12 font-mono text-sage-green flex items-center whitespace-nowrap">
                  {host ? `${host}/` : " "}
                </span>
                <input
                  type="text"
                  required
                  value={data.slug}
                  onChange={(e) => onChange({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                  placeholder="cafe-bar-central"
                  className="flex-1 h-40 px-12 bg-canvas-white border border-ash-graphite rounded-r-md focus:border-plain-green outline-none transition-all text-14 font-mono"
                />
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-11 font-mono text-sage-green uppercase tracking-wider px-1">
                Rubro Principal
              </label>
              <select 
                value={data.rubro || "cafeteria"}
                onChange={(e) => onChange({ rubro: e.target.value })}
                className="w-full h-40 px-12 bg-canvas-white border border-ash-graphite rounded-md focus:border-plain-green outline-none transition-all text-14"
              >
                <option value="cafeteria">Cafetería</option>
                <option value="restaurante">Restaurante</option>
                <option value="bar">Bar / Pub / Cervecería</option>
                <option value="comida_rapida">Comida Rápida</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-vanilla-cream p-20 rounded-lg border border-system-black shadow-sm space-y-8">
          <label className="text-11 font-mono text-sage-green uppercase tracking-wider px-1">
            Descripción o Slogan (Opcional)
          </label>
          <textarea
            rows={3}
            value={data.descripcion}
            onChange={(e) => onChange({ descripcion: e.target.value })}
            placeholder="Especialistas en café de especialidad y pastelería artesanal..."
            className="w-full p-12 bg-canvas-white border border-ash-graphite rounded-md focus:border-plain-green outline-none transition-all text-14 resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full h-40 bg-plain-green text-ash-graphite font-medium rounded-md hover:bg-plain-green-muted transition-all flex items-center justify-center gap-8 mt-24"
        >
          Continuar
          <span className="material-symbols-outlined text-16">arrow_forward</span>
        </button>
      </form>
    </div>
  );
}
