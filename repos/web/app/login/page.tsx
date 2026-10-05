"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, getErrorMessage } from "@/lib/api";
import Logo from "@/components/brand/Logo";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [linkDev, setLinkDev] = useState("");
  const googleClientID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

  const handleGoogleCredential = useCallback(async (credential: string) => {
    setGoogleLoading(true);
    setError("");
    try {
      await api.autenticarConGoogle(credential);
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No pudimos iniciar sesión con Google."));
    } finally {
      setGoogleLoading(false);
    }
  }, [router]);

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
            Gestión de sucursales, mesas, carta y pedidos en vivo. Accedé de forma segura con tu cuenta de Google.
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
          <h2 className="display text-40 mt-6 mb-12 text-ash-graphite">Ingresá con Google</h2>
          <p className="mb-24 text-13 leading-relaxed text-sage-green">
            Usá el mismo correo con el que registraste tu cuenta en Mesa CLICK.
          </p>

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
            <div className="space-y-20">
              <GoogleSignInButton
                clientID={googleClientID}
                disabled={googleLoading}
                onCredential={handleGoogleCredential}
                onError={setError}
              />
              {error && (
                <div className="p-12 border border-alert-red/30 rounded-lg text-12 text-alert-red">{error}</div>
              )}

              <div className="flex items-center gap-12" aria-hidden="true">
                <span className="h-px flex-1 bg-concrete" />
                <span className="text-10 font-mono uppercase tracking-wider text-stone">Acceso alternativo</span>
                <span className="h-px flex-1 bg-concrete" />
              </div>

              <details className="group rounded-xl border border-concrete bg-ghost-fog/40">
                <summary className="flex min-h-48 cursor-pointer list-none items-center justify-between gap-12 px-16 py-12 text-12 font-semibold text-ash-graphite">
                  Recibir un enlace por email
                  <span className="material-symbols-outlined text-18 transition-transform group-open:rotate-180">expand_more</span>
                </summary>
                <form onSubmit={handleSolicitarLink} className="space-y-14 border-t border-concrete p-16">
                  <p className="text-12 leading-relaxed text-sage-green">
                    Si no podés usar Google, te enviamos un enlace seguro de un solo uso.
                  </p>
                  <div>
                    <label htmlFor="email" className="mb-8 block text-11 uppercase tracking-widest text-sage-green">
                      Email del negocio o usuario
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@mibar.com"
                      className="h-52 w-full rounded-lg px-16 text-15"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-48 w-full items-center justify-center gap-8 rounded-full bg-plain-green text-12 font-bold uppercase tracking-wide text-canvas-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading ? (
                      <span className="material-symbols-outlined animate-spin text-20">progress_activity</span>
                    ) : (
                      "Enviar magic link"
                    )}
                  </button>
                </form>
              </details>
            </div>
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
