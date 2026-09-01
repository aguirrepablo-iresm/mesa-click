"use client";

import React, { useState } from "react";
import Link from "next/link";
import { api, getErrorMessage } from "@/lib/api";
import Logo from "@/components/brand/Logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [linkDev, setLinkDev] = useState("");

  const handleSolicitarLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Por favor ingresa un email válido.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.solicitarMagicLink(email);
      setLinkDev(res?.magic_link_dev || "");
      setEnviado(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Error al solicitar el enlace de acceso."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-[1.1fr_1fr] font-inter">
      {/* Izquierda */}
      <div className="bg-ash-graphite text-canvas-white px-32 md:px-56 py-48 md:py-64 flex flex-col justify-between gap-32">
        <Link href="/" className="text-12 uppercase tracking-widest text-stone hover:text-canvas-white transition-colors">
          ← Volver al inicio
        </Link>
        <div>
          <h1 className="display text-44 md:text-72">Entrá<br />al panel</h1>
          <p className="mt-20 text-16 text-concrete max-w-[34ch]">
            Gestión de sucursales, mesas, carta y pedidos en vivo. Sin contraseñas: entrás con un enlace.
          </p>
        </div>
        <div className="flex items-center gap-10">
          <Logo className="w-28 h-28" />
          <span className="text-16 font-bold uppercase tracking-tight">Mesa CLICK</span>
        </div>
      </div>

      {/* Derecha */}
      <div className="px-32 md:px-56 py-48 md:py-64 flex flex-col justify-center">
        <div className="w-full max-w-[420px] mx-auto">
          <div className="text-11 uppercase tracking-widest text-stone">Acceso administración</div>
          <h2 className="display text-40 mt-6 mb-28 text-ash-graphite">Magic link</h2>

          {enviado ? (
            <div className="space-y-20">
              <div className="flex items-center gap-12 px-16 py-14 bg-success rounded-lg text-12 font-bold uppercase tracking-wide text-ash-graphite">
                <span className="material-symbols-outlined text-20">mark_email_read</span>
                Enlace enviado
              </div>
              <p className="text-14 text-deep-forest leading-relaxed">
                Revisá tu casilla de correo en{" "}
                <span className="font-mono text-ash-graphite font-medium">{email}</span> y hacé clic en el
                enlace para ingresar al panel.
              </p>

              {linkDev && (
                <div className="p-12 bg-vanilla-cream border border-dashed border-concrete rounded-lg space-y-6">
                  <div className="flex items-center gap-6 text-11 font-mono uppercase tracking-wider text-stone">
                    <span className="material-symbols-outlined text-16">construction</span>
                    <span>Modo desarrollo — sin email configurado</span>
                  </div>
                  <a href={linkDev} className="block text-11 font-mono text-ash-graphite break-all hover:underline">
                    {linkDev}
                  </a>
                </div>
              )}

              <button
                onClick={() => {
                  setEnviado(false);
                  setLinkDev("");
                }}
                className="text-12 font-bold uppercase tracking-wide text-ash-graphite border-b border-ash-graphite"
              >
                Intentar con otro email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSolicitarLink} className="space-y-20">
              <div>
                <label htmlFor="email" className="block text-11 uppercase tracking-widest text-sage-green mb-8">
                  Email del negocio o usuario
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mibar.com"
                  className="w-full h-52 px-16 text-15 rounded-lg"
                />
              </div>

              {error && (
                <div className="p-12 border border-alert-red/30 rounded-lg text-12 text-alert-red">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-52 rounded-full bg-plain-green text-canvas-white text-12 font-bold uppercase tracking-wide flex items-center justify-center gap-8 hover:opacity-85 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="animate-spin material-symbols-outlined text-20">progress_activity</span>
                ) : (
                  "Enviar magic link"
                )}
              </button>

              <div className="p-16 bg-vanilla-cream rounded-lg text-13 text-sage-green">
                <div className="flex items-center gap-8 text-12 font-bold uppercase tracking-wide text-ash-graphite mb-6">
                  <span className="material-symbols-outlined text-16">check</span>
                  Sin contraseñas
                </div>
                Recibís un enlace seguro de un solo uso en tu correo. No hay que recordar nada.
              </div>
            </form>
          )}

          <p className="mt-26 text-13 text-sage-green">
            ¿No tenés un negocio registrado?{" "}
            <Link href="/onboarding" className="font-bold uppercase text-12 tracking-wide text-ash-graphite border-b border-ash-graphite">
              Registrar mi negocio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
