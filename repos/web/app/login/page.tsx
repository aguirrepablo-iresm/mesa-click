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
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
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

  const handlePasswordLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Ingresá tu correo y contraseña.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.autenticarConPassword(email, password);
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No pudimos iniciar sesión."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-[1.1fr_1fr] font-inter">
      <div className="bg-ash-graphite text-canvas-white px-32 md:px-56 py-48 md:py-64 flex flex-col justify-between gap-32">
        <Link href="/" className="text-12 uppercase tracking-widest text-stone hover:text-canvas-white transition-colors">
          ← Volver al inicio
        </Link>
        <div className="max-w-[520px]">
          <h1
            className="display"
            style={{ fontSize: "clamp(64px, 7vw, 112px)", lineHeight: 0.84 }}
          >
            Entrá<br />al panel
          </h1>
          <p className="mt-28 text-16 text-concrete max-w-[34ch]">
            Gestioná sucursales, mesas, carta y pedidos en vivo desde un único lugar.
          </p>
        </div>
        <div className="flex items-center gap-10">
          <Logo className="w-28 h-28" />
          <span className="text-16 font-bold uppercase tracking-tight">Mesa CLICK</span>
        </div>
      </div>

      <div className="px-32 md:px-56 py-48 md:py-64 flex flex-col justify-center">
        <div className="w-full max-w-[420px] mx-auto">
          <div className="text-11 uppercase tracking-widest text-stone">Acceso administración</div>
          <h2 className="display text-40 mt-6 mb-8 text-ash-graphite">Ingresá a tu cuenta</h2>
          <p className="mb-24 text-13 leading-relaxed text-sage-green">
            Usá el correo registrado y tu contraseña de Mesa CLICK.
          </p>

          <form onSubmit={handlePasswordLogin} className="space-y-16">
            <div className="space-y-7">
              <label htmlFor="email" className="block text-11 uppercase tracking-widest text-sage-green">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@minegocio.com"
                className="h-52 w-full rounded-lg border border-concrete bg-canvas-white px-16 text-15 outline-none transition-colors focus:border-plain-green"
              />
            </div>

            <div className="space-y-7">
              <label htmlFor="password" className="block text-11 uppercase tracking-widest text-sage-green">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={mostrarPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Tu contraseña de Mesa CLICK"
                  className="h-52 w-full rounded-lg border border-concrete bg-canvas-white px-16 pr-52 text-15 outline-none transition-colors focus:border-plain-green"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword((actual) => !actual)}
                  aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute inset-y-0 right-0 flex w-48 items-center justify-center text-stone hover:text-ash-graphite"
                >
                  <span className="material-symbols-outlined text-20">
                    {mostrarPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <div role="alert" className="p-12 border border-alert-red/30 rounded-lg text-12 text-alert-red">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="flex h-48 w-full items-center justify-center gap-8 rounded-full bg-plain-green text-12 font-bold uppercase tracking-wide text-canvas-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-20">progress_activity</span>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

          <div className="my-20 flex items-center gap-12" aria-hidden="true">
            <span className="h-px flex-1 bg-concrete" />
            <span className="text-10 font-mono uppercase tracking-wider text-stone">o continuá con</span>
            <span className="h-px flex-1 bg-concrete" />
          </div>

          <GoogleSignInButton
            clientID={googleClientID}
            disabled={loading || googleLoading}
            onCredential={handleGoogleCredential}
            onError={setError}
          />

          <p className="mt-12 text-11 leading-relaxed text-stone">
            Mesa CLICK nunca te pedirá la contraseña de tu cuenta de Google.
          </p>

          <p className="mt-26 text-13 text-sage-green">
            ¿No tenés un negocio registrado?{" "}
            <Link href="/onboarding" className="font-bold uppercase text-12 tracking-wide text-ash-graphite border-b border-ash-graphite">
              Registrar mi negocio
            </Link>
          </p>
          <p className="mt-16 border-t border-concrete pt-14 text-11 leading-relaxed text-stone">
            Al ingresar confirmás que conocés nuestros{" "}
            <Link href="/terminos" className="font-semibold text-ash-graphite underline underline-offset-4">
              Términos del Servicio
            </Link>{" "}
            y la{" "}
            <Link href="/privacidad" className="font-semibold text-ash-graphite underline underline-offset-4">
              Política de Privacidad
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
