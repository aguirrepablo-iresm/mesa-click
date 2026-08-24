"use client";

import React, { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

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
    } catch (err: any) {
      setError(err.message || "Error al solicitar el enlace de acceso.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas-white flex flex-col items-center justify-center p-24 font-inter">
      <div className="w-full max-w-sm space-y-32">
        {/* Logo/Brand */}
        <div className="text-center space-y-8">
          <Link href="/" className="inline-flex items-center gap-8 group">
            <span className="material-symbols-outlined text-plain-green text-32 group-hover:scale-110 transition-transform">restaurant</span>
            <h1 className="text-24 font-medium tracking-tight text-ash-graphite">Mesa CLICK</h1>
          </Link>
          <p className="text-14 text-sage-green uppercase tracking-widest font-mono">
            Acceso Administración
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-vanilla-cream p-32 rounded-xl border border-system-black shadow-sm space-y-24">
          {enviado ? (
            <div className="text-center space-y-16 py-8">
              <span className="material-symbols-outlined text-44 text-plain-green">
                mark_email_read
              </span>
              <div className="space-y-4">
                <h3 className="text-16 font-medium text-ash-graphite">
                  ¡Enlace de acceso enviado!
                </h3>
                <p className="text-13 text-sage-green leading-relaxed">
                  Revisá tu casilla de correo en <span className="font-mono text-ash-graphite font-medium">{email}</span> y hacé clic en el enlace para ingresar al panel.
                </p>
              </div>
              {linkDev && (
                <div className="p-12 bg-canvas-white border border-dashed border-ash-graphite/30 rounded-lg text-left space-y-6">
                  <div className="flex items-center gap-6 text-11 font-mono uppercase tracking-wider text-sage-green">
                    <span className="material-symbols-outlined text-16">construction</span>
                    <span>Modo desarrollo — sin email configurado</span>
                  </div>
                  <a href={linkDev} className="block text-11 font-mono text-plain-green break-all hover:underline">
                    {linkDev}
                  </a>
                </div>
              )}

              <div className="pt-8">
                <button
                  onClick={() => { setEnviado(false); setLinkDev(""); }}
                  className="text-12 font-medium text-plain-green hover:underline"
                >
                  Intentar con otro email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSolicitarLink} className="space-y-20">
              <div className="space-y-8">
                <label 
                  htmlFor="email" 
                  className="text-11 font-mono text-sage-green uppercase tracking-widest px-4"
                >
                  Email del Negocio o Usuario
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mibar.com"
                  className="w-full h-40 px-12 bg-canvas-white border border-ash-graphite rounded-md focus:border-plain-green transition-all text-14 outline-none"
                />
              </div>

              {error && (
                <div className="p-8 bg-red-50 border border-alert-red/30 rounded text-12 text-alert-red">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-44 bg-plain-green text-ash-graphite font-bold rounded-md hover:bg-plain-green-muted active:scale-95 transition-all shadow-lg shadow-plain-green/10 flex items-center justify-center gap-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="animate-spin material-symbols-outlined text-20">progress_activity</span>
                ) : (
                  <>
                    Enviar Magic Link
                    <span className="material-symbols-outlined text-18">send</span>
                  </>
                )}
              </button>

              <div className="p-12 bg-ghost-fog rounded-md border border-ghost-fog text-12 text-sage-green space-y-4">
                <div className="flex items-center gap-6 font-medium text-ash-graphite">
                  <span className="material-symbols-outlined text-16 text-plain-green">auto_fix</span>
                  <span>Sin contraseñas</span>
                </div>
                <p className="text-11 leading-normal">
                  Recibirás un enlace seguro de un solo uso en tu correo electrónico para acceder sin necesidad de recordar contraseñas.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Footer Link */}
        <p className="text-center text-13 text-sage-green">
          ¿No tienes un negocio registrado?{" "}
          <Link href="/onboarding" className="text-plain-green font-semibold hover:underline">
            Registrar mi negocio
          </Link>
        </p>
      </div>
    </div>
  );
}
